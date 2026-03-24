import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button-variants";
import { GitBranch, Link2, Globe, FolderGit2 } from "lucide-react";
import Link from "next/link";
import { IUser } from "@/types";

interface ProfileCardProps {
  user: IUser;
  compact?: boolean;
}

export function ProfileCard({ user, compact = false }: ProfileCardProps) {
  return (
    <Card className="overflow-hidden">
      {/* Header gradient */}
      <div className="h-20 bg-gradient-to-r from-primary/20 via-primary/10 to-transparent" />

      <CardContent className={`relative ${compact ? "px-4 pb-4" : "px-6 pb-6"}`}>
        {/* Avatar */}
        <Avatar
          className={`${compact ? "h-16 w-16" : "h-20 w-20"} -mt-10 border-4 border-background ring-2 ring-primary/10`}
        >
          <AvatarImage src={user.image} alt={user.name} />
          <AvatarFallback className="text-lg">
            {user.name?.charAt(0)?.toUpperCase()}
          </AvatarFallback>
        </Avatar>

        {/* Info */}
        <div className="mt-3 space-y-2">
          <div>
            <h3 className={`font-semibold ${compact ? "text-base" : "text-lg"}`}>
              {user.name}
            </h3>
            <p className="text-sm text-muted-foreground">
              @{user.githubUsername}
            </p>
          </div>

          {user.bio && (
            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
              {user.bio}
            </p>
          )}

          {/* Stats */}
          {user.projects && (
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="gap-1">
                <FolderGit2 className="h-3 w-3" />
                {user.projects.length} project
                {user.projects.length !== 1 ? "s" : ""}
              </Badge>
            </div>
          )}

          {/* Social Links */}
          <div className="flex items-center gap-1 pt-1">
            {user.socialLinks?.github && (
              <Link
                href={user.socialLinks.github}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonVariants({ variant: "ghost", size: "icon", className: "h-8 w-8" })}
              >
                <GitBranch className="h-4 w-4" />
              </Link>
            )}
            {user.socialLinks?.linkedin && (
              <Link
                href={user.socialLinks.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonVariants({ variant: "ghost", size: "icon", className: "h-8 w-8" })}
              >
                <Link2 className="h-4 w-4" />
              </Link>
            )}
            {user.socialLinks?.portfolio && (
              <Link
                href={user.socialLinks.portfolio}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonVariants({ variant: "ghost", size: "icon", className: "h-8 w-8" })}
              >
                <Globe className="h-4 w-4" />
              </Link>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
