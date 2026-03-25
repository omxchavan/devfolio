import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button-variants";
import { GitBranch, Link2, Globe, FolderGit2, X, Mail } from "lucide-react";
import Link from "next/link";
import { IUser } from "@/types";

interface ProfileCardProps {
  user: IUser;
  compact?: boolean;
  isOwner?: boolean;
}

export function ProfileCard({ user, compact = false, isOwner = false }: ProfileCardProps) {
  if (compact) {
    return (
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10 border border-border">
          <AvatarImage src={user.image} alt={user.name} />
          <AvatarFallback>{user.name?.charAt(0)?.toUpperCase()}</AvatarFallback>
        </Avatar>
        <div>
          <h4 className="text-sm font-semibold leading-none">{user.name}</h4>
          <p className="text-xs text-muted-foreground">@{user.githubUsername}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {/* Avatar Container */}
        <div className="relative group w-fit">
          <Avatar
            className="h-48 w-48 shrink-0 aspect-square overflow-hidden border-2 border-border ring-background shadow-sm"
            style={{ width: '192px', height: '192px' }}
          >
            <AvatarImage 
              src={user.image} 
              alt={user.name} 
              className="aspect-square object-cover h-full w-full" 
            />
            <AvatarFallback className="text-4xl text-muted-foreground/40 font-bold bg-muted/50">
              {user.name?.charAt(0)?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>
 
        {/* Info */}
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {user.name}
          </h1>
          <p className="text-xl text-muted-foreground/70 font-light lowercase">
            {user.githubUsername}
          </p>
        </div>

        {user.bio && (
          <p className="text-base text-foreground/80 leading-relaxed font-normal py-1">
            {user.bio}
          </p>
        )}

        {isOwner && (
          <Link 
            href="/settings/profile" 
            className={buttonVariants({ variant: "outline", className: "w-full justify-center rounded-lg h-9 text-sm font-medium" })}
          >
            Edit profile
          </Link>
        )}

        <div className="space-y-3 pt-2">
          {user.email && (
            <div className="flex items-center gap-2 text-sm text-foreground/80">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="truncate">{user.email}</span>
            </div>
          )}

          {/* Project Count Badge */}
          {user.projects && (
            <div className="flex items-center gap-2 text-sm text-foreground/80">
              <FolderGit2 className="h-4 w-4 text-muted-foreground" />
              <span>{user.projects.length} project{user.projects.length !== 1 ? "s" : ""}</span>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-1 pt-4 border-t">
          {user.socialLinks?.github && (
            <Link
              href={user.socialLinks.github}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonVariants({ variant: "ghost", size: "icon", className: "h-8 w-8 text-muted-foreground hover:text-foreground" })}
            >
              <GitBranch className="h-4 w-4" />
            </Link>
          )}
          {user.socialLinks?.linkedin && (
            <Link
              href={user.socialLinks.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonVariants({ variant: "ghost", size: "icon", className: "h-8 w-8 text-muted-foreground hover:text-foreground" })}
            >
              <Link2 className="h-4 w-4" />
            </Link>
          )}
          {user.socialLinks?.twitter && (
            <Link
              href={user.socialLinks.twitter}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonVariants({ variant: "ghost", size: "icon", className: "h-8 w-8 text-muted-foreground hover:text-foreground" })}
            >
              <X className="h-4 w-4" />
            </Link>
          )}
          {user.socialLinks?.portfolio && (
            <Link
              href={user.socialLinks.portfolio}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonVariants({ variant: "ghost", size: "icon", className: "h-8 w-8 text-muted-foreground hover:text-foreground" })}
            >
              <Globe className="h-4 w-4" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
