import { NextRequest, NextResponse } from "next/server";
import {
  getRedirectUri,
  getSpotifyRedirectUrisToRegister,
  resolveAppOrigin,
} from "@/lib/app-url";

export async function GET(request: NextRequest) {
  const origin = resolveAppOrigin(request);
  const redirectUri = getRedirectUri(request);

  return NextResponse.json({
    origin,
    redirectUri,
    registerInSpotifyDashboard: getSpotifyRedirectUrisToRegister(request),
    hint: "Add every URI in registerInSpotifyDashboard to Spotify → your app → Settings → Redirect URIs, then click Save.",
  });
}
