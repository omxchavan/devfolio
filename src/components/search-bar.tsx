"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
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

  const clearQuery = () => {
    setQuery("");
    updateSearch("");
  };

  return (
    <div className="relative group w-full">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none transition-colors group-focus-within:text-primary">
        <Search className="h-4.5 w-4.5 text-muted-foreground/60 group-focus-within:text-primary transition-colors" />
      </div>
      <input
        type="text"
        placeholder="Search projects..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full pl-11 pr-10 h-14 rounded-2xl border-2 border-border/40 bg-background text-sm font-bold placeholder:text-muted-foreground/40 placeholder:font-bold outline-none ring-0 focus:border-primary/40 focus:bg-primary/5 transition-all shadow-sm group-hover:border-border/80"
      />
      {query && (
        <button
          onClick={clearQuery}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-muted text-muted-foreground transition-all flex items-center justify-center h-6 w-6"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}
