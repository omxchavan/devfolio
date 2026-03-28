'use client';

import { Inter } from "next/font/google";
import { AlertTriangle, RefreshCw } from "lucide-react";

const inter = Inter({ subsets: ["latin"] });

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen bg-background flex items-center justify-center p-4`}>
        <div className="max-w-md w-full text-center space-y-8 animate-in fade-in zoom-in duration-500">
          <div className="relative inline-block mx-auto">
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-[80px]" />
            <div className="relative h-28 w-28 rounded-[2rem] bg-muted border border-border/50 flex items-center justify-center text-primary shadow-2xl mx-auto">
              <AlertTriangle className="h-12 w-12" />
            </div>
          </div>

          <div className="space-y-4">
            <h1 className="text-4xl font-black tracking-tighter">CORE SYSTEM <span className="text-primary italic">ALERT</span></h1>
            <p className="text-muted-foreground text-sm font-medium leading-relaxed max-w-sm mx-auto">
              Devfolio&apos;s root systems encountered an unexpected fault. This is likely a temporary hiccup or a connectivity lapse.
            </p>
            <div className="bg-muted/40 p-3 rounded-2xl border border-border/30 max-w-sm mx-auto overflow-hidden">
               <p className="font-mono text-[9px] text-muted-foreground line-clamp-2 truncate">
                 {error.message || "Root Layout Exception"}
               </p>
            </div>
          </div>

          <button
            onClick={() => {
              // Full reset - clear cache and reload
              window.location.reload();
            }}
            className="group relative h-14 w-full px-8 bg-foreground text-background font-black rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98] shadow-2xl shadow-primary/20"
          >
            <span className="flex items-center justify-center gap-2">
              <RefreshCw className="h-5 w-5 group-hover:rotate-180 transition-transform duration-500" />
              FACTORY RESET SYSTEM
            </span>
          </button>
        </div>
      </body>
    </html>
  );
}
