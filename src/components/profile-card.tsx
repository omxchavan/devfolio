import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { buttonVariants } from "@/components/ui/button-variants";
import { GitBranch, Link2, Globe, FolderGit2, X, Mail, GraduationCap, Hash, ExternalLink } from "lucide-react";
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
        <Avatar className="h-10 w-10">
          <AvatarImage src={user.image} alt={user.name} />
          <AvatarFallback className="bg-muted text-muted-foreground">{user.name?.charAt(0)?.toUpperCase()}</AvatarFallback>
        </Avatar>
        <div>
          <h4 className="text-sm font-semibold leading-none">{user.name}</h4>
          <p className="text-xs text-muted-foreground">@{user.githubUsername}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="space-y-4">
        {/* Avatar */}
        <Avatar className="h-44 w-44 border-2 border-border" style={{ width: '176px', height: '176px' }}>
          <AvatarImage src={user.image} alt={user.name} className="object-cover" />
          <AvatarFallback className="text-4xl text-muted-foreground/40 font-bold bg-muted">
            {user.name?.charAt(0)?.toUpperCase()}
          </AvatarFallback>
        </Avatar>

        {/* Info */}
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">{user.name}</h1>
          <p className="text-lg text-muted-foreground font-light lowercase">{user.githubUsername}</p>
        </div>

        {user.bio && (
          <p className="text-sm text-foreground/80 leading-relaxed">{user.bio}</p>
        )}

        {/* College Info */}
        {(user.prn || user.year) && (
          <div className="flex flex-wrap gap-2">
            {user.year && (
              <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 px-2 py-0.5 text-xs font-medium">
                <GraduationCap className="h-3 w-3" />
                {user.year}
              </span>
            )}
            {user.prn && (
              <span className="inline-flex items-center gap-1 rounded-md bg-muted text-muted-foreground px-2 py-0.5 text-xs font-medium">
                <Hash className="h-3 w-3" />
                {user.prn}
              </span>
            )}
          </div>
        )}

        {isOwner && (
          <Link
            href="/settings/profile"
            className={buttonVariants({ variant: "outline", className: "w-full justify-center rounded-lg h-9 text-sm font-medium" })}
          >
            Edit profile
          </Link>
        )}

        <div className="space-y-2.5 pt-1">
          {user.email && (
            <div className="flex items-center gap-2.5 text-sm text-foreground/80">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="truncate">{user.email}</span>
            </div>
          )}
          {user.projects && (
            <div className="flex items-center gap-2.5 text-sm text-foreground/80">
              <FolderGit2 className="h-4 w-4 text-muted-foreground" />
              <span>{user.projects.length} project{user.projects.length !== 1 ? "s" : ""}</span>
            </div>
          )}
        </div>

        <div className="space-y-2 pt-4 border-t border-border">
          {user.socialLinks?.github && (
            <Link href={user.socialLinks.github} target="_blank" rel="noopener noreferrer"
              className="group flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-widest text-muted-foreground hover:bg-muted hover:text-foreground transition-all">
              <GitBranch className="h-4 w-4 opacity-70 group-hover:opacity-100" />
              <span>GitHub</span>
              <ExternalLink className="ml-auto h-3 w-3 opacity-0 group-hover:opacity-40 transition-opacity" />
            </Link>
          )}
          {user.socialLinks?.linkedin && (
            <Link href={user.socialLinks.linkedin} target="_blank" rel="noopener noreferrer"
              className="group flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-widest text-muted-foreground hover:bg-muted hover:text-foreground transition-all">
              <Link2 className="h-4 w-4 opacity-70 group-hover:opacity-100 text-[#0077b5]" />
              <span>LinkedIn</span>
              <ExternalLink className="ml-auto h-3 w-3 opacity-0 group-hover:opacity-40 transition-opacity" />
            </Link>
          )}
          {user.socialLinks?.twitter && (
            <Link href={user.socialLinks.twitter} target="_blank" rel="noopener noreferrer"
              className="group flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-widest text-muted-foreground hover:bg-muted hover:text-foreground transition-all">
              <X className="h-4 w-4 opacity-70 group-hover:opacity-100" />
              <span>Twitter</span>
              <ExternalLink className="ml-auto h-3 w-3 opacity-0 group-hover:opacity-40 transition-opacity" />
            </Link>
          )}
          {user.socialLinks?.portfolio && (
            <Link href={user.socialLinks.portfolio} target="_blank" rel="noopener noreferrer"
              className="group flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-widest text-muted-foreground hover:bg-muted hover:text-foreground transition-all">
              <Globe className="h-4 w-4 opacity-70 group-hover:opacity-100 text-emerald-500" />
              <span>Portfolio</span>
              <ExternalLink className="ml-auto h-3 w-3 opacity-0 group-hover:opacity-40 transition-opacity" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
