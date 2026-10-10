"use client";

import dynamic from "next/dynamic";
import { signIn, useSession } from "next-auth/react";
import type { Session } from "next-auth";
import { Button } from "@/components/ui/button";
import { GitPullRequest } from "lucide-react";
import { sanitizeCallbackUrl } from "@/lib/callback-url";

const UserMenu = dynamic(
  () => import("@/components/user-menu").then((m) => m.UserMenu),
  {
    ssr: false,
    loading: () => (
      <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
        <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
      </Button>
    ),
  }
);

function handleSignIn() {
  const params = new URLSearchParams(window.location.search);
  const raw = params.get("callbackUrl") || params.get("next");
  const callbackUrl = sanitizeCallbackUrl(raw) || "/";
  signIn("github", { callbackUrl });
}

export function AuthButton() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <Button variant="ghost" size="sm" disabled className="gap-2 rounded-full">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </Button>
    );
  }

  if (session) {
    return <UserMenu session={session as Session} />;
  }

  return (
    <Button
      onClick={handleSignIn}
      size="sm"
      className="gap-2 bg-gradient-to-r from-primary to-[oklch(0.60_0.22_300)] hover:opacity-90 transition-all duration-300 shadow-lg shadow-primary/20 hover:shadow-primary/30 text-white rounded-full px-5"
    >
      <GitPullRequest className="h-4 w-4" />
      Sign in
    </Button>
  );
}
