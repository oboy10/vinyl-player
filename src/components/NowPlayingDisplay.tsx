"use client";

import { useCallback, useEffect, useState } from "react";
import type { NowPlaying } from "@/lib/spotify";
import { DEFAULT_PALETTE, extractPalette, type AlbumPalette } from "@/lib/colors";
import { usePlaybackProgress } from "@/hooks/usePlaybackProgress";
import { TurntableStage } from "./TurntableStage";

const POLL_PLAYING_MS = 1000;
const POLL_IDLE_MS = 5000;

const EMPTY_STATE: NowPlaying = {
  isPlaying: false,
  title: "",
  artist: "",
  album: "",
  albumArtUrl: null,
  albumReleaseYear: null,
  trackNumber: null,
  totalTracks: null,
  progressMs: 0,
  durationMs: 0,
  trackId: null,
  deviceName: null,
  deviceType: null,
  fetchedAt: Date.now(),
};

function formatTime(ms: number) {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function deviceIcon(type: string | null) {
  switch (type) {
    case "Smartphone":
      return "📱";
    case "Computer":
      return "💻";
    case "Speaker":
    case "CastVideo":
    case "CastAudio":
      return "🔊";
    case "TV":
      return "📺";
    default:
      return "🎧";
  }
}

export function NowPlayingDisplay() {
  const [track, setTrack] = useState<NowPlaying>(EMPTY_STATE);
  const [palette, setPalette] = useState<AlbumPalette>(DEFAULT_PALETTE);
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  const progressMs = usePlaybackProgress(track);
  const progress =
    track.durationMs > 0 ? (progressMs / track.durationMs) * 100 : 0;

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
  }, [fetchNowPlaying]);

  useEffect(() => {
    const interval = setInterval(
      () => void fetchNowPlaying(),
      track.isPlaying && track.title ? POLL_PLAYING_MS : POLL_IDLE_MS,
    );
    return () => clearInterval(interval);
  }, [fetchNowPlaying, track.isPlaying, track.title]);

  const hasTrack = Boolean(track.title);

  return (
    <div
      className="relative flex min-h-dvh w-full flex-col items-center justify-center overflow-hidden px-5 py-8 transition-[background] duration-1000 ease-out"
      style={{
        background: `radial-gradient(ellipse 120% 80% at 50% 120%, ${palette.accent}33 0%, transparent 55%),
          linear-gradient(160deg, ${palette.primary} 0%, ${palette.secondary} 45%, #050508 100%)`,
      }}
    >
      {track.albumArtUrl && (
        <div
          className="pointer-events-none absolute inset-0 scale-110 opacity-20 blur-3xl"
          style={{
            backgroundImage: `url(${track.albumArtUrl})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
      )}

      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          background: `radial-gradient(circle at 30% 20%, ${palette.accent}40, transparent 45%)`,
        }}
      />

      <main className="relative z-10 flex w-full max-w-lg flex-col items-center gap-5">
        {hasTrack && track.deviceName && (
          <div className="flex items-center gap-1.5 rounded-full border border-white/8 bg-black/20 px-3.5 py-1.5 text-[11px] uppercase tracking-widest text-white/45 backdrop-blur-sm">
            <span aria-hidden>{deviceIcon(track.deviceType)}</span>
            <span className="max-w-[240px] truncate">{track.deviceName}</span>
          </div>
        )}

        <TurntableStage
          albumArtUrl={track.albumArtUrl}
          album={track.album}
          artist={track.artist}
          title={track.title}
          releaseYear={track.albumReleaseYear}
          trackNumber={track.trackNumber}
          totalTracks={track.totalTracks}
          isPlaying={track.isPlaying}
          accentColor={palette.accent}
        />

        <div className="track-meta w-full space-y-3 text-center">
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
                <h1 className="truncate text-xl font-medium tracking-tight text-white/95">
                  {track.title}
                </h1>
                <p className="truncate text-base text-white/55">{track.artist}</p>
              </div>

              <div className="mx-auto w-full max-w-sm">
                <div className="h-1 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${progress}%`,
                      background: `linear-gradient(90deg, ${palette.accent}, ${palette.accent}88)`,
                    }}
                  />
                </div>
                <div className="mt-1.5 flex justify-between font-mono text-[11px] tabular-nums text-white/35">
                  <span>{formatTime(progressMs)}</span>
                  <span>{formatTime(track.durationMs)}</span>
                </div>
              </div>

              <p className="truncate text-xs uppercase tracking-[0.2em] text-white/30">
                {track.isPlaying ? "Now playing" : "Paused"}
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
