import { useState, useEffect, useRef } from "react";
import { sources } from "@/services/streamSources";
import { Loader2, RefreshCw, ChevronDown } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { arabicMovies, arabicSeries, IMAGE_BASE as AR_IMG } from "@/lib/arabicMock";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import videojs from "video.js";
import "video.js/dist/video-js.css";

const SANDBOX = "allow-same-origin allow-scripts allow-forms allow-presentation allow-popups allow-popups-to-escape-sandbox allow-top-navigation-by-user-activation";

interface ValidatedServer { id: string; name: string; url: string | null; valid: boolean; }
interface VideoPlayerProps { tmdbId: number; type: "movie" | "tv"; season?: number; episode?: number; }

export function VideoPlayer({ tmdbId, type, season, episode }: VideoPlayerProps) {
  const { t } = useI18n();
  const [activeView, setActiveView] = useState<"embed" | "direct" | "arabic">("embed");
  const [validServers, setValidServers] = useState<ValidatedServer[]>([]);
  const [validating, setValidating] = useState(true);
  const [selectedServerId, setSelectedServerId] = useState<string>("");
  const [customStreams, setCustomStreams] = useState<any[]>([]);

  // Load admin custom streams
  useEffect(() => {
    try {
      const stored = localStorage.getItem("admin_custom_streams");
      if (stored) {
        const all = JSON.parse(stored);
        setCustomStreams(all.filter((s: any) => s.tmdbId === String(tmdbId) && s.type === type));
      }
    } catch {}
  }, [tmdbId, type]);

  // Validate servers via API
  useEffect(() => {
    setValidating(true);
    setValidServers([]);
    setSelectedServerId("");
    
    fetch("/api/validate-servers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tmdbId: String(tmdbId), type, season: season || 1, episode: episode || 1 }),
    })
      .then(r => r.json())
      .then(data => {
        const valid = (data.servers as ValidatedServer[]).filter(s => s.valid);
        // If none validated, show all as fallback
        const toShow = valid.length > 0 ? valid : (data.servers as ValidatedServer[]);
        setValidServers(toShow);
        if (toShow.length > 0) setSelectedServerId(toShow[0].id);
      })
      .catch(() => {
        // Network error fallback: show all embed sources
        const fallback = sources.filter(s => s.group === "A").map(s => ({
          id: s.id,
          name: s.name,
          url: s.getUrl(String(tmdbId), type, season, episode),
          valid: true,
        }));
        setValidServers(fallback);
        if (fallback.length > 0) setSelectedServerId(fallback[0].id);
      })
      .finally(() => setValidating(false));
  }, [tmdbId, type, season, episode]);

  const currentServer = validServers.find(s => s.id === selectedServerId);
  const currentUrl = currentServer?.url || null;

  // Admin custom stream url
  const customMatch = customStreams.find(s => `custom-${s.label}` === selectedServerId);

  const iframeUrl = customMatch ? customMatch.url : currentUrl;

  const handleNext = () => {
    const allOptions = [
      ...validServers.map(s => s.id),
      ...customStreams.map(s => `custom-${s.label}`)
    ];
    const idx = allOptions.indexOf(selectedServerId);
    if (idx >= 0) {
      setSelectedServerId(allOptions[(idx + 1) % allOptions.length]);
    }
  };

  return (
    <div className="w-full space-y-3">
      {/* View Tabs */}
      <div className="flex gap-1 bg-muted/40 p-1 rounded-lg w-fit">
        {(["embed", "direct", "arabic"] as const).map(v => (
          <button key={v} data-testid={`tab-${v}`} onClick={() => setActiveView(v)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${activeView === v ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
            {v === "embed" ? t("embeds") : v === "direct" ? t("directURL") : t("arabic")}
          </button>
        ))}
      </div>

      {activeView === "embed" && (
        <>
          {/* Server selector row */}
          <div className="flex items-center gap-2 flex-wrap">
            {validating ? (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                {t("validatingServers")}
              </div>
            ) : (
              <>
                <div className="relative flex-1 min-w-[200px] max-w-xs">
                  <select
                    data-testid="server-select"
                    value={selectedServerId}
                    onChange={e => setSelectedServerId(e.target.value)}
                    className="w-full appearance-none bg-card border border-border text-foreground text-sm rounded-lg px-3 py-2 pe-8 focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                  >
                    <optgroup label={t("embeds")}>
                      {validServers.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </optgroup>
                    {customStreams.length > 0 && (
                      <optgroup label="Admin">
                        {customStreams.map(s => (
                          <option key={`custom-${s.label}`} value={`custom-${s.label}`}>{s.label}</option>
                        ))}
                      </optgroup>
                    )}
                  </select>
                  <ChevronDown className="absolute end-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                </div>
                <Button variant="secondary" size="sm" onClick={handleNext} data-testid="btn-next-server" className="text-xs">
                  <RefreshCw className="w-3.5 h-3.5 me-1.5" />
                  {t("nextServer")}
                </Button>
              </>
            )}
          </div>

          {/* Player iframe */}
          <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden shadow-2xl border border-white/5">
            {validating ? (
              <div className="absolute inset-0 flex items-center justify-center bg-[#0f0f10]">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
              </div>
            ) : iframeUrl ? (
              <iframe
                key={iframeUrl}
                src={iframeUrl}
                className="w-full h-full border-0"
                allowFullScreen
                allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                sandbox={SANDBOX}
                data-testid="embed-iframe"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-sm">
                No stream available
              </div>
            )}
          </div>
        </>
      )}

      {activeView === "direct" && (
        <DirectPlayerView />
      )}

      {activeView === "arabic" && (
        <ArabicSourcesView tmdbId={tmdbId} type={type} season={season} episode={episode} />
      )}
    </div>
  );
}

// Direct URL player (Video.js)
function DirectPlayerView() {
  const [url, setUrl] = useState("");
  const [playing, setPlaying] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<any>(null);

  useEffect(() => {
    if (!videoRef.current || !playing) return;
    playerRef.current = videojs(videoRef.current, {
      controls: true, fluid: true, responsive: true,
      sources: [{ src: playing, type: playing.includes(".m3u8") ? "application/x-mpegURL" : "video/mp4" }]
    });
    return () => { playerRef.current?.dispose(); };
  }, [playing]);

  if (!playing) return (
    <div className="w-full aspect-video bg-[#0f0f10] rounded-xl flex flex-col items-center justify-center gap-4 border border-border p-6">
      <p className="text-sm text-muted-foreground text-center">Paste a direct video URL from DoodStream, Streamtape, Filemoon, Uqload, Mixdrop, or VK</p>
      <div className="flex gap-2 w-full max-w-lg">
        <Input value={url} onChange={e => setUrl(e.target.value)} placeholder="https://..." className="bg-muted border-border text-sm" data-testid="direct-url-input" />
        <Button onClick={() => setPlaying(url)} disabled={!url} data-testid="btn-play-direct">Play</Button>
      </div>
    </div>
  );

  return (
    <div className="w-full aspect-video bg-black rounded-xl overflow-hidden">
      <div data-vjs-player>
        <video ref={videoRef} className="video-js vjs-big-play-centered w-full h-full" />
      </div>
    </div>
  );
}

// Arabic sources view with mock poster grid
function ArabicSourcesView({ tmdbId, type, season, episode }: { tmdbId: number; type: string; season?: number; episode?: number }) {
  const { t } = useI18n();
  const [selectedAr, setSelectedAr] = useState<string | null>(null);
  const allArabic = [...arabicMovies, ...arabicSeries];

  // Build VidSrc URL for selected Arabic title
  const arUrl = selectedAr
    ? `https://vidsrc.to/embed/${type}/${selectedAr}`
    : null;

  return (
    <div className="space-y-4">
      {arUrl && (
        <div className="w-full aspect-video bg-black rounded-xl overflow-hidden border border-border">
          <iframe src={arUrl} className="w-full h-full border-0" allowFullScreen sandbox={SANDBOX} />
        </div>
      )}
      <p className="text-xs text-muted-foreground">Arabic titles — click to play via VidSrc</p>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
        {allArabic.map(item => (
          <button key={item.id} data-testid={`ar-card-${item.id}`}
            onClick={() => setSelectedAr(String(item.tmdbId))}
            className={`group relative aspect-[2/3] rounded-lg overflow-hidden bg-muted border transition-all ${selectedAr === String(item.tmdbId) ? "border-primary ring-1 ring-primary" : "border-border hover:border-primary/50"}`}>
            <img src={`${AR_IMG}w185${item.poster}`} alt={item.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent p-2">
              <p className="text-[10px] font-bold text-white leading-tight text-right" dir="rtl">{item.title}</p>
              <p className="text-[9px] text-white/60">{item.year}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
