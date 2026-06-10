# Vinyl Player

A fun lil project — I always wanted a vinyl visualizer for whatever I'm listening to.

Shows your current Spotify track as a spinning record with the album sleeve, color-matched gradients, and live progress. Built for a tiny always-on display, but works in any browser.

## Setup

1. Create a [Spotify Developer](https://developer.spotify.com/dashboard) app
2. Add a redirect URI (Spotify no longer allows `localhost` — use `http://127.0.0.1:3000/api/auth/callback` locally, or your Vercel URL in production)
3. Copy `.env.example` to `.env.local` and fill in your credentials
4. Visit `/api/auth/spotify` to get a refresh token, then add it to your env vars

```bash
npm install
npm run dev
```

Open [http://127.0.0.1:3000/display](http://127.0.0.1:3000/display) — start playing something on Spotify.

## Deploy

Deploy to [Vercel](https://vercel.com), set `SPOTIFY_CLIENT_ID`, `SPOTIFY_CLIENT_SECRET`, `SPOTIFY_REDIRECT_URI`, and `SPOTIFY_REFRESH_TOKEN` as environment variables.
