"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import { useCallback, useEffect, useState, useTransition } from "react";

export function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [isPending, startTransition] = useTransition();

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
      startTransition(() => {
        router.push(`/explore?${params.toString()}`);
      });
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
      <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none transition-all group-focus-within:text-primary z-10">
        <Search className="h-5 w-5 text-muted-foreground/50 group-focus-within:text-primary group-hover:text-primary/70 transition-colors" />
      </div>
      <input
        type="text"
        placeholder="Search projects..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full pl-12 pr-11 h-14 rounded-2xl border-2 border-border bg-card text-sm font-bold placeholder:text-muted-foreground/30 placeholder:font-bold outline-none ring-0 focus:border-primary/40 focus:bg-primary/5 focus:shadow-[0_0_20px_rgba(var(--primary-rgb),0.1)] transition-all shadow-md hover:shadow-lg hover:border-border/80"
      />
      {query && (
        <button
          onClick={clearQuery}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-muted text-muted-foreground transition-all flex items-center justify-center h-6 w-6 z-10"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}
