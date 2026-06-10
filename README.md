# Vinyl Player

A fun lil project — I always wanted a vinyl visualizer for whatever I'm listening to.

Shows your current Spotify track as a spinning record with the album sleeve, color-matched gradients, and live progress. Built for a tiny always-on display, but works in any browser.

The public demo stays **offline** until you configure your own Spotify credentials. One refresh token = one person's listening — don't put yours on a public deploy unless you're okay with that.

## Setup

1. Clone the repo and install dependencies
2. Create a [Spotify Developer](https://developer.spotify.com/dashboard) app
3. Add a redirect URI:
   - Local: `http://127.0.0.1:3000/api/auth/callback`
   - Production: `https://your-app.vercel.app/api/auth/callback`
4. Copy `.env.example` to `.env.local` and fill in your credentials
5. Run the app, visit `/api/auth/spotify`, and save the refresh token to `.env.local`

```bash
npm install
npm run dev
```

Open [http://127.0.0.1:3000/display](http://127.0.0.1:3000/display) — start playing something on Spotify.

### Environment variables

| Variable | Description |
|----------|-------------|
| `SPOTIFY_CLIENT_ID` | From Spotify Developer Dashboard |
| `SPOTIFY_CLIENT_SECRET` | From Spotify Developer Dashboard |
| `SPOTIFY_REDIRECT_URI` | Optional — your callback URL if auto-detect fails |
| `SPOTIFY_REFRESH_TOKEN` | From `/api/auth/spotify` after connecting |

## Deploy

Deploy to [Vercel](https://vercel.com) and add the env vars above in **Settings → Environment Variables**.

**Privacy:** If you remove all Spotify env vars from Vercel, the site shows an offline screen. Only add your refresh token to deployments you want to show *your* listening activity.
