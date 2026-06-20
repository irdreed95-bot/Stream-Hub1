import React, { useState, useEffect } from "react";
import { parseM3U, M3UChannel } from "@/services/m3uParser";
import { LivePlayer } from "@/components/LivePlayer";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Search, Tv } from "lucide-react";
import { cn } from "@/lib/utils";

export default function LiveTV() {
  const [channels, setChannels] = useState<M3UChannel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [search, setSearch] = useState("");
  const [selectedChannel, setSelectedChannel] = useState<M3UChannel | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<string>("All");

  useEffect(() => {
    async function fetchPlaylist() {
      try {
        setIsLoading(true);
        // Direct fetch or use a CORS proxy if needed
        // Using corsproxy.io as requested in prompt instructions
        const proxyUrl = "https://corsproxy.io/?url=";
        const targetUrl = "http://kazimmt.ami.bd/playlist/wc.m3u";
        
        const response = await fetch(`${proxyUrl}${encodeURIComponent(targetUrl)}`);
        if (!response.ok) throw new Error("Failed to fetch playlist");
        
        const data = await response.text();
        const parsed = parseM3U(data);
        setChannels(parsed);
        if (parsed.length > 0) setSelectedChannel(parsed[0]);
      } catch (err: any) {
        console.error(err);
        setError("Unable to load Live TV playlist. The source might be offline or blocking access.");
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchPlaylist();
  }, []);

  const groups = ["All", ...Array.from(new Set(channels.map(c => c.group).filter(Boolean)))].sort();

  const filteredChannels = channels.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase());
    const matchesGroup = selectedGroup === "All" || c.group === selectedGroup;
    return matchesSearch && matchesGroup;
  });

  return (
    <div className="w-full h-screen bg-background flex flex-col md:flex-row overflow-hidden">
      
      {/* Sidebar List */}
      <div className="w-full md:w-80 h-[40vh] md:h-full bg-card border-r border-border flex flex-col shrink-0">
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
          {groups.length > 1 && (
            <select 
              className="w-full h-9 rounded-md bg-background border border-border text-sm px-3 focus:outline-none focus:ring-2 focus:ring-primary"
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
              <div className="p-4 text-center text-sm text-destructive bg-destructive/10 rounded-lg">
                {error}
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
                      : "hover:bg-white/5 text-muted-foreground hover:text-white"
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
      <div className="flex-1 h-[60vh] md:h-full bg-black p-0 md:p-6 flex flex-col relative">
        {selectedChannel ? (
          <>
            <div className="absolute top-6 right-6 z-10 hidden md:block">
               <div className="bg-black/50 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 text-white font-medium shadow-xl flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                 {selectedChannel.name}
               </div>
            </div>
            <LivePlayer url={selectedChannel.url} />
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