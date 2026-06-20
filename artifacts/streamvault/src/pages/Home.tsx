import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getTrending, getPopular, getTopRated, getByGenre, IMAGE_BASE } from "@/services/tmdb";
import { MovieCard } from "@/components/MovieCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { Play, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

function MovieCarousel({ title, data, isLoading }: { title: string, data: any[], isLoading: boolean }) {
  const { isRtl } = useI18n();
  return (
    <section className="py-6">
      <h2 className={cn("text-sm sm:text-base font-bold uppercase tracking-wider text-primary border-primary mb-4 mx-4 md:mx-8", isRtl ? "border-r-2 pr-3" : "border-l-2 pl-3")}>{title}</h2>
      <div className="flex overflow-x-auto gap-4 px-4 md:px-8 pb-4 snap-x snap-mandatory scrollbar-hide">
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="min-w-[130px] sm:min-w-[160px] md:min-w-[180px] snap-start">
                <Skeleton className="w-full aspect-[2/3] rounded-xl" />
              </div>
            ))
          : data.map((item) => (
              <div key={item.id} className="min-w-[130px] sm:min-w-[160px] md:min-w-[180px] snap-start">
                <MovieCard
                  id={item.id}
                  title={item.title || item.name}
                  posterPath={item.poster_path}
                  voteAverage={item.vote_average}
                  releaseDate={item.release_date || item.first_air_date}
                  type={item.media_type || (item.title ? 'movie' : 'tv')}
                />
              </div>
            ))}
      </div>
    </section>
  );
}

function GenreCarousel({ title, type, genreId }: { title: string, type: 'movie'|'tv', genreId: number }) {
  const { data, isLoading } = useQuery({
    queryKey: ['genre', type, genreId],
    queryFn: () => getByGenre(type, genreId),
  });

  return <MovieCarousel title={title} data={data?.results || []} isLoading={isLoading} />;
}

export default function Home() {
  const { t, isRtl } = useI18n();

  const { data: trending, isLoading: trendingLoading } = useQuery({
    queryKey: ['trending', 'all', 'day'],
    queryFn: () => getTrending('all', 'day'),
  });
  
  const { data: recentlyAdded, isLoading: recentlyAddedLoading } = useQuery({
    queryKey: ['trending', 'all', 'week'],
    queryFn: () => getTrending('all', 'week'),
  });

  const { data: popMovies, isLoading: popularMoviesLoading } = useQuery({
    queryKey: ['popular', 'movie'],
    queryFn: () => getPopular('movie'),
  });

  const { data: popSeries, isLoading: popularSeriesLoading } = useQuery({
    queryKey: ['popular', 'tv'],
    queryFn: () => getPopular('tv'),
  });

  const { data: topRatedMovies, isLoading: topMoviesLoading } = useQuery({
    queryKey: ['topRated', 'movie'],
    queryFn: () => getTopRated('movie'),
  });
  
  const { data: topRatedSeries, isLoading: topSeriesLoading } = useQuery({
    queryKey: ['topRated', 'tv'],
    queryFn: () => getTopRated('tv'),
  });

  const [heroIndex, setHeroIndex] = useState(0);
  const heroes = trending?.results?.slice(0, 5) || [];
  
  useEffect(() => {
    if (heroes.length === 0) return;
    const interval = setInterval(() => setHeroIndex(i => (i + 1) % heroes.length), 6000);
    return () => clearInterval(interval);
  }, [heroes.length]);
  
  const heroItem = heroes[heroIndex];

  return (
    <div className="w-full min-h-screen bg-background pb-20">
      {/* Hero Section */}
      <div className="relative w-full h-[45vh] sm:h-[55vh] md:h-[70vh] bg-black">
        {trendingLoading ? (
          <Skeleton className="w-full h-full" />
        ) : heroItem ? (
          <>
            <div className="absolute inset-0 transition-opacity duration-1000 ease-in-out">
              <img 
                src={`${IMAGE_BASE}original${heroItem.backdrop_path}`} 
                alt={heroItem.title || heroItem.name}
                className="w-full h-full object-cover opacity-60"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
              <div className={cn("absolute inset-0", isRtl ? "bg-gradient-to-l" : "bg-gradient-to-r", "from-background via-background/50 to-transparent")} />
              <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-background to-transparent" />
            </div>
            
            <div className={cn("absolute bottom-0 p-6 md:p-12 w-full md:w-2/3 space-y-4", isRtl ? "right-0" : "left-0")}>
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white tracking-tight drop-shadow-lg">
                {heroItem.title || heroItem.name}
              </h1>
              <p className="text-muted-foreground line-clamp-2 sm:line-clamp-3 text-xs sm:text-sm max-w-2xl">
                {heroItem.overview}
              </p>
              <div className="flex items-center gap-4 pt-4">
                <Link href={`/${heroItem.media_type || 'movie'}/${heroItem.id}`}>
                  <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 text-xs sm:text-sm px-3 sm:px-6 py-1.5 sm:py-2">
                    <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
                    {t("playNow")}
                  </Button>
                </Link>
                <Link href={`/${heroItem.media_type || 'movie'}/${heroItem.id}`}>
                  <Button size="lg" variant="secondary" className="gap-2 text-xs sm:text-sm px-3 sm:px-6 py-1.5 sm:py-2 bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-sm">
                    <Info className="w-4 h-4 sm:w-5 sm:h-5" />
                    {t("moreInfo")}
                  </Button>
                </Link>
              </div>
              
              <div className="flex gap-1.5 mt-3">
                {heroes.map((_, i) => (
                  <button key={i} onClick={() => setHeroIndex(i)}
                    className={cn("h-1 rounded-full transition-all", i === heroIndex ? "bg-primary w-5" : "bg-white/30 w-1.5")} />
                ))}
              </div>
            </div>
          </>
        ) : null}
      </div>

      <div className="mt-[-2rem] sm:mt-[-4rem] relative z-10 space-y-2 sm:space-y-6">
        <MovieCarousel 
          title={t("trendingToday")} 
          data={trending?.results?.slice(1) || []} 
          isLoading={trendingLoading} 
        />
        <MovieCarousel 
          title={t("recentlyAdded")} 
          data={recentlyAdded?.results || []} 
          isLoading={recentlyAddedLoading} 
        />
        <GenreCarousel title={t("worldCupHighlights")} type="movie" genreId={36} />
        <MovieCarousel 
          title={t("featuredMovies")} 
          data={topRatedMovies?.results || []} 
          isLoading={topMoviesLoading} 
        />
        <MovieCarousel 
          title={t("featuredSeries")} 
          data={topRatedSeries?.results || []} 
          isLoading={topSeriesLoading} 
        />
        <GenreCarousel title={t("muharramPack")} type="movie" genreId={18} />
        <GenreCarousel title={t("moviesIn4K")} type="movie" genreId={878} />
        <MovieCarousel 
          title={t("popularMovies")} 
          data={popMovies?.results || []} 
          isLoading={popularMoviesLoading} 
        />
        <MovieCarousel 
          title={t("popularSeries")} 
          data={popSeries?.results || []} 
          isLoading={popularSeriesLoading} 
        />
        
        <GenreCarousel title={t("action")} type="movie" genreId={28} />
        <GenreCarousel title={t("comedy")} type="movie" genreId={35} />
        <GenreCarousel title={t("horror")} type="movie" genreId={27} />
      </div>
    </div>
  );
}
