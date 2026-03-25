import { notFound } from "next/navigation";
import { connectDB } from "@/lib/db";
import Project from "@/models/Project";
import User from "@/models/User";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button-variants";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { GitPullRequest, Globe, Star, Users, FolderGit2, Calendar, Edit } from "lucide-react";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sanitizeText } from "@/lib/sanitize";
import { IProject, IUser } from "@/types";

interface ProjectPageProps {
  params: Promise<{
    id: string;
  }>;
}

async function getProjectData(id: string) {
  try {
    await connectDB();
    const project = await Project.findById(id)
      .populate({ path: "owner", model: User, select: "name image githubUsername bio socialLinks" })
      .lean();

    if (!project) return null;
    return JSON.parse(JSON.stringify(project)) as IProject;
  } catch {
    return null;
  }
}

export default async function ProjectPage(props: ProjectPageProps) {
  const session = await getServerSession(authOptions);
  const params = await props.params;
  const project = await getProjectData(params.id);

  if (!project) {
    notFound();
  }

  // Find owner in contributors list if they exist there to avoid rendering them twice in the team list
  const owner = project.owner as IUser;
  const isOwner = session?.user?.id === (owner as any)._id?.toString();
  const teamMembers = project.contributors?.filter(
    (c: any) => c.githubUsername !== owner.githubUsername
  ) || [];

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="flex flex-col gap-8">
        
        {/* Header Section */}
        <section className="flex flex-col gap-6">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="space-y-4 max-w-3xl">
              <div className="flex items-center gap-3">
                <Badge variant="secondary" className="text-primary bg-primary/10 hover:bg-primary/20">
                  {project.domain}
                </Badge>
                <div className="flex items-center text-muted-foreground text-sm gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>Added {new Date(project.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              
              <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
                {project.title}
              </h1>
              
              <p className="text-xl text-muted-foreground leading-relaxed">
                {project.description}
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row md:flex-col gap-3 shrink-0">
              <Link href={project.githubRepo} target="_blank" rel="noopener noreferrer" className={buttonVariants({ size: "lg", className: "w-full sm:w-auto gap-2" })}>
                <GitPullRequest className="h-5 w-5" />
                View Repository
              </Link>
              {project.liveLink && (
                <Link href={project.liveLink} target="_blank" rel="noopener noreferrer" className={buttonVariants({ variant: "outline", size: "lg", className: "w-full sm:w-auto gap-2" })}>
                  <Globe className="h-5 w-5" />
                  Visit Live Demo
                </Link>
              )}
              {isOwner && (
                <Link href={`/project/${project._id}/edit`} className={buttonVariants({ variant: "outline", size: "lg", className: "w-full sm:w-auto gap-2" })}>
                  <Edit className="h-5 w-5" />
                  Edit Project
                </Link>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            {project.tags?.map((tag: string) => (
              <Badge key={tag} variant="outline" className="bg-muted/50 rounded-md">
                #{tag}
              </Badge>
            ))}
          </div>
        </section>

        {/* Media / Gallery */}
        {project.images && project.images.length > 0 && (
          <section className="rounded-xl overflow-hidden border bg-muted/20">
            <div className="aspect-video relative">
              <img 
                src={project.images[0]} 
                alt={`${project.title} screenshot`}
                className="w-full h-full object-cover"
              />
            </div>
            {project.images.length > 1 && (
              <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2 p-2 bg-background border-t">
                {project.images.map((img: string, i: number) => (
                  <div key={i} className={`aspect-video relative rounded-md overflow-hidden border cursor-pointer hover:opacity-80 transition-opacity ${i === 0 ? 'ring-2 ring-primary ring-offset-1' : ''}`}>
                    <img src={img} alt={`Thumbnail ${i+1}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Content & Sidebar Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-4">
          
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-10">
            
            {/* Readme Section */}
            {project.readmeExcerpt && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b">
                  <FolderGit2 className="h-5 w-5 text-muted-foreground" />
                  <h2 className="text-xl font-semibold tracking-tight">From README.md</h2>
                </div>
                <div className="prose prose-neutral dark:prose-invert max-w-none prose-sm sm:prose-base bg-muted/30 p-6 rounded-xl border relative overflow-hidden">
                  <div className="max-h-96 overflow-hidden relative">
                    {/* Very basic render for MVP - we'd use a real markdown parser in v2 */}
                    <div className="whitespace-pre-wrap font-mono text-sm">
                      {sanitizeText(project.readmeExcerpt)}
                    </div>
                    {/* Fade out bottom */}
                    <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-muted/30 to-transparent" />
                  </div>
                  <div className="flex justify-center mt-4">
                    <Link href={project.githubRepo} target="_blank" className={buttonVariants({ variant: "outline", size: "sm" })}>
                      Read full on GitHub
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* Tech Stack */}
            {project.techStack && project.techStack.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold tracking-tight border-b pb-2">Technologies Used</h2>
                <div className="flex flex-wrap gap-2">
                  {project.techStack.map((tech: string) => (
                    <Badge key={tech} variant="secondary" className="px-3 py-1 text-sm font-medium">
                      {tech}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            
            {/* Stats Card */}
            <Card>
              <CardContent className="p-5 flex items-center justify-around">
                <div className="flex flex-col items-center gap-1">
                  <Star className="h-6 w-6 text-yellow-500 fill-yellow-500/20" />
                  <span className="font-bold text-xl">{project.stars}</span>
                  <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Stars</span>
                </div>
                <div className="w-px h-12 bg-border" />
                <div className="flex flex-col items-center gap-1">
                  <Users className="h-6 w-6 text-blue-500" />
                  <span className="font-bold text-xl">{project.contributors?.length || 1}</span>
                  <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Builders</span>
                </div>
              </CardContent>
            </Card>

            {/* Team / Contributors */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Created By</h3>
              
              <div className="flex flex-col gap-3">
                {/* Owner */}
                <Link href={`/profile/${owner.githubUsername}`}>
                  <div className="flex items-center gap-3 p-3 rounded-xl border bg-card hover:bg-accent/50 transition-colors group">
                    <Avatar className="h-12 w-12 border-2 border-primary/20 group-hover:border-primary transition-colors">
                      <AvatarImage src={owner.image} />
                      <AvatarFallback>{owner.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="font-medium text-sm group-hover:text-primary transition-colors">
                        {owner.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        @{owner.githubUsername}
                      </span>
                      <Badge variant="outline" className="w-fit mt-1 text-[10px] h-4 tracking-tighter bg-primary/5">Owner</Badge>
                    </div>
                  </div>
                </Link>

                {/* Other Contributors */}
                {teamMembers.map((contributor: any) => (
                  contributor.isLinked ? (
                    <Link key={contributor.githubUsername} href={`/profile/${contributor.githubUsername}`}>
                      <div className="flex items-center gap-3 p-3 rounded-xl border bg-card hover:bg-accent/50 transition-colors group">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={contributor.avatarUrl} />
                          <AvatarFallback>{contributor.githubUsername.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="font-medium text-sm group-hover:text-primary transition-colors">
                            @{contributor.githubUsername}
                          </span>
                          <span className="text-[10px] text-muted-foreground">Linked Contributor</span>
                        </div>
                      </div>
                    </Link>
                  ) : (
                    <div key={contributor.githubUsername} className="flex items-center gap-3 p-3 rounded-xl border bg-muted/30 grayscale-[50%] opacity-80">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={contributor.avatarUrl} />
                        <AvatarFallback>{contributor.githubUsername.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="font-medium text-sm">
                          @{contributor.githubUsername}
                        </span>
                        <span className="text-[10px] text-muted-foreground">External Contributor</span>
                      </div>
                    </div>
                  )
                ))}
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
