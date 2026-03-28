import Link from "next/link";
import { buttonVariants } from "@/components/ui/button-variants";
import { FileQuestion, Home, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
      <div className="space-y-6 max-w-md">
        <div className="relative inline-block mx-auto text-center">
          <div className="absolute inset-x-0 top-0 bg-primary/10 rounded-full blur-3xl animate-pulse h-full" />
          <div className="relative flex items-center justify-center h-24 w-24 rounded-3xl bg-muted border border-border/50 text-primary mb-8 shadow-2xl mx-auto">
            <FileQuestion className="h-10 w-10" />
          </div>
        </div>

        <div className="space-y-3">
          <h1 className="text-3xl font-black tracking-tight sm:text-4xl text-foreground">
            Project Blueprint Missing
          </h1>
          <p className="text-muted-foreground text-sm leading-relaxed font-medium opacity-80">
            The project or profile you are looking for doesn&apos;t exist or was moved to another repository. 
            Check the URL or explore other innovations below.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 pt-6 justify-center">
          <Link
            href="/"
            className={buttonVariants({ 
              size: "lg", 
              className: "rounded-xl gap-2 font-bold px-8 shadow-lg shadow-primary/10" 
            })}
          >
            <Home className="h-4 w-4" />
            Back Home
          </Link>
          <Link
            href="/explore"
            className={buttonVariants({ 
              variant: "outline", 
              size: "lg", 
              className: "rounded-xl gap-2 font-bold border-border/50 px-8 hover:bg-muted" 
            })}
          >
            <Search className="h-4 w-4" />
            Explore Gallery
          </Link>
        </div>
      </div>
    </div>
  );
}
