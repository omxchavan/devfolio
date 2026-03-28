import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Project from "@/models/Project";
import { AdminUsersTable } from "@/components/admin-users-table";
import { AdminProjectsTable } from "@/components/admin-projects-table";
import { ShieldCheck, Users, FolderGit2 } from "lucide-react";
import Link from "next/link";

export default async function AdminPage(props: { searchParams: Promise<{ tab?: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/api/auth/signin");
  }

  await connectDB();
  const currentUser = await User.findById(session.user.id).select("role").lean();

  if (!currentUser || currentUser.role !== "admin") {
    redirect("/dashboard");
  }

  const searchParams = await props.searchParams;
  const currentTab = searchParams.tab === "projects" ? "projects" : "users";

  let usersData: any[] = [];
  if (currentTab === "users") {
    const users = await User.find()
      .sort({ createdAt: -1 })
      .select("name email image githubUsername bio prn year role projects socialLinks createdAt")
      .lean();

    usersData = users.map((u: any) => ({
      _id: u._id.toString(),
      name: u.name,
      email: u.email,
      image: u.image,
      githubUsername: u.githubUsername,
      bio: u.bio,
      prn: u.prn || "",
      year: u.year || "",
      role: u.role || "user",
      projectCount: u.projects?.length || 0,
      createdAt: u.createdAt.toISOString(),
    }));
  }

  let projectsData: any[] = [];
  if (currentTab === "projects") {
    const projects = await Project.find()
      .sort({ createdAt: -1 })
      .populate({ path: "owner", model: User, select: "name image githubUsername year prn" })
      .lean();

    projectsData = projects.map((p: any) => ({
      _id: p._id.toString(),
      title: p.title,
      domain: p.domain,
      tags: p.tags || [],
      stars: p.stars || 0,
      featured: !!p.featured,
      createdAt: p.createdAt.toISOString(),
      owner: p.owner ? {
        name: p.owner.name,
        githubUsername: p.owner.githubUsername,
        image: p.owner.image,
        year: p.owner.year || "",
      } : null,
    }));
  }

  return (
    <div className="container mx-auto px-4 py-10 max-w-6xl selection:bg-primary/20">
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-primary/10 border border-primary/20">
              <ShieldCheck className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight">Admin Dashboard</h1>
              <p className="text-muted-foreground text-sm font-medium mt-0.5">
                Manage portal data, users, and explore submissions.
              </p>
            </div>
          </div>
        </div>

        {/* Custom Tabs */}
        <div className="flex items-center gap-1 border-b border-border">
          <Link
            href="/admin?tab=users"
            className={`flex items-center gap-2 px-6 py-3 text-sm font-bold uppercase tracking-widest transition-all border-b-2 ${
              currentTab === "users"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/30"
            }`}
          >
            <Users className="h-4 w-4" />
            Students
          </Link>
          <Link
            href="/admin?tab=projects"
            className={`flex items-center gap-2 px-6 py-3 text-sm font-bold uppercase tracking-widest transition-all border-b-2 ${
              currentTab === "projects"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/30"
            }`}
          >
            <FolderGit2 className="h-4 w-4" />
            Projects
          </Link>
        </div>

        {/* Tab Content */}
        <div className="mt-6">
          {currentTab === "users" ? (
            <AdminUsersTable initialUsers={usersData} />
          ) : (
            <AdminProjectsTable initialProjects={projectsData} />
          )}
        </div>
      </div>
    </div>
  );
}
