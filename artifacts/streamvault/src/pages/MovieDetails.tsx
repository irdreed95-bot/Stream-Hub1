import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { getDetails, getCredits, IMAGE_BASE } from "@/services/tmdb";
import { VideoPlayer } from "@/components/VideoPlayer";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Star, Clock, Calendar, AlertCircle } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function MovieDetails() {
  const { id } = useParams<{ id: string }>();
  const tmdbId = parseInt(id || "0", 10);

  const { data: movie, isLoading: isMovieLoading, isError } = useQuery({
    queryKey: ['movie', tmdbId],
    queryFn: () => getDetails('movie', tmdbId),
    enabled: !!tmdbId && !isNaN(tmdbId),
  });

  const { data: credits, isLoading: isCreditsLoading } = useQuery({
    queryKey: ['movieCredits', tmdbId],
    queryFn: () => getCredits('movie', tmdbId),
    enabled: !!tmdbId && !isNaN(tmdbId),
  });

  if (!tmdbId || isNaN(tmdbId) || isError) {
    return (
      <div className="w-full min-h-screen bg-background flex flex-col items-center justify-center p-6 space-y-6">
        <div className="w-24 h-24 rounded-full bg-destructive/10 flex items-center justify-center">
          <AlertCircle className="w-12 h-12 text-destructive" />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-white">Movie Not Found</h2>
          <p className="text-muted-foreground max-w-sm">We couldn't find the movie you were looking for. The link might be broken or the content was removed.</p>
        </div>
        <Link href="/">
          <Button variant="default" className="mt-4">Back to Home</Button>
        </Link>
      </div>
    );
  }

  if (isMovieLoading) {
    return (
      <div className="w-full min-h-screen bg-background">
        <Skeleton className="w-full h-[50vh]" />
        <div className="p-8 max-w-6xl mx-auto space-y-4 mt-8">
          <Skeleton className="w-1/2 h-12" />
          <Skeleton className="w-full h-24" />
          <Skeleton className="w-full aspect-video mt-12" />
        </div>
      </div>
    );
  }

  if (!movie) return null;

  const year = movie.release_date ? new Date(movie.release_date).getFullYear() : '';
  const runtime = movie.runtime ? `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m` : '';

  return (
    <div className="w-full min-h-screen bg-background pb-20">
      {/* Hero Backdrop */}
      <div className="relative w-full h-[50vh] md:h-[60vh] bg-black">
        {movie.backdrop_path && (
          <img 
            src={`${IMAGE_BASE}original${movie.backdrop_path}`} 
            alt={movie.title}
            className="w-full h-full object-cover opacity-30 mask-image-bottom"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
        
        <div className="absolute bottom-0 left-0 w-full p-6 md:p-12 z-10 flex flex-row gap-6 md:gap-8 items-end max-w-7xl mx-auto">
          {movie.poster_path && (
            <img 
              src={`${IMAGE_BASE}w342${movie.poster_path}`} 
              alt={movie.title}
              className="w-24 sm:w-32 md:w-48 rounded-xl shadow-2xl border border-white/10 shrink-0"
            />
          )}
          <div className="space-y-3 flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl md:text-4xl font-bold text-white drop-shadow-md truncate">
              {movie.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-3 text-xs md:text-sm text-muted-foreground font-medium">
              <div className="flex items-center gap-1 text-yellow-400 bg-yellow-400/10 px-2 py-1 rounded-md">
                <Star className="w-3.5 h-3.5 fill-current" />
                <span className="text-white">{movie.vote_average?.toFixed(1)}</span>
              </div>
              {year && <div className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {year}</div>}
              {runtime && <div className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {runtime}</div>}
              <div className="flex gap-2 flex-wrap mt-1 md:mt-0">
                {movie.genres?.map((g: any) => (
                  <Badge key={g.id} variant="secondary" className="bg-white/10 text-white hover:bg-white/20 text-[10px] md:text-xs">
                    {g.name}
                  </Badge>
                ))}
              </div>
            </div>
            
            <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed max-w-3xl line-clamp-3 md:line-clamp-none">
              {movie.overview}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 py-12 space-y-12">
        {/* Player Section */}
        <section className="space-y-6">
          <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
            Watch Now
          </h2>
          <VideoPlayer tmdbId={tmdbId} type="movie" />
        </section>

        {/* Cast Section */}
        {credits?.cast && credits.cast.length > 0 && (
          <section className="space-y-6 pt-8 border-t border-white/5">
            <h2 className="text-xl md:text-2xl font-bold text-white">Top Cast</h2>
            <div className="flex overflow-x-auto gap-4 pb-4 scrollbar-hide snap-x" style={{ scrollbarWidth: 'none' }}>
              {credits.cast.slice(0, 10).map((person: any) => (
                <div key={person.id} className="min-w-[100px] md:min-w-[120px] w-[100px] md:w-[120px] flex flex-col items-center space-y-2 snap-start">
                  <div className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden bg-muted border border-white/10 shrink-0">
                    {person.profile_path ? (
                      <img 
                        src={`${IMAGE_BASE}w185${person.profile_path}`} 
                        alt={person.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-secondary text-[10px] text-muted-foreground text-center p-2">
                        {person.name}
                      </div>
                    )}
                  </div>
                  <div className="text-center w-full">
                    <p className="text-xs md:text-sm font-semibold text-white leading-tight truncate">{person.name}</p>
                    <p className="text-[10px] md:text-xs text-muted-foreground leading-tight truncate">{person.character}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}