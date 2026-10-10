"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { GitPullRequest, Loader2 } from "lucide-react";
import { sanitizeCallbackUrl } from "@/lib/callback-url";

const OAUTH_ERROR_MESSAGES: Record<string, string> = {
  OAuthSignin: "Could not start the GitHub sign-in flow. Please try again.",
  OAuthCallback: "GitHub sign-in was interrupted or failed. Please try again.",
  OAuthAccountNotLinked: "This GitHub account is already linked to a different sign-in. Sign in with the original method.",
  AccessDenied: "Access was denied.",
  Callback: "Something went wrong while completing sign-in. Please try again.",
  Configuration: "Server configuration error. Check the auth environment variables.",
  Default: "Sign-in failed. Please try again.",
};

export function AuthPrompt() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { status } = useSession();
  const [signingIn, setSigningIn] = useState(false);

  const rawCallback = searchParams.get("callbackUrl") || searchParams.get("next");
  const oauthError = searchParams.get("error");
  const hasAuthIntent =
    !!rawCallback || searchParams.get("login") === "true" || !!oauthError;
  const callbackUrl = sanitizeCallbackUrl(rawCallback) || "/";

  const open = status === "unauthenticated" && hasAuthIntent;

  function dismiss() {
    // Clear the prompt params so the dialog does not reopen on navigation
    if (searchParams.toString()) router.replace("/");
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !next && dismiss()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="space-y-3">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <GitPullRequest className="h-6 w-6" />
          </div>
          <DialogTitle className="text-center text-lg font-bold tracking-tight">
            Sign in to continue
          </DialogTitle>
          <DialogDescription className="text-center">
            {oauthError
              ? OAUTH_ERROR_MESSAGES[oauthError] ?? OAUTH_ERROR_MESSAGES.Default
              : "Continue with GitHub to access this page."}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-2 pt-2">
          <Button
            disabled={signingIn}
            onClick={() => {
              setSigningIn(true);
              signIn("github", { callbackUrl });
            }}
            className="gap-2 w-full rounded-xl h-11 font-semibold"
          >
            {signingIn ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Redirecting to GitHub…
              </>
            ) : (
              <>
                <GitPullRequest className="h-4 w-4" />
                Continue with GitHub
              </>
            )}
          </Button>
          <Button
            variant="ghost"
            disabled={signingIn}
            onClick={dismiss}
            className="w-full rounded-xl"
          >
            Not now
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
