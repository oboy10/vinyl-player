import type { NextRequest } from "next/server";

const CALLBACK_PATH = "/api/auth/callback";

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
  return stripTrailingSlash(`${proto}://${host}`);
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
    return originFromHeaders(request) ?? "http://localhost:3000";
  }

  if (request) {
    const fromHeaders = originFromHeaders(request.headers);
    if (fromHeaders) return fromHeaders;
    return stripTrailingSlash(request.nextUrl.origin);
  }

  return "http://localhost:3000";
}

export function getRedirectUri(request?: NextRequest | Headers): string {
  const configured = process.env.SPOTIFY_REDIRECT_URI?.trim();
  if (configured) {
    return stripTrailingSlash(configured);
  }

  return `${resolveAppOrigin(request)}${CALLBACK_PATH}`;
}

export function getSpotifyRedirectUrisToRegister(request?: NextRequest | Headers): string[] {
  const primary = getRedirectUri(request);
  const extras = [
    "http://localhost:3000/api/auth/callback",
    "http://127.0.0.1:3000/api/auth/callback",
  ];

  return [primary, ...extras.filter((uri) => uri !== primary)];
}
