import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ProjectForm } from "@/components/project-form";
import { ArrowLeft, Rocket } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button-variants";

export default async function CreateProjectPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/?login=true");
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-4 animate-fade-down">
          <Link href="/dashboard" className={buttonVariants({ variant: "ghost", size: "icon", className: "shrink-0 -ml-2 hover:bg-primary/10 rounded-full transition-all duration-200" })}>
            <ArrowLeft className="h-5 w-5 text-muted-foreground" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-primary/10 to-[oklch(0.60_0.22_300_/_10%)]">
              <Rocket className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Add Project</h1>
              <p className="text-muted-foreground text-sm">
                Import a repository from GitHub to showcase to the community.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl p-6 md:p-8 border border-border/30 bg-card/60 backdrop-blur-sm animate-fade-up delay-1">
          <ProjectForm />
        </div>
      </div>
    </div>
  );
}
