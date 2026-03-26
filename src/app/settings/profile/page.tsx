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
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-3 animate-fade-down">
          <div className="p-2 rounded-lg bg-gradient-to-br from-primary/10 to-[oklch(0.60_0.22_300_/_10%)]">
            <Settings className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Edit Profile</h1>
            <p className="text-muted-foreground text-sm">
              Update your public profile and let the community know about you.
            </p>
          </div>
        </div>

        <div className="rounded-2xl p-6 md:p-8 border border-border/30 bg-card/60 backdrop-blur-sm animate-fade-up delay-1">
          <ProfileForm initialData={initialData} />
        </div>
      </div>
    </div>
  );
}
