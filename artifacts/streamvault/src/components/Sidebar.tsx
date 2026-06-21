import { Link, useLocation } from "wouter";
import { Home, Film, Monitor, Radio, Search, Settings, UserCircle, LayoutGrid, Shield, PlayCircle, Tv2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";

export function Sidebar() {
  const [location] = useLocation();
  const { t, isRtl } = useI18n();

  const mainNav = [
    { href: "/", labelKey: "home" as const, icon: Home },
    { href: "/search?type=movie", labelKey: "movies" as const, icon: Film },
    { href: "/search?type=tv", labelKey: "series" as const, icon: Monitor },
    { href: "/live", labelKey: "liveTV" as const, icon: Radio },
    { href: "/tv", labelKey: "tv" as const, icon: Tv2 },
    { href: "/categories", labelKey: "categories" as const, icon: LayoutGrid },
    { href: "/search", labelKey: "search" as const, icon: Search },
  ];

  const bottomNav = [
    { href: "/settings", labelKey: "settings" as const, icon: Settings },
    { href: "/profile", labelKey: "profile" as const, icon: UserCircle },
    { href: "/admin", labelKey: "admin" as const, icon: Shield, subtle: true },
  ];

  const mobileNav = [
    { href: "/", labelKey: "home" as const, icon: Home },
    { href: "/live", labelKey: "liveTV" as const, icon: Radio },
    { href: "/tv", labelKey: "tv" as const, icon: Tv2 },
    { href: "/search", labelKey: "search" as const, icon: Search },
    { href: "/profile", labelKey: "profile" as const, icon: UserCircle },
  ];

  const isActive = (href: string) => {
    const base = href.split("?")[0];
    if (base === "/") return location === "/";
    return location.startsWith(base);
  };

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-60 h-screen sticky top-0 bg-[#0a0a0b] border-e border-border z-40 shrink-0">
        <div className="p-5 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <PlayCircle className="w-5 h-5 text-primary-foreground" />
          </div>
          <div className="leading-none">
            <span className="text-base font-black text-foreground tracking-tight">{t("appNameAr")}</span>
            <span className="text-xs text-muted-foreground ms-1.5">Sarad</span>
          </div>
        </div>

        <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
          {mainNav.map(({ href, labelKey, icon: Icon }) => (
            <Link key={href} href={href} data-testid={`nav-${labelKey}`}
              className={cn("flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                isActive(href)
                  ? "bg-primary/15 text-primary"
                  : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
              )}>
              <Icon className="w-4.5 h-4.5 shrink-0" />
              {t(labelKey)}
            </Link>
          ))}
        </nav>

        <div className="px-3 pb-4 space-y-0.5 border-t border-border pt-3">
          {bottomNav.map(({ href, labelKey, icon: Icon, subtle }) => (
            <Link key={href} href={href} data-testid={`nav-${labelKey}`}
              className={cn("flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                isActive(href) ? "bg-primary/15 text-primary"
                  : subtle ? "text-muted-foreground/50 hover:text-muted-foreground hover:bg-white/5"
                  : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
              )}>
              <Icon className="w-4.5 h-4.5 shrink-0" />
              {t(labelKey)}
            </Link>
          ))}
        </div>
      </aside>

      {/* Mobile bottom bar */}
      <div className="md:hidden fixed bottom-0 inset-x-0 h-14 bg-[#0a0a0b]/95 backdrop-blur-md border-t border-border z-50 flex items-center">
        {mobileNav.map(({ href, labelKey, icon: Icon }) => (
          <Link key={href} href={href} data-testid={`mob-nav-${labelKey}`}
            className={cn("flex-1 flex flex-col items-center justify-center gap-0.5 h-full transition-colors",
              isActive(href) ? "text-primary" : "text-muted-foreground"
            )}>
            <Icon className="w-5 h-5" />
            <span className="text-[9px] font-medium leading-none">{t(labelKey)}</span>
          </Link>
        ))}
      </div>
    </>
  );
}
