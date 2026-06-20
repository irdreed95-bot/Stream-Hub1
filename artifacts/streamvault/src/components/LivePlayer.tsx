import React, { useEffect, useRef } from "react";
import Hls from "hls.js";

interface LivePlayerProps {
  url: string;
}

export function LivePlayer({ url }: LivePlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !url) return;

    let hls: Hls;

    if (Hls.isSupported() && url.includes('.m3u8')) {
      hls = new Hls({
        maxMaxBufferLength: 30,
      });
      hls.loadSource(url);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(e => console.log('Autoplay prevented', e));
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Native Safari support
      video.src = url;
      video.addEventListener('loadedmetadata', () => {
        video.play().catch(e => console.log('Autoplay prevented', e));
      });
    } else {
      // Fallback for non-HLS URLs
      video.src = url;
      video.play().catch(e => console.log('Autoplay prevented', e));
    }

    return () => {
      if (hls) {
        hls.destroy();
      }
    };
  }, [url]);

  if (!url) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-zinc-950 text-muted-foreground rounded-xl border border-white/5">
        Select a channel to start watching
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-black rounded-xl overflow-hidden shadow-2xl border border-white/5 relative group">
      <video 
        ref={videoRef} 
        controls 
        className="w-full h-full object-contain"
        crossOrigin="anonymous"
      />
    </div>
  );
}