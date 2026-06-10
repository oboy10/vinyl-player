import { NextRequest, NextResponse } from "next/server";
import { exchangeCodeForTokens } from "@/lib/spotify";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const error = request.nextUrl.searchParams.get("error");

  if (error || !code) {
    return new NextResponse(
      `<!DOCTYPE html>
      <html><body style="font-family:system-ui;background:#0a0a0a;color:#fff;padding:2rem">
        <h1>Spotify auth failed</h1>
        <p>${error ?? "No authorization code received."}</p>
        <a href="/api/auth/spotify" style="color:#1db954">Try again</a>
      </body></html>`,
      { headers: { "Content-Type": "text/html" } },
    );
  }

  const redirectUri = `${request.nextUrl.origin}/api/auth/callback`;

  try {
    const tokens = await exchangeCodeForTokens(code, redirectUri);

    return new NextResponse(
      `<!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Vinyl Player — Spotify connected</title>
          <style>
            body { font-family: system-ui, sans-serif; background: #0a0a0a; color: #f5f5f5; padding: 2rem; max-width: 42rem; margin: 0 auto; line-height: 1.6; }
            code { display: block; background: #1a1a1a; padding: 1rem; border-radius: 0.5rem; word-break: break-all; font-size: 0.85rem; margin: 1rem 0; }
            a { color: #1db954; }
            .warn { color: #fbbf24; font-size: 0.9rem; }
          </style>
        </head>
        <body>
          <h1>Connected to Spotify</h1>
          <p>Add this refresh token to your Vercel environment variables as <strong>SPOTIFY_REFRESH_TOKEN</strong>:</p>
          <code>${tokens.refresh_token}</code>
          <p class="warn">Keep this secret. Redeploy after adding it.</p>
          <p><a href="/">Open vinyl player →</a></p>
        </body>
      </html>`,
      { headers: { "Content-Type": "text/html" } },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return new NextResponse(
      `<!DOCTYPE html>
      <html><body style="font-family:system-ui;background:#0a0a0a;color:#fff;padding:2rem">
        <h1>Token exchange failed</h1>
        <p>${message}</p>
        <a href="/api/auth/spotify" style="color:#1db954">Try again</a>
      </body></html>`,
      { headers: { "Content-Type": "text/html" } },
    );
  }
}
