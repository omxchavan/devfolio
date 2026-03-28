import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Project from "@/models/Project";
import { updateProfileSchema } from "@/lib/validations";
import { sanitizeUserContent } from "@/lib/sanitize";

export async function GET() {
  try {
    const [session] = await Promise.all([
      getServerSession(authOptions),
      connectDB(),
    ]);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await User.findById(session.user.id)
      .populate({
        path: "projects",
        model: Project,
        populate: { path: "owner", model: User, select: "name image githubUsername" },
      })
      .lean();

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const [session, body] = await Promise.all([
      getServerSession(authOptions),
      request.json(),
      connectDB(),
    ]);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const validated = updateProfileSchema.parse(body);
    const sanitized = sanitizeUserContent(
      validated as unknown as Record<string, unknown>
    );

    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    user.set(sanitized);
    await user.save();

    revalidateTag("profiles", "page");

    return NextResponse.json(user);
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation failed", details: error },
        { status: 400 }
      );
    }
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
