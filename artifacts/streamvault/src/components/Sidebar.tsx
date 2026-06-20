import { Link, useLocation } from "wouter";
import { Home, Film, Tv, Radio, Search, Settings, PlayCircle, UserCircle, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

const DESKTOP_NAV = [
  { href: "/", label: "Home", icon: Home },
  { href: "/search?type=movie", label: "Movies", icon: Film },
  { href: "/search?type=tv", label: "Series", icon: Tv },
  { href: "/live", label: "Live TV", icon: Radio },
  { href: "/search", label: "Search", icon: Search },
];

const MOBILE_NAV = [
  { href: "/", label: "Home", icon: Home },
  { href: "/live", label: "Live TV", icon: Radio },
  { href: "/search", label: "Search", icon: Search },
  { href: "/settings", label: "Settings", icon: Settings },
  { href: "/login", label: "Profile", icon: UserCircle },
];

export function Sidebar() {
  const [location] = useLocation();

  const isRouteActive = (href: string) => {
    if (href === "/") return location === "/";
    return location === href || location.startsWith(href.split("?")[0]);
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 h-screen sticky top-0 bg-card border-r border-border z-40">
        <div className="p-6 flex items-center gap-3 text-primary">
          <PlayCircle className="w-8 h-8 fill-primary text-background" />
          <span className="text-xl font-bold tracking-tight text-foreground">StreamVault</span>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-2">
          {DESKTOP_NAV.map((item) => {
            const isActive = isRouteActive(item.href);
            return (
              <Link key={item.label} href={item.href} className={cn(
                "flex items-center gap-4 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200",
                isActive 
                  ? "bg-primary/10 text-primary" 
                  : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
              )} data-testid={`nav-desktop-${item.label.toLowerCase().replace(" ", "-")}`}>
                <item.icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 mt-auto space-y-2">
          <Link href="/settings" className={cn(
            "flex items-center gap-4 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200",
            isRouteActive("/settings") 
              ? "bg-primary/10 text-primary" 
              : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
          )} data-testid="nav-desktop-settings">
            <Settings className="w-5 h-5" />
            Settings
          </Link>
          <Link href="/login" className={cn(
            "flex items-center gap-4 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200",
            isRouteActive("/login") 
              ? "bg-primary/10 text-primary" 
              : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
          )} data-testid="nav-desktop-login">
            <UserCircle className="w-5 h-5" />
            Login
          </Link>
          <Link href="/admin" className={cn(
            "flex items-center gap-4 px-4 py-2 rounded-lg text-xs font-medium transition-all duration-200 opacity-60 hover:opacity-100",
            isRouteActive("/admin") 
              ? "bg-primary/10 text-primary opacity-100" 
              : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
          )} data-testid="nav-desktop-admin">
            <Shield className="w-4 h-4" />
            Admin
          </Link>
        </div>
      </aside>

      {/* Mobile Bottom Nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-card border-t border-border z-50 flex items-center justify-around px-2">
        {MOBILE_NAV.map((item) => {
          const isActive = isRouteActive(item.href);
          return (
            <Link key={item.label} href={item.href} className={cn(
              "flex flex-col items-center justify-center w-full h-full space-y-1",
              isActive ? "text-primary" : "text-muted-foreground"
            )} data-testid={`nav-mobile-${item.label.toLowerCase().replace(" ", "-")}`}>
              <item.icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </>
  );
}