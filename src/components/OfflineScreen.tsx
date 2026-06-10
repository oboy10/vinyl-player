const REPO_README = "https://github.com/oboy10/vinyl-player#setup";

export function OfflineScreen() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-[#050508] px-6 text-center">
      <div className="max-w-sm space-y-6">
        <div className="relative mx-auto h-28 w-28">
          <div className="absolute inset-0 rounded-full bg-neutral-900 ring-1 ring-white/8" />
          <div className="absolute inset-[18%] rounded-full bg-neutral-950 ring-1 ring-white/5" />
          <div className="absolute left-1/2 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-neutral-800" />
          <div className="absolute -right-0.5 top-[10%] h-[38%] w-[2px] origin-top-right rotate-[30deg] rounded-full bg-neutral-600" />
        </div>

        <div className="space-y-2">
          <p className="text-[11px] font-medium uppercase tracking-[0.25em] text-white/30">
            Offline
          </p>
          <h1 className="text-xl font-medium tracking-tight text-white/90">Vinyl Player</h1>
          <p className="text-sm leading-relaxed text-white/45">
            Not connected to Spotify. This is a personal display — follow the README to set up your
            own.
          </p>
        </div>

        <a
          href={REPO_README}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/5 px-5 py-2.5 text-sm text-white/70 transition hover:bg-white/8 hover:text-white/90"
        >
          Setup instructions
        </a>
      </div>
    </div>
  );
}
