// Only ever returns a same-origin relative path, so it is safe to use as a
// sign-in redirect target (prevents open-redirect abuse).
export function sanitizeCallbackUrl(url: string | null): string | null {
  if (!url) return null;
  let path = url;
  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(url)) {
    try {
      const parsed = new URL(url);
      path = `${parsed.pathname}${parsed.search}${parsed.hash}`;
    } catch {
      return null;
    }
  }
  if (!path.startsWith("/") || path.startsWith("//")) return null;
  return path;
}
