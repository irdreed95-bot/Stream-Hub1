import { useState, useEffect } from "react";
import { Settings as SettingsIcon, Globe, PlayCircle, HardDrive, Download, Info, Search as SearchIcon } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import { useI18n } from "@/lib/i18n";
import { useLocation } from "wouter";

export default function Settings() {
  const { toast } = useToast();
  const { t, lang, setLang, isRtl } = useI18n();
  const [, setLocation] = useLocation();
  const [rtlMode, setRtlMode] = useState(() => localStorage.getItem("rtl_mode") === "1" || localStorage.getItem("sarad_lang") === "ar");
  const [secretSearch, setSecretSearch] = useState("");

  const handleRtlToggle = (checked: boolean) => {
    setRtlMode(checked);
    document.documentElement.setAttribute('dir', checked ? 'rtl' : 'ltr');
    localStorage.setItem('rtl_mode', checked ? '1' : '0');
  };

  const handleClearCache = () => {
    toast({
      title: "Success",
      description: t("cacheCleared"),
    });
  };

  const handleClearHistory = () => {
    toast({
      title: "Success",
      description: "Watch history cleared successfully",
    });
  };

  const handleSecretSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && secretSearch.toLowerCase() === "devportal") {
      setLocation("/admin");
    }
  };

  return (
    <div className="w-full min-h-screen bg-background p-6 md:p-10 pb-24">
      <div className="max-w-3xl mx-auto space-y-8">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <SettingsIcon className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">{t("settings")}</h1>
          </div>
          
          <div className="relative max-w-[200px]">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder={t("searchPlaceholder")}
              className="pl-9 h-9 text-sm bg-card border-border"
              value={secretSearch}
              onChange={(e) => setSecretSearch(e.target.value)}
              onKeyDown={handleSecretSearch}
            />
          </div>
        </div>

        {/* 1. Language & Region */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-foreground font-semibold text-lg border-b border-border pb-2">
            <Globe className="w-5 h-5 text-primary" />
            <h2>{t("language")} & {t("region")}</h2>
          </div>
          <div className="bg-card rounded-xl p-6 border border-border space-y-6">
            
            {/* Quick Language Switcher */}
            <div className="flex flex-col gap-3 pb-6 border-b border-border/50">
              <h3 className="font-medium text-foreground">{t("interfaceLanguage")}</h3>
              <div className="flex gap-2">
                <Button 
                  variant={lang === "en" ? "default" : "secondary"} 
                  className={`flex-1 ${lang === "en" ? "bg-primary text-primary-foreground" : "bg-muted"}`}
                  onClick={() => {
                    setLang("en");
                    setRtlMode(false);
                  }}
                >
                  English
                </Button>
                <Button 
                  variant={lang === "ar" ? "default" : "secondary"} 
                  className={`flex-1 font-sans ${lang === "ar" ? "bg-primary text-primary-foreground" : "bg-muted"}`}
                  onClick={() => {
                    setLang("ar");
                    setRtlMode(true);
                  }}
                >
                  العربية
                </Button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-medium text-foreground">{t("contentLanguage")}</h3>
                <p className="text-sm text-muted-foreground">Preferred language for titles and descriptions</p>
              </div>
              <Select defaultValue="all">
                <SelectTrigger className="w-full sm:w-[180px] bg-background">
                  <SelectValue placeholder="Select Language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Languages</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="ar">Arabic</SelectItem>
                  <SelectItem value="fr">French</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-foreground">{t("rtlMode")}</h3>
                <p className="text-sm text-muted-foreground">Right-to-Left layout for Arabic</p>
              </div>
              <Switch checked={isRtl || rtlMode} onCheckedChange={handleRtlToggle} disabled={lang === "ar"} />
            </div>
          </div>
        </section>

        {/* 2. Playback */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-foreground font-semibold text-lg border-b border-border pb-2">
            <PlayCircle className="w-5 h-5 text-primary" />
            <h2>Playback</h2>
          </div>
          <div className="bg-card rounded-xl p-6 border border-border space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-medium text-foreground">{t("defaultServer")}</h3>
                <p className="text-sm text-muted-foreground">Preferred streaming server</p>
              </div>
              <Select defaultValue="vidsrc">
                <SelectTrigger className="w-full sm:w-[180px] bg-background">
                  <SelectValue placeholder="Select Server" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vidsrc">VidSrc To</SelectItem>
                  <SelectItem value="vidsrcme">VidSrc Me</SelectItem>
                  <SelectItem value="embedsu">Embed Su</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-foreground">{t("autoPlay")}</h3>
                <p className="text-sm text-muted-foreground">Automatically play the next episode</p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-foreground">{t("hdQuality")}</h3>
                <p className="text-sm text-muted-foreground">Always select highest available quality</p>
              </div>
              <Switch defaultChecked />
            </div>
          </div>
        </section>

        {/* 3. Storage & Cache */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-foreground font-semibold text-lg border-b border-border pb-2">
            <HardDrive className="w-5 h-5 text-primary" />
            <h2>Storage & Cache</h2>
          </div>
          <div className="bg-card rounded-xl p-6 border border-border space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-foreground">Cache Size: 247 MB</h3>
                <p className="text-sm text-muted-foreground">Temporary files and images</p>
              </div>
              <Button variant="outline" onClick={handleClearCache}>{t("clearCache")}</Button>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-foreground">Watch History</h3>
                <p className="text-sm text-muted-foreground">Your recent viewing activity</p>
              </div>
              <Button variant="destructive" onClick={handleClearHistory}>Clear History</Button>
            </div>
          </div>
        </section>

        {/* 4. Download Manager */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-foreground font-semibold text-lg border-b border-border pb-2">
            <Download className="w-5 h-5 text-primary" />
            <h2>{t("activeDownloads")}</h2>
          </div>
          <div className="bg-card rounded-xl p-6 border border-border space-y-6">
            <p className="text-sm text-muted-foreground mb-4">Downloads are stored locally on your device.</p>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-foreground">Inception (2010)</span>
                  <span className="text-muted-foreground">75% • 1.8 GB</span>
                </div>
                <div className="flex items-center gap-4">
                  <Progress value={75} className="h-2" />
                  <Button variant="ghost" size="sm" className="h-6 text-destructive text-xs px-2">{t("cancel")}</Button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-foreground">Breaking Bad S01E01</span>
                  <span className="text-muted-foreground">42% • 650 MB</span>
                </div>
                <div className="flex items-center gap-4">
                  <Progress value={42} className="h-2" />
                  <Button variant="ghost" size="sm" className="h-6 text-destructive text-xs px-2">{t("cancel")}</Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 5. About */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-foreground font-semibold text-lg border-b border-border pb-2">
            <Info className="w-5 h-5 text-primary" />
            <h2>{t("about")}</h2>
          </div>
          <div className="bg-card rounded-xl p-6 border border-border text-center space-y-2">
            <h3 className="font-bold text-foreground text-xl">{t("appName")}</h3>
            <p className="text-muted-foreground text-sm">{t("version")} 2.0.0</p>
            <div className="pt-4 mt-4 border-t border-border flex flex-col items-center gap-2">
              <p className="text-xs text-muted-foreground">Powered by</p>
              <div className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-green-400 text-lg">
                TMDB API
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
