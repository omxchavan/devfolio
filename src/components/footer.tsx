import { Code2, Heart } from "lucide-react";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border bg-card/30">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between gap-10">
          {/* Logo & Info */}
          <div className="space-y-4 max-w-sm">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm shadow-primary/20">
                <Code2 className="h-3.5 w-3.5" />
              </div>
              <span className="text-base font-bold tracking-tight">devfolio</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Official Showcase • AISSMS IOIT IT Department
            </p>
            <div className="pt-2 text-[10px] text-muted-foreground/50 font-bold uppercase tracking-widest">
              © {new Date().getFullYear()} devfolio • Built with <Heart className="h-2.5 w-2.5 inline text-primary mx-0.5" /> for students
            </div>
          </div>

          {/* Links Grid */}
          <div className="flex gap-16">
            <div className="space-y-4">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">Platform</h4>
              <nav className="flex flex-col gap-2">
                <Link href="/explore" className="text-xs font-semibold text-muted-foreground hover:text-primary transition-colors">Showcase Gallery</Link>
                <Link href="/dashboard" className="text-xs font-semibold text-muted-foreground hover:text-primary transition-colors">My Portfolio</Link>
                <Link href="/create-project" className="text-xs font-semibold text-muted-foreground hover:text-primary transition-colors">Submit Project</Link>
              </nav>
            </div>
            <div className="space-y-4">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">Portal</h4>
              <nav className="flex flex-col gap-2">
                <Link href="https://github.com" target="_blank" className="text-xs font-semibold text-muted-foreground hover:text-primary transition-colors">GitHub</Link>
                <Link href="https://aissmsioit.org" target="_blank" className="text-xs font-semibold text-muted-foreground hover:text-primary transition-colors">College Website</Link>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
