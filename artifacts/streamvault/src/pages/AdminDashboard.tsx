import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Lock, Plus } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export default function AdminDashboard() {
  const { t, isRtl } = useI18n();
  const { toast } = useToast();
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

  // TV Channels
  const [tvChannels, setTvChannels] = useState<{name: string; logo: string; url: string}[]>([]);
  const [newChName, setNewChName] = useState("");
  const [newChLogo, setNewChLogo] = useState("");
  const [newChUrl, setNewChUrl] = useState("");

  // APK Link
  const [apkLink, setApkLink] = useState("");

  // Category Images
  const [categoryImages, setCategoryImages] = useState<Record<string, string>>({});
  const [selectedGenreId, setSelectedGenreId] = useState("");
  const [newCatImageUrl, setNewCatImageUrl] = useState("");

  useEffect(() => {
    // Check session auth
    const sessionAuth = sessionStorage.getItem("admin_auth");
    if (sessionAuth === "true") setIsAuthenticated(true);

    // Load settings from local storage
    setBannerEnabled(localStorage.getItem("admin_banner_enabled") === "true");
    setBannerText(localStorage.getItem("admin_banner_text") || "");
    setAdsEnabled(localStorage.getItem("admin_ads_enabled") === "true");
    setApkLink(localStorage.getItem("admin_apk_link") || "");
    
    const streamsStr = localStorage.getItem("admin_custom_streams");
    if (streamsStr) {
      try { setCustomStreams(JSON.parse(streamsStr)); } catch (e) {}
    }

    const tvStr = localStorage.getItem("admin_tv_channels");
    if (tvStr) {
      try { setTvChannels(JSON.parse(tvStr)); } catch (e) {}
    }

    const catImgStr = localStorage.getItem("admin_category_images");
    if (catImgStr) {
      try { setCategoryImages(JSON.parse(catImgStr)); } catch (e) {}
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
    toast({ title: t("save"), description: "Banner settings updated." });
  };

  const saveAdsSettings = (enabled: boolean) => {
    setAdsEnabled(enabled);
    localStorage.setItem("admin_ads_enabled", enabled.toString());
    toast({ title: t("save"), description: "Ad settings updated." });
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
    
    setStreamId("");
    setStreamLabel("");
    setStreamUrl("");
    toast({ title: t("save"), description: "Custom stream has been saved." });
  };

  const removeCustomStream = (id: string) => {
    const updated = customStreams.filter(s => s.id !== id);
    setCustomStreams(updated);
    localStorage.setItem("admin_custom_streams", JSON.stringify(updated));
    toast({ title: "Stream Removed", description: "Custom stream deleted." });
  };

  // TV Channel Handlers
  const addTvChannel = () => {
    if (!newChName || !newChUrl) return;
    const updated = [...tvChannels, { name: newChName, logo: newChLogo, url: newChUrl }];
    setTvChannels(updated);
    localStorage.setItem("admin_tv_channels", JSON.stringify(updated));
    dispatchSettingsChanged();
    setNewChName(""); setNewChLogo(""); setNewChUrl("");
    toast({ title: "تم إضافة القناة" });
  };

  const deleteTvChannel = (i: number) => {
    const updated = tvChannels.filter((_, idx) => idx !== i);
    setTvChannels(updated);
    localStorage.setItem("admin_tv_channels", JSON.stringify(updated));
    dispatchSettingsChanged();
  };

  // APK Handler
  const saveApkLink = () => {
    localStorage.setItem("admin_apk_link", apkLink);
    toast({ title: t("save"), description: "APK Link updated." });
  };

  // Category Image Handler
  const addCatImage = () => {
    if (!selectedGenreId || !newCatImageUrl) return;
    const updated = { ...categoryImages, [selectedGenreId]: newCatImageUrl };
    setCategoryImages(updated);
    localStorage.setItem("admin_category_images", JSON.stringify(updated));
    setSelectedGenreId(""); setNewCatImageUrl("");
    toast({ title: t("save"), description: "Category Image updated." });
  };

  const deleteCatImage = (id: string) => {
    const updated = { ...categoryImages };
    delete updated[id];
    setCategoryImages(updated);
    localStorage.setItem("admin_category_images", JSON.stringify(updated));
    toast({ title: "Deleted", description: "Category Image removed." });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-background p-4" dir={isRtl ? "rtl" : "ltr"}>
        <Card className="w-full max-w-md shadow-2xl border-border bg-card">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mb-4">
              <Lock className="w-6 h-6 text-primary" />
            </div>
            <CardTitle className="text-2xl text-foreground">{t("admin")}</CardTitle>
            <CardDescription>{isRtl ? "أدخل الرمز السري. الافتراضي هو 1234." : "Enter PIN to access control panel. Default is 1234."}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Input 
                  type="password" 
                  value={pinInput} 
                  onChange={(e) => setPinInput(e.target.value)} 
                  placeholder={isRtl ? "أدخل الرمز السري" : "Enter PIN"} 
                  className="text-center text-2xl tracking-[0.5em] h-14 bg-background border-border"
                  autoFocus
                  data-testid="input-pin"
                />
              </div>
              <Button type="submit" className="w-full h-12 text-lg" data-testid="btn-login-admin">{t("login")}</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-background p-6 md:p-10 space-y-8 pb-24" dir={isRtl ? "rtl" : "ltr"}>
      <div className="max-w-5xl mx-auto space-y-8">
        
        <div>
          <h1 className="text-3xl font-bold text-foreground">{t("admin")}</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Notifications */}
          <Card className="border-border bg-card shadow-lg">
            <CardHeader>
              <CardTitle>{t("updateBanner")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg border border-border">
                <Label className="text-base">{t("updateBanner")}</Label>
                <Switch checked={bannerEnabled} onCheckedChange={setBannerEnabled} data-testid="switch-banner" />
              </div>
              <div className="space-y-2">
                <Input 
                  value={bannerText} 
                  onChange={(e) => setBannerText(e.target.value)} 
                  placeholder="..." 
                  className="bg-background"
                  data-testid="input-banner"
                />
              </div>
              <Button onClick={saveBannerSettings} className="w-full" data-testid="btn-save-banner">{t("save")}</Button>
            </CardContent>
          </Card>

          {/* Settings */}
          <div className="space-y-8">
            <Card className="border-border bg-card shadow-lg">
              <CardHeader>
                <CardTitle>{t("pinChange")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input 
                    type="password" 
                    placeholder="***" 
                    value={newPin} 
                    onChange={e => setNewPin(e.target.value)} 
                    className="bg-background"
                    data-testid="input-new-pin"
                  />
                  <Button onClick={changePin} variant="secondary" data-testid="btn-save-pin">{t("save")}</Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border bg-card shadow-lg">
              <CardHeader>
                <CardTitle>{t("adsToggle")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-4 bg-muted rounded-lg border border-border">
                  <Label className="text-base">{t("adsToggle")}</Label>
                  <Switch checked={adsEnabled} onCheckedChange={saveAdsSettings} data-testid="switch-ads" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* TV Channels Manager */}
        <Card className="border-border bg-card shadow-lg">
          <CardHeader>
            <CardTitle>{t("manageTvChannels")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border border-border rounded-xl bg-muted/50 items-end">
              <div className="space-y-2">
                <Label>{t("channelName")}</Label>
                <Input value={newChName} onChange={e => setNewChName(e.target.value)} placeholder={t("channelName")} className="bg-background" data-testid="input-ch-name" />
              </div>
              <div className="space-y-2">
                <Label>{t("channelLogo")}</Label>
                <Input value={newChLogo} onChange={e => setNewChLogo(e.target.value)} placeholder="https://..." className="bg-background" data-testid="input-ch-logo" />
              </div>
              <div className="space-y-2 md:col-span-2 flex gap-2">
                <div className="flex-1 space-y-2">
                  <Label>{t("streamUrl")}</Label>
                  <Input value={newChUrl} onChange={e => setNewChUrl(e.target.value)} placeholder="https://..." className="bg-background" data-testid="input-ch-url" />
                </div>
                <Button onClick={addTvChannel} className="h-10 mt-auto bg-primary shrink-0 px-3" data-testid="btn-add-ch">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="rounded-xl border border-border overflow-hidden bg-background">
              <div className="grid grid-cols-4 gap-4 p-4 border-b border-border font-medium text-sm text-muted-foreground bg-muted/50">
                <div>{t("channelName")}</div>
                <div>{t("channelLogo")}</div>
                <div className="col-span-2">{t("streamUrl")}</div>
              </div>
              <div className="divide-y divide-border">
                {tvChannels.length === 0 && (
                  <div className="p-8 text-center text-muted-foreground text-sm">{t("noChannels")}</div>
                )}
                {tvChannels.map((ch, i) => (
                  <div key={i} className="grid grid-cols-4 gap-4 p-4 items-center text-sm hover:bg-muted/30 transition-colors">
                    <div className="font-semibold">{ch.name}</div>
                    <div className="truncate text-muted-foreground">{ch.logo}</div>
                    <div className="col-span-2 flex items-center justify-between gap-4">
                      <div className="truncate text-muted-foreground" dir="ltr">{ch.url}</div>
                      <Button variant="ghost" size="icon" onClick={() => deleteTvChannel(i)} className="text-destructive hover:bg-destructive/10 hover:text-destructive h-8 w-8 shrink-0" data-testid={`btn-del-ch-${i}`}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* APK Link Manager */}
          <Card className="border-border bg-card shadow-lg">
            <CardHeader>
              <CardTitle>{t("apkLink")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>{t("apkLink")}</Label>
                <div className="flex gap-2">
                  <Input value={apkLink} onChange={e => setApkLink(e.target.value)} placeholder="https://..." className="bg-background" data-testid="input-apk" />
                  <Button onClick={saveApkLink} variant="secondary" data-testid="btn-save-apk">{t("save")}</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Category Images Manager */}
          <Card className="border-border bg-card shadow-lg">
            <CardHeader>
              <CardTitle>{t("categoryImages")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2 items-end">
                <div className="space-y-2 flex-1">
                  <Label>Genre ID</Label>
                  <Input value={selectedGenreId} onChange={e => setSelectedGenreId(e.target.value)} placeholder="e.g. 28" className="bg-background" data-testid="input-cat-id" />
                </div>
                <div className="space-y-2 flex-[2]">
                  <Label>{t("categoryImageUrl")}</Label>
                  <Input value={newCatImageUrl} onChange={e => setNewCatImageUrl(e.target.value)} placeholder="https://..." className="bg-background" data-testid="input-cat-img" />
                </div>
                <Button onClick={addCatImage} variant="secondary" data-testid="btn-add-cat-img">{t("save")}</Button>
              </div>

              <div className="space-y-2 mt-4">
                {Object.entries(categoryImages).map(([id, url]) => (
                  <div key={id} className="flex items-center justify-between p-2 border border-border rounded text-sm bg-muted/30">
                    <span className="font-mono text-primary w-12">{id}</span>
                    <span className="truncate flex-1 px-2 text-muted-foreground text-xs" dir="ltr">{url}</span>
                    <Button variant="ghost" size="sm" onClick={() => deleteCatImage(id)} className="h-6 w-6 p-0 text-destructive" data-testid={`btn-del-cat-${id}`}>
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Custom Streams */}
        <Card className="border-border bg-card shadow-lg">
          <CardHeader>
            <CardTitle>{t("customStreams")}</CardTitle>
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
                <Input value={streamId} onChange={e => setStreamId(e.target.value)} placeholder="e.g. 550" className="bg-background" data-testid="input-stream-id" />
              </div>
              <div className="space-y-2">
                <Label>Label</Label>
                <Input value={streamLabel} onChange={e => setStreamLabel(e.target.value)} placeholder="e.g. Server VIP" className="bg-background" data-testid="input-stream-label" />
              </div>
              <div className="space-y-2 md:col-span-2 flex gap-2">
                <div className="flex-1 space-y-2">
                  <Label>URL</Label>
                  <Input value={streamUrl} onChange={e => setStreamUrl(e.target.value)} placeholder="https://..." className="bg-background" data-testid="input-stream-url" />
                </div>
                <Button onClick={addCustomStream} className="h-10 mt-auto bg-primary shrink-0 px-3" data-testid="btn-add-stream">
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
                      <div className="truncate text-muted-foreground" dir="ltr">{stream.url}</div>
                      <Button variant="ghost" size="icon" onClick={() => removeCustomStream(stream.id)} className="text-destructive hover:bg-destructive/10 hover:text-destructive h-8 w-8 shrink-0" data-testid={`btn-del-stream-${stream.id}`}>
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