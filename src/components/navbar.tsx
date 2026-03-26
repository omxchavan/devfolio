"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AuthButton } from "@/components/auth-button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button-variants";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Code2, Compass, Menu, Plus, Sparkles } from "lucide-react";
import { useSession } from "next-auth/react";
import { useState } from "react";

const navLinks = [
  { href: "/explore", label: "Explore", icon: Compass },
];

export function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full glass border-b border-border/40">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-[oklch(0.60_0.22_300)] text-primary-foreground transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_0_20px_oklch(0.65_0.24_270_/_30%)]">
            <Code2 className="h-4 w-4" />
            <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-primary to-[oklch(0.60_0.22_300)] opacity-0 group-hover:opacity-40 blur-md transition-opacity duration-300" />
          </div>
          <span className="text-lg font-bold tracking-tight">devfolio</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`relative flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                pathname === link.href
                  ? "text-primary bg-primary/8"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
              }`}
            >
              <link.icon className="h-4 w-4" />
              {link.label}
              {pathname === link.href && (
                <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-gradient-to-r from-primary to-[oklch(0.60_0.22_300)] rounded-full" />
              )}
            </Link>
          ))}
          {session && (
            <Link
              href="/create-project"
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg bg-gradient-to-r from-primary/10 to-[oklch(0.60_0.22_300_/_10%)] text-primary hover:from-primary/15 hover:to-[oklch(0.60_0.22_300_/_15%)] transition-all duration-200"
            >
              <Plus className="h-4 w-4" />
              New Project
            </Link>
          )}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <div className="hidden md:flex">
            <AuthButton />
          </div>

          {/* Mobile menu */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger className="md:hidden" render={<Button variant="ghost" size="icon" className="h-9 w-9" />}>
              <Menu className="h-5 w-5" />
            </SheetTrigger>
            <SheetContent side="right" className="w-72 pt-10 glass">
              <div className="flex flex-col gap-4">
                <div className="flex justify-center">
                  <AuthButton />
                </div>
                <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm transition-all duration-200 ${
                      pathname === link.href
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                    }`}
                  >
                    <link.icon className="h-4 w-4" />
                    {link.label}
                  </Link>
                ))}
                {session && (
                  <>
                    <Link
                      href="/dashboard"
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-muted-foreground hover:bg-accent/50 hover:text-foreground transition-all duration-200"
                    >
                      <Sparkles className="h-4 w-4" />
                      Dashboard
                    </Link>
                    <Link
                      href="/create-project"
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm bg-gradient-to-r from-primary/10 to-[oklch(0.60_0.22_300_/_10%)] text-primary font-medium transition-all duration-200"
                    >
                      <Plus className="h-4 w-4" />
                      New Project
                    </Link>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
