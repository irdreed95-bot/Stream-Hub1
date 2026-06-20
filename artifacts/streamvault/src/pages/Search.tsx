import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { searchMulti, getByGenre } from "@/services/tmdb";
import { MovieCard } from "@/components/MovieCard";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Search as SearchIcon } from "lucide-react";
import { useLocation } from "wouter";
import { useI18n } from "@/lib/i18n";

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debouncedValue;
}

export default function Search() {
  const [location] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  const typeFilter = searchParams.get("type"); // movie, tv, or null
  const genreFilter = searchParams.get("genre");
  const { t } = useI18n();

  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 500);

  const { data: searchData, isLoading: searchLoading } = useQuery({
    queryKey: ['search', debouncedQuery],
    queryFn: () => searchMulti(debouncedQuery),
    enabled: debouncedQuery.length > 2 && !genreFilter,
  });

  const { data: genreData, isLoading: genreLoading } = useQuery({
    queryKey: ['genre-search', typeFilter, genreFilter],
    queryFn: () => getByGenre((typeFilter as 'movie'|'tv') || 'movie', Number(genreFilter)),
    enabled: !!genreFilter && debouncedQuery.length === 0,
  });

  let results: any[] = [];
  let isLoading = false;

  if (genreFilter && debouncedQuery.length === 0) {
    results = genreData?.results || [];
    isLoading = genreLoading;
  } else if (debouncedQuery.length > 2) {
    results = searchData?.results?.filter((item: any) => {
      if (item.media_type === 'person') return false;
      if (typeFilter && item.media_type !== typeFilter) return false;
      return true;
    }) || [];
    isLoading = searchLoading;
  }

  return (
    <div className="w-full min-h-screen bg-background p-6 md:p-8 pt-12">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-foreground">
          {genreFilter ? t("categories") : typeFilter === 'movie' ? t("movies") : typeFilter === 'tv' ? t("series") : t("search")}
        </h1>
        
        {!genreFilter && (
          <div className="relative">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("searchPlaceholder")} 
              className="w-full pl-12 h-14 text-lg bg-card border-border rounded-xl shadow-sm focus-visible:ring-primary"
              data-testid="input-search"
            />
          </div>
        )}

        {(debouncedQuery.length > 2 || genreFilter) && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">
              {genreFilter ? t("recentlyAdded") : `Results for "${debouncedQuery}"`}
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
                    type={item.media_type || (item.title ? 'movie' : 'tv')}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 text-muted-foreground">
                <p>{t("noResults")}</p>
              </div>
            )}
          </div>
        )}
        
        {debouncedQuery.length <= 2 && !genreFilter && (
          <div className="text-center py-32 text-muted-foreground flex flex-col items-center justify-center opacity-50">
            <SearchIcon className="w-16 h-16 mb-4" />
            <p>Start typing to search for movies and series</p>
          </div>
        )}
      </div>
    </div>
  );
}
