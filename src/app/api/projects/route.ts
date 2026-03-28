import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Project from "@/models/Project";
import User from "@/models/User";
import { createProjectSchema, searchQuerySchema } from "@/lib/validations";
import { sanitizeUserContent } from "@/lib/sanitize";
import {
  parseGithubUrl,
  fetchRepoDetails,
  fetchContributors,
  fetchLanguages,
  fetchReadme,
} from "@/lib/github";

export async function GET(request: Request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const query = searchQuerySchema.parse(Object.fromEntries(searchParams));

    const filter: Record<string, unknown> = {};

    if (query.domain) {
      filter.domain = query.domain;
    }

    if (query.tags) {
      const tagList = query.tags.split(",").map((t) => t.trim().toLowerCase());
      filter.tags = { $in: tagList };
    }

    if (query.q) {
      filter.$or = [
        { title: { $regex: query.q, $options: "i" } },
        { tags: { $elemMatch: { $regex: query.q, $options: "i" } } },
      ];
    }

    const sort: Record<string, 1 | -1> =
      query.sort === "stars"
        ? { stars: -1, createdAt: -1 }
        : { createdAt: -1 };

    const skip = (query.page - 1) * query.limit;

    const [projects, total] = await Promise.all([
      Project.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(query.limit)
        .populate({ path: "owner", model: User, select: "name image githubUsername" })
        .lean(),
      Project.countDocuments(filter),
    ]);

    return NextResponse.json({
      projects,
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        pages: Math.ceil(total / query.limit),
      },
    });
  } catch (error) {
    console.error("Error fetching projects:", error);
    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      console.warn("Project submission attempt failed: Missing session.user.id", { email: session?.user?.email });
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!session.user.githubUsername) {
      console.warn("Project submission attempt failed: Missing session.user.githubUsername", { id: session.user.id });
      return NextResponse.json(
        { error: "GitHub username required in profile" },
        { status: 403 }
      );
    }

    await connectDB();

    const body = await request.json();
    const validated = createProjectSchema.parse(body);
    const sanitized = sanitizeUserContent(
      validated as unknown as Record<string, unknown>
    ) as typeof validated;

    // Parse GitHub URL
    const parsed = parseGithubUrl(sanitized.githubRepo);
    if (!parsed) {
      return NextResponse.json(
        { error: "Invalid GitHub repository URL" },
        { status: 400 }
      );
    }

    // Fetch GitHub data
    const [repoDetails, contributors, languages, readme] = await Promise.all([
      fetchRepoDetails(parsed.owner, parsed.repo),
      fetchContributors(parsed.owner, parsed.repo),
      fetchLanguages(parsed.owner, parsed.repo),
      fetchReadme(parsed.owner, parsed.repo),
    ]);

    // Link contributors to existing users
    const contributorUsernames = contributors.map((c) => c.githubUsername);
    const existingUsers = await User.find({
      githubUsername: { $in: contributorUsernames.map((u) => new RegExp(`^${u}$`, "i")) },
    }).lean();

    const userMap = new Map(
      existingUsers.map((u) => [u.githubUsername.toLowerCase(), u._id])
    );

    const linkedContributors = contributors.map((c) => {
      const lowerUsername = c.githubUsername.toLowerCase();
      return {
        githubUsername: c.githubUsername,
        avatarUrl: c.avatarUrl,
        userId: userMap.get(lowerUsername) || null,
        isLinked: userMap.has(lowerUsername),
      };
    });

    // Create project
    const project = await Project.create({
      title: sanitized.title,
      description: sanitized.description,
      domain: sanitized.domain,
      githubRepo: sanitized.githubRepo,
      liveLink: sanitized.liveLink || repoDetails.homepage || "",
      tags: [
        ...sanitized.tags.map((t) => t.toLowerCase()),
        ...repoDetails.topics,
      ].filter((t, i, a) => a.indexOf(t) === i), // deduplicate
      images: sanitized.images,
      owner: session.user.id,
      contributors: linkedContributors,
      stars: repoDetails.stars,
      techStack: languages,
      readmeExcerpt: readme,
    });

    // Add project to owner's profile
    await User.findByIdAndUpdate(session.user.id, {
      $addToSet: { projects: project._id },
    });

    // Add project to linked contributors' profiles
    const linkedUserIds = linkedContributors
      .filter((c) => c.isLinked && c.userId)
      .map((c) => c.userId);

    if (linkedUserIds.length > 0) {
      await User.updateMany(
        { _id: { $in: linkedUserIds } },
        { $addToSet: { projects: project._id } }
      );
    }

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation failed", details: error },
        { status: 400 }
      );
    }
    console.error("Error creating project:", error);
    return NextResponse.json(
      { error: "Failed to create project" },
      { status: 500 }
    );
  }
}
