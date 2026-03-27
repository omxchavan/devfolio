"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

export function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");

  const updateSearch = useCallback(
    (value: string) => {
      const currentQ = searchParams.get("q") || "";
      if (value === currentQ) return;
      const params = new URLSearchParams(searchParams.toString());
      if (value.trim()) {
        params.set("q", value.trim());
      } else {
        params.delete("q");
      }
      params.delete("page");
      router.push(`/explore?${params.toString()}`);
    },
    [router, searchParams]
  );

  useEffect(() => {
    const timer = setTimeout(() => updateSearch(query), 400);
    return () => clearTimeout(timer);
  }, [query, updateSearch]);

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <input
        type="text"
        placeholder="Search projects by title or tag..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full pl-9 pr-4 h-11 rounded-lg border border-border bg-background text-sm placeholder:text-muted-foreground/60 outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring transition-all"
      />
    </div>
  );
}
