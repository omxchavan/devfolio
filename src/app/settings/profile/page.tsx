import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ProfileForm } from "@/components/profile-form";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

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
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Profile</h1>
          <p className="text-muted-foreground">
            Update your public profile and let the community know about you.
          </p>
        </div>

        <div className="bg-muted/30 border rounded-2xl p-6 md:p-8">
          <ProfileForm initialData={initialData} />
        </div>
      </div>
    </div>
  );
}
