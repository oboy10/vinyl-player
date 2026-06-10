import { NowPlayingDisplay } from "@/components/NowPlayingDisplay";
import { OfflineScreen } from "@/components/OfflineScreen";
import { isSpotifyConfigured } from "@/lib/spotify";

export const dynamic = "force-dynamic";

export default function Home() {
  if (!isSpotifyConfigured()) {
    return <OfflineScreen />;
  }

  return <NowPlayingDisplay />;
}
