import { NextResponse } from "next/server";
import { revalidateTag, revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Project from "@/models/Project";
import User from "@/models/User";
import { updateProjectSchema } from "@/lib/validations";
import { sanitizeUserContent } from "@/lib/sanitize";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    const project = await Project.findById(id)
      .populate({ path: "owner", model: User, select: "name image githubUsername bio socialLinks" })
      .lean();

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json(project);
  } catch (error) {
    console.error("Error fetching project:", error);
    return NextResponse.json(
      { error: "Failed to fetch project" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const [session] = await Promise.all([
      getServerSession(authOptions),
      connectDB(),
    ]);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const project = await Project.findById(id);
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    if (project.owner.toString() !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Remove project from users and delete in parallel
    await Promise.all([
      User.updateMany(
        { projects: project._id },
        { $pull: { projects: project._id } }
      ),
      Project.findByIdAndDelete(id),
    ]);

    revalidateTag("projects", "page");
    revalidateTag("profiles", "page");
    revalidatePath("/");
    revalidatePath("/dashboard");
    revalidatePath("/explore");
    revalidatePath(`/project/${id}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting project:", error);
    return NextResponse.json(
      { error: "Failed to delete project" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Session + DB + params + body in parallel
    const [session, , paramsData, body] = await Promise.all([
      getServerSession(authOptions),
      connectDB(),
      params,
      request.json(),
    ]);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = paramsData;
    const validated = updateProjectSchema.parse(body);
    const sanitized = sanitizeUserContent(validated as unknown as Record<string, unknown>);

    const project = await Project.findById(id);
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    if (project.owner.toString() !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    project.set(sanitized);
    await project.save();

    revalidateTag("projects", "page");
    revalidatePath("/");
    revalidatePath("/dashboard");
    revalidatePath("/explore");
    revalidatePath(`/project/${id}`);

    return NextResponse.json(project);
    return NextResponse.json(project);
  } catch (error: any) {
    if (error.name === "ZodError" || error.errors) {
      return NextResponse.json({ error: "Validation failed", details: error }, { status: 400 });
    }
    console.error("Error updating project:", error);
    const message = error instanceof Error ? error.message : "Failed to update project";
    return NextResponse.json({ error: message }, { status: error.status || 500 });
  }
}
