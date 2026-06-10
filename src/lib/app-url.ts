import type { NextRequest } from "next/server";

const CALLBACK_PATH = "/api/auth/callback";

/** Spotify no longer allows localhost — use 127.0.0.1 for local dev. */
const LOCAL_ORIGIN = "http://127.0.0.1:3000";
const LOCAL_REDIRECT_URI = `${LOCAL_ORIGIN}${CALLBACK_PATH}`;

function stripTrailingSlash(url: string) {
  return url.replace(/\/$/, "");
}

function originFromHeaders(headers: Headers): string | null {
  const host =
    headers.get("x-forwarded-host")?.split(",")[0]?.trim() ??
    headers.get("host")?.split(",")[0]?.trim();

  const proto =
    headers.get("x-forwarded-proto")?.split(",")[0]?.trim() ?? "http";

  if (!host) return null;

  // Spotify rejects localhost — normalize to 127.0.0.1 for local dev
  const normalizedHost = host.replace(/^localhost/i, "127.0.0.1");
  return stripTrailingSlash(`${proto}://${normalizedHost}`);
}

function isLocalOrigin(origin: string) {
  try {
    const { hostname } = new URL(origin);
    return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "[::1]";
  } catch {
    return false;
  }
}

/** Canonical app origin for OAuth (must match a Spotify Dashboard redirect URI). */
export function resolveAppOrigin(request?: NextRequest | Headers): string {
  const appUrl = process.env.APP_URL?.trim() || process.env.NEXT_PUBLIC_APP_URL?.trim();

  if (appUrl) {
    try {
      return stripTrailingSlash(new URL(appUrl).origin);
    } catch {
      return stripTrailingSlash(appUrl);
    }
  }

  const vercelProduction = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (vercelProduction) {
    const host = vercelProduction.replace(/^https?:\/\//, "");
    return `https://${host}`;
  }

  const vercelUrl = process.env.VERCEL_URL?.trim();
  if (vercelUrl) {
    return `https://${vercelUrl.replace(/^https?:\/\//, "")}`;
  }

  if (request instanceof Headers) {
    const fromHeaders = originFromHeaders(request);
    if (fromHeaders) return fromHeaders;
    return LOCAL_ORIGIN;
  }

  if (request) {
    const fromHeaders = originFromHeaders(request.headers);
    if (fromHeaders) return fromHeaders;
    const origin = stripTrailingSlash(request.nextUrl.origin);
    if (isLocalOrigin(origin)) {
      try {
        const { port } = new URL(origin);
        return port ? `http://127.0.0.1:${port}` : LOCAL_ORIGIN;
      } catch {
        return LOCAL_ORIGIN;
      }
    }
    return origin;
  }

  return LOCAL_ORIGIN;
}

export function getRedirectUri(request?: NextRequest | Headers): string {
  const configured = process.env.SPOTIFY_REDIRECT_URI?.trim();
  if (configured) {
    return stripTrailingSlash(configured).replace(
      /^http:\/\/localhost/i,
      "http://127.0.0.1",
    );
  }

  const origin = resolveAppOrigin(request);
  if (isLocalOrigin(origin)) {
    try {
      const { port } = new URL(origin);
      return port
        ? `http://127.0.0.1:${port}${CALLBACK_PATH}`
        : LOCAL_REDIRECT_URI;
    } catch {
      return LOCAL_REDIRECT_URI;
    }
  }

  return `${origin}${CALLBACK_PATH}`;
}

export function getSpotifyRedirectUrisToRegister(request?: NextRequest | Headers): string[] {
  const primary = getRedirectUri(request);

  if (isLocalOrigin(resolveAppOrigin(request))) {
    return [primary];
  }

  return [primary];
}
