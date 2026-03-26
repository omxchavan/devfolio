import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, ExternalLink, GitPullRequest, ArrowUpRight } from "lucide-react";
import { IProject, IUser } from "@/types";

interface ProjectCardProps {
  project: IProject;
  variant?: "default" | "minimal";
  showOwner?: boolean;
}

const domainColors: Record<string, string> = {
  Web: "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400",
  AI: "bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-400",
  App: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400",
  Mobile: "bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-400",
  DevOps: "bg-cyan-100 text-cyan-700 dark:bg-cyan-500/15 dark:text-cyan-400",
  Data: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400",
  Security: "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-400",
  Blockchain: "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-400",
  IoT: "bg-teal-100 text-teal-700 dark:bg-teal-500/15 dark:text-teal-400",
  Other: "bg-gray-100 text-gray-700 dark:bg-gray-500/15 dark:text-gray-400",
};

export function ProjectCard({
  project,
  variant = "default",
  showOwner = true,
}: ProjectCardProps) {
  const isMinimal = variant === "minimal";

  return (
    <div
      className={`neo-card group h-full flex flex-col overflow-hidden rounded-xl ${
        isMinimal ? "max-w-sm" : ""
      }`}
    >
      {/* Project Image */}
      <Link
        href={`/project/${project._id}`}
        className={`block relative overflow-hidden ${
          isMinimal ? "aspect-[2.4/1]" : "aspect-[16/10]"
        }`}
      >
        {project.images?.[0] ? (
          <img
            src={
              project.images[0].includes("cloudinary.com")
                ? project.images[0].replace(
                    "/upload/",
                    `/upload/c_fill,g_center,ar_${
                      isMinimal ? "2.4" : "1.6"
                    },w_${isMinimal ? "600" : "1200"},q_auto,f_auto/`
                  )
                : project.images[0]
            }
            alt={project.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/5 via-accent to-secondary">
            <GitPullRequest
              className={`${
                isMinimal ? "h-6 w-6" : "h-10 w-10"
              } text-muted-foreground/25`}
            />
          </div>
        )}
        {/* Domain badge */}
        <div className="absolute top-2.5 right-2.5">
          <span
            className={`neo-badge inline-flex items-center rounded-md px-2 py-0.5 ${
              isMinimal ? "text-[9px]" : "text-[10px]"
            } ${domainColors[project.domain] || domainColors.Other}`}
          >
            {project.domain}
          </span>
        </div>
        {/* Hover arrow */}
        <div className="absolute bottom-2.5 right-2.5 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-y-1 group-hover:translate-y-0">
          <div className="p-1.5 rounded-lg bg-foreground text-background">
            <ArrowUpRight className="h-3.5 w-3.5" />
          </div>
        </div>
      </Link>

      {/* Content */}
      <div className="flex flex-col flex-1">
        <div className={`space-y-2 flex-1 ${isMinimal ? "p-3" : "p-4"}`}>
          {/* Title */}
          <Link href={`/project/${project._id}`}>
            <h3
              className={`font-bold leading-tight line-clamp-1 group-hover:text-primary transition-colors duration-200 ${
                isMinimal ? "text-[13px]" : "text-[15px]"
              }`}
            >
              {project.title}
            </h3>
          </Link>

          {/* Description */}
          <p
            className={`text-muted-foreground line-clamp-2 leading-relaxed ${
              isMinimal ? "text-[11px]" : "text-sm"
            }`}
          >
            {project.description}
          </p>

          {/* Tech Stack */}
          {project.techStack?.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-1">
              {project.techStack
                .slice(0, isMinimal ? 3 : 4)
                .map((tech) => (
                  <span
                    key={tech}
                    className="neo-badge inline-flex items-center rounded-md px-1.5 py-0 text-[9px] h-[18px] text-muted-foreground"
                  >
                    {tech}
                  </span>
                ))}
              {project.techStack.length > (isMinimal ? 3 : 4) && (
                <span className="text-[10px] text-muted-foreground/60 px-1 self-center font-medium">
                  +{project.techStack.length - (isMinimal ? 3 : 4)}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {(showOwner || project.stars > 0) && (
          <div
            className={`flex items-center justify-between border-t-2 border-inherit p-3 ${
              isMinimal ? "pt-2 pb-2 px-3" : "pt-3"
            }`}
          >
            {showOwner ? (
              <Link
                href={`/profile/${
                  (project.owner as IUser)?.githubUsername
                }`}
                className="flex items-center gap-2 hover:opacity-80 transition-opacity"
              >
                <Avatar
                  className={`${
                    isMinimal ? "h-5 w-5" : "h-6 w-6"
                  } border-2 border-foreground/10`}
                >
                  <AvatarImage
                    src={(project.owner as IUser)?.image}
                    alt={(project.owner as IUser)?.name}
                  />
                  <AvatarFallback className="text-[10px] bg-primary/10 text-primary font-bold">
                    {(project.owner as IUser)?.name
                      ?.charAt(0)
                      ?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span
                  className={`text-muted-foreground font-medium truncate max-w-[80px] hover:text-foreground transition-colors ${
                    isMinimal ? "text-[11px]" : "text-xs"
                  }`}
                >
                  {(project.owner as IUser)?.name}
                </span>
              </Link>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <Star
                  className={`${
                    isMinimal ? "h-3 w-3" : "h-3.5 w-3.5"
                  } text-amber-500 fill-amber-500/20`}
                />
                <span
                  className={`${
                    isMinimal ? "text-[11px]" : "text-xs"
                  } font-bold tabular-nums`}
                >
                  {project.stars}
                </span>
              </div>
              {project.liveLink && (
                <ExternalLink
                  className={`${
                    isMinimal ? "h-3 w-3" : "h-3.5 w-3.5"
                  } text-emerald-500`}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
