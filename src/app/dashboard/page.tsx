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
import { Plus, LayoutDashboard, GitPullRequest, Settings, ExternalLink } from "lucide-react";
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

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <LayoutDashboard className="h-8 w-8 text-primary" />
            Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your projects and see how they are performing.
          </p>
        </div>
        <Link 
          href="/create-project" 
          className={buttonVariants({ className: "gap-2" })}
        >
          <Plus className="h-4 w-4" />
          Add Project
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-8">
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Your Projects</h2>
            <span className="text-sm text-muted-foreground px-2 py-0.5 bg-muted rounded-full">
              {projects.length} Total
            </span>
          </div>

          {projects.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <div key={project._id.toString()} className="group relative">
                  <ProjectCard project={project} />
                  <div className="absolute top-2 left-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Link
                      href={`/project/${project._id}`}
                      className={buttonVariants({ variant: "outline", size: "sm", className: "bg-background/80 backdrop-blur-sm" })}
                    >
                      View
                    </Link>
                    <Link
                      href={project.githubRepo}
                      target="_blank"
                      className={buttonVariants({ variant: "outline", size: "sm", className: "bg-background/80 backdrop-blur-sm" })}
                    >
                      <GitPullRequest className="mr-2 h-4 w-4" />
                      Repo
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-12 bg-muted/20 border border-dashed rounded-2xl text-center space-y-4">
              <p className="text-muted-foreground">You haven&apos;t added any projects yet.</p>
              <Link href="/create-project" className={buttonVariants({ variant: "outline" })}>
                Add your first project
              </Link>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
