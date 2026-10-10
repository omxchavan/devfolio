"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";
import { AuthButton } from "@/components/auth-button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Code2, Compass, Menu, Plus, ShieldCheck } from "lucide-react";
import { useSession } from "next-auth/react";

const MobileMenu = dynamic(() => import("@/components/mobile-menu"), {
  ssr: false,
  loading: () => (
    <Button variant="ghost" size="icon" className="md:hidden h-10 w-10 text-muted-foreground" aria-label="Open menu">
      <Menu className="h-5 w-5" />
    </Button>
  ),
});

const navLinks = [
  { href: "/explore", label: "Gallery", icon: Compass },
];

export function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "admin";

  return (
    <header className="nav-solid bg-background">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Code2 className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-extrabold tracking-tight leading-none">devfolio</span>
              <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.1em] mt-0.5 opacity-70">IT Department</span>
            </div>
          </Link>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1.5 ml-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-2 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.15em] rounded-xl transition-all duration-200 ${
                pathname === link.href
                  ? "text-primary bg-primary/5"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              <link.icon className="h-4 w-4" />
              {link.label}
            </Link>
          ))}
          {session && (
            <Link
              href="/create-project"
              className="flex items-center gap-2 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.15em] rounded-xl text-primary bg-primary/8 hover:bg-primary/15 transition-all ml-1"
            >
              <Plus className="h-4 w-4" />
              Submit
            </Link>
          )}
          {isAdmin && (
            <Link
              href="/admin"
              className={`flex items-center gap-2 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.15em] rounded-xl transition-all ml-1 ${
                pathname === "/admin"
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground/60 hover:text-foreground hover:bg-muted"
              }`}
            >
              <ShieldCheck className="h-4 w-4" />
              Admin
            </Link>
          )}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <div className="hidden md:flex">
            <AuthButton />
          </div>

          {/* Mobile menu (code-split) */}
          <MobileMenu />
        </div>
      </div>
    </header>
  );
}
