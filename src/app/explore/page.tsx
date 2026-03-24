import { Suspense } from "react";
import { FilterSidebar } from "@/components/filter-sidebar";
import { SearchBar } from "@/components/search-bar";
import { ProjectCard } from "@/components/project-card";
import { connectDB } from "@/lib/db";
import Project from "@/models/Project";
import { IProject } from "@/types";
import { searchQuerySchema } from "@/lib/validations";
import { Skeleton } from "@/components/ui/skeleton";

interface ExplorePageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

async function getFilteredProjects(searchParams: { [key: string]: string | undefined }) {
  await connectDB();
  
  const query = searchQuerySchema.parse(searchParams);
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
    .limit(50) // Hard limit for MVP
    .populate("owner", "name image githubUsername")
    .lean();

  return JSON.parse(JSON.stringify(projects)) as IProject[];
}

function ProjectsLoading() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="space-y-4">
          <Skeleton className="h-48 w-full rounded-xl" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
      ))}
    </div>
  );
}

async function ProjectsGrid({ searchParams }: { searchParams: { [key: string]: string | undefined } }) {
  const projects = await getFilteredProjects(searchParams);

  if (projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed rounded-2xl bg-muted/10">
        <h3 className="text-lg font-semibold mb-2">No projects found</h3>
        <p className="text-muted-foreground max-w-md">
          We couldn't find any projects matching your current filters. Try adjusting
          your search or clearing some filters.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map((project) => (
        <ProjectCard key={project._id.toString()} project={project as any} />
      ))}
    </div>
  );
}

export default async function ExplorePage(props: ExplorePageProps) {
  const searchParams = await props.searchParams;
  
  // Convert searchParams to standard object with string values
  const safeParams: Record<string, string | undefined> = {};
  for (const [key, value] of Object.entries(searchParams)) {
    if (typeof value === "string") {
      safeParams[key] = value;
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col gap-8">
        {/* Header & Search */}
        <div className="flex flex-col gap-4">
          <h1 className="text-3xl font-bold tracking-tight">Explore Projects</h1>
          <p className="text-muted-foreground">
            Discover amazing projects built by the student community.
          </p>
          <div className="max-w-2xl mt-2">
            <Suspense fallback={<Skeleton className="h-11 w-full" />}>
              <SearchBar />
            </Suspense>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          {/* Sidebar */}
          <aside className="lg:sticky lg:top-24 hidden lg:block border rounded-xl p-5 bg-card">
            <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
              <FilterSidebar />
            </Suspense>
          </aside>

          {/* Mobile Filters Toggle could go here but skipping for MVP simplicity */}

          {/* Main Content */}
          <main className="lg:col-span-3 min-h-[500px]">
            <Suspense fallback={<ProjectsLoading />}>
              <ProjectsGrid searchParams={safeParams} />
            </Suspense>
          </main>
        </div>
      </div>
    </div>
  );
}
