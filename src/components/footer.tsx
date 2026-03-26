import { Code2, GitPullRequest, Heart } from "lucide-react";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="relative border-t border-border/40 bg-background/50 backdrop-blur-sm">
      {/* Gradient top edge */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Logo & Description */}
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-primary to-[oklch(0.60_0.22_300)] text-primary-foreground">
              <Code2 className="h-3.5 w-3.5" />
            </div>
            <span className="text-sm font-semibold">devfolio</span>
            <span className="text-sm text-muted-foreground">
              — showcase your projects
            </span>
          </div>

          {/* Links */}
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <Link
              href="/explore"
              className="hover:text-primary transition-colors duration-200"
            >
              Explore
            </Link>
            <Link
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary transition-colors duration-200 flex items-center gap-1.5"
            >
              <GitPullRequest className="h-3.5 w-3.5" />
              GitHub
            </Link>
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-muted-foreground flex items-center justify-center gap-1">
          © {new Date().getFullYear()} devfolio. Built with
          <Heart className="h-3 w-3 text-primary fill-primary/30 inline" />
        </div>
      </div>
    </footer>
  );
}
