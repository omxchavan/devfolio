import { notFound } from "next/navigation";
import { connectDB } from "@/lib/db";
import Project from "@/models/Project";
import User from "@/models/User";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button-variants";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { GitPullRequest, Globe, Star, Users, FolderGit2, Calendar, Edit, GraduationCap } from "lucide-react";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sanitizeText } from "@/lib/sanitize";
import { IProject, IUser } from "@/types";
import { unstable_cache } from "next/cache";
import { ProjectCarousel } from "@/components/project-carousel";

interface ProjectPageProps {
  params: Promise<{ id: string }>;
}

const getCachedProjectData = unstable_cache(
  async (id: string) => {
    try {
      await connectDB();
      const project = await Project.findById(id)
        .populate({ path: "owner", model: User, select: "name image githubUsername bio socialLinks prn year" })
        .lean();
      if (!project) return null;
      return JSON.parse(JSON.stringify(project)) as IProject;
    } catch (error: any) {
      if (error?.name === 'CastError' || error?.kind === 'ObjectId') {
        return null;
      }
      throw error;
    }
  },
  ["project-detail"],
  { revalidate: 60, tags: ["projects"] }
);

export default async function ProjectPage(props: ProjectPageProps) {
  const session = await getServerSession(authOptions);
  const params = await props.params;
  const project = await getCachedProjectData(params.id);

  if (!project) notFound();

  const owner = project.owner as IUser;
  const isOwner = session?.user?.id === (owner as any)._id?.toString();
  const teamMembers = project.contributors?.filter(
    (c: any) => c.githubUsername.toLowerCase() !== owner.githubUsername.toLowerCase()
  ) || [];

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <div className="flex flex-col gap-10">

        {/* Header */}
        <section className="flex flex-col gap-8">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-8">
            <div className="space-y-5 max-w-3xl">
              <div className="flex items-center gap-4">
                <Badge variant="secondary" className="px-3 py-1 text-xs font-bold uppercase tracking-wider bg-primary/10 text-primary border-primary/20">
                  {project.domain}
                </Badge>
                <div className="flex items-center text-muted-foreground/60 text-xs font-bold uppercase tracking-widest gap-2">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>{new Date(project.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
              </div>

              <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-[1.1]">
                {project.title}
              </h1>

              <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl">
                {project.description}
              </p>

              <div className="flex flex-wrap gap-2">
                {project.tags?.map((tag: string) => (
                  <Badge key={tag} variant="outline" className="rounded-lg px-3 py-1 text-[11px] font-semibold border-border/50 hover:bg-muted/50 transition-colors">
                    #{tag}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row md:flex-col gap-3 shrink-0">
              <Link href={project.githubRepo} target="_blank" rel="noopener noreferrer" className={buttonVariants({ size: "lg", className: "w-full sm:w-auto h-12 rounded-xl gap-2 px-8 font-bold shadow-lg shadow-primary/20" })}>
                <GitPullRequest className="h-4 w-4" />
                GitHub Repo
              </Link>
              {project.liveLink && (
                <Link href={project.liveLink} target="_blank" rel="noopener noreferrer" className={buttonVariants({ variant: "outline", size: "lg", className: "w-full sm:w-auto h-12 rounded-xl gap-2 px-8 font-bold border-border/50" })}>
                  <Globe className="h-4 w-4 text-emerald-500" />
                  Live Demo
                </Link>
              )}
              {isOwner && (
                <Link href={`/project/${project._id}/edit`} className={buttonVariants({ variant: "outline", size: "lg", className: "w-full sm:w-auto h-12 rounded-xl gap-2 px-8 font-bold border-border/50" })}>
                  <Edit className="h-4 w-4" />
                  Edit Project
                </Link>
              )}
            </div>
          </div>
        </section>

        {/* Gallery Carousel */}
        {project.images && project.images.length > 0 && (
          <section className="rounded-3xl overflow-hidden shadow-2xl shadow-black/5 bg-muted/20 border border-border/40">
            <ProjectCarousel 
              images={project.images} 
              title={project.title}
              aspectRatio="aspect-video"
              className="max-h-[600px]"
            />
          </section>
        )}

        {/* Content & Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 pt-4">

          {/* Main */}
          <div className="lg:col-span-2 space-y-10">
            {project.readmeExcerpt && (
              <div className="space-y-5">
                <div className="flex items-center gap-3 pb-3 border-b border-border/40">
                  <div className="p-2 rounded-lg bg-muted">
                    <FolderGit2 className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <h2 className="text-xl font-bold tracking-tight">Technical Overview</h2>
                </div>
                <div className="card-elevated p-8 relative overflow-hidden bg-card/50">
                   <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-[40px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                  
                  <div className="max-h-[500px] overflow-hidden relative">
                    <div className="whitespace-pre-wrap font-mono text-sm leading-relaxed text-foreground/80 selection:bg-primary/20">
                      {sanitizeText(project.readmeExcerpt)}
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-card/90 to-transparent" />
                  </div>
                  <div className="flex justify-center mt-6">
                    <Link href={project.githubRepo} target="_blank" className={buttonVariants({ variant: "secondary", size: "sm", className: "rounded-xl font-bold px-6 h-10" })}>
                      Read Full Implementation on GitHub
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {project.techStack && project.techStack.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold pb-3 border-b border-border/40">Core Stack</h2>
                <div className="flex flex-wrap gap-2.5">
                  {project.techStack.map((tech: string) => (
                    <Badge key={tech} variant="secondary" className="px-4 py-2 text-sm font-bold bg-muted/60 border border-border/40 rounded-xl hover:bg-primary/10 hover:text-primary transition-all">
                      {tech}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Creator Profile */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60 px-1">Created By</h3>
              <div className="card-elevated p-6 bg-primary/5 border-primary/10 space-y-4">
                <Link href={`/profile/${owner.githubUsername}`} className="flex items-center gap-4 group">
                  <Avatar className="h-14 w-14 border-2 border-primary/20 p-0.5">
                    <AvatarImage src={owner.image} className="rounded-full" />
                    <AvatarFallback className="bg-muted text-primary font-bold text-lg">{owner.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="font-bold text-base group-hover:text-primary transition-colors truncate">{owner.name}</p>
                    <p className="text-xs text-muted-foreground font-medium">@{owner.githubUsername}</p>
                    {owner.year && (
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary uppercase tracking-tighter">
                          <GraduationCap className="h-2.5 w-2.5" />
                          {owner.year}
                        </span>
                        {owner.prn && <span className="text-[10px] text-muted-foreground/40 font-bold">{owner.prn}</span>}
                      </div>
                    )}
                  </div>
                </Link>
                {owner.bio && <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3 italic">"{owner.bio}"</p>}
                
                <div className="flex items-center justify-between pt-4 border-t border-primary/10">
                  <div className="flex flex-col">
                    <span className="text-xl font-black tabular-nums">{project.stars}</span>
                    <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/60">Repository Stars</span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-xl font-black tabular-nums">{project.contributors?.length || 1}</span>
                    <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/60">Builders</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Team Members */}
            {teamMembers.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60 px-1">Collaborators</h3>
                <div className="flex flex-col gap-3">
                  {teamMembers.map((contributor: any) => (
                    contributor.isLinked ? (
                      <Link key={contributor.githubUsername} href={`/profile/${contributor.githubUsername}`}>
                        <div className="flex items-center gap-3 p-3 rounded-2xl border border-border/50 hover:bg-muted/50 transition-all group">
                          <Avatar className="h-10 w-10 border border-border/50">
                            <AvatarImage src={contributor.avatarUrl} />
                            <AvatarFallback className="bg-muted text-xs font-bold">{contributor.githubUsername.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="font-bold text-sm group-hover:text-primary transition-colors truncate">@{contributor.githubUsername}</p>
                            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">Student Builder</p>
                          </div>
                        </div>
                      </Link>
                    ) : (
                      <div key={contributor.githubUsername} className="flex items-center gap-3 p-3 rounded-2xl border border-border/50 opacity-60">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={contributor.avatarUrl} />
                          <AvatarFallback className="text-xs font-bold">{contributor.githubUsername.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="font-bold text-sm truncate">@{contributor.githubUsername}</p>
                          <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">External</p>
                        </div>
                      </div>
                    )
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
