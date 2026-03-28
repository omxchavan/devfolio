import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Project from "@/models/Project";
import User from "@/models/User";
import { IProject } from "@/types";
import { ProjectCard } from "@/components/project-card";
import { buttonVariants } from "@/components/ui/button-variants";
import { Plus, FolderGit2, Star, GitPullRequest, Globe } from "lucide-react";
import Link from "next/link";
export const dynamic = "force-dynamic";

const getCachedUserProjects = async (userId: string) => {
  await connectDB();
  const projects = await Project.find({
    $or: [
      { owner: userId },
      { "contributors.userId": userId, "contributors.isLinked": true }
    ]
  })
    .sort({ createdAt: -1 })
    .populate({ path: "owner", model: User, select: "name image githubUsername" })
    .lean();
  return JSON.parse(JSON.stringify(projects)) as IProject[];
};

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/api/auth/signin");

  const projects = await getCachedUserProjects(session.user.id);
  const ownedProjects = projects.filter(p => (p.owner as any)?._id?.toString() === session.user.id || p.owner?.toString() === session.user.id);
  const contributedProjects = projects.filter(p => {
    const ownerId = (p.owner as any)?._id?.toString() || p.owner?.toString();
    return ownerId !== session.user.id;
  });
  const totalStars = projects.reduce((sum, p) => sum + (p.stars || 0), 0);

  return (
    <div className="container mx-auto px-4 py-10 space-y-8 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage your projects and track performance.
          </p>
        </div>
        <Link
          href="/create-project"
          className={buttonVariants({ className: "gap-2 rounded-lg px-5" })}
        >
          <Plus className="h-4 w-4" />
          Add Project
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card-elevated p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-500/10">
              <FolderGit2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{ownedProjects.length}</p>
              <p className="text-xs text-muted-foreground">Owned Projects</p>
            </div>
          </div>
        </div>
        <div className="card-elevated p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-500/10">
              <GitPullRequest className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{contributedProjects.length}</p>
              <p className="text-xs text-muted-foreground">Contributing To</p>
            </div>
          </div>
        </div>
        <div className="card-elevated p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-500/10">
              <Star className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalStars}</p>
              <p className="text-xs text-muted-foreground">Total Stars</p>
            </div>
          </div>
        </div>
        <div className="card-elevated p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-500/10">
              <Globe className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{projects.filter(p => p.liveLink).length}</p>
              <p className="text-xs text-muted-foreground">Live Projects</p>
            </div>
          </div>
        </div>
      </div>

      {/* Projects */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Your Projects</h2>
          <span className="text-xs text-muted-foreground px-2.5 py-1 bg-muted rounded-full font-medium">
            {projects.length} Total
          </span>
        </div>

        {projects.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {projects.map((project) => (
              <ProjectCard key={project._id.toString()} project={project} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-16 border border-dashed border-border rounded-xl text-center space-y-4">
            <div className="p-4 rounded-full bg-muted">
              <FolderGit2 className="h-8 w-8 text-muted-foreground/40" />
            </div>
            <p className="text-muted-foreground">You haven&apos;t added any projects yet.</p>
            <Link href="/create-project" className={buttonVariants({ variant: "outline", className: "rounded-lg" })}>
              Add your first project
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
