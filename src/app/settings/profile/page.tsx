import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ProfileForm } from "@/components/profile-form";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { Settings } from "lucide-react";

export default async function ProfileSettingsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/?login=true");
  }

  await connectDB();
  const user = await User.findById(session.user.id).lean();

  if (!user) {
    redirect("/");
  }

  const initialData = JSON.parse(JSON.stringify(user));

  return (
    <div className="container mx-auto px-4 py-10 max-w-2xl">
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-muted">
            <Settings className="h-5 w-5 text-muted-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Edit Profile</h1>
            <p className="text-muted-foreground text-sm">
              Update your public profile and college details.
            </p>
          </div>
        </div>

        <ProfileForm initialData={initialData} />
      </div>
    </div>
  );
}
