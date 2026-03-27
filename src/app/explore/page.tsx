import { Suspense } from "react";
import { FilterSidebar } from "@/components/filter-sidebar";
import { SearchBar } from "@/components/search-bar";
import { ProjectCard } from "@/components/project-card";
import { connectDB } from "@/lib/db";
import Project from "@/models/Project";
import User from "@/models/User";
import { IProject } from "@/types";
import { searchQuerySchema } from "@/lib/validations";
import { Compass, Sparkles } from "lucide-react";

import { unstable_cache } from "next/cache";

// Revalidate every 60 seconds for global caching
export const revalidate = 60;

interface ExplorePageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

const getCachedFilteredProjects = unstable_cache(
  async (params: Record<string, string | undefined>) => {
    await connectDB();

    const query = searchQuerySchema.parse(params);
    const filter: Record<string, unknown> = {};

    if (query.domain) {
      filter.domain = query.domain;
    }

    if (query.tags) {
      const tagList = query.tags.split(",").map((t: string) => t.trim().toLowerCase());
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

    const projects = await Project.find(filter)
      .sort(sort)
      .limit(50)
      .populate({ path: "owner", model: User, select: "name image githubUsername" })
      .lean();

    return JSON.parse(JSON.stringify(projects)) as IProject[];
  },
  ["explore-projects"],
  { revalidate: 60, tags: ["projects"] }
);

async function getFilteredProjects(searchParams: { [key: string]: string | undefined }) {
  return getCachedFilteredProjects(searchParams);
}

function ProjectsLoading() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className={`neo-card rounded-xl overflow-hidden animate-fade-up animate-stagger-child delay-${i}`}>
          <div className="h-44 w-full skeleton-shimmer" />
          <div className="p-4 space-y-3">
            <div className="h-4 w-3/4 rounded skeleton-shimmer" />
            <div className="h-3 w-full rounded skeleton-shimmer" />
            <div className="h-3 w-5/6 rounded skeleton-shimmer" />
            <div className="flex gap-1.5 pt-1">
              <div className="h-[18px] w-12 rounded skeleton-shimmer" />
              <div className="h-[18px] w-14 rounded skeleton-shimmer" />
              <div className="h-[18px] w-10 rounded skeleton-shimmer" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

async function ProjectsGrid({ searchParams }: { searchParams: { [key: string]: string | undefined } }) {
  const projects = await getFilteredProjects(searchParams);

  if (projects.length === 0) {
    return (
      <div className="neo-card flex flex-col items-center justify-center py-24 text-center rounded-xl">
        <div className="p-4 rounded-full bg-primary/5 mb-4">
          <Compass className="h-8 w-8 text-primary/40" />
        </div>
        <h3 className="text-lg font-bold mb-1">No projects found</h3>
        <p className="text-muted-foreground max-w-sm text-sm">
          We couldn&apos;t find any projects matching your filters.
          Try adjusting your search or clearing some filters.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
      {projects.map((project, i) => (
        <div key={project._id.toString()} className={`animate-fade-up animate-stagger-child delay-${Math.min(i + 1, 8)}`}>
          <ProjectCard project={project as any} />
        </div>
      ))}
    </div>
  );
}

export default async function ExplorePage(props: ExplorePageProps) {
  const searchParams = await props.searchParams;

  const safeParams: Record<string, string | undefined> = {};
  for (const [key, value] of Object.entries(searchParams)) {
    if (typeof value === "string") {
      safeParams[key] = value;
    }
  }

  return (
    <div className="min-h-screen">
      {/* Page Header — Cinematic & Structured */}
      <section className="relative overflow-hidden border-b-2 border-foreground/5 dark:border-border/30 bg-background/50 backdrop-blur-sm pt-12 pb-16">
        {/* Subtle decorative elements */}
        <div className="absolute inset-0 bg-dot-grid opacity-40" />
        <div className="gradient-orb w-[300px] h-[300px] bg-primary/20 -top-20 -left-20" />
        <div className="gradient-orb w-[250px] h-[250px] bg-secondary/10 bottom-0 right-0" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-12 max-w-6xl mx-auto">
            {/* Left side info */}
            <div className="max-w-xl space-y-5 animate-fade-up">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-primary">
                <Sparkles className="h-3.5 w-3.5" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Discover</span>
              </div>

              <div className="space-y-3">
                <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-none">
                  Explore <span className="gradient-text-animated">Projects</span>
                </h1>
                <p className="text-muted-foreground text-lg leading-relaxed max-w-sm">
                  Find amazing projects built by the student community.
                </p>
              </div>
            </div>

            {/* Right side search & stats */}
            <div className="flex flex-col gap-8 w-full lg:max-w-md animate-fade-up delay-1">
              <div className="relative group">
                <Suspense fallback={<div className="h-12 w-full rounded-xl skeleton-shimmer" />}>
                  <SearchBar />
                </Suspense>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-12 items-start max-w-6xl mx-auto">

          {/* Sidebar — minimal, sticky */}
          <aside className="lg:sticky lg:top-24 hidden lg:block neo-card rounded-xl p-6 bg-card/40 backdrop-blur-sm">
            <Suspense fallback={<div className="h-[400px] w-full skeleton-shimmer rounded-xl" />}>
              <FilterSidebar />
            </Suspense>
          </aside>

          {/* Project Grid */}
          <main className="min-h-[500px]">
            <Suspense fallback={<ProjectsLoading />}>
              <ProjectsGrid searchParams={safeParams} />
            </Suspense>
          </main>
        </div>
      </div>
    </div>
  );
}
