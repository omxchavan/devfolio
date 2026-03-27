import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, ExternalLink, GitPullRequest, ArrowUpRight, GraduationCap } from "lucide-react";
import { IProject, IUser } from "@/types";
import { ProjectCarousel } from "@/components/project-carousel";

interface ProjectCardProps {
  project: IProject;
  variant?: "default" | "minimal";
  showOwner?: boolean;
}

const domainColors: Record<string, string> = {
  Web: "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
  AI: "bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-400",
  App: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
  Mobile: "bg-orange-50 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400",
  DevOps: "bg-cyan-50 text-cyan-700 dark:bg-cyan-500/10 dark:text-cyan-400",
  Data: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
  Security: "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400",
  Blockchain: "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400",
  IoT: "bg-teal-50 text-teal-700 dark:bg-teal-500/10 dark:text-teal-400",
  Other: "bg-gray-50 text-gray-700 dark:bg-gray-500/10 dark:text-gray-400",
};

export function ProjectCard({
  project,
  variant = "default",
  showOwner = true,
}: ProjectCardProps) {
  const isMinimal = variant === "minimal";
  const owner = project.owner as IUser;

  return (
    <div className="card-elevated group h-full flex flex-col overflow-hidden transition-all duration-300 hover:translate-y-[-2px] hover:shadow-xl">
      {/* Project Carousel / Image */}
      <div className="relative group">
        <Link
          href={`/project/${project._id}`}
          className="block w-full h-full cursor-pointer"
        >
          <ProjectCarousel 
            images={project.images} 
            title={project.title}
            aspectRatio={isMinimal ? "aspect-[2.4/1]" : "aspect-[16/10]"}
            showArrows={true}
          />
        </Link>
        
        {/* Domain badge - Fixed position over carousel */}
        <div className="absolute top-3 right-3 z-20">
          <span
            className={`inline-flex items-center rounded-md px-2 py-0.5 font-bold uppercase tracking-wider backdrop-blur-md border border-white/20 select-none shadow-sm ${
              isMinimal ? "text-[8px]" : "text-[9px]"
            } ${domainColors[project.domain] || domainColors.Other}`}
          >
            {project.domain}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-5">
        <div className="space-y-3 flex-1">
          <Link href={`/project/${project._id}`}>
            <h3
              className={`font-bold leading-tight group-hover:text-primary transition-colors line-clamp-2 ${
                isMinimal ? "text-[14px]" : "text-[17px]"
              }`}
            >
              {project.title}
            </h3>
          </Link>

          <p
            className={`text-muted-foreground line-clamp-2 leading-relaxed font-normal ${
              isMinimal ? "text-[11px]" : "text-sm"
            }`}
          >
            {project.description}
          </p>

          {/* Tech Stack */}
          {project.techStack?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {project.techStack
                .slice(0, isMinimal ? 3 : 5)
                .map((tech) => (
                  <span
                    key={tech}
                    className="inline-flex items-center rounded-md bg-muted/60 border border-border/30 px-2 py-0 text-[10px] h-5 text-muted-foreground/80 font-medium"
                  >
                    {tech}
                  </span>
                ))}
              {project.techStack.length > (isMinimal ? 3 : 5) && (
                <span className="text-[10px] text-muted-foreground/40 font-medium self-center pl-1">
                  +{project.techStack.length - (isMinimal ? 3 : 5)}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-5 mt-5 border-t border-border/40">
          {showOwner && owner ? (
            <Link
              href={`/profile/${owner.githubUsername}`}
              className="flex items-center gap-2.5 group/owner"
            >
              <Avatar className="h-6 w-6 border border-border">
                <AvatarImage src={owner.image} alt={owner.name} />
                <AvatarFallback className="text-[10px] bg-muted font-bold">
                  {owner.name?.charAt(0)?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col min-w-0">
                <span className="text-[11px] font-bold text-foreground/80 truncate max-w-[100px] group-hover/owner:text-primary transition-colors leading-none">
                  {owner.name}
                </span>
                {owner.year && (
                  <span className="text-[9px] text-primary/70 font-bold uppercase tracking-tighter flex items-center gap-0.5 mt-0.5">
                    <GraduationCap className="h-2 w-2" />
                    {owner.year}
                  </span>
                )}
              </div>
            </Link>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <Star className="h-3.5 w-3.5 text-muted-foreground/40 group-hover:text-amber-500 transition-colors" />
              <span className="text-[11px] font-bold tabular-nums text-muted-foreground/80">
                {project.stars}
              </span>
            </div>
            {project.liveLink && (
              <ExternalLink className="h-3.5 w-3.5 text-muted-foreground/40 hover:text-emerald-500 transition-colors" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
