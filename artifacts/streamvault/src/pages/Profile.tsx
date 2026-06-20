import { Link } from "wouter";
import { useI18n } from "@/lib/i18n";
import { Download, Settings, HelpCircle, Shield, ChevronRight, LogIn, UserPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export default function Profile() {
  const { t, lang, setLang, isRtl } = useI18n();
  const { toast } = useToast();

  const handleHelp = () => {
    toast({
      title: "Support",
      description: "Contact: support@sarad.app",
    });
  };

  return (
    <div className="w-full min-h-screen bg-background p-6 md:p-10 pb-24">
      <div className="max-w-2xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-foreground">{t("profile")}</h1>
        
        {/* Profile Header */}
        <div className="flex items-center gap-4 bg-card border border-border p-6 rounded-2xl shadow-sm">
          <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-2xl font-bold shadow-lg">
            GU
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">Guest User</h2>
            <p className="text-muted-foreground">guest@sarad.app</p>
          </div>
        </div>
        
        {/* Menu List */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
          <Link href="/settings" className="flex items-center justify-between p-4 border-b border-border/50 hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
                <Download className="w-4 h-4" />
              </div>
              <span className="font-medium">{t("downloads")}</span>
            </div>
            <ChevronRight className={cn("w-5 h-5 text-muted-foreground", isRtl && "rotate-180")} />
          </Link>
          
          <Link href="/settings" className="flex items-center justify-between p-4 border-b border-border/50 hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-zinc-500/10 flex items-center justify-center text-zinc-500">
                <Settings className="w-4 h-4" />
              </div>
              <span className="font-medium">{t("settings")}</span>
            </div>
            <ChevronRight className={cn("w-5 h-5 text-muted-foreground", isRtl && "rotate-180")} />
          </Link>
          
          <button onClick={handleHelp} className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center text-green-500">
                <HelpCircle className="w-4 h-4" />
              </div>
              <span className="font-medium">{t("help")}</span>
            </div>
            <ChevronRight className={cn("w-5 h-5 text-muted-foreground", isRtl && "rotate-180")} />
          </button>
        </div>
        
        {/* Language Switcher */}
        <div className="bg-card border border-border p-6 rounded-2xl shadow-sm space-y-4">
          <h3 className="font-medium text-foreground">{t("language")}</h3>
          <div className="flex gap-2">
            <Button 
              variant={lang === "en" ? "default" : "secondary"} 
              className={cn("flex-1", lang === "en" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}
              onClick={() => setLang("en")}
            >
              English
            </Button>
            <Button 
              variant={lang === "ar" ? "default" : "secondary"} 
              className={cn("flex-1 font-sans", lang === "ar" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}
              onClick={() => setLang("ar")}
            >
              العربية
            </Button>
          </div>
        </div>

        {/* Auth / Admin actions */}
        <div className="space-y-3">
          <div className="flex gap-3">
            <Link href="/login" className="flex-1">
              <Button className="w-full gap-2 font-bold h-12" variant="outline">
                <LogIn className="w-4 h-4" />
                {t("signIn")}
              </Button>
            </Link>
            <Link href="/login" className="flex-1">
              <Button className="w-full gap-2 font-bold h-12">
                <UserPlus className="w-4 h-4" />
                {t("createAccount")}
              </Button>
            </Link>
          </div>
          
          <Link href="/admin" className="flex items-center justify-center gap-2 p-3 text-xs text-muted-foreground/60 hover:text-muted-foreground transition-colors mt-8">
            <Shield className="w-3 h-3" />
            <span>{t("developerPortal")}</span>
          </Link>
        </div>

      </div>
    </div>
  );
}
