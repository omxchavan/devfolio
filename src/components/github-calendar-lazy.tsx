"use client";

import dynamic from "next/dynamic";

const GithubCalendar = dynamic(() => import("@/components/github-calendar"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[180px] bg-muted/20 rounded-xl border flex items-center justify-center">
      <div className="h-4 w-32 rounded-md bg-muted skeleton-shimmer" />
    </div>
  ),
});

export default GithubCalendar;
