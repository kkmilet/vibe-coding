
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Photo } from '../types';
import { useApp } from '../context';
import { useScrollReveal } from './animations';

interface BentoGridProps {
  id: string;
  title: string;
  items: Photo[];
  onPhotoClick: (photo: Photo) => void;
}

const getOptimizedUrl = (url: string, targetWidth: number, originalWidth: number, originalHeight: number) => {
  if (url.includes("picsum.photos")) {
    const targetHeight = Math.round(targetWidth * (originalHeight / originalWidth));
    return url.replace(/\/\d+\/\d+$/, `/${targetWidth}/${targetHeight}`);
  }
  return url;
};

const generateSrcSet = (url: string, originalWidth: number, originalHeight: number) => {
  if (!url.includes("picsum.photos")) return '';
  const sizes = [400, 800, 1600];
  return sizes
    .map(w => {
      const h = Math.round(w * (originalHeight / originalWidth));
      const resizedUrl = url.replace(/\/\d+\/\d+$/, `/${w}/${h}`);
      return `${resizedUrl} ${w}w`;
    })
    .join(', ');
};

const useWindowWidth = () => {
  const [width, setWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  return width;
};

// --- Internal: Smart Image Component ---
// Solves scroll lag by pre-fetching images 800px before they appear
const GridImage = ({ photo, onClick, priority = false }: { photo: Photo; onClick: () => void; priority?: boolean }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [showHighRes, setShowHighRes] = useState(false);
  const [shouldLoad, setShouldLoad] = useState(priority); // If priority, load immediately
  const imgRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  const optimizedUrl = getOptimizedUrl(photo.url, 800, photo.width, photo.height);

  // Tiny thumbnail for instant blur effect
  const thumbUrl = photo.url.includes("picsum.photos")
    ? photo.url.replace(/\/\d+\/\d+$/, '/150/150?blur=5')
    : photo.url;

  useEffect(() => {
    if (priority || shouldLoad) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '600px 0px', // Start loading when image is 600px away from viewport (approx 1 scroll)
        threshold: 0
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [priority, shouldLoad]);

  useEffect(() => {
    if (isLoaded) {
      const timer = setTimeout(() => setShowHighRes(true), 100);
      return () => clearTimeout(timer);
    } else {
      setShowHighRes(false);
    }
  }, [isLoaded]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imgRef.current) return;
    const rect = imgRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: y * -6, y: x * 6 });
  };

  const handleMouseEnter = () => setIsHovering(true);
  const handleMouseLeave = () => {
    setIsHovering(false);
    setTilt({ x: 0, y: 0 });
  };

  return (
     <div
      ref={imgRef}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="group relative w-full cursor-zoom-in mb-4 md:mb-8"
      style={{
        perspective: '1000px',
      }}
    >
      {/* Image Container */}
      <div
        className="relative overflow-hidden rounded-sm md:rounded-xl bg-gray-100 dark:bg-[#1a1a1a] transition-shadow duration-700 ease-fluid shadow-soft hover:shadow-soft-hover dark:shadow-none dark:hover:shadow-[0_10px_50px_rgba(255,255,255,0.1)]"
        style={{
          transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) ${isHovering ? 'scale(1.02)' : 'scale(1)'}`,
          transition: isHovering ? 'none' : 'all 0.7s cubic-bezier(0.16, 1, 0.3, 1)',
          transformStyle: 'preserve-3d',
        }}
      >
        {/* 1. Instant Blur Placeholder (Always Visible initially) */}
        <img
            src={thumbUrl}
            alt=""
            aria-hidden="true"
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${isLoaded ? 'opacity-0' : 'opacity-100 blur-md'}`}
        />

        {/* 2. High Res Image (Loads when 'shouldLoad' is true) */}
        {shouldLoad && (
          <img
            src={optimizedUrl}
            srcSet={generateSrcSet(photo.url, photo.width, photo.height)}
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            alt={photo.title}
            onLoad={() => setIsLoaded(true)}
            decoding={priority ? "sync" : "async"}
            className={`relative z-10 w-full h-auto block transition-all duration-500 ease-out group-hover:scale-[1.03] group-hover:saturate-[1.15] ${
              showHighRes ? 'opacity-100' : 'opacity-0'
            }`}
            style={{ aspectRatio: `${photo.width} / ${photo.height}` }}
          />
        )}

        {/* Subtle radial glow on hover */}
        <div
          className={`absolute inset-0 rounded-sm md:rounded-xl pointer-events-none transition-opacity duration-500 ${
            isHovering ? 'opacity-100' : 'opacity-0'
          }`}
          style={{
            background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.15) 0%, transparent 70%)',
            boxShadow: 'inset 0 0 60px rgba(255,255,255,0.05)',
          }}
        />

        {/* Hover Overlay */}
        <div className="absolute inset-0 z-20 bg-gradient-to-t from-black/80 via-black/10 to-transparent transition-opacity duration-700 ease-fluid
                        opacity-0 group-hover:opacity-100 pointer-events-none" />

        {/* Shine sweep effect */}
        <div
          className="absolute inset-0 z-30 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700"
          style={{
            background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.15) 45%, rgba(255,255,255,0.25) 50%, rgba(255,255,255,0.15) 55%, transparent 60%)',
            transform: 'translateX(-100%)',
            animation: isHovering ? 'shineSweep 0.8s ease-out forwards' : 'none',
          }}
        />

        {/* Metadata */}
        <div className="absolute bottom-0 left-0 p-6 md:p-8 w-full z-30 pointer-events-none">
            <div className="overflow-hidden py-1">
               <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/90 mb-2 drop-shadow-md transition-all duration-500 ease-fluid
                             translate-y-[150%] opacity-0
                             group-hover:translate-y-0 group-hover:opacity-100 group-hover:delay-100">
                 {photo.category}
               </p>
            </div>
            <div className="overflow-hidden py-1">
              <h3 className="text-2xl text-white font-light tracking-tight leading-none drop-shadow-md transition-all duration-500 ease-fluid
                             translate-y-[150%] opacity-0
                             group-hover:translate-y-0 group-hover:opacity-100 group-hover:delay-200">
                {photo.title}
              </h3>
            </div>
        </div>
      </div>
    </div>
  );
};

