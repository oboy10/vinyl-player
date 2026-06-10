const SPOTIFY_TOKEN_URL = "https://accounts.spotify.com/api/token";
const SPOTIFY_API_BASE = "https://api.spotify.com/v1";

export type NowPlaying = {
  isPlaying: boolean;
  title: string;
  artist: string;
  album: string;
  albumArtUrl: string | null;
  progressMs: number;
  durationMs: number;
  trackId: string | null;
};

type SpotifyTokenResponse = {
  access_token: string;
  expires_in: number;
};

type SpotifyCurrentlyPlaying = {
  is_playing: boolean;
  progress_ms: number;
  item: {
    id: string;
    name: string;
    duration_ms: number;
    artists: { name: string }[];
    album: {
      name: string;
      images: { url: string; width: number; height: number }[];
    };
  } | null;
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

export async function fetchNowPlaying(): Promise<NowPlaying | null> {
  if (!isSpotifyConfigured()) {
    return null;
  }

  const accessToken = await getAccessToken();

  const response = await fetch(
    `${SPOTIFY_API_BASE}/me/player/currently-playing`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    },
  );

  if (response.status === 204) {
    return {
      isPlaying: false,
      title: "",
      artist: "",
      album: "",
      albumArtUrl: null,
      progressMs: 0,
      durationMs: 0,
      trackId: null,
    };
  }

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Spotify API error: ${error}`);
  }

  const data = (await response.json()) as SpotifyCurrentlyPlaying;
  const track = data.item;

  if (!track) {
    return {
      isPlaying: false,
      title: "",
      artist: "",
      album: "",
      albumArtUrl: null,
      progressMs: 0,
      durationMs: 0,
      trackId: null,
    };
  }

  const images = [...track.album.images].sort((a, b) => b.width - a.width);
  const albumArtUrl = images[0]?.url ?? null;

  return {
    isPlaying: data.is_playing,
    title: track.name,
    artist: track.artists.map((a) => a.name).join(", "),
    album: track.album.name,
    albumArtUrl,
    progressMs: data.progress_ms,
    durationMs: track.duration_ms,
    trackId: track.id,
  };
}

export function getSpotifyAuthUrl(origin: string) {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  if (!clientId) {
    throw new Error("SPOTIFY_CLIENT_ID is not set");
  }

  const params = new URLSearchParams({
    client_id: clientId,
    response_type: "code",
    redirect_uri: `${origin}/api/auth/callback`,
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
