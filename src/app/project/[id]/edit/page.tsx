import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Project from "@/models/Project";
import { ProjectForm } from "@/components/project-form";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button-variants";

interface EditProjectPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditProjectPage(props: EditProjectPageProps) {
  const params = await props.params;
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    redirect(`/?login=true&callbackUrl=${encodeURIComponent(`/project/${params.id}/edit`)}`);
  }

  await connectDB();
  const project = await Project.findById(params.id).lean();

  if (!project) {
    notFound();
  }

  if (project.owner.toString() !== session.user.id) {
    redirect(`/project/${params.id}`);
  }

  const initialData = JSON.parse(JSON.stringify(project));

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <Link href={`/project/${params.id}`} className={buttonVariants({ variant: "ghost", size: "icon", className: "shrink-0 -ml-2" })}>
            <ArrowLeft className="h-5 w-5 text-muted-foreground" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Edit Project</h1>
            <p className="text-muted-foreground">
              Update the details of your showcased project.
            </p>
          </div>
        </div>

        <div className="bg-muted/30 border rounded-2xl p-6 md:p-8">
          <ProjectForm initialData={initialData} />
        </div>
      </div>
    </div>
  );
}
