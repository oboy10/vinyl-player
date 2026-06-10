"use client";

import { useCallback, useEffect, useState } from "react";
import type { NowPlaying } from "@/lib/spotify";
import { DEFAULT_PALETTE, extractPalette, type AlbumPalette } from "@/lib/colors";
import { VinylRecord } from "./VinylRecord";

const POLL_INTERVAL_MS = 4000;

const EMPTY_STATE: NowPlaying = {
  isPlaying: false,
  title: "",
  artist: "",
  album: "",
  albumArtUrl: null,
  progressMs: 0,
  durationMs: 0,
  trackId: null,
};

function formatTime(ms: number) {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function NowPlayingDisplay() {
  const [track, setTrack] = useState<NowPlaying>(EMPTY_STATE);
  const [palette, setPalette] = useState<AlbumPalette>(DEFAULT_PALETTE);
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  const updatePalette = useCallback(async (imageUrl: string | null) => {
    if (!imageUrl) {
      setPalette(DEFAULT_PALETTE);
      return;
    }
    const colors = await extractPalette(imageUrl);
    setPalette(colors);
  }, []);

  const fetchNowPlaying = useCallback(async () => {
    try {
      const response = await fetch("/api/now-playing", { cache: "no-store" });
      const data = await response.json();

      if (!response.ok) {
        setError(data.message ?? "Failed to load playback");
        setLoaded(true);
        return;
      }

      setError(null);
      setTrack((prev) => {
        if (data.albumArtUrl !== prev.albumArtUrl) {
          void updatePalette(data.albumArtUrl);
        }
        return data as NowPlaying;
      });
      setLoaded(true);
    } catch {
      setError("Connection error");
      setLoaded(true);
    }
  }, [updatePalette]);

  useEffect(() => {
    void fetchNowPlaying();
    const interval = setInterval(() => void fetchNowPlaying(), POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [fetchNowPlaying]);

  const hasTrack = Boolean(track.title);
  const progress =
    track.durationMs > 0 ? (track.progressMs / track.durationMs) * 100 : 0;

  return (
    <div
      className="relative flex min-h-dvh w-full flex-col items-center justify-center overflow-hidden px-5 py-8 transition-[background] duration-1000 ease-out"
      style={{
        background: `radial-gradient(ellipse 120% 80% at 50% 120%, ${palette.accent}33 0%, transparent 55%),
          linear-gradient(160deg, ${palette.primary} 0%, ${palette.secondary} 45%, #050508 100%)`,
      }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          background: `radial-gradient(circle at 30% 20%, ${palette.accent}40, transparent 45%)`,
        }}
      />

      <main className="relative z-10 flex w-full max-w-sm flex-col items-center gap-6">
        <VinylRecord
          albumArtUrl={track.albumArtUrl}
          isPlaying={track.isPlaying}
          title={track.title}
        />

        <div className="w-full space-y-3 text-center">
          {!loaded ? (
            <div className="space-y-2 animate-pulse">
              <div className="mx-auto h-5 w-48 rounded bg-white/10" />
              <div className="mx-auto h-4 w-32 rounded bg-white/5" />
            </div>
          ) : error ? (
            <p className="text-sm text-red-300/90">{error}</p>
          ) : hasTrack ? (
            <>
              <div className="space-y-1">
                <h1 className="truncate text-lg font-medium tracking-tight text-white/95">
                  {track.title}
                </h1>
                <p className="truncate text-sm text-white/55">{track.artist}</p>
              </div>

              <div className="mx-auto max-w-[200px]">
                <div className="h-[2px] overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full transition-[width] duration-1000 ease-linear"
                    style={{
                      width: `${progress}%`,
                      background: `linear-gradient(90deg, ${palette.accent}, ${palette.accent}88)`,
                    }}
                  />
                </div>
                <div className="mt-1.5 flex justify-between font-mono text-[10px] text-white/35">
                  <span>{formatTime(track.progressMs)}</span>
                  <span>{formatTime(track.durationMs)}</span>
                </div>
              </div>

              <p className="truncate text-[11px] uppercase tracking-[0.2em] text-white/30">
                {track.isPlaying ? "Now playing" : "Paused"} · {track.album}
              </p>
            </>
          ) : (
            <div className="space-y-1">
              <p className="text-sm text-white/70">Nothing playing</p>
              <p className="text-xs text-white/40">Start music on Spotify</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
