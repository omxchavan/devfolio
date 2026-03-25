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

async function getUserProfile(username: string) {
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
    <div className="flex flex-col min-h-screen bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-12 lg:gap-16 relative">
          
          {/* Sidebar Area (Left) */}
          <aside className="lg:sticky lg:top-12 self-start animate-in fade-in slide-in-from-left-4 duration-700">
            <ProfileCard user={user} compact={false} isOwner={isOwner} />
          </aside>

          {/* Main Content Area (Right) */}
          <main className="space-y-10 min-w-0">
            
            {/* Navigation Tabs (Pseudo-tabs for Overview/Projects) */}
            <nav className="flex items-center gap-6 border-b pb-1 overflow-x-auto no-scrollbar scroll-smooth">
              <Link href={`/profile/${user.githubUsername}`} className="flex items-center gap-2 pb-3 px-1 border-b-2 border-primary font-semibold text-sm transition-all hover:text-primary whitespace-nowrap">
                <BookOpen className="h-4 w-4" />
                Overview
              </Link>
              <Link href="#projects" className="flex items-center gap-2 pb-3 px-1 border-b-2 border-transparent text-muted-foreground/70 font-medium text-sm transition-all hover:text-primary hover:border-muted-foreground/30 whitespace-nowrap">
                <FolderGit2 className="h-4 w-4" />
                Projects
                <span className="ml-1 rounded-full bg-muted px-1.5 py-0.5 text-[10px] tabular-nums">
                  {user.projects?.length || 0}
                </span>
              </Link>
              <button className="flex items-center gap-2 pb-3 px-1 border-b-2 border-transparent text-muted-foreground/70 font-medium text-sm transition-all hover:text-primary hover:border-muted-foreground/30 disabled:opacity-50 whitespace-nowrap">
                <Star className="h-4 w-4" />
                Starred
                <span className="ml-1 rounded-full bg-muted px-1.5 py-0.5 text-[10px] tabular-nums">0</span>
              </button>
            </nav>

            {/* Overview Section */}
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-500">
              
              {/* Contribution Graph (Requested Feature) */}
              <section className="space-y-4 overflow-hidden">
                 <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                       <Clock className="h-4 w-4" />
                       GitHub Activity
                    </h3>
                 </div>
                 <div className="max-w-full overflow-hidden">
                    <GithubCalendar username={user.githubUsername} />
                 </div>
              </section>

              {/* Pinned / Top Projects Showcase */}
              <section className="space-y-6" id="projects">
                <div className="flex items-center justify-between border-b pb-4">
                  <div className="space-y-1">
                    <h2 className="text-xl font-bold tracking-tight">Showcased Projects</h2>
                    <p className="text-sm text-muted-foreground">
                       Hand-picked projects that define {user.name.split(' ')[0]}'s journey.
                    </p>
                  </div>
                </div>

                {!user.projects || user.projects.length === 0 ? (
                  <div className="text-center py-20 bg-muted/20 rounded-2xl border border-dashed hover:bg-muted/30 transition-colors">
                    <p className="text-muted-foreground italic text-sm">
                      No projects added to this devfolio yet.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {/* Only show up to 9 on overview */}
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
                      <button className={buttonVariants({ variant: "ghost", className: "text-muted-foreground hover:text-primary transition-colors text-sm" })}>
                        View all projects
                      </button>
                   </div>
                )}
              </section>

              {/* Contact / Footer CTA */}
              {isOwner ? (
                <div className="p-8 rounded-3xl bg-primary/[0.03] border border-primary/10 text-center flex flex-col items-center gap-4">
                  <p className="text-muted-foreground max-w-sm">
                    Customize your profile overview and highlight your best work to stand out to the community.
                  </p>
                  <Link href="/settings/profile" className={buttonVariants({ className: "rounded-full" })}>
                    Manage My Profile
                  </Link>
                </div>
              ) : (
                <div className="p-8 border rounded-3xl bg-muted/10 text-center">
                  <p className="text-sm text-muted-foreground">
                    Inspired by {user.name.split(' ')[0]}'s work? Follow their GitHub to see more!
                  </p>
                  <Link href={user.socialLinks?.github || "#"} target="_blank" className="text-primary font-medium hover:underline block mt-2">
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
