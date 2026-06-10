import { headers } from "next/headers";
import { getRedirectUri } from "@/lib/spotify";

async function getAppOrigin() {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? "http";
  return `${proto}://${host}`;
}

export async function SetupScreen() {
  const origin = await getAppOrigin();
  const redirectUri = getRedirectUri(origin);

  const localVariants = [
    "http://localhost:3000/api/auth/callback",
    "http://127.0.0.1:3000/api/auth/callback",
  ].filter((uri) => uri !== redirectUri);

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-[#050508] px-6 text-center">
      <div className="max-w-md space-y-6">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white/5 ring-1 ring-white/10">
          <svg viewBox="0 0 24 24" className="h-9 w-9 fill-[#1db954]" aria-hidden>
            <path d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3h-6z" />
          </svg>
        </div>

        <div className="space-y-2">
          <h1 className="text-xl font-medium tracking-tight text-white">Vinyl Player</h1>
          <p className="text-sm leading-relaxed text-white/50">
            Connect Spotify to show your now-playing track as a spinning vinyl on your display.
          </p>
        </div>

        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-left text-sm">
          <p className="font-medium text-amber-200">Spotify redirect URI (copy exactly)</p>
          <code className="mt-2 block break-all text-xs text-amber-100/90">{redirectUri}</code>
          {localVariants.length > 0 && (
            <p className="mt-2 text-xs text-amber-200/70">
              If auth still fails locally, also add:{" "}
              {localVariants.map((uri, i) => (
                <span key={uri}>
                  {i > 0 && " and "}
                  <code className="text-amber-100/80">{uri}</code>
                </span>
              ))}
            </p>
          )}
        </div>

        <ol className="space-y-3 text-left text-sm text-white/60">
          <li className="rounded-lg bg-white/5 px-4 py-3 ring-1 ring-white/8">
            <span className="text-white/80">1.</span> Open{" "}
            <a
              href="https://developer.spotify.com/dashboard"
              className="text-[#1db954] underline-offset-2 hover:underline"
              target="_blank"
              rel="noreferrer"
            >
              Spotify Developer Dashboard
            </a>{" "}
            → your app → <strong className="text-white/80">Settings</strong>
          </li>
          <li className="rounded-lg bg-white/5 px-4 py-3 ring-1 ring-white/8">
            <span className="text-white/80">2.</span> Under <strong className="text-white/80">Redirect URIs</strong>, paste the URI above →{" "}
            <strong className="text-white/80">Add</strong> → <strong className="text-white/80">Save</strong> at the bottom
          </li>
          <li className="rounded-lg bg-white/5 px-4 py-3 ring-1 ring-white/8">
            <span className="text-white/80">3.</span> Set env vars:{" "}
            <code className="text-xs text-white/70">SPOTIFY_CLIENT_ID</code>,{" "}
            <code className="text-xs text-white/70">SPOTIFY_CLIENT_SECRET</code>, then{" "}
            <code className="text-xs text-white/70">SPOTIFY_REFRESH_TOKEN</code> after connecting
          </li>
        </ol>

        <a
          href="/api/auth/spotify"
          className="inline-flex items-center gap-2 rounded-full bg-[#1db954] px-6 py-3 text-sm font-medium text-black transition hover:bg-[#1ed760]"
        >
          Connect Spotify
        </a>
      </div>
    </div>
  );
}
