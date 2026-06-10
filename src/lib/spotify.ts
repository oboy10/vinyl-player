import type { NextRequest } from "next/server";
import { getRedirectUri } from "@/lib/app-url";

const SPOTIFY_TOKEN_URL = "https://accounts.spotify.com/api/token";
const SPOTIFY_API_BASE = "https://api.spotify.com/v1";

export type NowPlaying = {
  isPlaying: boolean;
  title: string;
  artist: string;
  album: string;
  albumArtUrl: string | null;
  albumReleaseYear: string | null;
  trackNumber: number | null;
  totalTracks: number | null;
  progressMs: number;
  durationMs: number;
  trackId: string | null;
  deviceName: string | null;
  deviceType: string | null;
  fetchedAt: number;
};

type SpotifyTokenResponse = {
  access_token: string;
  expires_in: number;
};

type SpotifyImage = { url: string; width: number; height: number };

type SpotifyTrack = {
  id: string;
  name: string;
  duration_ms: number;
  track_number: number;
  artists: { name: string }[];
  album: {
    name: string;
    release_date: string;
    total_tracks: number;
    images: SpotifyImage[];
  };
};

type SpotifyPlayerState = {
  is_playing: boolean;
  progress_ms: number;
  item: SpotifyTrack | null;
  device: {
    name: string;
    type: string;
  };
};

function getCredentials() {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  const refreshToken = process.env.SPOTIFY_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    return null;
  }

  return { clientId, clientSecret, refreshToken };
}

export function hasSpotifyOAuthCredentials() {
  return Boolean(
    process.env.SPOTIFY_CLIENT_ID?.trim() && process.env.SPOTIFY_CLIENT_SECRET?.trim(),
  );
}

export function getMissingSpotifyEnvVars() {
  const missing: string[] = [];
  if (!process.env.SPOTIFY_CLIENT_ID?.trim()) missing.push("SPOTIFY_CLIENT_ID");
  if (!process.env.SPOTIFY_CLIENT_SECRET?.trim()) missing.push("SPOTIFY_CLIENT_SECRET");
  if (!process.env.SPOTIFY_REFRESH_TOKEN?.trim()) missing.push("SPOTIFY_REFRESH_TOKEN");
  return missing;
}

export function isSpotifyConfigured() {
  return getCredentials() !== null;
}

async function getAccessToken(): Promise<string> {
  const credentials = getCredentials();
  if (!credentials) {
    throw new Error("Spotify is not configured");
  }

  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: credentials.refreshToken,
  });

  const response = await fetch(SPOTIFY_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(
        `${credentials.clientId}:${credentials.clientSecret}`,
      ).toString("base64")}`,
    },
    body,
    cache: "no-store",
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Spotify token refresh failed: ${error}`);
  }

  const data = (await response.json()) as SpotifyTokenResponse;
  return data.access_token;
}

function getLargestImage(images: SpotifyImage[]) {
  if (!images.length) return null;
  return [...images].sort((a, b) => b.width - a.width)[0]?.url ?? null;
}

function emptyNowPlaying(): NowPlaying {
  return {
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
}

function mapPlayerState(data: SpotifyPlayerState): NowPlaying {
  const track = data.item;
  const fetchedAt = Date.now();

  if (!track) {
    return {
      ...emptyNowPlaying(),
      isPlaying: data.is_playing,
      deviceName: data.device?.name ?? null,
      deviceType: data.device?.type ?? null,
      fetchedAt,
    };
  }

  const releaseYear = track.album.release_date?.slice(0, 4) ?? null;

  return {
    isPlaying: data.is_playing,
    title: track.name,
    artist: track.artists.map((a) => a.name).join(", "),
    album: track.album.name,
    albumArtUrl: getLargestImage(track.album.images),
    albumReleaseYear: releaseYear,
    trackNumber: track.track_number,
    totalTracks: track.album.total_tracks,
    progressMs: data.progress_ms,
    durationMs: track.duration_ms,
    trackId: track.id,
    deviceName: data.device?.name ?? null,
    deviceType: data.device?.type ?? null,
    fetchedAt,
  };
}

export async function fetchNowPlaying(): Promise<NowPlaying | null> {
  if (!isSpotifyConfigured()) {
    return null;
  }

  const accessToken = await getAccessToken();

  const playerResponse = await fetch(`${SPOTIFY_API_BASE}/me/player`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });

  if (playerResponse.status === 204) {
    return emptyNowPlaying();
  }

  if (!playerResponse.ok) {
    const error = await playerResponse.text();
    throw new Error(`Spotify API error: ${error}`);
  }

  const playerData = (await playerResponse.json()) as SpotifyPlayerState;
  return mapPlayerState(playerData);
}

export function getSpotifyAuthUrl(request: NextRequest) {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  if (!clientId) {
    throw new Error("SPOTIFY_CLIENT_ID is not set");
  }

  const redirectUri = getRedirectUri(request);

  const params = new URLSearchParams({
    client_id: clientId,
    response_type: "code",
    redirect_uri: redirectUri,
    scope: "user-read-currently-playing user-read-playback-state",
    show_dialog: "true",
  });

  return `https://accounts.spotify.com/authorize?${params}`;
}

export async function exchangeCodeForTokens(code: string, redirectUri: string) {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("Spotify credentials are not configured");
  }

  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: redirectUri,
  });

  const response = await fetch(SPOTIFY_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(
        `${clientId}:${clientSecret}`,
      ).toString("base64")}`,
    },
    body,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Token exchange failed: ${error}`);
  }

  return response.json() as Promise<{
    access_token: string;
    refresh_token: string;
    expires_in: number;
  }>;
}
