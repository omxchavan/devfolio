"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { GitPullRequest, LogOut, LayoutDashboard, User, Settings } from "lucide-react";
import Link from "next/link";

export function AuthButton() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <Button variant="ghost" size="sm" disabled className="gap-2 rounded-full">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </Button>
    );
  }

  if (!session) {
    return (
      <Button
        onClick={() => signIn("github")}
        size="sm"
        className="gap-2 bg-gradient-to-r from-primary to-[oklch(0.60_0.22_300)] hover:opacity-90 transition-all duration-300 shadow-lg shadow-primary/20 hover:shadow-primary/30 text-white rounded-full px-5"
      >
        <GitPullRequest className="h-4 w-4" />
        Sign in
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-full ring-2 ring-transparent hover:ring-primary/30 transition-all duration-300" />}>
        <Avatar className="h-8 w-8">
          <AvatarImage
            src={session.user.image || ""}
            alt={session.user.name || ""}
          />
          <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
            {session.user.name?.charAt(0)?.toUpperCase() || "U"}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 glass-card border-border/50 p-1">
        <div className="flex items-center gap-3 p-2.5">
          <Avatar className="h-9 w-9 ring-2 ring-primary/20">
            <AvatarImage
              src={session.user.image || ""}
              alt={session.user.name || ""}
            />
            <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
              {session.user.name?.charAt(0)?.toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col space-y-0.5">
            <p className="text-sm font-semibold">{session.user.name}</p>
            <p className="text-xs text-muted-foreground">
              @{session.user.githubUsername}
            </p>
          </div>
        </div>
        <DropdownMenuSeparator className="bg-border/30" />
        <DropdownMenuItem className="rounded-md">
          <Link href="/dashboard" className="flex items-center w-full">
            <LayoutDashboard className="mr-2 h-4 w-4 text-muted-foreground" />
            Dashboard
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem className="rounded-md">
          <Link
            href={`/profile/${session.user.githubUsername}`}
            className="flex items-center w-full"
          >
            <User className="mr-2 h-4 w-4 text-muted-foreground" />
            Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem className="rounded-md">
          <Link href="/settings/profile" className="flex items-center w-full">
            <Settings className="mr-2 h-4 w-4 text-muted-foreground" />
            Settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-border/30" />
        <DropdownMenuItem
          onClick={() => signOut()}
          className="text-destructive cursor-pointer rounded-md"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
