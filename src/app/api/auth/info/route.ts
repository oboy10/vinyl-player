import { NextRequest, NextResponse } from "next/server";
import { getRedirectUri } from "@/lib/spotify";

export async function GET(request: NextRequest) {
  const origin = request.nextUrl.origin;
  const redirectUri = getRedirectUri(origin);

  return NextResponse.json({
    origin,
    redirectUri,
    hint: "Add redirectUri exactly to Spotify Dashboard → your app → Settings → Redirect URIs → Save",
  });
}
