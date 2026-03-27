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

export const revalidate = 60;

interface ExplorePageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

const getCachedFilteredProjects = unstable_cache(
  async (params: Record<string, string | undefined>) => {
    await connectDB();
    const query = searchQuerySchema.parse(params);
    const filter: Record<string, unknown> = {};
    if (query.domain) filter.domain = query.domain;
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
      query.sort === "stars" ? { stars: -1, createdAt: -1 } : { createdAt: -1 };
    const projects = await Project.find(filter)
      .sort(sort)
      .limit(50)
      .populate({ path: "owner", model: User, select: "name image githubUsername prn year" })
      .lean();
    return JSON.parse(JSON.stringify(projects)) as IProject[];
  },
  ["explore-projects"],
  { revalidate: 60, tags: ["projects"] }
);

function ProjectsLoading() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="card-elevated overflow-hidden border-border/20">
          <div className="h-48 w-full skeleton-shimmer" />
          <div className="p-5 space-y-4">
            <div className="h-5 w-3/4 rounded-md skeleton-shimmer" />
            <div className="space-y-2">
              <div className="h-3 w-full rounded-md skeleton-shimmer" />
              <div className="h-3 w-5/6 rounded-md skeleton-shimmer" />
            </div>
            <div className="pt-4 border-t border-border/10 flex justify-between">
              <div className="h-6 w-24 rounded-full skeleton-shimmer" />
              <div className="h-6 w-12 rounded-full skeleton-shimmer" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

async function ProjectsGrid({ searchParams }: { searchParams: Record<string, string | undefined> }) {
  const projects = await getCachedFilteredProjects(searchParams);

  if (projects.length === 0) {
    return (
      <div className="card-elevated flex flex-col items-center justify-center py-28 text-center border-dashed border-2 border-border/30 bg-muted/10">
        <div className="p-5 rounded-2xl bg-muted/40 mb-5">
          <Compass className="h-10 w-10 text-muted-foreground/30" />
        </div>
        <h3 className="text-xl font-bold mb-2">No projects found</h3>
        <p className="text-muted-foreground max-w-sm text-sm leading-relaxed">
          Try adjusting your search terms or filters to find what students are working on.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
      {projects.map((project) => (
        <ProjectCard key={project._id.toString()} project={project as any} />
      ))}
    </div>
  );
}

export default async function ExplorePage(props: ExplorePageProps) {
  const searchParams = await props.searchParams;
  const safeParams: Record<string, string | undefined> = {};
  for (const [key, value] of Object.entries(searchParams)) {
    if (typeof value === "string") safeParams[key] = value;
  }

  return (
    <div className="min-h-screen bg-muted/5">
      {/* Header */}
      <div className="border-b border-border/40 bg-card/60 backdrop-blur-md sticky top-16 z-40">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 max-w-6xl mx-auto">
            {/* Left */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest">
                <Sparkles className="h-3 w-3" />
                Student Showcase
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight">
                Project Gallery
              </h1>
              <p className="text-muted-foreground text-sm font-medium">
                Browsing excellence from AISSMS IOIT IT students.
              </p>
            </div>
            {/* Right — Search */}
            <div className="w-full md:max-w-sm">
              <Suspense fallback={<div className="h-11 w-full rounded-xl skeleton-shimmer" />}>
                <SearchBar />
              </Suspense>
            </div>
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-12 items-start max-w-6xl mx-auto">
          {/* Sidebar */}
          <aside className="lg:sticky lg:top-[164px] hidden lg:block">
            <Suspense fallback={<div className="h-[400px] w-full skeleton-shimmer rounded-2xl" />}>
              <div className="space-y-6">
                <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60 px-1">Filter Excellence</h3>
                <FilterSidebar />
              </div>
            </Suspense>
          </aside>

          {/* Grid */}
          <main className="min-h-[600px]">
            <Suspense fallback={<ProjectsLoading />}>
              <ProjectsGrid searchParams={safeParams} />
            </Suspense>
          </main>
        </div>
      </div>
    </div>
  );
}
