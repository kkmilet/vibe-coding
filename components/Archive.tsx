
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Photo } from '../types';
import { useApp } from '../context';
import { Calendar, MapPin, Filter } from 'lucide-react';
import { useScrollReveal } from './animations';

interface ArchiveProps {
  items: Photo[];
  onPhotoClick: (photo: Photo) => void;
}

type ViewMode = 'time' | 'location';

// Internal Image Component for Archive with Aggressive Loading
const ArchiveImage = ({ photo, onClick, viewMode }: { photo: Photo; onClick: () => void; viewMode: ViewMode }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [shouldLoad, setShouldLoad] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const getSquareUrl = (url: string) => {
    if (url.includes("picsum.photos")) {
        return url.replace(/\/\d+\/\d+$/, '/400/400'); 
    }
    return url;
  };
  const squareUrl = getSquareUrl(photo.url);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      { rootMargin: '500px' } // Pre-fetch when 500px away
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div 
      ref={containerRef}
      onClick={onClick}
      className="group relative aspect-square cursor-pointer overflow-hidden rounded-xl bg-gray-100 dark:bg-white/5 shadow-soft hover:shadow-soft-hover dark:shadow-none transition-all duration-500 ease-fluid hover:-translate-y-1 hover:shadow-2xl"
    >
      {/* Placeholder background */}
      <div className={`absolute inset-0 bg-gray-200 dark:bg-white/5 transition-opacity duration-500 ${isLoaded ? 'opacity-0' : 'opacity-100'}`} />
      
      {shouldLoad && (
        <img 
            src={squareUrl} 
            alt={photo.title} 
            onLoad={() => setIsLoaded(true)}
            className={`w-full h-full object-cover transition-all duration-700 ease-fluid group-hover:scale-110 dark:opacity-90 dark:group-hover:opacity-100 ${
                isLoaded ? 'opacity-100 blur-0' : 'opacity-0 blur-sm'
            }`}
        />
      )}
      
      {/* Overlay info */}
      <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[2px] transition-opacity duration-500 ease-fluid
                      opacity-0 group-hover:opacity-100">
         <div className="text-center text-white transition-transform duration-500 ease-fluid p-4
                         translate-y-8 group-hover:translate-y-0">
            <p className="text-[10px] font-bold uppercase tracking-widest mb-1 opacity-80">{viewMode === 'time' ? photo.location : photo.year}</p>
            <p className="text-lg font-serif italic drop-shadow-lg">{photo.title}</p>
         </div>
      </div>
    </div>
  );
};

