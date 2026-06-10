"use client";

import Image from "next/image";

type VinylRecordProps = {
  albumArtUrl: string | null;
  isPlaying: boolean;
  title: string;
};

export function VinylRecord({ albumArtUrl, isPlaying, title }: VinylRecordProps) {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[min(58vw,240px)]">
      <div
        className={`vinyl-disc absolute inset-0 rounded-full ${isPlaying ? "vinyl-spinning" : ""}`}
        aria-hidden
      >
        <div className="vinyl-grooves absolute inset-0 rounded-full" />
        <div className="vinyl-shine absolute inset-0 rounded-full" />

        <div className="absolute inset-[18%] rounded-full bg-[#0d0d0d] shadow-inner" />

        <div className="absolute inset-[22%] overflow-hidden rounded-full ring-1 ring-white/10">
          {albumArtUrl ? (
            <Image
              src={albumArtUrl}
              alt={title || "Album art"}
              fill
              className="object-cover"
              sizes="240px"
              priority
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-neutral-800 text-neutral-500">
              <svg viewBox="0 0 24 24" className="h-8 w-8 fill-current opacity-40">
                <path d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3h-6z" />
              </svg>
            </div>
          )}
        </div>

        <div className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#1a1a1a] ring-2 ring-black/50" />
      </div>

      <div
        className={`tonearm absolute -right-1 top-[8%] h-[42%] w-[3px] origin-top-right rounded-full bg-gradient-to-b from-neutral-300 to-neutral-500 shadow-lg transition-transform duration-700 ease-out ${isPlaying ? "rotate-[18deg]" : "rotate-[32deg]"}`}
        aria-hidden
      >
        <div className="absolute -left-1 bottom-0 h-3 w-3 rounded-full bg-neutral-400 shadow" />
      </div>
    </div>
  );
}
