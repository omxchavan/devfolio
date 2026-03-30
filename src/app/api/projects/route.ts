import { NextResponse } from "next/server";
import { revalidateTag, revalidatePath } from "next/cache";
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

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

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
    // Run session check, DB connect, and body parse in parallel
    const [session, , body] = await Promise.all([
      getServerSession(authOptions),
      connectDB(),
      request.json(),
    ]);

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

    if (parsed.owner.toLowerCase() !== session.user.githubUsername.toLowerCase()) {
      return NextResponse.json(
        { error: `You can only submit projects from your own GitHub account (@${session.user.githubUsername}). If this is a group project, ensure you are the repository owner.` },
        { status: 403 }
      );
    }

    // 1. Fetch data in parallel
    const [existingProject, repoDetails, contributors, languages, readme] = await Promise.all([
      Project.findOne({ githubRepo: sanitized.githubRepo }).lean(),
      fetchRepoDetails(parsed.owner, parsed.repo),
      fetchContributors(parsed.owner, parsed.repo),
      fetchLanguages(parsed.owner, parsed.repo),
      fetchReadme(parsed.owner, parsed.repo),
    ]);

    if (existingProject) {
      return NextResponse.json(
        { error: "This GitHub repository has already been submitted as a project" },
        { status: 409 }
      );
    }

    // Link contributors
    const contributorUsernames = contributors.map((c) => c.githubUsername);
    const existingUsers = await User.find({
      githubUsername: { $in: contributorUsernames.map((u) => new RegExp(`^${escapeRegex(u)}$`, "i")) },
    }).lean();

    const userMap = new Map(existingUsers.map((u) => [u.githubUsername.toLowerCase(), u._id]));
    const linkedContributors = contributors.map((c) => {
      const lowerUsername = c.githubUsername.toLowerCase();
      return {
        githubUsername: c.githubUsername,
        avatarUrl: c.avatarUrl,
        userId: userMap.get(lowerUsername) || null,
        isLinked: userMap.has(lowerUsername),
      };
    });

    // 2. Create the project
    const project = await Project.create({
      title: sanitized.title,
      description: sanitized.description,
      domain: sanitized.domain,
      githubRepo: sanitized.githubRepo,
      liveLink: sanitized.liveLink || repoDetails.homepage || "",
      tags: [
        ...sanitized.tags.map((t) => t.toLowerCase()),
        ...repoDetails.topics,
      ].filter((t, i, a) => a.indexOf(t) === i),
      images: sanitized.images,
      owner: session.user.id,
      contributors: linkedContributors,
      stars: repoDetails.stars,
      techStack: languages,
      readmeExcerpt: readme,
    });

    // 3. Update profiles
    const profileUpdates: Promise<any>[] = [
      User.findByIdAndUpdate(session.user.id, { $addToSet: { projects: project._id } }),
    ];

    const linkedUserIds = linkedContributors
      .filter((c) => c.isLinked && c.userId)
      .map((c) => c.userId);

    if (linkedUserIds.length > 0) {
      profileUpdates.push(
        User.updateMany({ _id: { $in: linkedUserIds } }, { $addToSet: { projects: project._id } })
      );
    }

    await Promise.all(profileUpdates);

    // 4. Revalidate
    revalidateTag("projects", "max");
    revalidateTag("profiles", "max");
    revalidatePath("/");
    revalidatePath("/dashboard");
    revalidatePath("/explore");
    revalidatePath(`/profile/${session.user.githubUsername}`);

    return NextResponse.json(project, { status: 201 });
  } catch (error: any) {
    if (error.name === "ZodError" || error.errors) {
      return NextResponse.json(
        { error: "Validation failed", details: error },
        { status: 400 }
      );
    }
    
    console.error("Error creating project:", error);
    const message = error instanceof Error ? error.message : "Failed to create project";
    return NextResponse.json(
      { error: message },
      { status: error.status || 500 }
    );
  }
}
