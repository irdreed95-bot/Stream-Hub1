import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { searchMulti } from "@/services/tmdb";
import { MovieCard } from "@/components/MovieCard";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Search as SearchIcon } from "lucide-react";
import { useLocation } from "wouter";

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

  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 500);

  const { data, isLoading } = useQuery({
    queryKey: ['search', debouncedQuery],
    queryFn: () => searchMulti(debouncedQuery),
    enabled: debouncedQuery.length > 2,
  });

  const results = data?.results?.filter((item: any) => {
    if (item.media_type === 'person') return false;
    if (typeFilter && item.media_type !== typeFilter) return false;
    return true;
  }) || [];

  return (
    <div className="w-full min-h-screen bg-background p-6 md:p-8 pt-12">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-foreground">
          {typeFilter === 'movie' ? "Search Movies" : typeFilter === 'tv' ? "Search Series" : "Search Everything"}
        </h1>
        
        <div className="relative">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
          <Input 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type to search..." 
            className="w-full pl-12 h-14 text-lg bg-card border-border rounded-xl shadow-sm focus-visible:ring-primary"
            data-testid="input-search"
          />
        </div>

        {debouncedQuery.length > 2 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Results for "{debouncedQuery}"</h2>
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
                <p>No results found for "{debouncedQuery}"</p>
              </div>
            )}
          </div>
        )}
        
        {debouncedQuery.length <= 2 && (
          <div className="text-center py-32 text-muted-foreground flex flex-col items-center justify-center opacity-50">
            <SearchIcon className="w-16 h-16 mb-4" />
            <p>Start typing to search for movies and series</p>
          </div>
        )}
      </div>
    </div>
  );
}