import Link from "next/link";
import { buttonVariants } from "@/components/ui/button-variants";
import { ProjectCard } from "@/components/project-card";
import { connectDB } from "@/lib/db";
import Project from "@/models/Project";
import User from "@/models/User";
import { IProject } from "@/types";
import { ArrowRight, Code2, Rocket, Users } from "lucide-react";

async function getFeaturedProjects() {
  await connectDB();
  const projects = await Project.find()
    .sort({ stars: -1, createdAt: -1 })
    .limit(6)
    .populate({ path: "owner", model: User, select: "name image githubUsername" })
    .lean();
  
  // Serialize Mongoose docs
  return JSON.parse(JSON.stringify(projects)) as IProject[];
}

export default async function Home() {
  const featuredProjects = await getFeaturedProjects();

  return (
    <div className="flex flex-col gap-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-background pt-24 pb-32">
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:60px_60px]" />
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col items-center text-center space-y-8 max-w-3xl mx-auto">
            <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80">
              <span className="flex h-2 w-2 rounded-full bg-primary mr-2"></span>
              The platform for student builders
            </div>
            
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">
              Showcase your work to the <span className="text-primary">world</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl">
              Devfolio automatically syncs with GitHub to display your projects,
              find your contributors, and build your developer portfolio in seconds.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
              <Link
                href="/create-project"
                className={buttonVariants({ size: "lg", className: "w-full sm:w-auto gap-2" })}
              >
                <Rocket className="h-4 w-4" />
                Add Your Project
              </Link>
              <Link
                href="/explore"
                className={buttonVariants({ size: "lg", variant: "outline", className: "w-full sm:w-auto gap-2" })}
              >
                Explore Projects
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="flex flex-col items-center text-center p-6 space-y-4 rounded-2xl bg-muted/50">
            <div className="p-3 rounded-full bg-primary/10 text-primary">
              <Code2 className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-semibold">GitHub Sync</h3>
            <p className="text-muted-foreground">
              We automatically fetch your repository details, tech stack, and README data.
            </p>
          </div>
          <div className="flex flex-col items-center text-center p-6 space-y-4 rounded-2xl bg-muted/50">
            <div className="p-3 rounded-full bg-primary/10 text-primary">
              <Users className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-semibold">Auto-Contributors</h3>
            <p className="text-muted-foreground">
              Contributors are automatically detected and linked to their devfolio profiles.
            </p>
          </div>
          <div className="flex flex-col items-center text-center p-6 space-y-4 rounded-2xl bg-muted/50">
            <div className="p-3 rounded-full bg-primary/10 text-primary">
              <Rocket className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-semibold">Beautiful Portfolios</h3>
            <p className="text-muted-foreground">
              Get a stunning, shareable developer portfolio page right out of the box.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Projects */}
      <section className="container mx-auto px-4 space-y-8">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-3xl font-bold tracking-tight">Featured Projects</h2>
            <p className="text-muted-foreground">Top rated projects from the community.</p>
          </div>
          <Link
            href="/explore"
            className={buttonVariants({ variant: "ghost", className: "hidden sm:flex" })}
          >
            View all {">"}
          </Link>
        </div>

        {featuredProjects.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProjects.map((project) => (
              <ProjectCard key={project._id.toString()} project={project as any} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-muted/30 rounded-2xl border border-dashed">
            <p className="text-muted-foreground">No projects found. Be the first to add one!</p>
          </div>
        )}
        
        <div className="sm:hidden flex justify-center pt-4">
          <Link
            href="/explore"
            className={buttonVariants({ variant: "ghost" })}
          >
            View all projects {">"}
          </Link>
        </div>
      </section>
    </div>
  );
}
