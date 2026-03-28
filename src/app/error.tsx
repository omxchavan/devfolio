'use client';

import { useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCcw, Home, WifiOff } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button-variants";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service if needed
    console.error("Application error boundary caught error:", error);
  }, [error]);

  const isNetworkError = 
    error.message?.toLowerCase().includes("failed to fetch") || 
    error.message?.toLowerCase().includes("network error") ||
    (typeof window !== 'undefined' && !window.navigator.onLine);

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
      <div className="space-y-6 max-w-lg">
        <div className="relative inline-block mx-auto text-center">
          <div className="absolute inset-x-0 top-0 bg-red-500/10 rounded-full blur-3xl h-full w-full" />
          <div className="relative flex items-center justify-center h-24 w-24 rounded-3xl bg-muted border border-border/50 text-destructive mb-8 shadow-2xl mx-auto">
            {isNetworkError ? <WifiOff className="h-10 w-10" /> : <AlertCircle className="h-10 w-10" />}
          </div>
        </div>

        <div className="space-y-3">
          <h1 className="text-3xl font-black tracking-tight sm:text-4xl text-foreground capitalize">
            {isNetworkError ? "Network Disconnect Detected" : "System Alert"}
          </h1>
          <div className="text-muted-foreground text-sm leading-relaxed font-medium opacity-80 space-y-2">
            <p>
              {isNetworkError 
                ? "Your internet connection seems to be unstable or offline. Please check your connectivity and try again."
                : "A technical error occurred while processing your request. Our core systems are still functional, but this specific task failed."}
            </p>
            {!isNetworkError && (
              <p className="font-mono text-[10px] bg-muted/60 py-1.5 px-3 rounded-lg border border-border/40 line-clamp-2 max-w-sm mx-auto">
                {error.message || "Unknown Application Fault"}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 pt-6 justify-center">
          <Button
            onClick={() => reset()}
            size="lg"
            className="rounded-xl gap-2 font-bold px-8 shadow-xl shadow-destructive/10"
          >
            <RefreshCcw className="h-4 w-4" />
            Attempt Recovery
          </Button>
          <Link
            href="/"
            className={buttonVariants({ 
              variant: "outline", 
              size: "lg", 
              className: "rounded-xl gap-2 font-bold border-border/50 px-8 hover:bg-muted" 
            })}
          >
            <Home className="h-4 w-4" />
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
