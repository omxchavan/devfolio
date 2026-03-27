import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { AdminUsersTable } from "@/components/admin-users-table";
import { ShieldCheck } from "lucide-react";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/api/auth/signin");
  }

  await connectDB();
  const currentUser = await User.findById(session.user.id).select("role").lean();

  if (!currentUser || currentUser.role !== "admin") {
    redirect("/dashboard");
  }

  // Fetch all users
  const users = await User.find()
    .sort({ createdAt: -1 })
    .select("name email image githubUsername bio prn year role projects socialLinks createdAt")
    .lean();

  const usersData = users.map((u: any) => ({
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

  return (
    <div className="container mx-auto px-4 py-10 max-w-6xl">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <ShieldCheck className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Admin Panel</h1>
            <p className="text-muted-foreground text-sm mt-0.5">
              Manage users, filter by year, and analyze student data.
            </p>
          </div>
        </div>

        <AdminUsersTable initialUsers={usersData} />
      </div>
    </div>
  );
}
