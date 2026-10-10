"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { AuthButton } from "@/components/auth-button";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Compass, Menu, Plus, Sparkles, ShieldCheck, GraduationCap } from "lucide-react";

const navLinks = [{ href: "/explore", label: "Gallery", icon: Compass }];

export default function MobileMenu() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const isAdmin = session?.user?.role === "admin";

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger className="md:hidden" render={<Button variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground hover:text-foreground transition-colors" />}>
        <Menu className="h-5 w-5" />
      </SheetTrigger>
      <SheetContent side="right" className="w-85 p-0 border-l border-border bg-background">
        <div className="flex flex-col h-full">
          <div className="p-8 space-y-8 flex-1">
            <div className="px-5 py-6 rounded-3xl bg-muted/30 border border-border text-center space-y-3">
              <div className="flex h-12 w-12 mx-auto items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                <GraduationCap className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-extrabold tracking-tight">AISSMS IOIT</h3>
                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest opacity-60">IT Department Portal</p>
              </div>
            </div>

            <div className="flex justify-center flex-col gap-4 text-center">
              <AuthButton />
              {session && (
                <Link
                  href="/dashboard"
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-center gap-2 rounded-2xl px-6 py-4 text-xs font-bold uppercase tracking-widest border border-border hover:bg-muted transition-all"
                >
                  <Sparkles className="h-4 w-4" />
                  Dashboard
                </Link>
              )}
            </div>

            <div className="h-px bg-border mx-2" />

            <div className="space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-4 rounded-2xl px-5 py-4 text-xs font-black uppercase tracking-widest transition-all ${
                    pathname === link.href
                      ? "bg-primary/5 text-primary border border-primary/10"
                      : "text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <link.icon className="h-5 w-5 opacity-60" />
                  {link.label}
                </Link>
              ))}
              {session && (
                <Link
                  href="/create-project"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-4 rounded-2xl px-5 py-4 text-xs font-black uppercase tracking-widest text-primary bg-primary/5 border border-primary/10"
                >
                  <Plus className="h-5 w-5" />
                  Publish Project
                </Link>
              )}
              {isAdmin && (
                <Link
                  href="/admin"
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-4 rounded-2xl px-5 py-4 text-xs font-black uppercase tracking-widest transition-all ${
                    pathname === "/admin"
                      ? "bg-primary/5 text-primary border border-primary/10"
                      : "text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <ShieldCheck className="h-5 w-5 opacity-60" />
                  Admin Panel
                </Link>
              )}
            </div>
          </div>

          <div className="p-8 border-t border-border text-center">
            <p className="text-[9px] font-bold text-muted-foreground/40 uppercase tracking-[0.2em]">devfolio • official showcase</p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
