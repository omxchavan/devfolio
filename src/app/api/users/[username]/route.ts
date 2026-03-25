import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Project from "@/models/Project";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    await connectDB();
    const { username } = await params;

    const user = await User.findOne({ githubUsername: username })
      .populate({
        path: "projects",
        model: Project,
        populate: { path: "owner", model: User, select: "name image githubUsername" },
      })
      .lean();

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Don't expose email to the public
    const { email: _email, ...publicUser } = user;
    void _email;

    return NextResponse.json(publicUser);
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 }
    );
  }
}
