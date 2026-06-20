import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Trash2, Lock, Plus } from "lucide-react";

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState("");
  
  // Settings State
  const [bannerEnabled, setBannerEnabled] = useState(false);
  const [bannerText, setBannerText] = useState("");
  const [adsEnabled, setAdsEnabled] = useState(false);
  const [customStreams, setCustomStreams] = useState<any[]>([]);
  const [newPin, setNewPin] = useState("");

  // New stream form state
  const [streamType, setStreamType] = useState<"movie" | "tv">("movie");
  const [streamId, setStreamId] = useState("");
  const [streamLabel, setStreamLabel] = useState("");
  const [streamUrl, setStreamUrl] = useState("");

  useEffect(() => {
    // Check session auth
    const sessionAuth = sessionStorage.getItem("admin_auth");
    if (sessionAuth === "true") setIsAuthenticated(true);

    // Load settings from local storage
    setBannerEnabled(localStorage.getItem("admin_banner_enabled") === "true");
    setBannerText(localStorage.getItem("admin_banner_text") || "");
    setAdsEnabled(localStorage.getItem("admin_ads_enabled") === "true");
    
    const streamsStr = localStorage.getItem("admin_custom_streams");
    if (streamsStr) {
      try { setCustomStreams(JSON.parse(streamsStr)); } catch (e) {}
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const storedPin = localStorage.getItem("admin_pin") || "1234";
    if (pinInput === storedPin) {
      sessionStorage.setItem("admin_auth", "true");
      setIsAuthenticated(true);
      toast({ title: "Authenticated", description: "Welcome to the admin panel." });
    } else {
      toast({ title: "Access Denied", description: "Incorrect PIN", variant: "destructive" });
    }
  };

  const dispatchSettingsChanged = () => {
    window.dispatchEvent(new Event('admin_settings_changed'));
  };

  const saveBannerSettings = () => {
    localStorage.setItem("admin_banner_enabled", bannerEnabled.toString());
    localStorage.setItem("admin_banner_text", bannerText);
    dispatchSettingsChanged();
    toast({ title: "Settings Saved", description: "Banner settings updated." });
  };

  const saveAdsSettings = (enabled: boolean) => {
    setAdsEnabled(enabled);
    localStorage.setItem("admin_ads_enabled", enabled.toString());
    toast({ title: "Settings Saved", description: "Ad settings updated." });
  };

  const changePin = () => {
    if (newPin.length < 4) {
      toast({ title: "Invalid PIN", description: "PIN must be at least 4 characters", variant: "destructive" });
      return;
    }
    localStorage.setItem("admin_pin", newPin);
    setNewPin("");
    toast({ title: "PIN Updated", description: "Your admin PIN has been changed." });
  };

  const addCustomStream = () => {
    if (!streamId || !streamLabel || !streamUrl) {
      toast({ title: "Missing Fields", description: "Please fill all fields", variant: "destructive" });
      return;
    }
    const newStream = { id: Date.now().toString(), type: streamType, tmdbId: streamId, label: streamLabel, url: streamUrl };
    const updated = [...customStreams, newStream];
    setCustomStreams(updated);
    localStorage.setItem("admin_custom_streams", JSON.stringify(updated));
    
    // reset form
    setStreamId("");
    setStreamLabel("");
    setStreamUrl("");
    toast({ title: "Stream Added", description: "Custom stream has been saved." });
  };

  const removeCustomStream = (id: string) => {
    const updated = customStreams.filter(s => s.id !== id);
    setCustomStreams(updated);
    localStorage.setItem("admin_custom_streams", JSON.stringify(updated));
    toast({ title: "Stream Removed", description: "Custom stream deleted." });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md shadow-2xl border-border bg-card">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mb-4">
              <Lock className="w-6 h-6 text-primary" />
            </div>
            <CardTitle className="text-2xl text-foreground">Admin Access</CardTitle>
            <CardDescription>Enter PIN to access control panel. Default is 1234.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Input 
                  type="password" 
                  value={pinInput} 
                  onChange={(e) => setPinInput(e.target.value)} 
                  placeholder="Enter PIN" 
                  className="text-center text-2xl tracking-[0.5em] h-14 bg-background border-border"
                  autoFocus
                />
              </div>
              <Button type="submit" className="w-full h-12 text-lg">Unlock</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-background p-6 md:p-10 space-y-8 pb-24">
      <div className="max-w-5xl mx-auto space-y-8">
        
        <div>
          <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">Manage global app settings and custom content.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Notifications */}
          <Card className="border-border bg-card shadow-lg">
            <CardHeader>
              <CardTitle>Global Notification Banner</CardTitle>
              <CardDescription>Show a dismissible alert at the top of all pages.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg border border-border">
                <div className="space-y-0.5">
                  <Label className="text-base">Enable Banner</Label>
                  <p className="text-sm text-muted-foreground">Toggle visibility across the app</p>
                </div>
                <Switch checked={bannerEnabled} onCheckedChange={setBannerEnabled} />
              </div>
              <div className="space-y-2">
                <Label>Banner Text</Label>
                <Input 
                  value={bannerText} 
                  onChange={(e) => setBannerText(e.target.value)} 
                  placeholder="e.g., We are undergoing maintenance..." 
                  className="bg-background"
                />
              </div>
              <Button onClick={saveBannerSettings} className="w-full">Save Banner Settings</Button>
            </CardContent>
          </Card>

          {/* Settings */}
          <div className="space-y-8">
            <Card className="border-border bg-card shadow-lg">
              <CardHeader>
                <CardTitle>Security</CardTitle>
                <CardDescription>Update your admin access PIN.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input 
                    type="password" 
                    placeholder="New PIN (min 4 chars)" 
                    value={newPin} 
                    onChange={e => setNewPin(e.target.value)} 
                    className="bg-background"
                  />
                  <Button onClick={changePin} variant="secondary">Update</Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border bg-card shadow-lg">
              <CardHeader>
                <CardTitle>Ad Integration</CardTitle>
                <CardDescription>Toggle placeholder ad spots across the UI.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-4 bg-muted rounded-lg border border-border">
                  <div className="space-y-0.5">
                    <Label className="text-base">Enable Ads</Label>
                    <p className="text-sm text-muted-foreground">Show ad containers in UI</p>
                  </div>
                  <Switch checked={adsEnabled} onCheckedChange={saveAdsSettings} />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Custom Streams */}
        <Card className="border-border bg-card shadow-lg">
          <CardHeader>
            <CardTitle>Custom Stream Links</CardTitle>
            <CardDescription>Override or add specific direct links for movies/series.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 border border-border rounded-xl bg-muted/50 items-end">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={streamType} onValueChange={(v: any) => setStreamType(v)}>
                  <SelectTrigger className="bg-background border-border"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="movie">Movie</SelectItem>
                    <SelectItem value="tv">Series</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>TMDB ID</Label>
                <Input value={streamId} onChange={e => setStreamId(e.target.value)} placeholder="e.g. 550" className="bg-background" />
              </div>
              <div className="space-y-2">
                <Label>Server Label</Label>
                <Input value={streamLabel} onChange={e => setStreamLabel(e.target.value)} placeholder="e.g. Server VIP" className="bg-background" />
              </div>
              <div className="space-y-2 md:col-span-2 flex gap-2">
                <div className="flex-1 space-y-2">
                  <Label>Stream URL (Embed or .mp4/.m3u8)</Label>
                  <Input value={streamUrl} onChange={e => setStreamUrl(e.target.value)} placeholder="https://..." className="bg-background" />
                </div>
                <Button onClick={addCustomStream} className="h-10 mt-auto bg-primary shrink-0 px-3">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="rounded-xl border border-border overflow-hidden bg-background">
              <div className="grid grid-cols-5 gap-4 p-4 border-b border-border font-medium text-sm text-muted-foreground bg-muted/50">
                <div>Type</div>
                <div>TMDB ID</div>
                <div>Label</div>
                <div className="col-span-2">URL</div>
              </div>
              <div className="divide-y divide-border">
                {customStreams.length === 0 && (
                  <div className="p-8 text-center text-muted-foreground text-sm">No custom streams configured.</div>
                )}
                {customStreams.map(stream => (
                  <div key={stream.id} className="grid grid-cols-5 gap-4 p-4 items-center text-sm hover:bg-muted/30 transition-colors">
                    <div className="uppercase font-medium text-primary">{stream.type}</div>
                    <div className="font-mono">{stream.tmdbId}</div>
                    <div className="font-semibold">{stream.label}</div>
                    <div className="col-span-2 flex items-center justify-between gap-4">
                      <div className="truncate text-muted-foreground">{stream.url}</div>
                      <Button variant="ghost" size="icon" onClick={() => removeCustomStream(stream.id)} className="text-destructive hover:bg-destructive/10 hover:text-destructive h-8 w-8 shrink-0">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </CardContent>
        </Card>

      </div>
    </div>
  );
}