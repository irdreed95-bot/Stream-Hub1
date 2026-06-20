import React, { useState, useEffect, useRef } from "react";
import { sources, StreamSource } from "@/services/streamSources";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import videojs from "video.js";
import "video.js/dist/video-js.css";

interface VideoPlayerProps {
  tmdbId: number;
  type: "movie" | "tv";
  season?: number;
  episode?: number;
}

export function VideoPlayer({ tmdbId, type, season, episode }: VideoPlayerProps) {
  const [activeGroup, setActiveGroup] = useState<"A" | "B" | "C" | "D">("A");
  const [activeSource, setActiveSource] = useState<StreamSource | null>(null);
  
  // Custom streams from admin panel
  const [customStreams, setCustomStreams] = useState<any[]>([]);

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

  const renderPlayer = () => {
    if (customStreams.length > 0 && activeGroup === "A" && activeSource?.id.startsWith('custom-')) {
       // Using custom stream
       const stream = customStreams.find(s => `custom-${s.label}` === activeSource.id);
       if (stream) {
         return (
           <iframe
            src={stream.url}
            className="w-full h-full border-0"
            allowFullScreen
            sandbox="allow-forms allow-pointer-lock allow-same-origin allow-scripts allow-top-navigation-by-user-activation"
          />
         );
       }
    }

    if (activeGroup === "A" && activeSource) {
      const url = activeSource.getUrl(tmdbId, type, season, episode);
      if (url) {
        return (
          <iframe
            src={url}
            className="w-full h-full border-0"
            allowFullScreen
            sandbox="allow-forms allow-pointer-lock allow-same-origin allow-scripts allow-top-navigation-by-user-activation"
          />
        );
      }
    }

    if (activeGroup === "B") {
      return <DirectPlayerGroup source={activeSource} />;
    }

    if (activeGroup === "C" || activeGroup === "D") {
      return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-black text-white p-8">
          <div className="max-w-md text-center space-y-4">
            <h3 className="text-xl font-bold">{activeSource?.name || "Scraper"}</h3>
            <div className="bg-primary/20 text-primary px-3 py-1 rounded-full inline-block text-sm font-semibold mb-4">
              Coming Soon
            </div>
            <p className="text-muted-foreground text-sm">
              This provider requires backend scraping or a custom browser extension which is not yet implemented.
            </p>
            {activeGroup === "D" && (
              <Input placeholder="Search in Arabic..." className="mt-4 bg-zinc-900 border-zinc-800" disabled />
            )}
          </div>
        </div>
      );
    }

    return <div className="w-full h-full flex items-center justify-center bg-black">Select a source</div>;
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
          <TabsList className="grid grid-cols-4 mb-4 bg-muted/50">
            <TabsTrigger value="A">Embeds</TabsTrigger>
            <TabsTrigger value="B">Direct URL</TabsTrigger>
            <TabsTrigger value="C">Scrapers</TabsTrigger>
            <TabsTrigger value="D">Arabic</TabsTrigger>
          </TabsList>

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

// Group B Player - allows user to paste a URL and play it with video.js
function DirectPlayerGroup({ source }: { source: StreamSource | null }) {
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
          <h3 className="text-xl font-bold text-center">{source?.name || "Direct Player"}</h3>
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
            <Button onClick={() => setPlayingUrl(url)}>Play</Button>
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