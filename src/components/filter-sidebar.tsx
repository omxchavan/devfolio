"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DOMAINS } from "@/lib/constants";
import { SlidersHorizontal, X, ArrowDownWideNarrow } from "lucide-react";

const POPULAR_TAGS = [
  "react",
  "nextjs",
  "python",
  "machine-learning",
  "typescript",
  "node",
  "flutter",
  "docker",
  "api",
  "database",
  "blockchain",
  "ios",
  "android",
  "rust",
  "go",
];

export function FilterSidebar() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentDomain = searchParams.get("domain") || "";
  const currentTags = searchParams.get("tags")?.split(",").filter(Boolean) || [];
  const currentSort = searchParams.get("sort") || "latest";

  function updateParams(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete("page");
    router.push(`/explore?${params.toString()}`);
  }

  function toggleTag(tag: string) {
    const tags = new Set(currentTags);
    if (tags.has(tag)) {
      tags.delete(tag);
    } else {
      tags.add(tag);
    }
    updateParams("tags", Array.from(tags).join(","));
  }

  function clearAll() {
    router.push("/explore");
  }

  const hasFilters = currentDomain || currentTags.length > 0 || currentSort !== "latest";

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-primary" />
          <h3 className="font-bold text-sm">Filters</h3>
        </div>
        {hasFilters && (
          <button
            onClick={clearAll}
            className="text-xs text-muted-foreground hover:text-destructive font-medium flex items-center gap-1 transition-colors"
          >
            <X className="h-3 w-3" />
            Clear
          </button>
        )}
      </div>

      <div className="h-0.5 bg-foreground/5 dark:bg-border/30 rounded-full" />

      {/* Sort */}
      <div className="space-y-2.5">
        <h4 className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
          <ArrowDownWideNarrow className="h-3 w-3" />
          Sort
        </h4>
        <div className="flex gap-2">
          {[
            { value: "latest", label: "Latest" },
            { value: "stars", label: "Top ★" },
          ].map((sort) => (
            <button
              key={sort.value}
              className={`neo-badge rounded-lg px-3 py-1.5 text-xs cursor-pointer transition-all duration-200 ${
                currentSort === sort.value
                  ? "!bg-foreground !text-background !border-foreground dark:!bg-primary dark:!text-primary-foreground dark:!border-primary"
                  : "hover:border-primary/50"
              }`}
              onClick={() => updateParams("sort", sort.value)}
            >
              {sort.label}
            </button>
          ))}
        </div>
      </div>

      <div className="h-0.5 bg-foreground/5 dark:bg-border/30 rounded-full" />

      {/* Domain */}
      <div className="space-y-2.5">
        <h4 className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
          Domain
        </h4>
        <div className="flex flex-wrap gap-1.5">
          {DOMAINS.map((domain) => (
            <button
              key={domain}
              className={`neo-badge rounded-lg px-2 py-1 text-[11px] cursor-pointer transition-all duration-200 ${
                currentDomain === domain
                  ? "!bg-foreground !text-background !border-foreground dark:!bg-primary dark:!text-primary-foreground dark:!border-primary"
                  : "hover:border-primary/50"
              }`}
              onClick={() =>
                updateParams("domain", currentDomain === domain ? "" : domain)
              }
            >
              {domain}
            </button>
          ))}
        </div>
      </div>

      <div className="h-0.5 bg-foreground/5 dark:bg-border/30 rounded-full" />

      {/* Tags */}
      <div className="space-y-2.5">
        <h4 className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
          Tags
        </h4>
        <div className="flex flex-wrap gap-1.5">
          {POPULAR_TAGS.map((tag) => (
            <button
              key={tag}
              className={`neo-badge rounded-lg px-2 py-1 text-[11px] cursor-pointer transition-all duration-200 ${
                currentTags.includes(tag)
                  ? "!bg-foreground !text-background !border-foreground dark:!bg-primary dark:!text-primary-foreground dark:!border-primary"
                  : "hover:border-primary/50"
              }`}
              onClick={() => toggleTag(tag)}
            >
              #{tag}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
