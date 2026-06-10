"use client";

import { useEffect, useState } from "react";
import type { NowPlaying } from "@/lib/spotify";

export function usePlaybackProgress(track: NowPlaying) {
  const [progressMs, setProgressMs] = useState(track.progressMs);

  useEffect(() => {
    if (!track.isPlaying || !track.durationMs) {
      setProgressMs(track.progressMs);
      return;
    }

    const anchorProgress = track.progressMs;
    const anchorTime = track.fetchedAt || Date.now();

    let frame = 0;
    const tick = () => {
      const elapsed = Date.now() - anchorTime;
      setProgressMs(Math.min(anchorProgress + elapsed, track.durationMs));
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [
    track.isPlaying,
    track.progressMs,
    track.fetchedAt,
    track.trackId,
    track.durationMs,
  ]);

  return progressMs;
}
