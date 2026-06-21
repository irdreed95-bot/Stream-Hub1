import { useState, useEffect } from "react";
import { LivePlayer } from "@/components/LivePlayer";
import { useI18n } from "@/lib/i18n";
import { Tv2, Radio } from "lucide-react";

interface TvChannel { name: string; logo: string; url: string; }

export default function TV() {
  const { t } = useI18n();
  const [channels, setChannels] = useState<TvChannel[]>([]);
  const [selected, setSelected] = useState<TvChannel | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("admin_tv_channels");
      if (raw) setChannels(JSON.parse(raw));
    } catch {}
    // Listen for admin changes
    const handler = () => {
      try {
        const raw = localStorage.getItem("admin_tv_channels");
        if (raw) setChannels(JSON.parse(raw));
      } catch {}
    };
    window.addEventListener("admin_settings_changed", handler);
    return () => window.removeEventListener("admin_settings_changed", handler);
  }, []);

  return (
    <div className="min-h-screen bg-background p-4 md:p-8 pb-20 md:pb-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <h1 className="text-xl md:text-2xl font-bold flex items-center gap-2">
          <Tv2 className="w-6 h-6 text-primary" />
          {t("tvChannels")}
        </h1>

        {selected && (
          <div className="w-full max-w-3xl mx-auto space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              {selected.name}
            </div>
            <div className="aspect-video rounded-xl overflow-hidden bg-black border border-border">
              <LivePlayer url={selected.url} channelName={selected.name} />
            </div>
            <button onClick={() => setSelected(null)} className="text-xs text-muted-foreground hover:text-foreground transition-colors" data-testid="btn-close-tv">
              Close player
            </button>
          </div>
        )}

        {channels.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
              <Radio className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground max-w-xs">{t("noChannels")}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {channels.map((ch, i) => (
              <button key={i} data-testid={`tv-ch-${i}`} onClick={() => setSelected(ch)}
                className={`group relative aspect-video rounded-xl overflow-hidden bg-card border transition-all hover:border-primary/60 hover:shadow-lg hover:shadow-primary/10 ${selected?.url === ch.url ? "border-primary ring-1 ring-primary" : "border-border"}`}>
                {ch.logo ? (
                  <img src={ch.logo} alt={ch.name} className="w-full h-full object-contain p-3 group-hover:scale-105 transition-transform" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-muted">
                    <Tv2 className="w-8 h-8 text-muted-foreground" />
                  </div>
                )}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                  <p className="text-[10px] font-semibold text-white truncate">{ch.name}</p>
                </div>
                {selected?.url === ch.url && (
                  <div className="absolute top-2 end-2 w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}