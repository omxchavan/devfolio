import Link from "next/link";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, ExternalLink, GitPullRequest } from "lucide-react";
import { IProject, IUser } from "@/types";

interface ProjectCardProps {
  project: IProject;
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

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Link href={`/project/${project._id}`}>
      <Card className="group h-full overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1 hover:border-primary/20">
        {/* Image */}
        <div className="relative aspect-[16/10] overflow-hidden bg-muted">
          {project.images?.[0] ? (
            <img
              src={project.images[0].replace("/upload/", "/upload/c_fill,g_north,ar_16:10,w_800,q_auto,f_auto/")}
              alt={project.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/5 to-primary/10">
              <GitPullRequest className="h-12 w-12 text-muted-foreground/30" />
            </div>
          )}
          <div className="absolute top-2 right-2">
            <Badge
              variant="outline"
              className={`text-xs backdrop-blur-sm ${domainColors[project.domain] || domainColors.Other}`}
            >
              {project.domain}
            </Badge>
          </div>
        </div>

        <CardContent className="space-y-3 p-4">
          {/* Title */}
          <h3 className="font-semibold text-base leading-tight line-clamp-1 group-hover:text-primary transition-colors">
            {project.title}
          </h3>

          {/* Description */}
          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
            {project.description}
          </p>

          {/* Tech Stack */}
          {project.techStack?.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {project.techStack.slice(0, 4).map((tech) => (
                <Badge
                  key={tech}
                  variant="secondary"
                  className="text-[10px] font-medium px-1.5 py-0"
                >
                  {tech}
                </Badge>
              ))}
              {project.techStack.length > 4 && (
                <Badge
                  variant="secondary"
                  className="text-[10px] font-medium px-1.5 py-0"
                >
                  +{project.techStack.length - 4}
                </Badge>
              )}
            </div>
          )}

          {/* Tags */}
          {project.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {project.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="text-[11px] text-muted-foreground/70"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </CardContent>

        <CardFooter className="flex items-center justify-between border-t p-4 pt-3">
          {/* Owner */}
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarImage
                src={(project.owner as IUser)?.image}
                alt={(project.owner as IUser)?.name}
              />
              <AvatarFallback className="text-xs">
                {(project.owner as IUser)?.name?.charAt(0)?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs text-muted-foreground truncate max-w-[100px]">
              {(project.owner as IUser)?.name}
            </span>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Star className="h-3.5 w-3.5" />
              <span className="text-xs font-medium">{project.stars}</span>
            </div>
            {project.liveLink && (
              <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
            )}
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
