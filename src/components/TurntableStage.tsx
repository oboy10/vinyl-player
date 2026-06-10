"use client";

import { AlbumSleeve } from "./AlbumSleeve";
import { VinylRecord } from "./VinylRecord";

type TurntableStageProps = {
  albumArtUrl: string | null;
  album: string;
  artist: string;
  title: string;
  releaseYear: string | null;
  trackNumber: number | null;
  totalTracks: number | null;
  isPlaying: boolean;
  accentColor: string;
};

export function TurntableStage({
  albumArtUrl,
  album,
  artist,
  title,
  releaseYear,
  trackNumber,
  totalTracks,
  isPlaying,
  accentColor,
}: TurntableStageProps) {
  return (
    <div className="turntable-stage-wrap relative mx-auto w-full max-w-[min(94vw,400px)]">
      <div
        className="pointer-events-none absolute inset-0 -z-10 rounded-3xl opacity-60 blur-3xl"
        style={{ background: `${accentColor}33` }}
      />

      <div className="turntable-mat relative flex items-center justify-center gap-3.5 rounded-2xl px-4 py-5">
        <AlbumSleeve
          albumArtUrl={albumArtUrl}
          album={album}
          artist={artist}
          releaseYear={releaseYear}
          trackNumber={trackNumber}
          totalTracks={totalTracks}
          isPlaying={isPlaying}
          accentColor={accentColor}
        />

        <div
          className={`relative flex-1 transition-transform duration-700 ease-out ${
            isPlaying ? "translate-x-1 scale-[1.02]" : "translate-x-0 scale-100"
          }`}
        >
          <VinylRecord
            albumArtUrl={albumArtUrl}
            isPlaying={isPlaying}
            title={title}
          />
        </div>
      </div>
    </div>
  );
}
