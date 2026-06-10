import { NextRequest, NextResponse } from "next/server";
import { getRedirectUri } from "@/lib/app-url";
import { getMissingSpotifyEnvVars, getSpotifyAuthUrl, hasSpotifyOAuthCredentials } from "@/lib/spotify";

export async function GET(request: NextRequest) {
  if (!hasSpotifyOAuthCredentials()) {
    const missing = getMissingSpotifyEnvVars().filter(
      (v) => v !== "SPOTIFY_REFRESH_TOKEN",
    );
    const onVercel = Boolean(process.env.VERCEL);

    return new NextResponse(
      `<!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Spotify env vars missing</title>
          <style>
            body { font-family: system-ui, sans-serif; background: #0a0a0a; color: #f5f5f5; padding: 2rem; max-width: 42rem; margin: 0 auto; line-height: 1.6; }
            code { background: #1a1a1a; padding: 0.15rem 0.4rem; border-radius: 0.25rem; font-size: 0.9em; }
            li { margin: 0.5rem 0; }
            .box { background: #1a1a1a; border-radius: 0.5rem; padding: 1rem; margin: 1rem 0; }
            a { color: #1db954; }
          </style>
        </head>
        <body>
          <h1>Spotify credentials not configured</h1>
          <p>Add these in ${onVercel ? "<strong>Vercel → Project → Settings → Environment Variables</strong>, then redeploy" : "<code>.env.local</code>, then restart the dev server"}:</p>
          <div class="box">
            <ul>
              ${missing.map((v) => `<li><code>${v}</code></li>`).join("")}
            </ul>
          </div>
          ${onVercel ? "<p>After saving env vars, go to Vercel → Deployments → Redeploy.</p>" : ""}
          <p><a href="/">← Back to setup</a></p>
        </body>
      </html>`,
      { status: 503, headers: { "Content-Type": "text/html" } },
    );
  }

  try {
    const url = getSpotifyAuthUrl(request);
    return NextResponse.redirect(url);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    const redirectUri = getRedirectUri(request);

    return new NextResponse(
      `<!DOCTYPE html>
      <html><body style="font-family:system-ui;background:#0a0a0a;color:#fff;padding:2rem">
        <h1>Spotify auth error</h1>
        <p>${message}</p>
        <p>Redirect URI: <code>${redirectUri}</code></p>
        <a href="/" style="color:#1db954">Back</a>
      </body></html>`,
      { status: 500, headers: { "Content-Type": "text/html" } },
    );
  }
}
