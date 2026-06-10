import { NowPlayingDisplay } from "@/components/NowPlayingDisplay";
import { SetupScreen } from "@/components/SetupScreen";
import { isSpotifyConfigured } from "@/lib/spotify";

export const dynamic = "force-dynamic";

export default function DisplayPage() {
  if (!isSpotifyConfigured()) {
    return <SetupScreen />;
  }

  return (
    <div className="display-kiosk">
      <NowPlayingDisplay />
    </div>
  );
}
