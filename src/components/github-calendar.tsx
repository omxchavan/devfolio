"use client";

import { GitHubCalendar } from "react-github-calendar";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface GithubCalendarWrapperProps {
  username: string;
}

export default function GithubCalendarWrapper({
  username,
}: GithubCalendarWrapperProps) {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-full h-48 bg-muted/20 animate-pulse rounded-xl border flex items-center justify-center">
        <p className="text-muted-foreground animate-pulse">Loading contributions...</p>
      </div>
    );
  }

  return (
    <div className="w-full p-6 border rounded-2xl bg-gradient-to-br from-card to-background shadow-sm hover:shadow-md transition-all">
      <h3 className="text-sm font-semibold mb-6 flex items-center gap-2 text-muted-foreground uppercase tracking-widest">
        GitHub Contributions
      </h3>
      <div className="flex justify-center overflow-x-auto">
        <GitHubCalendar
          username={username}
          colorScheme={theme === "dark" ? "dark" : "light"}
          fontSize={12}
          blockSize={12}
          blockMargin={4}
        />
      </div>
    </div>
  );
}
