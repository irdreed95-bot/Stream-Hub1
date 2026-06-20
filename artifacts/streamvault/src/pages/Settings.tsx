import { useState, useEffect } from "react";
import { Settings as SettingsIcon, Globe, PlayCircle, HardDrive, Download, Info } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";

export default function Settings() {
  const { toast } = useToast();
  const [rtlMode, setRtlMode] = useState(() => localStorage.getItem("rtl_mode") === "1");

  const handleRtlToggle = (checked: boolean) => {
    setRtlMode(checked);
    document.documentElement.setAttribute('dir', checked ? 'rtl' : 'ltr');
    localStorage.setItem('rtl_mode', checked ? '1' : '0');
  };

  const handleClearCache = () => {
    toast({
      title: "Success",
      description: "Cache cleared successfully",
    });
  };

  const handleClearHistory = () => {
    toast({
      title: "Success",
      description: "Watch history cleared successfully",
    });
  };

  return (
    <div className="w-full min-h-screen bg-background p-6 md:p-10 pb-24">
      <div className="max-w-3xl mx-auto space-y-8">
        
        <div className="flex items-center gap-3 mb-8">
          <SettingsIcon className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        </div>

        {/* 1. Language & Region */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-foreground font-semibold text-lg border-b border-border pb-2">
            <Globe className="w-5 h-5 text-primary" />
            <h2>Language & Region</h2>
          </div>
          <div className="bg-card rounded-xl p-6 border border-border space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-medium text-foreground">Interface Language</h3>
                <p className="text-sm text-muted-foreground">Select the language for menus and buttons</p>
              </div>
              <Select defaultValue="en">
                <SelectTrigger className="w-full sm:w-[180px] bg-background">
                  <SelectValue placeholder="Select Language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="ar">العربية (Arabic)</SelectItem>
                  <SelectItem value="fr">Français</SelectItem>
                  <SelectItem value="es">Español</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-medium text-foreground">Content Language</h3>
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
                <h3 className="font-medium text-foreground">RTL Mode</h3>
                <p className="text-sm text-muted-foreground">Right-to-Left layout for Arabic</p>
              </div>
              <Switch checked={rtlMode} onCheckedChange={handleRtlToggle} />
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
                <h3 className="font-medium text-foreground">Default Server</h3>
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
                <h3 className="font-medium text-foreground">Auto-play next episode</h3>
                <p className="text-sm text-muted-foreground">Automatically play the next episode</p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-foreground">HD Quality by Default</h3>
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
              <Button variant="outline" onClick={handleClearCache}>Clear Cache</Button>
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
            <h2>Active Downloads</h2>
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
                  <Button variant="ghost" size="sm" className="h-6 text-destructive text-xs px-2">Cancel</Button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-foreground">Breaking Bad S01E01</span>
                  <span className="text-muted-foreground">42% • 650 MB</span>
                </div>
                <div className="flex items-center gap-4">
                  <Progress value={42} className="h-2" />
                  <Button variant="ghost" size="sm" className="h-6 text-destructive text-xs px-2">Cancel</Button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-foreground">The Dark Knight (2008)</span>
                  <span className="text-green-500 font-medium">Complete • 2.1 GB</span>
                </div>
                <div className="flex items-center gap-4">
                  <Progress value={100} className="h-2 [&>div]:bg-green-500" />
                  <Button variant="ghost" size="sm" className="h-6 text-muted-foreground text-xs px-2">Remove</Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 5. About */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-foreground font-semibold text-lg border-b border-border pb-2">
            <Info className="w-5 h-5 text-primary" />
            <h2>About</h2>
          </div>
          <div className="bg-card rounded-xl p-6 border border-border text-center space-y-2">
            <h3 className="font-bold text-foreground text-xl">StreamVault</h3>
            <p className="text-muted-foreground text-sm">v2.0.0</p>
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