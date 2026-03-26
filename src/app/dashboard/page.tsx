import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Project from "@/models/Project";
import User from "@/models/User";
import { IProject } from "@/types";
import { ProjectCard } from "@/components/project-card";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button-variants";
import { Plus, LayoutDashboard, GitPullRequest, FolderGit2, Star } from "lucide-react";
import Link from "next/link";
import { AuthProvider } from "@/components/auth-provider";

async function getUserProjects(userId: string) {
  await connectDB();
  const projects = await Project.find({ owner: userId })
    .sort({ createdAt: -1 })
    .populate({ path: "owner", model: User, select: "name image githubUsername" })
    .lean();
  
  return JSON.parse(JSON.stringify(projects)) as IProject[];
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/api/auth/signin");
  }

  const projects = await getUserProjects(session.user.id);
  const totalStars = projects.reduce((sum, p) => sum + (p.stars || 0), 0);

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 animate-fade-down">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary/10 to-[oklch(0.60_0.22_300_/_10%)]">
            <LayoutDashboard className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground text-sm mt-0.5">
              Manage your projects and track performance.
            </p>
          </div>
        </div>
        <Link 
          href="/create-project" 
          className={buttonVariants({ className: "gap-2 bg-gradient-to-r from-primary to-[oklch(0.60_0.22_300)] hover:opacity-90 text-white shadow-lg shadow-primary/20 rounded-full px-6 border-0 transition-all duration-300" })}
        >
          <Plus className="h-4 w-4" />
          Add Project
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 animate-fade-up delay-1">
        <div className="neo-card p-5 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <FolderGit2 className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{projects.length}</p>
              <p className="text-xs text-muted-foreground">Total Projects</p>
            </div>
          </div>
        </div>
        <div className="neo-card p-5 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10">
              <Star className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalStars}</p>
              <p className="text-xs text-muted-foreground">Total Stars</p>
            </div>
          </div>
        </div>
        <div className="neo-card p-5 rounded-xl col-span-2 md:col-span-1">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10">
              <GitPullRequest className="h-5 w-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{projects.filter(p => p.liveLink).length}</p>
              <p className="text-xs text-muted-foreground">Live Projects</p>
            </div>
          </div>
        </div>
      </div>

      {/* Projects Section */}
      <div className="grid grid-cols-1 gap-8">
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Your Projects</h2>
            <span className="text-xs text-muted-foreground px-3 py-1 bg-primary/5 border border-primary/10 rounded-full font-medium">
              {projects.length} Total
            </span>
          </div>

          {projects.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project, i) => (
                <div key={project._id.toString()} className={`group relative animate-fade-up animate-stagger-child delay-${Math.min(i + 1, 8)}`}>
                  <ProjectCard project={project} />
                  <div className="absolute top-2 left-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <Link
                      href={`/project/${project._id}`}
                      className={buttonVariants({ variant: "outline", size: "sm", className: "glass text-xs h-7 rounded-full" })}
                    >
                      View
                    </Link>
                    <Link
                      href={project.githubRepo}
                      target="_blank"
                      className={buttonVariants({ variant: "outline", size: "sm", className: "glass text-xs h-7 rounded-full" })}
                    >
                      <GitPullRequest className="mr-1 h-3 w-3" />
                      Repo
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-16 border border-dashed border-border/50 rounded-2xl text-center space-y-4 bg-card/30 backdrop-blur-sm">
              <div className="p-4 rounded-full bg-primary/5">
                <FolderGit2 className="h-8 w-8 text-primary/40" />
              </div>
              <p className="text-muted-foreground">You haven&apos;t added any projects yet.</p>
              <Link href="/create-project" className={buttonVariants({ variant: "outline", className: "rounded-full border-primary/20 hover:bg-primary/5 hover:border-primary/40" })}>
                Add your first project
              </Link>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
