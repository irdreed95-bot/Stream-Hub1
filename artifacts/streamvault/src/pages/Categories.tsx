import { Link } from "wouter";
import { useI18n } from "@/lib/i18n";
import { Film, Laugh, Ghost, Rocket, Users, Tv2, Sword, Heart } from "lucide-react";
import { cn } from "@/lib/utils";

const GENRES = [
  { id: 28,  key: "action",  icon: Sword,  gradient: "from-red-900/60 to-red-700/30" },
  { id: 35,  key: "comedy",  icon: Laugh,  gradient: "from-yellow-900/60 to-yellow-700/30" },
  { id: 18,  key: "drama",   icon: Film,   gradient: "from-blue-900/60 to-blue-700/30" },
  { id: 27,  key: "horror",  icon: Ghost,  gradient: "from-purple-900/60 to-purple-700/30" },
  { id: 878, key: "sciFi",   icon: Rocket, gradient: "from-cyan-900/60 to-cyan-700/30" },
  { id: 10751, key: "family", icon: Users,  gradient: "from-green-900/60 to-green-700/30" },
  { id: 16,  key: "anime",   icon: Tv2,    gradient: "from-pink-900/60 to-pink-700/30" },
  { id: 10749, key: "drama", icon: Heart,  gradient: "from-rose-900/60 to-rose-700/30" },
  { id: 80,  key: "drama",   icon: Film,   gradient: "from-gray-900/60 to-gray-700/30" },
  { id: 99,  key: "drama",   icon: Film,   gradient: "from-teal-900/60 to-teal-700/30" },
] as const;

export default function Categories() {
  const { t } = useI18n();

  return (
    <div className="w-full min-h-screen bg-background p-6 md:p-10 pb-24">
      <div className="max-w-6xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-foreground">{t("categories")}</h1>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {GENRES.map((genre, index) => {
            const Icon = genre.icon;
            return (
              <Link key={`${genre.id}-${index}`} href={`/search?type=movie&genre=${genre.id}`} data-testid={`category-${genre.key}`}>
                <div className={cn(
                  "relative aspect-[4/3] rounded-xl overflow-hidden cursor-pointer group flex flex-col items-center justify-center bg-gradient-to-br transition-all duration-300",
                  genre.gradient
                )}>
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                  
                  <div className="z-10 flex flex-col items-center justify-center gap-3 transform group-hover:scale-110 transition-transform duration-300">
                    <Icon className="w-12 h-12 text-white/90 drop-shadow-md" />
                    <span className="text-lg font-bold text-white tracking-wider drop-shadow-md">
                      {t(genre.key as any)}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
