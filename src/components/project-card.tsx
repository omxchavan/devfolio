import Link from "next/link";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, ExternalLink, GitPullRequest } from "lucide-react";
import { IProject, IUser } from "@/types";

interface ProjectCardProps {
  project: IProject;
  variant?: "default" | "minimal";
  showOwner?: boolean;
}

const domainColors: Record<string, string> = {
  Web: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  AI: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
  App: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20",
  Mobile: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
  DevOps: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20",
  Data: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20",
  Security: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
  Blockchain: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
  IoT: "bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20",
  Other: "bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20",
};

export function ProjectCard({ 
  project, 
  variant = "default", 
  showOwner = true 
}: ProjectCardProps) {
  const isMinimal = variant === "minimal";

  return (
    <div className={`group h-full flex flex-col overflow-hidden rounded-xl border bg-card transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1 hover:border-primary/20 ${isMinimal ? "max-w-sm" : ""}`}>
      {/* Project Image & Link */}
      <Link href={`/project/${project._id}`} className={`block relative overflow-hidden bg-muted ${isMinimal ? "aspect-[2.4/1]" : "aspect-[16/10]"}`}>
        {project.images?.[0] ? (
          <img
            src={project.images[0].includes("cloudinary.com") 
              ? project.images[0].replace("/upload/", `/upload/c_fill,g_center,ar_${isMinimal ? "2.4" : "1.6"},w_${isMinimal ? "600" : "1200"},q_auto,f_auto/`)
              : project.images[0]
            }
            alt={project.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/5 to-primary/10">
            <GitPullRequest className={`${isMinimal ? "h-6 w-6" : "h-12 w-12"} text-muted-foreground/30`} />
          </div>
        )}
        <div className="absolute top-2 right-2">
          <Badge
            variant="outline"
            className={`${isMinimal ? "text-[8px] h-4 px-1" : "text-[10px] h-5"} backdrop-blur-sm ${domainColors[project.domain] || domainColors.Other}`}
          >
            {project.domain}
          </Badge>
        </div>
      </Link>

      <div className="flex flex-col flex-1">
        <CardContent className={`space-y-1.5 flex-1 ${isMinimal ? "p-3" : "p-4"}`}>
          {/* Title */}
          <Link href={`/project/${project._id}`}>
            <h3 className={`font-semibold leading-tight line-clamp-1 group-hover:text-primary transition-colors ${isMinimal ? "text-[13px]" : "text-base"}`}>
              {project.title}
            </h3>
          </Link>

          {/* Description */}
          <p className={`text-muted-foreground line-clamp-2 leading-relaxed ${isMinimal ? "text-[11px] opacity-80" : "text-sm"}`}>
            {project.description}
          </p>

          {/* Tech Stack */}
          {project.techStack?.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-1">
              {project.techStack.slice(0, isMinimal ? 3 : 4).map((tech) => (
                <Badge
                  key={tech}
                  variant="secondary"
                  className="text-[9px] font-medium px-1.5 py-0 h-4"
                >
                  {tech}
                </Badge>
              ))}
              {project.techStack.length > (isMinimal ? 3 : 4) && (
                <span className="text-[10px] text-muted-foreground px-1 self-center">
                  +{project.techStack.length - (isMinimal ? 3 : 4)}
                </span>
              )}
            </div>
          )}
        </CardContent>

        {(showOwner || project.stars > 0) && (
          <CardFooter className={`flex items-center justify-between border-t p-3 ${isMinimal ? "pt-2 pb-2 px-3" : "pt-3"}`}>
            {/* Owner */}
            {showOwner ? (
              <Link 
                href={`/profile/${(project.owner as IUser)?.githubUsername}`}
                className="flex items-center gap-2 hover:opacity-80 transition-opacity"
              >
                <Avatar className={`${isMinimal ? "h-5 w-5" : "h-6 w-6"}`}>
                  <AvatarImage
                    src={(project.owner as IUser)?.image}
                    alt={(project.owner as IUser)?.name}
                  />
                  <AvatarFallback className="text-[10px]">
                    {(project.owner as IUser)?.name?.charAt(0)?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className={`text-muted-foreground truncate max-w-[80px] hover:text-primary transition-colors ${isMinimal ? "text-[11px]" : "text-xs"}`}>
                  {(project.owner as IUser)?.name}
                </span>
              </Link>
            ) : (
              <div />
            )}

            {/* Stats */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-muted-foreground">
                <Star className={`${isMinimal ? "h-3 w-3" : "h-3.5 w-3.5"}`} />
                <span className={`${isMinimal ? "text-[11px]" : "text-xs"} font-medium`}>{project.stars}</span>
              </div>
              {project.liveLink && (
                <ExternalLink className={`${isMinimal ? "h-3 w-3" : "h-3.5 w-3.5"} text-muted-foreground`} />
              )}
            </div>
          </CardFooter>
        )}
      </div>
    </div>
  );
}
