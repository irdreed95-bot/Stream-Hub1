import React, { useState, useEffect, useRef } from "react";
import { sources, StreamSource } from "@/services/streamSources";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import videojs from "video.js";
import "video.js/dist/video-js.css";
import { useI18n } from "@/lib/i18n";
import { arabicMovies, arabicSeries, IMAGE_BASE as AR_IMG } from "@/lib/arabicMock";
import { Skeleton } from "@/components/ui/skeleton";

interface VideoPlayerProps {
  tmdbId: number;
  type: "movie" | "tv";
  season?: number;
  episode?: number;
}

export function VideoPlayer({ tmdbId, type, season, episode }: VideoPlayerProps) {
  const { t } = useI18n();
  const [activeGroup, setActiveGroup] = useState<"A" | "B" | "C" | "D">("A");
  const [activeSource, setActiveSource] = useState<StreamSource | null>(null);
  const [fallbackLoading, setFallbackLoading] = useState(false);
  
  // Custom streams from admin panel
  const [customStreams, setCustomStreams] = useState<any[]>([]);

  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [iframeError, setIframeError] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('admin_custom_streams');
      if (stored) {
        const parsed = JSON.parse(stored);
        const matches = parsed.filter((s: any) => s.tmdbId === tmdbId.toString() && s.type === type);
        setCustomStreams(matches);
      }
    } catch (e) {}
  }, [tmdbId, type]);

  const groupASources = sources.filter(s => s.group === "A");
  const groupBSources = sources.filter(s => s.group === "B");
  const groupCSources = sources.filter(s => s.group === "C");
  const groupDSources = sources.filter(s => s.group === "D");

  useEffect(() => {
    if (activeGroup === "A" && groupASources.length > 0 && !activeSource) {
      setActiveSource(groupASources[0]);
    }
  }, [activeGroup, groupASources, activeSource]);

  useEffect(() => {
    setIframeLoaded(false);
    setIframeError(false);
    if (activeGroup === "A" && activeSource && !activeSource.id.startsWith("custom-")) {
      const timer = setTimeout(() => {
        if (!iframeLoaded) {
          setIframeError(true);
        }
      }, 12000);
      return () => clearTimeout(timer);
    }
  }, [activeSource, activeGroup, iframeLoaded]);

  const handleNextServer = () => {
    if (activeGroup === "A" && activeSource) {
      const currentIndex = groupASources.findIndex(s => s.id === activeSource.id);
      if (currentIndex !== -1) {
        setFallbackLoading(true);
        setIframeError(false);
        setTimeout(() => {
          const nextIndex = (currentIndex + 1) % groupASources.length;
          setActiveSource(groupASources[nextIndex]);
          setFallbackLoading(false);
        }, 1500);
      }
    }
  };

  const renderPlayer = () => {
    if (fallbackLoading) {
      return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-black text-white space-y-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium">Trying next server...</p>
        </div>
      );
    }

    if (customStreams.length > 0 && activeGroup === "A" && activeSource?.id.startsWith('custom-')) {
       const stream = customStreams.find(s => `custom-${s.label}` === activeSource.id);
       if (stream) {
         return (
           <iframe
            src={stream.url}
            className="w-full h-full border-0"
            allowFullScreen
            sandbox="allow-forms allow-pointer-lock allow-same-origin allow-scripts allow-top-navigation"
          />
         );
       }
    }

    if (activeGroup === "A" && activeSource) {
      const url = activeSource.getUrl(tmdbId.toString(), type, season, episode);
      if (url) {
        return (
          <div className="relative w-full h-full">
            <iframe
              src={url}
              className="w-full h-full border-0 relative z-10"
              allowFullScreen
              sandbox="allow-forms allow-pointer-lock allow-same-origin allow-scripts allow-top-navigation"
            />
          </div>
        );
      }
    }

    if (activeGroup === "B") {
      return <DirectPlayerGroup source={activeSource} />;
    }

    if (activeGroup === "D") {
      const mockData = type === 'movie' ? arabicMovies : arabicSeries;
      return (
        <div className="w-full h-full bg-black overflow-y-auto p-4 custom-scrollbar">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {mockData.map((item) => (
              <div key={item.id} className="relative group cursor-pointer aspect-[2/3] rounded-lg overflow-hidden border border-white/10"
                onClick={() => {
                  setActiveGroup("A");
                  setActiveSource(groupASources[0]);
                }}
              >
                <img src={`${AR_IMG}w342${item.poster}`} alt={item.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-3 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                  <span className="text-white font-bold text-sm text-right">{item.title}</span>
                  <span className="text-primary text-xs text-right font-medium">{item.source}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (activeGroup === "C") {
      return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-black text-white p-8">
          <div className="max-w-md text-center space-y-4">
            <h3 className="text-xl font-bold">{activeSource?.name || t("scrapers")}</h3>
            <div className="bg-primary/20 text-primary px-3 py-1 rounded-full inline-block text-sm font-semibold mb-4">
              {t("comesSoon")}
            </div>
          </div>
        </div>
      );
    }

    return <div className="w-full h-full flex items-center justify-center bg-black">{t("selectChannel")}</div>;
  };

  return (
    <div className="w-full space-y-4">
      {/* Player Frame */}
      <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden shadow-2xl border border-white/5">
        {renderPlayer()}
      </div>

      {/* Server Switcher */}
      <div className="bg-card rounded-xl p-4 border border-border">
        <Tabs defaultValue="A" onValueChange={(v) => { setActiveGroup(v as any); setActiveSource(null); }}>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
            <TabsList className="grid grid-cols-4 bg-muted/50 w-full sm:w-auto">
              <TabsTrigger value="A">{t("embeds")}</TabsTrigger>
              <TabsTrigger value="B">{t("directURL")}</TabsTrigger>
              <TabsTrigger value="C">{t("scrapers")}</TabsTrigger>
              <TabsTrigger value="D">{t("arabic")}</TabsTrigger>
            </TabsList>
            
            {activeGroup === "A" && (
              <Button onClick={handleNextServer} variant="outline" size="sm" className="w-full sm:w-auto border-primary/50 hover:bg-primary/20 hover:text-primary transition-colors">
                Next Server
              </Button>
            )}
          </div>

          <TabsContent value="A" className="mt-0">
            <div className="flex flex-wrap gap-2">
              {groupASources.map((src) => (
                <Button
                  key={src.id}
                  variant={activeSource?.id === src.id ? "default" : "secondary"}
                  size="sm"
                  onClick={() => setActiveSource(src)}
                >
                  {src.name}
                </Button>
              ))}
              {customStreams.map((src) => (
                <Button
                  key={`custom-${src.label}`}
                  variant={activeSource?.id === `custom-${src.label}` ? "default" : "outline"}
                  className="border-primary text-primary hover:bg-primary hover:text-white"
                  size="sm"
                  onClick={() => setActiveSource({ id: `custom-${src.label}`, name: src.label, group: 'A', getUrl: () => src.url })}
                >
                  ⭐ {src.label}
                </Button>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="B" className="mt-0">
            <div className="flex flex-wrap gap-2">
              {groupBSources.map((src) => (
                <Button
                  key={src.id}
                  variant={activeSource?.id === src.id ? "default" : "secondary"}
                  size="sm"
                  onClick={() => setActiveSource(src)}
                >
                  {src.name}
                </Button>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="C" className="mt-0">
            <div className="flex flex-wrap gap-2">
              {groupCSources.map((src) => (
                <Button
                  key={src.id}
                  variant={activeSource?.id === src.id ? "default" : "secondary"}
                  size="sm"
                  onClick={() => setActiveSource(src)}
                >
                  {src.name}
                </Button>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="D" className="mt-0">
            <div className="flex flex-wrap gap-2">
              {groupDSources.map((src) => (
                <Button
                  key={src.id}
                  variant={activeSource?.id === src.id ? "default" : "secondary"}
                  size="sm"
                  onClick={() => setActiveSource(src)}
                >
                  {src.name}
                </Button>
              ))}
            </div>
          </TabsContent>

        </Tabs>
      </div>
    </div>
  );
}

// Group B Player
function DirectPlayerGroup({ source }: { source: StreamSource | null }) {
  const { t } = useI18n();
  const [url, setUrl] = useState("");
  const [playingUrl, setPlayingUrl] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<any>(null);

  useEffect(() => {
    if (!videoRef.current || !playingUrl) return;

    playerRef.current = videojs(videoRef.current, {
      controls: true,
      fluid: true,
      responsive: true,
      sources: [{
        src: playingUrl,
        type: playingUrl.includes('.m3u8') ? 'application/x-mpegURL' : 'video/mp4'
      }]
    });

    return () => {
      if (playerRef.current) {
        playerRef.current.dispose();
      }
    };
  }, [playingUrl]);

  if (!playingUrl) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-zinc-950">
        <div className="max-w-lg w-full space-y-4">
          <h3 className="text-xl font-bold text-center">{source?.name || t("directURL")}</h3>
          <p className="text-sm text-center text-muted-foreground">
            Paste a direct video URL (.mp4, .m3u8) from this provider to play it here.
          </p>
          <div className="flex gap-2">
            <Input 
              value={url} 
              onChange={e => setUrl(e.target.value)} 
              placeholder="https://example.com/video.mp4"
              className="bg-zinc-900 border-zinc-800"
            />
            <Button onClick={() => setPlayingUrl(url)}>{t("playNow")}</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div data-vjs-player className="w-full h-full bg-black">
      <video ref={videoRef} className="video-js vjs-big-play-centered w-full h-full" />
    </div>
  );
}
