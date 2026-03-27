import Link from "next/link";
import { buttonVariants } from "@/components/ui/button-variants";
import { ProjectCard } from "@/components/project-card";
import { connectDB } from "@/lib/db";
import Project from "@/models/Project";
import User from "@/models/User";
import { IProject } from "@/types";
import { ArrowRight, Code2, Rocket, Users, Zap } from "lucide-react";

import { unstable_cache } from "next/cache";

const getCachedFeaturedProjects = unstable_cache(
  async () => {
    await connectDB();
    const projects = await Project.find()
      .sort({ stars: -1, createdAt: -1 })
      .limit(6)
      .populate({ path: "owner", model: User, select: "name image githubUsername" })
      .lean();
    
    // Serialize Mongoose docs
    return JSON.parse(JSON.stringify(projects)) as IProject[];
  },
  ["featured-projects"],
  { revalidate: 60, tags: ["projects"] }
);

async function getFeaturedProjects() {
  return getCachedFeaturedProjects();
}

export default async function Home() {
  const featuredProjects = await getFeaturedProjects();

  return (
    <div className="flex flex-col gap-0 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-background pt-28 pb-36">
        {/* Dot grid pattern */}
        <div className="absolute inset-0 bg-dot-grid" />
        
        {/* Gradient orbs */}
        <div className="gradient-orb w-[500px] h-[500px] bg-primary/40 -top-40 -left-20" />
        <div className="gradient-orb w-[400px] h-[400px] bg-[oklch(0.60_0.22_300_/_40%)] -top-20 right-0" />
        <div className="gradient-orb w-[300px] h-[300px] bg-[oklch(0.70_0.18_200_/_30%)] bottom-0 left-1/3" />
        
        {/* Fade overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 to-transparent h-20" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col items-center text-center space-y-8 max-w-3xl mx-auto">
            <div className="animate-fade-up inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary backdrop-blur-sm">
              <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse" />
              The platform for student builders
            </div>
            
            <h1 className="animate-fade-up delay-1 text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1]">
              Showcase your work to the{" "}
              <span className="gradient-text-animated">world</span>
            </h1>
            
            <p className="animate-fade-up delay-2 text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed">
              Devfolio automatically syncs with GitHub to display your projects,
              find your contributors, and build your developer portfolio in seconds.
            </p>
            
            <div className="animate-fade-up delay-3 flex flex-col sm:flex-row items-center gap-4 pt-4">
              <Link
                href="/create-project"
                className={buttonVariants({ size: "lg", className: "w-full sm:w-auto gap-2 bg-gradient-to-r from-primary to-[oklch(0.60_0.22_300)] hover:opacity-90 text-white shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all duration-300 rounded-full px-8 border-0" })}
              >
                <Rocket className="h-4 w-4" />
                Add Your Project
              </Link>
              <Link
                href="/explore"
                className={buttonVariants({ size: "lg", variant: "outline", className: "w-full sm:w-auto gap-2 rounded-full px-8 border-border/50 hover:border-primary/30 hover:bg-primary/5 transition-all duration-300" })}
              >
                Explore Projects
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 -mt-16 relative z-20">
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: Code2,
              title: "GitHub Sync",
              description: "We automatically fetch your repository details, tech stack, and README data.",
              color: "from-blue-500/15 to-blue-500/5",
              iconColor: "text-blue-500",
              delay: "delay-1",
            },
            {
              icon: Users,
              title: "Auto-Contributors",
              description: "Contributors are automatically detected and linked to their devfolio profiles.",
              color: "from-violet-500/15 to-violet-500/5",
              iconColor: "text-violet-500",
              delay: "delay-2",
            },
            {
              icon: Zap,
              title: "Beautiful Portfolios",
              description: "Get a stunning, shareable developer portfolio page right out of the box.",
              color: "from-emerald-500/15 to-emerald-500/5",
              iconColor: "text-emerald-500",
              delay: "delay-3",
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className={`animate-fade-up animate-stagger-child ${feature.delay} neo-card group flex flex-col items-center text-center p-8 space-y-4 rounded-xl`}
            >
              <div className={`p-3 rounded-xl bg-gradient-to-br ${feature.color} ${feature.iconColor} transition-transform duration-300 group-hover:scale-110`}>
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold">{feature.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Projects */}
      <section className="container mx-auto px-4 space-y-8 mt-24">
        <div className="flex items-center justify-between">
          <div className="space-y-1.5">
            <h2 className="text-3xl font-bold tracking-tight">Featured Projects</h2>
            <p className="text-muted-foreground">Top rated projects from the community.</p>
          </div>
          <Link
            href="/explore"
            className={buttonVariants({ variant: "ghost", className: "hidden sm:flex gap-1 text-muted-foreground hover:text-primary transition-colors" })}
          >
            View all
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {featuredProjects.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProjects.map((project, i) => (
              <div key={project._id.toString()} className={`animate-fade-up animate-stagger-child delay-${Math.min(i + 1, 6)}`}>
                <ProjectCard project={project as any} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 rounded-2xl border border-dashed border-border/50 bg-card/30 backdrop-blur-sm">
            <p className="text-muted-foreground">No projects found. Be the first to add one!</p>
          </div>
        )}
        
        <div className="sm:hidden flex justify-center pt-4">
          <Link
            href="/explore"
            className={buttonVariants({ variant: "ghost", className: "gap-1 text-muted-foreground hover:text-primary" })}
          >
            View all projects
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
