"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ACADEMIC_YEARS } from "@/lib/constants";
import {
  Search,
  Download,
  Users,
  GraduationCap,
  FolderGit2,
  ArrowUpDown,
  Hash,
  Mail,
} from "lucide-react";
import Link from "next/link";

interface AdminUser {
  _id: string;
  name: string;
  email: string;
  image: string;
  githubUsername: string;
  bio?: string;
  prn?: string;
  year?: string;
  role?: string;
  projectCount: number;
  createdAt: string;
}

interface AdminUsersTableProps {
  initialUsers: AdminUser[];
}

export function AdminUsersTable({ initialUsers }: AdminUsersTableProps) {
  const [search, setSearch] = useState("");
  const [yearFilter, setYearFilter] = useState("");
  const [sortField, setSortField] = useState<"name" | "prn" | "year" | "projects" | "date">("date");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const filteredUsers = useMemo(() => {
    let result = initialUsers;

    // Year filter
    if (yearFilter) {
      result = result.filter((u) => u.year === yearFilter);
    }

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          u.githubUsername.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          (u.prn && u.prn.toLowerCase().includes(q))
      );
    }

    // Sort
    result = [...result].sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case "name":
          cmp = a.name.localeCompare(b.name);
          break;
        case "prn":
          cmp = (a.prn || "").localeCompare(b.prn || "");
          break;
        case "year":
          cmp = (a.year || "").localeCompare(b.year || "");
          break;
        case "projects":
          cmp = a.projectCount - b.projectCount;
          break;
        case "date":
          cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });

    return result;
  }, [initialUsers, search, yearFilter, sortField, sortDir]);

  function toggleSort(field: typeof sortField) {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  }

  function exportCSV() {
    const headers = ["Name", "Email", "GitHub", "PRN", "Year", "Projects", "Joined"];
    const rows = filteredUsers.map((u) => [
      u.name,
      u.email,
      u.githubUsername,
      u.prn || "",
      u.year || "",
      u.projectCount.toString(),
      new Date(u.createdAt).toLocaleDateString(),
    ]);

    const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `devfolio-users-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // Stats
  const totalProjects = initialUsers.reduce((s, u) => s + u.projectCount, 0);
  const yearCounts = ACADEMIC_YEARS.reduce((acc, y) => {
    acc[y] = initialUsers.filter((u) => u.year === y).length;
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
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="card-elevated p-4 text-center">
          <div className="flex items-center justify-center gap-1.5 text-muted-foreground mb-1">
            <Users className="h-4 w-4" />
          </div>
          <p className="text-2xl font-bold">{initialUsers.length}</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Total Users</p>
        </div>
        <div className="card-elevated p-4 text-center">
          <div className="flex items-center justify-center gap-1.5 text-muted-foreground mb-1">
            <FolderGit2 className="h-4 w-4" />
          </div>
          <p className="text-2xl font-bold">{totalProjects}</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Total Projects</p>
        </div>
        {ACADEMIC_YEARS.map((y) => (
          <div
            key={y}
            className={`card-elevated p-4 text-center cursor-pointer transition-colors ${yearFilter === y ? "ring-2 ring-primary" : ""}`}
            onClick={() => setYearFilter(yearFilter === y ? "" : y)}
          >
            <div className="flex items-center justify-center gap-1.5 text-muted-foreground mb-1">
              <GraduationCap className="h-4 w-4" />
            </div>
            <p className="text-2xl font-bold">{yearCounts[y]}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">{y} Year</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name, PRN, or username..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <select
          value={yearFilter}
          onChange={(e) => setYearFilter(e.target.value)}
          className="flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/20 focus-visible:border-ring"
        >
          <option value="">All Years</option>
          {ACADEMIC_YEARS.map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>

        <button
          onClick={exportCSV}
          className="flex items-center gap-1.5 h-9 px-3 rounded-md border border-input bg-background text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
        >
          <Download className="h-3.5 w-3.5" />
          Export CSV
        </button>

        <span className="text-xs text-muted-foreground ml-auto">
          {filteredUsers.length} of {initialUsers.length} users
        </span>
      </div>

      {/* Table */}
      <div className="card-elevated overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-4 py-3 text-left">
                  <SortButton field="name" label="User" />
                </th>
                <th className="px-4 py-3 text-left hidden md:table-cell">
                  <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                    <Mail className="h-3 w-3" /> Email
                  </span>
                </th>
                <th className="px-4 py-3 text-left">
                  <SortButton field="prn" label="PRN" />
                </th>
                <th className="px-4 py-3 text-left">
                  <SortButton field="year" label="Year" />
                </th>
                <th className="px-4 py-3 text-center">
                  <SortButton field="projects" label="Projects" />
                </th>
                <th className="px-4 py-3 text-left hidden lg:table-cell">
                  <SortButton field="date" label="Joined" />
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                    No users found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <Link href={`/profile/${user.githubUsername}`} className="flex items-center gap-3 group">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.image} />
                          <AvatarFallback className="bg-muted text-xs">{user.name?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="font-medium text-sm truncate group-hover:text-primary transition-colors">{user.name}</p>
                          <p className="text-[11px] text-muted-foreground truncate">@{user.githubUsername}</p>
                        </div>
                      </Link>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="text-xs text-muted-foreground truncate block max-w-[180px]">{user.email}</span>
                    </td>
                    <td className="px-4 py-3">
                      {user.prn ? (
                        <span className="inline-flex items-center gap-1 text-xs font-mono bg-muted rounded px-1.5 py-0.5">
                          <Hash className="h-2.5 w-2.5" />
                          {user.prn}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground/40">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {user.year ? (
                        <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 px-2 py-0.5 text-[11px] font-medium">
                          {user.year}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground/40">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-sm font-semibold tabular-nums">{user.projectCount}</span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <span className="text-xs text-muted-foreground">
                        {new Date(user.createdAt).toLocaleDateString("en-IN", {
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
