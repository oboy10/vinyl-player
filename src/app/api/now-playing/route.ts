import { NextResponse } from "next/server";
import { fetchNowPlaying, isSpotifyConfigured } from "@/lib/spotify";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!isSpotifyConfigured()) {
    return NextResponse.json(
      { error: "not_configured", message: "Spotify credentials are missing" },
      { status: 503 },
    );
  }

  try {
    const nowPlaying = await fetchNowPlaying();
    return NextResponse.json(nowPlaying);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: "spotify_error", message }, { status: 502 });
  }
}
