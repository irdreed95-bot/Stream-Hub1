import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import { Wifi, WifiOff, Loader2 } from "lucide-react";

interface LivePlayerProps {
  url: string;
  channelName?: string;
}

export function LivePlayer({ url, channelName }: LivePlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [status, setStatus] = useState<"loading" | "playing" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!url || !videoRef.current) return;
    setStatus("loading");
    setErrorMsg("");
    
    // Cleanup previous
    if (hlsRef.current) { hlsRef.current.destroy(); hlsRef.current = null; }
    
    const video = videoRef.current;
    
    if (Hls.isSupported() && (url.includes('.m3u8') || url.includes('m3u'))) {
      const hls = new Hls({ enableWorker: true, lowLatencyMode: true });
      hlsRef.current = hls;
      hls.loadSource(url);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(() => {});
        setStatus("playing");
      });
      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) {
          setStatus("error");
          setErrorMsg("Stream unavailable or channel is currently offline.");
        }
      });
    } else {
      video.src = url;
      video.oncanplay = () => setStatus("playing");
      video.onerror = () => { setStatus("error"); setErrorMsg("Unable to load stream."); };
      video.play().catch(() => {});
    }
    
    return () => { hlsRef.current?.destroy(); };
  }, [url]);

  return (
    <div className="relative w-full h-full bg-black rounded-xl overflow-hidden border border-white/5">
      <video
        ref={videoRef}
        className={status === "playing" ? "w-full h-full object-contain" : "hidden"}
        controls
        playsInline
      />
      
      {status === "loading" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-[#0f0f10]">
          <div className="relative">
            <div className="w-16 h-16 rounded-full border-2 border-primary/20 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
          </div>
          <p className="text-sm text-muted-foreground">Loading stream{channelName ? ` — ${channelName}` : ""}...</p>
        </div>
      )}
      
      {status === "error" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 bg-[#0f0f10] p-6">
          <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center border border-destructive/20">
            <WifiOff className="w-10 h-10 text-destructive" />
          </div>
          <div className="text-center space-y-2 max-w-xs">
            <h3 className="text-base font-bold text-white">Channel Offline</h3>
            <p className="text-xs text-muted-foreground">{errorMsg || "This channel is currently unavailable or the stream has ended."}</p>
            {channelName && <p className="text-xs text-primary font-medium">{channelName}</p>}
          </div>
          <button
            onClick={() => { setStatus("loading"); if(videoRef.current) videoRef.current.load(); }}
            className="px-4 py-2 text-xs font-semibold bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Retry
          </button>
        </div>
      )}
    </div>
  );
}