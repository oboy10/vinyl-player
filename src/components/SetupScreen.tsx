import { headers } from "next/headers";
import {
  getRedirectUri,
  getSpotifyRedirectUrisToRegister,
  resolveAppOrigin,
} from "@/lib/app-url";
import { getMissingSpotifyEnvVars, hasSpotifyOAuthCredentials } from "@/lib/spotify";

export async function SetupScreen() {
  const h = await headers();
  const origin = resolveAppOrigin(h);
  const redirectUri = getRedirectUri(h);
  const allUris = getSpotifyRedirectUrisToRegister(h);
  const missing = getMissingSpotifyEnvVars();
  const onVercel = Boolean(process.env.VERCEL);
  const canConnect = hasSpotifyOAuthCredentials();

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
            Connect Spotify to show your now-playing track as a spinning vinyl.
          </p>
        </div>

        {missing.length > 0 && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-left text-sm">
            <p className="font-medium text-red-200">
              Missing {onVercel ? "Vercel" : "local"} env vars
            </p>
            <ul className="mt-2 space-y-1">
              {missing.map((v) => (
                <li key={v}>
                  <code className="text-xs text-red-100/90">{v}</code>
                </li>
              ))}
            </ul>
            <p className="mt-2 text-xs text-red-200/70">
              {onVercel
                ? "Vercel → Settings → Environment Variables → add each → Redeploy"
                : "Add to .env.local → restart npm run dev"}
            </p>
          </div>
        )}

        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-left text-sm">
          <p className="font-medium text-amber-200">Spotify redirect URI</p>
          <p className="mt-1 text-xs text-amber-200/70">
            Spotify no longer allows <code className="text-amber-100/80">localhost</code>. Use{" "}
            <code className="text-amber-100/80">127.0.0.1</code> locally or your{" "}
            <code className="text-amber-100/80">https://</code> Vercel URL in production.
          </p>
          <ul className="mt-3 space-y-2">
            {allUris.map((uri) => (
              <li key={uri}>
                <code className="block break-all text-xs text-amber-100/90">{uri}</code>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-amber-200/60">
            Dashboard → your app → Settings → Redirect URIs → Add → Save
          </p>
        </div>

        {canConnect ? (
          <a
            href="/api/auth/spotify"
            className="inline-flex items-center gap-2 rounded-full bg-[#1db954] px-6 py-3 text-sm font-medium text-black transition hover:bg-[#1ed760]"
          >
            Connect Spotify
          </a>
        ) : (
          <p className="text-sm text-white/40">Add client ID + secret above first</p>
        )}

        <p className="text-xs text-white/30">
          Active: {origin} · redirect: <code className="text-white/50">{redirectUri}</code>
        </p>
      </div>
    </div>
  );
}
