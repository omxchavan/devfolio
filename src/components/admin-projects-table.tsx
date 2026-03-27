"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DOMAINS } from "@/lib/constants";
import {
  Search,
  Download,
  FolderGit2,
  Star,
  ArrowUpDown,
  ExternalLink,
  Layers,
  Code2
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

interface AdminProject {
  _id: string;
  title: string;
  domain: string;
  tags: string[];
  stars: number;
  featured: boolean;
  createdAt: string;
  owner: {
    name: string;
    githubUsername: string;
    image: string;
    year?: string;
  };
}

interface AdminProjectsTableProps {
  initialProjects: AdminProject[];
}

export function AdminProjectsTable({ initialProjects }: AdminProjectsTableProps) {
  const [search, setSearch] = useState("");
  const [domainFilter, setDomainFilter] = useState("");
  const [yearFilter, setYearFilter] = useState("");
  const [sortField, setSortField] = useState<"title" | "owner" | "domain" | "stars" | "date">("date");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const filteredProjects = useMemo(() => {
    let result = initialProjects;

    // Domain filter
    if (domainFilter) {
      result = result.filter((p) => p.domain === domainFilter);
    }

    // Year filter
    if (yearFilter) {
      result = result.filter((p) => p.owner?.year === yearFilter);
    }

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.owner?.name?.toLowerCase().includes(q) ||
          p.owner?.githubUsername?.toLowerCase().includes(q) ||
          p.tags.some(t => t.toLowerCase().includes(q))
      );
    }

    // Sort
    result = [...result].sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case "title":
          cmp = a.title.localeCompare(b.title);
          break;
        case "owner":
          cmp = (a.owner?.name || "").localeCompare(b.owner?.name || "");
          break;
        case "domain":
          cmp = (a.domain || "").localeCompare(b.domain || "");
          break;
        case "stars":
          cmp = a.stars - b.stars;
          break;
        case "date":
          cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });

    return result;
  }, [initialProjects, search, domainFilter, yearFilter, sortField, sortDir]);

  function toggleSort(field: typeof sortField) {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  }

  function exportCSV() {
    const headers = ["Title", "Author", "Year", "Domain", "Tags", "Stars", "Created"];
    const rows = filteredProjects.map((p) => [
      p.title,
      p.owner?.name || "Unknown",
      p.owner?.year || "",
      p.domain,
      p.tags.join(" | "),
      p.stars.toString(),
      new Date(p.createdAt).toLocaleDateString(),
    ]);

    const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `devfolio-projects-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // Stats
  const totalStars = initialProjects.reduce((s, p) => s + p.stars, 0);
  const domainCounts = DOMAINS.reduce((acc, d) => {
    acc[d] = initialProjects.filter((p) => p.domain === d).length;
    return acc;
  }, {} as Record<string, number>);

  const SortButton = ({ field, label }: { field: typeof sortField; label: string }) => (
    <button
      onClick={() => toggleSort(field)}
      className="flex items-center gap-1 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors"
    >
      {label}
      <ArrowUpDown className={`h-3 w-3 ${sortField === field ? "text-primary" : "opacity-40"}`} />
    </button>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="card-elevated p-4 text-center">
          <div className="flex items-center justify-center gap-1.5 text-muted-foreground mb-1">
            <FolderGit2 className="h-4 w-4" />
          </div>
          <p className="text-2xl font-bold">{initialProjects.length}</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Total Projects</p>
        </div>
        <div className="card-elevated p-4 text-center">
          <div className="flex items-center justify-center gap-1.5 text-muted-foreground mb-1">
            <Star className="h-4 w-4 text-yellow-500" />
          </div>
          <p className="text-2xl font-bold">{totalStars}</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Total Stars</p>
        </div>
        {DOMAINS.slice(0, 2).map((d) => (
          <div
            key={d}
            className={`card-elevated p-4 text-center cursor-pointer transition-colors ${domainFilter === d ? "ring-2 ring-primary" : ""}`}
            onClick={() => setDomainFilter(domainFilter === d ? "" : d)}
          >
            <div className="flex items-center justify-center gap-1.5 text-muted-foreground mb-1">
              <Layers className="h-4 w-4" />
            </div>
            <p className="text-2xl font-bold">{domainCounts[d] || 0}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium truncate px-2">{d}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search projects, authors, tags..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-background"
          />
        </div>

        <select
          value={domainFilter}
          onChange={(e) => setDomainFilter(e.target.value)}
          className="flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/20 focus-visible:border-ring w-full sm:max-w-[150px]"
        >
          <option value="">All Domains</option>
          {DOMAINS.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>

        <select
          value={yearFilter}
          onChange={(e) => setYearFilter(e.target.value)}
          className="flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/20 focus-visible:border-ring w-full sm:max-w-[120px]"
        >
          <option value="">All Years</option>
          <option value="FY">FY</option>
          <option value="SY">SY</option>
          <option value="TY">TY</option>
          <option value="BE">BE</option>
        </select>

        <button
          onClick={exportCSV}
          className="flex items-center gap-1.5 h-9 px-3 rounded-md border border-input bg-background text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
        >
          <Download className="h-3.5 w-3.5" />
          Export CSV
        </button>

        <span className="text-xs text-muted-foreground ml-auto whitespace-nowrap">
          {filteredProjects.length} of {initialProjects.length} projects
        </span>
      </div>

      {/* Table */}
      <div className="card-elevated overflow-hidden bg-background">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-4 py-3 text-left w-1/3">
                  <SortButton field="title" label="Project" />
                </th>
                <th className="px-4 py-3 text-left">
                  <SortButton field="owner" label="Author" />
                </th>
                <th className="px-4 py-3 text-left hidden md:table-cell">
                  <SortButton field="domain" label="Domain" />
                </th>
                <th className="px-4 py-3 text-left hidden lg:table-cell">
                  <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                    <Code2 className="h-3 w-3" /> Tech Stack
                  </span>
                </th>
                <th className="px-4 py-3 text-center">
                  <SortButton field="stars" label="Stars" />
                </th>
                <th className="px-4 py-3 text-left hidden sm:table-cell">
                  <SortButton field="date" label="Created" />
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredProjects.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                    No projects found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredProjects.map((project) => (
                  <tr key={project._id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <Link href={`/project/${project._id}`} className="group flex items-center gap-2 max-w-[250px] sm:max-w-xs md:max-w-sm">
                        <span className="font-semibold text-sm truncate group-hover:text-primary transition-colors">
                          {project.title}
                        </span>
                        <ExternalLink className="h-3.5 w-3.5 text-muted-foreground/30 group-hover:text-primary/50 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      {project.owner ? (
                        <div className="flex flex-col gap-1">
                          <Link href={`/profile/${project.owner.githubUsername}`} className="flex items-center gap-2 group w-fit">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={project.owner.image} />
                              <AvatarFallback className="bg-muted text-[10px]">{project.owner.name?.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <span className="text-xs font-medium truncate max-w-[120px] group-hover:text-primary transition-colors">
                              {project.owner.name}
                            </span>
                          </Link>
                          {project.owner.year && (
                            <span className="text-[10px] font-bold text-muted-foreground ml-8">
                              {project.owner.year}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground/40">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <Badge variant="secondary" className="text-[10px] font-medium rounded-md whitespace-nowrap bg-muted/60 hover:bg-muted/80 truncate max-w-[150px] inline-block">
                        {project.domain}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <div className="flex flex-wrap gap-1 max-w-[200px] max-h-12 overflow-hidden">
                        {project.tags.slice(0, 3).map(tag => (
                          <span key={tag} className="text-[9px] px-1.5 py-0.5 bg-accent/50 text-accent-foreground rounded-sm border border-border/50 truncate max-w-[80px]">
                            {tag}
                          </span>
                        ))}
                        {project.tags.length > 3 && (
                          <span className="text-[9px] px-1.5 py-0.5 bg-muted text-muted-foreground rounded-sm font-medium">
                            +{project.tags.length - 3}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="inline-flex items-center gap-1 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 px-2 py-0.5 rounded-md">
                        <Star className="h-3 w-3 fill-current" />
                        <span className="text-xs font-bold tabular-nums">{project.stars}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {new Date(project.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
