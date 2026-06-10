"use client";

import Image from "next/image";

type AlbumSleeveProps = {
  albumArtUrl: string | null;
  album: string;
  artist: string;
  releaseYear: string | null;
  trackNumber: number | null;
  totalTracks: number | null;
  isPlaying: boolean;
  accentColor: string;
};

export function AlbumSleeve({
  albumArtUrl,
  album,
  artist,
  releaseYear,
  trackNumber,
  totalTracks,
  isPlaying,
  accentColor,
}: AlbumSleeveProps) {
  const trackLabel =
    trackNumber && totalTracks ? `${trackNumber} / ${totalTracks}` : null;

  return (
    <div
      className={`album-sleeve relative aspect-square w-[38%] shrink-0 transition-all duration-700 ease-out ${
        isPlaying ? "-translate-x-1 -rotate-2 opacity-90" : "translate-x-0 rotate-0 opacity-100"
      }`}
    >
      <div
        className="absolute inset-0 rounded-sm shadow-2xl"
        style={{
          boxShadow: `0 12px 40px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.06), inset 0 0 0 1px ${accentColor}22`,
        }}
      >
        <div className="sleeve-texture absolute inset-0 rounded-sm" />

        <div className="relative h-full w-full overflow-hidden rounded-sm">
          {albumArtUrl ? (
            <Image
              src={albumArtUrl}
              alt={`${album} cover`}
              fill
              className="object-cover"
              sizes="140px"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-neutral-800" />
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />

          <div className="absolute bottom-0 left-0 right-0 p-3 text-left">
            <p className="line-clamp-2 text-[10px] font-medium leading-tight text-white/95">
              {album}
            </p>
            <p className="mt-0.5 truncate text-[9px] text-white/55">{artist}</p>
            <div className="mt-1.5 flex items-center gap-2 text-[8px] uppercase tracking-wider text-white/40">
              {releaseYear && <span>{releaseYear}</span>}
              {trackLabel && (
                <>
                  {releaseYear && <span>·</span>}
                  <span>Track {trackLabel}</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div
        className="absolute -right-[3px] top-2 bottom-2 w-[3px] rounded-r-sm bg-black/40"
        aria-hidden
      />
    </div>
  );
}