const BentoGrid: React.FC<BentoGridProps> = ({ id, title, items, onPhotoClick }) => {
  const windowWidth = useWindowWidth();
  const { ref, isVisible } = useScrollReveal({ threshold: 0.05, once: true });

  const columnsCount = useMemo(() => {
    if (windowWidth < 768) return 1;
    if (windowWidth < 1024) return 2;
    return 3;
  }, [windowWidth]);

  const columns = useMemo(() => {
    const cols: Photo[][] = Array.from({ length: columnsCount }, () => []);
    items.forEach((photo, index) => {
      cols[index % columnsCount].push(photo);
    });
    return cols;
  }, [columnsCount, items]);

  return (
    <section
      id={id}
      ref={ref}
      className="pb-20 pt-20 bg-apple-bg dark:bg-black relative z-20 transition-colors duration-700"
    >
      <div className="max-w-[1800px] mx-auto px-4 md:px-8">
        
        {/* Header */}
        <div className={`mb-24 flex flex-col items-center text-center space-y-6 transition-all duration-1000 ease-fluid transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <h2 className="text-4xl md:text-6xl font-semibold text-apple-dark dark:text-white tracking-tight transition-colors duration-500">
            {title}
          </h2>
          <div className={`w-px bg-gradient-to-b from-gray-300 to-transparent dark:from-white/50 dark:to-transparent transition-all duration-1000 delay-300 ${isVisible ? 'h-16 opacity-100' : 'h-0 opacity-0'}`}></div>
        </div>

        {/* Masonry Grid */}
        <div className="flex gap-4 md:gap-8 items-start">
          {columns.map((col, colIndex) => (
            <div key={colIndex} className="flex-1 space-y-4 md:space-y-8">
              {col.map((photo, index) => {
                // Calculate if this is an "early" item to load immediately
                // We load the top 2 items of each column immediately (6 items total on desktop)
                const isPriority = index < 2; 
                
                const revealDelay = (colIndex * 100) + (index * 150);
                
                return (
                  <div 
                    key={photo.id}
                    className={`transition-all duration-1000 ease-fluid transform will-change-transform ${
                      isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'
                    }`}
                    style={{ transitionDelay: `${revealDelay}ms` }}
                  >
                    <GridImage 
                      photo={photo} 
                      onClick={() => onPhotoClick(photo)} 
                      priority={isPriority} 
                    />
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BentoGrid;
