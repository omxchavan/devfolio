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
    const timer = setTimeout(() => {
      updateSearch(query);
    }, 400);

    return () => clearTimeout(timer);
  }, [query, updateSearch]);

  return (
    <div className="relative group">
      <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors duration-200" />
      <input
        type="text"
        placeholder="Search projects by title or tag..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="neo-input w-full pl-10 pr-4 h-12 rounded-xl text-sm font-medium placeholder:text-muted-foreground/50 outline-none transition-all duration-200"
      />
    </div>
  );
}
