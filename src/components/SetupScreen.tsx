import { headers } from "next/headers";
import {
  getRedirectUri,
  getSpotifyRedirectUrisToRegister,
  resolveAppOrigin,
} from "@/lib/app-url";

export async function SetupScreen() {
  const h = await headers();
  const origin = resolveAppOrigin(h);
  const redirectUri = getRedirectUri(h);
  const allUris = getSpotifyRedirectUrisToRegister(h);

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
          <p className="font-medium text-amber-200">Add these redirect URIs in Spotify</p>
          <p className="mt-1 text-xs text-amber-200/70">
            Dashboard → your app → Settings → Redirect URIs → Add each → Save
          </p>
          <ul className="mt-3 space-y-2">
            {allUris.map((uri) => (
              <li key={uri}>
                <code className="block break-all text-xs text-amber-100/90">{uri}</code>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-amber-200/60">Active origin: {origin}</p>
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
            </a>
          </li>
          <li className="rounded-lg bg-white/5 px-4 py-3 ring-1 ring-white/8">
            <span className="text-white/80">2.</span> Add every URI above, then click{" "}
            <strong className="text-white/80">Save</strong> at the bottom of Settings
          </li>
          <li className="rounded-lg bg-white/5 px-4 py-3 ring-1 ring-white/8">
            <span className="text-white/80">3.</span> Set{" "}
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

        <p className="text-xs text-white/30">
          Using redirect: <code className="text-white/50">{redirectUri}</code>
        </p>
      </div>
    </div>
  );
}
