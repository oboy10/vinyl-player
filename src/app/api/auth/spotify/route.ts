import { NextRequest, NextResponse } from "next/server";
import { getSpotifyAuthUrl } from "@/lib/spotify";

export async function GET(request: NextRequest) {
  try {
    const url = getSpotifyAuthUrl(request);
    return NextResponse.redirect(url);
  } catch {
    return NextResponse.json(
      { error: "Set SPOTIFY_CLIENT_ID in your environment variables first." },
      { status: 500 },
    );
  }
}
