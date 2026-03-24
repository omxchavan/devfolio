import { notFound } from "next/navigation";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { ProfileCard } from "@/components/profile-card";
import { ProjectCard } from "@/components/project-card";

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
      options: { sort: { createdAt: -1 } },
      populate: { path: "owner", select: "name image githubUsername" },
    })
    .lean();

  if (!user) return null;

  return JSON.parse(JSON.stringify(user));
}

export default async function ProfilePage(props: ProfilePageProps) {
  const params = await props.params;
  const user = await getUserProfile(params.username);

  if (!user) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-start">
        {/* Profile Sidebar */}
        <aside className="md:col-span-1 md:sticky md:top-24">
          <ProfileCard user={user} />
        </aside>

        {/* Projects Space */}
        <main className="md:col-span-3 space-y-6">
          <div className="flex items-center gap-3 border-b pb-4">
            <h2 className="text-2xl font-bold tracking-tight">Projects</h2>
            <div className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-semibold">
              {user.projects?.length || 0}
            </div>
          </div>

          {!user.projects || user.projects.length === 0 ? (
            <div className="text-center py-20 bg-muted/30 rounded-2xl border border-dashed">
              <p className="text-muted-foreground">
                This user hasn't added any projects to their devfolio yet.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {user.projects.map((project: any) => (
                <ProjectCard key={project._id.toString()} project={project} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
