import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { searchMulti, getByGenre } from "@/services/tmdb";
import { MovieCard } from "@/components/MovieCard";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Search as SearchIcon } from "lucide-react";
import { Link } from "wouter";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debouncedValue;
}

const GENRES = [
  { id: 28,    key: "action" as const, gradient: "from-red-900/70 to-red-700/40",    emoji: "⚔️" },
  { id: 35,    key: "comedy" as const, gradient: "from-yellow-800/70 to-yellow-600/40", emoji: "😂" },
  { id: 18,    key: "drama"  as const, gradient: "from-blue-900/70 to-blue-700/40",  emoji: "🎭" },
  { id: 27,    key: "horror" as const, gradient: "from-purple-900/70 to-purple-700/40", emoji: "👻" },
  { id: 878,   key: "sciFi"  as const, gradient: "from-cyan-900/70 to-cyan-700/40",  emoji: "🚀" },
  { id: 10751, key: "family" as const, gradient: "from-green-900/70 to-green-700/40", emoji: "👨‍👩‍👧" },
  { id: 16,    key: "anime"  as const, gradient: "from-pink-900/70 to-pink-700/40",  emoji: "🌸" },
  { id: 10749, key: "drama"  as const, gradient: "from-rose-900/70 to-rose-700/40", emoji: "❤️" },
] as const;

function CategoriesGrid() {
  const { t } = useI18n();
  const [categoryImages, setCategoryImages] = useState<Record<string, string>>({});

  useEffect(() => {
    try {
      const raw = localStorage.getItem("admin_category_images");
      if (raw) setCategoryImages(JSON.parse(raw));
    } catch {}
    const handler = () => {
      try {
        const raw = localStorage.getItem("admin_category_images");
        if (raw) setCategoryImages(JSON.parse(raw));
      } catch {}
    };
    window.addEventListener("admin_settings_changed", handler);
    return () => window.removeEventListener("admin_settings_changed", handler);
  }, []);

  return (
    <div className="space-y-4">
      <h2 className="text-base font-bold text-foreground">{t("categories")}</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {GENRES.map((genre, i) => {
          const customImg = categoryImages[String(genre.id)];
          return (
            <Link key={`${genre.id}-${i}`} href={`/search?type=movie&genre=${genre.id}`}
              data-testid={`category-${genre.key}`}>
              <div
                className={cn(
                  "relative aspect-[16/9] rounded-xl overflow-hidden cursor-pointer group flex items-end bg-gradient-to-br transition-all duration-300 hover:scale-[1.02] hover:shadow-lg",
                  !customImg && genre.gradient
                )}
                style={customImg ? { backgroundImage: `url(${customImg})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}
              >
                <div className={cn(
                  "absolute inset-0 transition-all duration-300",
                  customImg ? "bg-black/45 group-hover:bg-black/25" : "bg-black/10 group-hover:bg-black/0"
                )} />
                <div className="relative z-10 p-3 w-full bg-gradient-to-t from-black/80 to-transparent">
                  <div className="flex items-center gap-2">
                    {!customImg && <span className="text-xl">{genre.emoji}</span>}
                    <span className="text-sm font-bold text-white drop-shadow">
                      {t(genre.key)}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default function Search() {
  const searchParams = new URLSearchParams(window.location.search);
  const typeFilter = searchParams.get("type");
  const genreFilter = searchParams.get("genre");
  const { t } = useI18n();

  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 500);

  const { data: searchData, isLoading: searchLoading } = useQuery({
    queryKey: ["search", debouncedQuery],
    queryFn: () => searchMulti(debouncedQuery),
    enabled: debouncedQuery.length > 2 && !genreFilter,
  });

  const { data: genreData, isLoading: genreLoading } = useQuery({
    queryKey: ["genre-search", typeFilter, genreFilter],
    queryFn: () => getByGenre((typeFilter as "movie" | "tv") || "movie", Number(genreFilter)),
    enabled: !!genreFilter && debouncedQuery.length === 0,
  });

  let results: any[] = [];
  let isLoading = false;

  if (genreFilter && debouncedQuery.length === 0) {
    results = genreData?.results || [];
    isLoading = genreLoading;
  } else if (debouncedQuery.length > 2) {
    results = (searchData?.results || []).filter((item: any) => {
      if (item.media_type === "person") return false;
      if (typeFilter && item.media_type !== typeFilter) return false;
      return true;
    });
    isLoading = searchLoading;
  }

  const showingResults = debouncedQuery.length > 2 || !!genreFilter;

  return (
    <div className="w-full min-h-screen bg-background p-4 md:p-8 pb-24">
      <div className="max-w-5xl mx-auto space-y-8">

        {/* Search bar — always at top */}
        <div className="relative pt-4">
          <SearchIcon className="absolute left-4 top-1/2 mt-2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
          <Input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder={t("searchPlaceholder")}
            autoFocus={!genreFilter}
            className="w-full pl-12 h-14 text-base bg-card border-border rounded-2xl shadow-sm focus-visible:ring-primary"
            data-testid="input-search"
          />
        </div>

        {/* Categories grid — shown when idle */}
        {!showingResults && <CategoriesGrid />}

        {/* Results */}
        {showingResults && (
          <div className="space-y-5">
            <h2 className="text-lg font-semibold text-foreground">
              {genreFilter
                ? t("categories")
                : `"${debouncedQuery}"`}
            </h2>
            {isLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {Array.from({ length: 10 }).map((_, i) => (
                  <Skeleton key={i} className="w-full aspect-[2/3] rounded-xl" />
                ))}
              </div>
            ) : results.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {results.map((item: any) => (
                  <MovieCard
                    key={item.id}
                    id={item.id}
                    title={item.title || item.name}
                    posterPath={item.poster_path}
                    voteAverage={item.vote_average}
                    releaseDate={item.release_date || item.first_air_date}
                    type={item.media_type || (item.title ? "movie" : "tv")}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 text-muted-foreground flex flex-col items-center gap-3 opacity-50">
                <SearchIcon className="w-12 h-12" />
                <p>{t("noResults")}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
