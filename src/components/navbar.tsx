"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AuthButton } from "@/components/auth-button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Code2, Compass, Menu, Plus, Sparkles, ShieldCheck, GraduationCap } from "lucide-react";
import { useSession } from "next-auth/react";
import { useState } from "react";

const navLinks = [
  { href: "/explore", label: "Gallery", icon: Compass },
];

export function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const isAdmin = session?.user?.role === "admin";

  return (
    <header className="sticky top-0 z-50 w-full glass border-b border-border/40">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-lg shadow-primary/20 transition-transform group-hover:scale-105">
              <Code2 className="h-4 w-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold tracking-tight leading-none">devfolio</span>
              <span className="text-[10px] text-muted-foreground/60 font-bold uppercase tracking-tighter mt-0.5">IT Department</span>
            </div>
          </Link>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1.5 ml-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
                pathname === link.href
                  ? "text-primary bg-primary/8 shadow-sm ring-1 ring-primary/20"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
              }`}
            >
              <link.icon className="h-3.5 w-3.5" />
              {link.label}
            </Link>
          ))}
          {session && (
            <Link
              href="/create-project"
              className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider rounded-lg text-primary bg-primary/8 hover:bg-primary/12 transition-all ml-1"
            >
              <Plus className="h-3.5 w-3.5" />
              Submit
            </Link>
          )}
          {isAdmin && (
            <Link
              href="/admin"
              className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ml-1 ${
                pathname === "/admin"
                  ? "text-primary bg-primary/8 shadow-sm ring-1 ring-primary/20"
                  : "text-muted-foreground/60 hover:text-foreground hover:bg-accent/50"
              }`}
            >
              <ShieldCheck className="h-3.5 w-3.5" />
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

          {/* Mobile menu */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger className="md:hidden" render={<Button variant="ghost" size="icon" className="h-9 w-9" />}>
              <Menu className="h-5 w-5" />
            </SheetTrigger>
            <SheetContent side="right" className="w-80 pt-10">
              <div className="flex flex-col gap-5">
                <div className="px-3 py-4 rounded-2xl bg-muted/30 border border-border/50 text-center">
                   <div className="flex h-10 w-10 mx-auto items-center justify-center rounded-xl bg-primary text-primary-foreground mb-3">
                    <GraduationCap className="h-5 w-5" />
                  </div>
                  <h3 className="text-sm font-bold">AISSMS IOIT</h3>
                  <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mt-1">IT Department Showcase</p>
                </div>

                <div className="flex justify-center">
                  <AuthButton />
                </div>
                
                <div className="h-px bg-border/50 mx-3" />
                
                <div className="space-y-1">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setOpen(false)}
                      className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold uppercase tracking-wide transition-colors ${
                        pathname === link.href
                          ? "bg-primary/8 text-primary"
                          : "text-muted-foreground hover:bg-accent hover:text-foreground"
                      }`}
                    >
                      <link.icon className="h-4.5 w-4.5 text-primary/60" />
                      {link.label}
                    </Link>
                  ))}
                  {session && (
                    <>
                      <Link
                        href="/dashboard"
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold uppercase tracking-wide text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                      >
                        <Sparkles className="h-4.5 w-4.5 text-primary/60" />
                        Dashboard
                      </Link>
                      <Link
                        href="/create-project"
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold uppercase tracking-wide text-primary bg-primary/8"
                      >
                        <Plus className="h-4.5 w-4.5" />
                        Submit Project
                      </Link>
                    </>
                  )}
                  {isAdmin && (
                    <Link
                      href="/admin"
                      onClick={() => setOpen(false)}
                      className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold uppercase tracking-wide transition-colors ${
                        pathname === "/admin"
                          ? "bg-primary/8 text-primary"
                          : "text-muted-foreground hover:bg-accent hover:text-foreground"
                      }`}
                    >
                      <ShieldCheck className="h-4.5 w-4.5 text-primary/60" />
                      Admin Panel
                    </Link>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
