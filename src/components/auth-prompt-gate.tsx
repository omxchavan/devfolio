"use client";

import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";

// The sign-in dialog (and its base-ui dependency) is only fetched when an auth
// intent is actually present in the URL, keeping it out of the initial bundle.
const AuthPrompt = dynamic(
  () => import("@/components/auth-prompt").then((m) => m.AuthPrompt),
  { ssr: false }
);

export function AuthPromptGate() {
  const searchParams = useSearchParams();
  const hasAuthIntent =
    searchParams.has("callbackUrl") ||
    searchParams.has("next") ||
    searchParams.has("error") ||
    searchParams.get("login") === "true";

  if (!hasAuthIntent) return null;

  return <AuthPrompt />;
}
