"use client";

import { GitHubCalendar } from "react-github-calendar";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

interface GithubCalendarWrapperProps {
  username: string;
}

export default function GithubCalendarWrapper({
  username,
}: GithubCalendarWrapperProps) {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Use useEffect to ensure we only render the calendar on the client
  // and that the initial render matches the server's loading state.
  useEffect(() => {
    setMounted(true);
  }, []);

  // Initial render (both SSR and first client pass)
  if (!mounted) {
    return (
      <div className="w-full h-[180px] bg-muted/20 rounded-xl border flex items-center justify-center">
        <div className="h-4 w-32 rounded-md bg-muted skeleton-shimmer" />
      </div>
    );
  }

  return (
    <div className="flex justify-center overflow-x-auto py-2 scrollbar-hide">
      <GitHubCalendar
        username={username}
        colorScheme={theme === "dark" ? "dark" : "light"}
        fontSize={12}
        blockSize={12}
        blockMargin={4}
        theme={{
          light: ["#f1f5f9", "#cbd5e1", "#64748b", "#475569", "#1e293b"],
          dark: ["#1e293b", "#334155", "#64748b", "#94a3b8", "#e2e8f0"],
        }}
        // Adding dynamic loading false to avoid internal hydration issues
        loading={false}
      />
    </div>
  );
}