const Archive: React.FC<ArchiveProps> = ({ items, onPhotoClick }) => {
  const { t } = useApp();
  const [viewMode, setViewMode] = useState<ViewMode>('time');
  const [selectedFilter, setSelectedFilter] = useState<string | number | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  const { ref, isVisible } = useScrollReveal({ threshold: 0.1, once: true });

  const years = useMemo(() => {
    const allYears = items.map(p => p.year).filter((y): y is number => y !== undefined);
    return [...new Set(allYears)].sort((a, b) => b - a);
  }, [items]);

  const locations = useMemo(() => {
    const allLocs = items.map(p => p.location).filter((l): l is string => l !== undefined);
    return [...new Set(allLocs)].sort();
  }, [items]);

  const filteredItems = useMemo(() => {
    if (!selectedFilter) return items;
    return items.filter(item => {
      if (viewMode === 'time') return item.year === selectedFilter;
      if (viewMode === 'location') return item.location === selectedFilter;
      return true;
    });
  }, [items, viewMode, selectedFilter]);

  useEffect(() => {
    setIsAnimating(true);
    const timer = setTimeout(() => setIsAnimating(false), 500);
    return () => clearTimeout(timer);
  }, [selectedFilter, viewMode]);

  const handleModeChange = (mode: ViewMode) => {
    setViewMode(mode);
    setSelectedFilter(null);
  };

  return (
    <section id="archive" ref={ref} className="py-32 bg-apple-bg dark:bg-[#0a0a0a] transition-colors duration-700 relative z-20">
      <div className="max-w-[1800px] mx-auto px-6 md:px-12">
        
        {/* Header Section */}
        <div className={`flex flex-col md:flex-row justify-between items-end mb-16 gap-8 transition-all duration-1000 ease-fluid transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div>
            <h2 className="text-4xl md:text-6xl font-bold text-apple-dark dark:text-white tracking-tighter mb-4 transition-colors">
              {t.archive.title}
            </h2>
            <p className="text-apple-gray dark:text-gray-400 font-light text-lg">
              {t.archive.subtitle}
            </p>
          </div>

          {/* Mode Toggle */}
          <div className="bg-white dark:bg-white/5 p-1.5 rounded-xl flex text-sm font-medium shadow-sm dark:shadow-none backdrop-blur-md">
            <button
              onClick={() => handleModeChange('time')}
              className={`px-6 py-2.5 rounded-lg transition-all duration-500 ease-fluid flex items-center gap-2 ${
                viewMode === 'time' 
                  ? 'bg-gray-100 dark:bg-white/20 text-apple-dark dark:text-white shadow-inner' 
                  : 'text-apple-gray dark:text-gray-400 hover:text-apple-dark dark:hover:text-gray-200'
              }`}
            >
              <Calendar size={14} />
              {t.archive.modeTime}
            </button>
            <button
              onClick={() => handleModeChange('location')}
              className={`px-6 py-2.5 rounded-lg transition-all duration-500 ease-fluid flex items-center gap-2 ${
                viewMode === 'location' 
                  ? 'bg-gray-100 dark:bg-white/20 text-apple-dark dark:text-white shadow-inner' 
                  : 'text-apple-gray dark:text-gray-400 hover:text-apple-dark dark:hover:text-gray-200'
              }`}
            >
              <MapPin size={14} />
              {t.archive.modeLocation}
            </button>
          </div>
        </div>

        {/* Sub-Filters */}
        <div className={`mb-12 overflow-x-auto pb-4 no-scrollbar transition-all duration-1000 delay-100 ease-fluid transform ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}>
          <div className="flex gap-3 min-w-max">
            <button
              onClick={() => setSelectedFilter(null)}
              className={`px-5 py-2 rounded-full border text-xs uppercase tracking-widest transition-all duration-300 ${
                selectedFilter === null
                  ? 'bg-apple-dark dark:bg-white text-white dark:text-black border-transparent scale-105'
                  : 'bg-white dark:bg-transparent border-gray-200 dark:border-white/20 text-apple-gray dark:text-gray-400 hover:border-gray-400 dark:hover:border-white/50 hover:scale-105'
              }`}
            >
              {viewMode === 'time' ? t.archive.allYears : t.archive.allLocations}
            </button>
            
            {(viewMode === 'time' ? years : locations).map(item => (
              <button
                key={item}
                onClick={() => setSelectedFilter(item)}
                className={`px-5 py-2 rounded-full border text-xs uppercase tracking-widest transition-all duration-300 ${
                  selectedFilter === item
                     ? 'bg-apple-dark dark:bg-white text-white dark:text-black border-transparent scale-105'
                : 'bg-white dark:bg-transparent border-gray-200 dark:border-white/20 text-apple-gray dark:text-gray-400 hover:border-gray-400 dark:hover:border-white/50 hover:scale-105'
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        {/* Result Grid */}
        <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8 min-h-[400px] transition-all duration-500 ease-fluid ${isAnimating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
          {filteredItems.map((photo, index) => (
            <div
              key={photo.id}
              className="animate-scale-in"
              style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'both' }}
            >
              <ArchiveImage photo={photo} onClick={() => onPhotoClick(photo)} viewMode={viewMode} />
            </div>
          ))}
          {filteredItems.length === 0 && (
             <div className="col-span-full flex flex-col items-center justify-center text-apple-gray dark:text-gray-600 py-20 animate-fade-in">
                <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center mb-6">
                  <Filter size={32} className="opacity-30" />
                </div>
                <p className="text-sm font-medium">No items found for this selection.</p>
             </div>
          )}
        </div>

      </div>
    </section>
  );
};

export default Archive;
