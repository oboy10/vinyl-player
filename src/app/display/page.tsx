import { NowPlayingDisplay } from "@/components/NowPlayingDisplay";
import { OfflineScreen } from "@/components/OfflineScreen";
import { isSpotifyConfigured } from "@/lib/spotify";

export const dynamic = "force-dynamic";

export default function DisplayPage() {
  if (!isSpotifyConfigured()) {
    return <OfflineScreen />;
  }

  return (
    <div className="display-kiosk">
      <NowPlayingDisplay />
    </div>
  );
}
