import { useState, useEffect } from "react";
import { parseM3U, M3UChannel } from "@/services/m3uParser";
import { LivePlayer } from "@/components/LivePlayer";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Search, Tv, WifiOff, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const PLAYLIST_URL = "http://kazimmt.ami.bd/playlist/wc.m3u";
const PROXIES = [
  (url: string) => `https://corsproxy.io/?url=${encodeURIComponent(url)}`,
  (url: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
];

async function fetchWithFallback(url: string): Promise<string> {
  // Try direct
  try {
    const r = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (r.ok) return r.text();
  } catch {}
  // Try proxies
  for (const proxy of PROXIES) {
    try {
      const r = await fetch(proxy(url), { signal: AbortSignal.timeout(8000) });
      if (r.ok) return r.text();
    } catch {}
  }
  throw new Error("All sources failed");
}

export default function LiveTV() {
  const [channels, setChannels] = useState<M3UChannel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [search, setSearch] = useState("");
  const [selectedChannel, setSelectedChannel] = useState<M3UChannel | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<string>("All");

  const fetchPlaylist = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await fetchWithFallback(PLAYLIST_URL);
      const parsed = parseM3U(data);
      setChannels(parsed);
      if (parsed.length > 0) setSelectedChannel(parsed[0]);
    } catch (err: any) {
      console.error(err);
      setError("Unable to load Live TV playlist. The source might be offline or blocking access.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPlaylist();
  }, []);

  const groups = ["All", ...Array.from(new Set(channels.map(c => c.group).filter(Boolean)))].sort();

  const filteredChannels = channels.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase());
    const matchesGroup = selectedGroup === "All" || c.group === selectedGroup;
    return matchesSearch && matchesGroup;
  });

  return (
    <div className="w-full h-[calc(100vh-4rem)] md:h-screen bg-background flex flex-col md:flex-row overflow-hidden">
      
      {/* Sidebar List */}
      <div className="w-full md:w-80 h-[40vh] md:h-full bg-card border-r border-border flex flex-col shrink-0 z-10 shadow-xl">
        <div className="p-4 border-b border-border space-y-4">
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Tv className="w-6 h-6 text-primary" />
            Live TV
          </h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search channels..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 bg-background border-border"
            />
          </div>
          {groups.length > 1 && !error && !isLoading && (
            <select 
              className="w-full h-9 rounded-md bg-background border border-border text-sm px-3 focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
              value={selectedGroup}
              onChange={e => setSelectedGroup(e.target.value)}
            >
              {groups.map(g => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          )}
        </div>

        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {isLoading ? (
              Array.from({ length: 10 }).map((_, i) => (
                <Skeleton key={i} className="w-full h-14 rounded-lg" />
              ))
            ) : error ? (
              <div className="flex flex-col items-center justify-center p-6 text-center space-y-4 h-[30vh]">
                <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
                  <WifiOff className="w-8 h-8 text-destructive" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-semibold text-foreground">Playlist Unavailable</h3>
                  <p className="text-xs text-muted-foreground">The live TV playlist could not be loaded. Please try again later.</p>
                </div>
                <Button onClick={fetchPlaylist} size="sm" variant="outline" className="gap-2">
                  <RefreshCcw className="w-4 h-4" /> Retry
                </Button>
              </div>
            ) : filteredChannels.length > 0 ? (
              filteredChannels.map(channel => (
                <button
                  key={channel.url}
                  onClick={() => setSelectedChannel(channel)}
                  className={cn(
                    "w-full flex items-center gap-3 p-2 rounded-lg text-left transition-colors",
                    selectedChannel?.url === channel.url 
                      ? "bg-primary/20 text-primary border border-primary/30" 
                      : "hover:bg-white/5 text-muted-foreground hover:text-foreground"
                  )}
                >
                  <div className="w-12 h-10 bg-background rounded overflow-hidden shrink-0 flex items-center justify-center p-1 border border-border">
                    {channel.logo ? (
                      <img src={channel.logo} alt={channel.name} className="max-w-full max-h-full object-contain" />
                    ) : (
                      <Tv className="w-5 h-5 opacity-30" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm truncate text-foreground">{channel.name}</div>
                    <div className="text-[10px] opacity-70 truncate">{channel.group}</div>
                  </div>
                </button>
              ))
            ) : (
              <div className="p-8 text-center text-muted-foreground text-sm">
                No channels found
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Main Player Area */}
      <div className="flex-1 h-[60vh] md:h-full bg-black p-0 md:p-6 flex flex-col relative z-0">
        {selectedChannel ? (
          <>
            <div className="absolute top-6 right-6 z-10 hidden md:block">
               <div className="bg-black/50 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 text-white font-medium shadow-xl flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                 {selectedChannel.name}
               </div>
            </div>
            <LivePlayer url={selectedChannel.url} channelName={selectedChannel.name} />
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            {isLoading ? <Skeleton className="w-full max-w-2xl aspect-video rounded-xl" /> : "Select a channel from the list"}
          </div>
        )}
      </div>

    </div>
  );
}