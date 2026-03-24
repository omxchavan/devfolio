"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { DOMAINS } from "@/lib/constants";
import { SlidersHorizontal, X } from "lucide-react";

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4" />
          <h3 className="font-semibold text-sm">Filters</h3>
        </div>
        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAll}
            className="h-7 text-xs gap-1"
          >
            <X className="h-3 w-3" />
            Clear
          </Button>
        )}
      </div>

      <Separator />

      {/* Sort */}
      <div className="space-y-2">
        <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Sort by
        </h4>
        <div className="flex gap-2">
          {[
            { value: "latest", label: "Latest" },
            { value: "stars", label: "Most Stars" },
          ].map((sort) => (
            <Button
              key={sort.value}
              variant={currentSort === sort.value ? "default" : "outline"}
              size="sm"
              className="h-7 text-xs"
              onClick={() => updateParams("sort", sort.value)}
            >
              {sort.label}
            </Button>
          ))}
        </div>
      </div>

      <Separator />

      {/* Domain */}
      <div className="space-y-2">
        <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Domain
        </h4>
        <div className="flex flex-wrap gap-1.5">
          {DOMAINS.map((domain) => (
            <Badge
              key={domain}
              variant={currentDomain === domain ? "default" : "outline"}
              className="cursor-pointer text-xs transition-colors hover:bg-primary hover:text-primary-foreground"
              onClick={() =>
                updateParams("domain", currentDomain === domain ? "" : domain)
              }
            >
              {domain}
            </Badge>
          ))}
        </div>
      </div>

      <Separator />

      {/* Tags */}
      <div className="space-y-2">
        <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Popular Tags
        </h4>
        <div className="flex flex-wrap gap-1.5">
          {POPULAR_TAGS.map((tag) => (
            <Badge
              key={tag}
              variant={currentTags.includes(tag) ? "default" : "outline"}
              className="cursor-pointer text-xs transition-colors hover:bg-primary hover:text-primary-foreground"
              onClick={() => toggleTag(tag)}
            >
              #{tag}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
}
