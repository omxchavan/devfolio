import Link from "next/link";
import { Suspense } from "react";
import { buttonVariants } from "@/components/ui/button-variants";
import { ProjectCard } from "@/components/project-card";
import { connectDB } from "@/lib/db";
import Project from "@/models/Project";
import User from "@/models/User";
import { IProject } from "@/types";
import { ArrowRight, Code2, GraduationCap, Rocket, Users, Zap } from "lucide-react";
import { unstable_cache } from "next/cache";

export const revalidate = 60;

const getCachedFeaturedProjects = unstable_cache(
  async () => {
    await connectDB();
    const projects = await Project.find()
      .sort({ createdAt: -1 })
      .limit(3)
      .populate({ path: "owner", model: User, select: "name image githubUsername prn year" })
      .lean();
    return JSON.parse(JSON.stringify(projects)) as IProject[];
  },
  ["featured-projects"],
  { revalidate: 60, tags: ["projects"] }
);

function FeaturedProjectsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
      {[1, 2, 3].map((i) => (
        <div key={i} className="rounded-2xl border border-border/20 bg-card overflow-hidden animate-pulse">
          <div className="aspect-video bg-muted/60" />
          <div className="p-5 space-y-3">
            <div className="h-5 w-3/4 rounded-md bg-muted/60" />
            <div className="h-3 w-full rounded-md bg-muted/60" />
            <div className="h-3 w-5/6 rounded-md bg-muted/60" />
          </div>
        </div>
      ))}
    </div>
  );
}

async function FeaturedProjects() {
  const featuredProjects = await getCachedFeaturedProjects();

  if (featuredProjects.length === 0) {
    return (
      <div className="text-center py-24 rounded-2xl border border-dashed border-border bg-muted/10">
        <p className="text-muted-foreground font-medium italic">The gallery is currently being curated. Submit your project to be featured!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
      {featuredProjects.map((project) => (
        <ProjectCard key={project._id.toString()} project={project as any} />
      ))}
    </div>
  );
}

export default function Home() {
  return (
    <div className="flex flex-col pb-20">
      {/* Hero Section (Clean, non-glass) */}
      <section className="pt-24 pb-20 lg:pt-32 lg:pb-32 relative overflow-hidden bg-muted/20">
        {/* Subtle non-glass decoration */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 pointer-events-none opacity-[0.05]">
          <div className="absolute top-20 left-10 w-96 h-96 rounded-full bg-primary/20 blur-[150px]" />
          <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full bg-blue-600/10 blur-[150px]" />
        </div>

        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center text-center space-y-8 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-semibold text-primary">
              <GraduationCap className="h-3.5 w-3.5" />
              AISSMS IOIT • IT Department
            </div>

            <div className="space-y-4">
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1]">
                The Student <br />
                <span className="text-primary italic">Innovation</span> Showcase
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                The official platform for IT students to showcase engineering excellence, 
                track academic projects, and build industry-ready portfolios.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
              <Link
                href="/create-project"
                className={buttonVariants({ size: "lg", className: "w-full sm:w-auto h-12 rounded-xl px-8 shadow-lg shadow-primary/20 font-semibold" })}
              >
                <Rocket className="mr-2 h-4 w-4" />
                Submit Your Project
              </Link>
              <Link
                href="/explore"
                className={buttonVariants({ size: "lg", variant: "outline", className: "w-full sm:w-auto h-12 rounded-xl px-8 border-border bg-background hover:bg-muted font-semibold" })}
              >
                Explore Gallery
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>

            <div className="pt-10 flex flex-wrap justify-center gap-x-8 gap-y-4 text-sm text-muted-foreground/60 font-medium">
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                FY to BE Progress
              </div>
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                PRN-Verified Profiles
              </div>
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-violet-500" />
                GitHub Contribution Sync
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats/Department Focus */}
      <section className="container mx-auto px-4 pb-28 pt-10">
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: Code2,
              title: "Engineering Portfolio",
              description: "Every project is automatically linked to your GitHub repo, pulling README data and tech stacks instantly.",
              color: "text-blue-600 dark:text-blue-400",
              bg: "bg-blue-50 dark:bg-blue-500/10",
            },
            {
              icon: Users,
              title: "Peer Collaboration",
              description: "Automatically detect and link contributors. Build together and get recognized together on the department wall.",
              color: "text-violet-600 dark:text-violet-400",
              bg: "bg-violet-50 dark:bg-violet-500/10",
            },
            {
              icon: Zap,
              title: "Industry Ready",
              description: "A professional, clean, and impressive display of your 4-year journey from FY fundamentals to BE capstone projects.",
              color: "text-emerald-600 dark:text-emerald-400",
              bg: "bg-emerald-50 dark:bg-emerald-500/10",
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="group card-elevated p-8 space-y-4 shadow-sm"
            >
              <div className={`w-fit p-3 rounded-xl ${feature.bg} ${feature.color}`}>
                <feature.icon className="h-5 w-5" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold group-hover:text-primary transition-colors">{feature.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Projects Showcase */}
      <section className="container mx-auto px-4 space-y-10">
        <div className="flex items-end justify-between border-b border-border pb-6">
          <div className="space-y-1">
            <h2 className="text-3xl font-bold tracking-tight">Recent Work</h2>
            <p className="text-muted-foreground">Discover the latest submissions from IOIT IT students.</p>
          </div>
          <Link
            href="/explore"
            className={buttonVariants({ variant: "ghost", className: "hidden sm:flex gap-2 text-sm font-semibold hover:bg-muted" })}
          >
            Visit Showcase
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <Suspense fallback={<FeaturedProjectsSkeleton />}>
          <FeaturedProjects />
        </Suspense>
      </section>

      {/* Department Banner */}
      <section className="container mx-auto px-4 pt-32 pb-10">
        <div className="rounded-3xl border border-border bg-card p-10 md:p-16 flex flex-col md:flex-row items-center justify-between gap-10 overflow-hidden relative shadow-sm">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />
          
          <div className="space-y-4 text-center md:text-left relative z-10 max-w-xl">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Ready to showcase your innovation?</h2>
            <p className="text-muted-foreground md:text-lg">
              Join your fellow student builders and start building your legacy at AISSMS IOIT.
            </p>
          </div>
          
          <div className="relative z-10 shrink-0">
            <Link
              href="/create-project"
              className={buttonVariants({ size: "lg", className: "h-14 px-10 rounded-2xl text-lg font-bold shadow-xl shadow-primary/20 transition-all hover:scale-105 active:scale-95" })}
            >
              Get Started
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
