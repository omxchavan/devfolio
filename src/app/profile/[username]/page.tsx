import { notFound } from "next/navigation";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Project from "@/models/Project";
import { ProfileCard } from "@/components/profile-card";
import { ProjectCard } from "@/components/project-card";
import GithubCalendar from "@/components/github-calendar";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { BookOpen, FolderGit2, Star, Clock } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button-variants";
import { unstable_cache } from "next/cache";

interface ProfilePageProps {
  params: Promise<{ username: string }>;
}

const getCachedUserProfile = unstable_cache(
  async (username: string) => {
    await connectDB();
    const user = await User.findOne({ githubUsername: username })
      .populate({
        path: "projects",
        model: Project,
        options: { sort: { createdAt: -1 } },
        populate: { path: "owner", model: User, select: "name image githubUsername" },
      })
      .lean();
    if (!user) return null;
    return JSON.parse(JSON.stringify(user));
  },
  ["profile-detail"],
  { revalidate: 60, tags: ["profiles"] }
);

export default async function ProfilePage(props: ProfilePageProps) {
  const session = await getServerSession(authOptions);
  const params = await props.params;
  const user = await getCachedUserProfile(params.username);

  if (!user) notFound();

  const isOwner = session?.user?.id === user._id.toString();

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-10 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-10 lg:gap-14">

          {/* Sidebar */}
          <aside className="lg:sticky lg:top-24 self-start">
            <ProfileCard user={user} compact={false} isOwner={isOwner} />
          </aside>

          {/* Main */}
          <main className="space-y-8 min-w-0">

            {/* Tabs */}
            <nav className="flex items-center gap-6 border-b border-border pb-1 overflow-x-auto">
              <Link href={`/profile/${user.githubUsername}`} className="flex items-center gap-2 pb-3 px-1 border-b-2 border-primary font-semibold text-sm text-primary whitespace-nowrap">
                <BookOpen className="h-4 w-4" />
                Overview
              </Link>
              <Link href="#projects" className="flex items-center gap-2 pb-3 px-1 border-b-2 border-transparent text-muted-foreground font-medium text-sm hover:text-foreground transition-colors whitespace-nowrap">
                <FolderGit2 className="h-4 w-4" />
                Projects
                <span className="ml-1 rounded-full bg-muted px-1.5 py-0.5 text-[10px] tabular-nums font-medium">
                  {user.projects?.length || 0}
                </span>
              </Link>
              <button disabled className="flex items-center gap-2 pb-3 px-1 border-b-2 border-transparent text-muted-foreground/50 font-medium text-sm whitespace-nowrap">
                <Star className="h-4 w-4" />
                Starred
                <span className="ml-1 rounded-full bg-muted px-1.5 py-0.5 text-[10px] tabular-nums">0</span>
              </button>
            </nav>

            {/* Activity */}
            <section className="space-y-3 overflow-hidden">
              <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Clock className="h-3.5 w-3.5" />
                GitHub Activity
              </h3>
              <div className="max-w-full overflow-hidden p-4 rounded-xl border border-border bg-card">
                <GithubCalendar username={user.githubUsername} />
              </div>
            </section>

            {/* Projects */}
            <section className="space-y-5" id="projects">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h2 className="text-xl font-bold tracking-tight">Showcased Projects</h2>
                  <p className="text-sm text-muted-foreground">
                    Projects that define {user.name.split(' ')[0]}&apos;s journey.
                  </p>
                </div>
              </div>

              {!user.projects || user.projects.length === 0 ? (
                <div className="text-center py-16 rounded-xl border border-dashed border-border">
                  <div className="p-3 rounded-full bg-muted inline-block mb-3">
                    <FolderGit2 className="h-6 w-6 text-muted-foreground/40" />
                  </div>
                  <p className="text-muted-foreground text-sm">
                    No projects added yet.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  {user.projects.slice(0, 9).map((project: any) => (
                    <ProjectCard
                      key={project._id.toString()}
                      project={project}
                      variant="minimal"
                      showOwner={false}
                    />
                  ))}
                </div>
              )}

              {user.projects?.length > 9 && (
                <div className="flex justify-center pt-2">
                  <button className={buttonVariants({ variant: "ghost", className: "text-sm" })}>
                    View all projects
                  </button>
                </div>
              )}
            </section>

            {/* Footer CTA */}
            {isOwner ? (
              <div className="card-elevated p-6 text-center space-y-3">
                <p className="text-muted-foreground text-sm max-w-sm mx-auto">
                  Customize your profile and highlight your best work.
                </p>
                <Link href="/settings/profile" className={buttonVariants({ className: "rounded-lg px-6" })}>
                  Manage Profile
                </Link>
              </div>
            ) : (
              <div className="card-elevated p-6 text-center">
                <p className="text-sm text-muted-foreground">
                  Inspired by {user.name.split(' ')[0]}&apos;s work?
                </p>
                <Link href={user.socialLinks?.github || "#"} target="_blank" className="text-primary font-medium hover:underline block mt-1 text-sm">
                  @{user.githubUsername} on GitHub
                </Link>
              </div>
            )}

          </main>
        </div>
      </div>
    </div>
  );
}
