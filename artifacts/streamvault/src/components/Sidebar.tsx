import { Link, useLocation } from "wouter";
import { Home, Film, Tv, Radio, Search, Settings, PlayCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/search?type=movie", label: "Movies", icon: Film },
  { href: "/search?type=tv", label: "Series", icon: Tv },
  { href: "/live", label: "Live TV", icon: Radio },
  { href: "/search", label: "Search", icon: Search },
];

export function Sidebar() {
  const [location] = useLocation();

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 h-screen sticky top-0 bg-card border-r border-border z-40">
        <div className="p-6 flex items-center gap-3 text-primary">
          <PlayCircle className="w-8 h-8 fill-primary text-background" />
          <span className="text-xl font-bold tracking-tight text-foreground">StreamVault</span>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-2">
          {NAV_ITEMS.map((item) => {
            const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href.split("?")[0]));
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

        <div className="p-4 mt-auto">
          <Link href="/admin" className={cn(
            "flex items-center gap-4 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200",
            location === "/admin" 
              ? "bg-primary/10 text-primary" 
              : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
          )} data-testid="nav-desktop-admin">
            <Settings className="w-5 h-5" />
            Admin
          </Link>
        </div>
      </aside>

      {/* Mobile Bottom Nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-card border-t border-border z-50 flex items-center justify-around px-2">
        {NAV_ITEMS.map((item) => {
          const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href.split("?")[0]));
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
        <Link href="/admin" className={cn(
          "flex flex-col items-center justify-center w-full h-full space-y-1",
          location === "/admin" ? "text-primary" : "text-muted-foreground"
        )} data-testid="nav-mobile-admin">
          <Settings className="w-5 h-5" />
          <span className="text-[10px] font-medium">Admin</span>
        </Link>
      </div>
    </>
  );
}