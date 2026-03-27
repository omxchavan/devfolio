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

interface ProfilePageProps {
  params: Promise<{
    username: string;
  }>;
}

import { unstable_cache } from "next/cache";

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

async function getUserProfile(username: string) {
  return getCachedUserProfile(username);
}

export default async function ProfilePage(props: ProfilePageProps) {
  const session = await getServerSession(authOptions);
  const params = await props.params;
  const user = await getUserProfile(params.username);

  if (!user) {
    notFound();
  }

  const isOwner = session?.user?.id === user._id.toString();

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground selection:bg-primary/20 selection:text-foreground">
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-12 lg:gap-16 relative">
          
          {/* Sidebar Area (Left) */}
          <aside className="lg:sticky lg:top-12 self-start animate-slide-in-left">
            <ProfileCard user={user} compact={false} isOwner={isOwner} />
          </aside>

          {/* Main Content Area (Right) */}
          <main className="space-y-10 min-w-0">
            
            {/* Navigation Tabs */}
            <nav className="flex items-center gap-6 border-b border-border/30 pb-1 overflow-x-auto no-scrollbar scroll-smooth animate-fade-down">
              <Link href={`/profile/${user.githubUsername}`} className="flex items-center gap-2 pb-3 px-1 border-b-2 border-primary font-semibold text-sm text-primary transition-all hover:text-primary whitespace-nowrap">
                <BookOpen className="h-4 w-4" />
                Overview
              </Link>
              <Link href="#projects" className="flex items-center gap-2 pb-3 px-1 border-b-2 border-transparent text-muted-foreground/70 font-medium text-sm transition-all hover:text-primary hover:border-primary/30 whitespace-nowrap">
                <FolderGit2 className="h-4 w-4" />
                Projects
                <span className="ml-1 rounded-full bg-primary/10 text-primary px-1.5 py-0.5 text-[10px] tabular-nums font-medium">
                  {user.projects?.length || 0}
                </span>
              </Link>
              <button className="flex items-center gap-2 pb-3 px-1 border-b-2 border-transparent text-muted-foreground/70 font-medium text-sm transition-all hover:text-primary hover:border-primary/30 disabled:opacity-50 whitespace-nowrap">
                <Star className="h-4 w-4" />
                Starred
                <span className="ml-1 rounded-full bg-muted px-1.5 py-0.5 text-[10px] tabular-nums">0</span>
              </button>
            </nav>

            {/* Overview Section */}
            <div className="space-y-10 animate-fade-up">
              
              {/* Contribution Graph */}
              <section className="space-y-4 overflow-hidden">
                 <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                       <Clock className="h-4 w-4 text-primary/60" />
                       GitHub Activity
                    </h3>
                 </div>
                 <div className="max-w-full overflow-hidden p-4 rounded-xl border border-border/20 bg-card/40 backdrop-blur-sm">
                    <GithubCalendar username={user.githubUsername} />
                 </div>
              </section>

              {/* Projects Showcase */}
              <section className="space-y-6" id="projects">
                <div className="flex items-center justify-between pb-4">
                  <div className="space-y-1">
                    <h2 className="text-xl font-bold tracking-tight">Showcased Projects</h2>
                    <p className="text-sm text-muted-foreground">
                       Hand-picked projects that define {user.name.split(' ')[0]}&apos;s journey.
                    </p>
                  </div>
                </div>

                {!user.projects || user.projects.length === 0 ? (
                  <div className="text-center py-20 rounded-2xl border border-dashed border-border/50 bg-card/30 backdrop-blur-sm transition-colors">
                    <div className="p-3 rounded-full bg-primary/5 inline-block mb-3">
                      <FolderGit2 className="h-6 w-6 text-primary/40" />
                    </div>
                    <p className="text-muted-foreground text-sm">
                      No projects added to this devfolio yet.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {user.projects.slice(0, 9).map((project: any, i: number) => (
                      <div key={project._id.toString()} className={`animate-fade-up animate-stagger-child delay-${Math.min(i + 1, 8)}`}>
                        <ProjectCard 
                          project={project} 
                          variant="minimal"
                          showOwner={false}
                        />
                      </div>
                    ))}
                  </div>
                )}
                
                {user.projects?.length > 9 && (
                   <div className="flex justify-center pt-2">
                      <button className={buttonVariants({ variant: "ghost", className: "text-muted-foreground hover:text-primary transition-colors text-sm rounded-full" })}>
                        View all projects
                      </button>
                   </div>
                )}
              </section>

              {/* Contact / Footer CTA */}
              {isOwner ? (
                <div className="p-8 rounded-2xl border border-primary/10 bg-gradient-to-br from-primary/[0.03] to-[oklch(0.60_0.22_300_/_3%)] text-center flex flex-col items-center gap-4 backdrop-blur-sm">
                  <p className="text-muted-foreground max-w-sm text-sm">
                    Customize your profile overview and highlight your best work to stand out to the community.
                  </p>
                  <Link href="/settings/profile" className={buttonVariants({ className: "rounded-full bg-gradient-to-r from-primary to-[oklch(0.60_0.22_300)] hover:opacity-90 text-white shadow-lg shadow-primary/20 border-0 px-6 transition-all duration-300" })}>
                    Manage My Profile
                  </Link>
                </div>
              ) : (
                <div className="p-8 border border-border/30 rounded-2xl bg-card/30 backdrop-blur-sm text-center">
                  <p className="text-sm text-muted-foreground">
                    Inspired by {user.name.split(' ')[0]}&apos;s work? Follow their GitHub to see more!
                  </p>
                  <Link href={user.socialLinks?.github || "#"} target="_blank" className="text-primary font-medium hover:underline block mt-2 text-sm">
                     @{user.githubUsername} on GitHub
                  </Link>
                </div>
              )}

            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
