import { Link } from "wouter";
import { IMAGE_BASE } from "@/services/tmdb";
import { Play, Star } from "lucide-react";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";

interface MovieCardProps {
  id: number;
  title: string;
  posterPath: string | null;
  voteAverage: number;
  releaseDate?: string;
  type: "movie" | "tv";
}

export function MovieCard({ id, title, posterPath, voteAverage, releaseDate, type }: MovieCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const year = releaseDate ? new Date(releaseDate).getFullYear() : "";

  return (
    <Link href={`/${type}/${id}`} data-testid={`card-${type}-${id}`}>
      <motion.div 
        whileHover={{ scale: 1.05, zIndex: 10 }}
        transition={{ duration: 0.2 }}
        className="group relative flex flex-col gap-2 cursor-pointer"
      >
        <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-muted">
          {!imageLoaded && <Skeleton className="absolute inset-0 w-full h-full" />}
          {posterPath ? (
            <img 
              src={`${IMAGE_BASE}w342${posterPath}`} 
              alt={title}
              className={`object-cover w-full h-full transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
              onLoad={() => setImageLoaded(true)}
              loading="lazy"
            />
          ) : (
            <div className="flex items-center justify-center w-full h-full bg-secondary text-muted-foreground text-sm text-center p-4">
              {title}
            </div>
          )}

          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <div className="bg-primary text-white rounded-full p-3 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 shadow-[0_0_15px_rgba(229,9,20,0.5)]">
              <Play className="w-6 h-6 fill-current ml-1" />
            </div>
          </div>
          
          {/* Rating Badge */}
          <div className="absolute top-2 right-2 bg-black/80 backdrop-blur-md text-white text-xs font-bold px-2 py-1 rounded-md flex items-center gap-1 border border-white/10">
            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
            {voteAverage.toFixed(1)}
          </div>
        </div>

        <div>
          <h3 className="font-semibold text-sm text-foreground truncate">{title}</h3>
          <div className="flex items-center text-xs text-muted-foreground gap-2">
            <span>{year}</span>
            <span className="w-1 h-1 rounded-full bg-muted-foreground/50"></span>
            <span className="uppercase">{type === 'tv' ? 'Series' : 'Movie'}</span>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}