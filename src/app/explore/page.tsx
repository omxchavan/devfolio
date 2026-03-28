import { Suspense } from "react";
import { FilterSidebar } from "@/components/filter-sidebar";
import { SearchBar } from "@/components/search-bar";
import { ProjectCard } from "@/components/project-card";
import { connectDB } from "@/lib/db";
import Project from "@/models/Project";
import User from "@/models/User";
import { IProject } from "@/types";
import { searchQuerySchema } from "@/lib/validations";
import { Compass, Sparkles, LayoutGrid, Search } from "lucide-react";
export const dynamic = "force-dynamic";

interface ExplorePageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

const fetchProjects = async (params: Record<string, string | undefined>) => {
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
};

const getCachedFilteredProjects = async (params: Record<string, string | undefined>) => {
  return fetchProjects(params);
};

function ProjectsLoading() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 animate-pulse">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="rounded-2xl border border-border/20 bg-card overflow-hidden">
          <div className="aspect-video bg-muted/60" />
          <div className="p-5 space-y-4">
            <div className="h-5 w-3/4 rounded-md bg-muted/60" />
            <div className="space-y-2">
              <div className="h-3 w-full rounded-md bg-muted/60" />
              <div className="h-3 w-5/6 rounded-md bg-muted/60" />
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
      <div className="flex flex-col items-center justify-center py-32 text-center rounded-3xl border-2 border-dashed border-border/40 bg-muted/10">
        <div className="p-6 rounded-3xl bg-background border border-border/50 shadow-xl mb-6">
          <Compass className="h-12 w-12 text-primary opacity-20" />
        </div>
        <h3 className="text-2xl font-black tracking-tight mb-2">No projects matching your filters</h3>
        <p className="text-muted-foreground max-w-sm text-sm font-medium leading-relaxed opacity-60">
          Try expanding your horizons by clearing some filters or searching for something broader.
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
    <div className="min-h-screen bg-background selection:bg-primary/10">
      {/* Top Page Header (Non-sticky to avoid clashing with navbar) */}
      <div className="bg-muted/40 border-b border-border py-16 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 max-w-7xl mx-auto">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-[10px] font-black uppercase tracking-[0.2em]">
                <LayoutGrid className="h-3 w-3" />
                Engineering Commons
              </div>
              <h1 className="text-5xl font-black tracking-tighter leading-none">
                Innovation <span className="text-primary italic">Gallery</span>
              </h1>
              <p className="text-muted-foreground text-base max-w-md font-medium leading-relaxed opacity-70">
                Peer-reviewed engineering projects from the AISSMS IOIT IT department.
              </p>
            </div>
            
            <div className="w-full md:max-w-sm">
              <Suspense fallback={<div className="h-14 w-full rounded-2xl bg-muted/60 animate-pulse" />}>
                <SearchBar />
              </Suspense>
            </div>
          </div>
        </div>
      </div>

      {/* Main Layout Grid */}
      <div className="container mx-auto px-4 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-16 items-start max-w-7xl mx-auto">
          
          {/* Static/Sticky Sidebar */}
          <aside className="hidden lg:block sticky top-24 self-start">
            <Suspense fallback={<div className="h-[500px] w-full bg-muted/60 rounded-3xl animate-pulse" />}>
              <div className="space-y-8 p-1">
                <div className="flex items-center gap-3 px-1 mb-2">
                  <div className="h-1 w-8 bg-primary rounded-full" />
                  <h3 className="text-[11px] font-black uppercase tracking-[0.25em] text-muted-foreground/60">Refine Search</h3>
                </div>
                <FilterSidebar />
                
                <div className="rounded-2xl bg-primary/5 border border-primary/10 p-5 mt-10">
                  <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1.5 flex items-center gap-2">
                    <Sparkles className="h-3 w-3" />
                    Pro Tip
                  </p>
                  <p className="text-[11px] text-muted-foreground leading-relaxed font-medium">
                    Combine domain filters and specific technology tags for precise results.
                  </p>
                </div>
              </div>
            </Suspense>
          </aside>

          {/* Main Results Area */}
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
