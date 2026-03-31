
import React, { useEffect, useState, useMemo, useRef } from 'react';
import { Photo } from '../types';
import { X, Aperture, MapPin, Calendar, Download } from 'lucide-react';
import { useApp } from '../context';

interface Props {
  photo: Photo | null;
  onClose: () => void;
  onPrev?: () => void;
  onNext?: () => void;
  hasPrev?: boolean;
  hasNext?: boolean;
  currentIndex?: number;
  totalCount?: number;
}

const PhotoDetailModal: React.FC<Props> = ({ photo, onClose, onPrev, onNext, hasPrev, hasNext, currentIndex, totalCount }) => {
  // Local state to manage display data during exit animations
  const [displayPhoto, setDisplayPhoto] = useState<Photo | null>(photo);
  const [exitPhoto, setExitPhoto] = useState<Photo | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right' | 'none'>('none');
  const [isSliding, setIsSliding] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const lastTapRef = useRef<number>(0);
  const [bgUrl, setBgUrl] = useState('');

  const { t, theme } = useApp();
  const isMounted = useRef(true);

  // Handle mounting/unmounting safety for async ops
  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  // Sync props to state and handle animation triggers
  useEffect(() => {
    if (photo) {
      // If displayPhoto exists and new photo is different, trigger slide animation
      if (displayPhoto && photo.id !== displayPhoto.id) {
        // Start transition: current becomes exit photo, new becomes display photo
        setExitPhoto(displayPhoto);
        setDisplayPhoto(photo);
        setIsSliding(true);
        setBgUrl(getBgUrl(photo));

        // After slide animation completes, clear exit photo
        setTimeout(() => {
          setExitPhoto(null);
          setIsSliding(false);
        }, 280);
      } else {
        setDisplayPhoto(photo);
        setBgUrl(getBgUrl(photo));
        requestAnimationFrame(() => setIsVisible(true));
      }
    } else {
      setIsVisible(false);
      const timer = setTimeout(() => {
        if (isMounted.current) {
          setDisplayPhoto(null);
          setExitPhoto(null);
        }
      }, 500); // Match the transition duration (500ms)
      return () => clearTimeout(timer);
    }
  }, [photo]);

  // Helper to get background URL
  const getBgUrl = (p: Photo | null) => {
    if (!p) return '';
    if (p.url.includes("picsum.photos")) {
      return p.url.replace(/\/\d+\/\d+$/, '/100/100?blur=10');
    }
    return p.url;
  };

  // Separate effect for overflow to prevent flicker when switching photos (A -> B)
  // because isVisible remains true, avoiding the cleanup/setup cycle of 'unset'/'hidden'
  useEffect(() => {
    if (isVisible) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isVisible]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' && hasPrev) {
        setSlideDirection('left');
        onPrev?.();
      }
      if (e.key === 'ArrowRight' && hasNext) {
        setSlideDirection('right');
        onNext?.();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, onPrev, onNext, hasPrev, hasNext]);

  const handlePrevClick = () => {
    setSlideDirection('left');
    onPrev?.();
  };

  const handleNextClick = () => {
    setSlideDirection('right');
    onNext?.();
  };


  const handleDownload = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!displayPhoto) return;

    try {
      const response = await fetch(displayPhoto.url, { 
        mode: 'cors', 
      });
      
      if (!response.ok) throw new Error('Network response not ok');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      const filename = `${displayPhoto.title.replace(/\s+/g, '-').replace(/[^a-z0-9-]/gi, '').toLowerCase()}.jpg`;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      
      document.body.removeChild(link);
      setTimeout(() => window.URL.revokeObjectURL(url), 100);
      
    } catch (error) {
      console.warn("Direct download prevented, opening in new tab.", error);
      window.open(displayPhoto.url, '_blank');
    }
  };

  // Only return null if we have no photo to display at all (after exit animation)
  if (!displayPhoto) return null;

  const MIN_SWIPE_DISTANCE = 50;

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    if (zoomLevel !== 1) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > MIN_SWIPE_DISTANCE;
    const isRightSwipe = distance < -MIN_SWIPE_DISTANCE;

    if (isLeftSwipe && hasNext) {
      setSlideDirection('left');
      onNext?.();
    }
    if (isRightSwipe && hasPrev) {
      setSlideDirection('right');
      onPrev?.();
    }

    setTouchStart(null);
    setTouchEnd(null);
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      setZoomLevel(z => z === 1 ? 2 : 1);
      lastTapRef.current = 0;
    } else {
      lastTapRef.current = now;
    }
  };

  return (
    <div
      className="fixed inset-0 z-[5000] flex items-center justify-center overflow-hidden h-[100dvh]"
      style={{
        animation: isVisible ? 'modalBackdropIn 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards' : 'none',
        opacity: 0,
      }}
    >

      {/* --- IMMERSIVE BACKGROUND --- */}
      <div
        className={`absolute inset-0 z-0 ${theme === 'dark' ? 'bg-black' : 'bg-apple-bg'}`}
        style={{ animation: isVisible ? 'backdropFadeIn 0.6s ease-out forwards' : 'none' }}
      />

      {/* Optimized Blurred Background */}
      <div className="absolute inset-0 z-0 pointer-events-none select-none overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${bgUrl})`,
            filter: 'blur(100px)',
            opacity: 0.4,
            transform: 'scale(1.2)',
            animation: isVisible
              ? 'bgExpandIn 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards'
              : 'none',
          }}
        />
        <div
          className={`absolute inset-0 ${theme === 'dark' ? 'bg-black/40' : 'bg-white/40'}`}
          style={{ animation: isVisible ? 'overlayFadeIn 0.5s ease-out 0.2s forwards' : 'none', opacity: 0 }}
        />
      </div>

      {/* --- MAIN CONTENT --- */}
      <div
        className="relative z-10 w-full h-full flex flex-col md:flex-row"
        style={{
          animation: isSliding
            ? slideDirection === 'left'
              ? 'slideInRight 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards'
              : 'slideInLeft 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards'
            : isVisible
              ? 'contentRevealIn 0.6s cubic-bezier(0.4, 0, 0.2, 1) 0.1s forwards'
              : 'none',
          opacity: isSliding || isVisible ? 1 : 0,
        }}
      >

        {/* Close Button */}
        <button
          onClick={onClose}
          className={`absolute top-6 right-6 md:top-8 md:right-8 z-[60] p-3 rounded-full transition-all duration-500 ease-fluid group ${
             theme === 'dark' ? 'bg-white/10 hover:bg-white/20' : 'bg-black/5 hover:bg-black/10'
          }`}
          aria-label="Close"
        >
           <X size={20} className={`transition-transform duration-500 group-hover:rotate-90 ${theme === 'dark' ? 'text-white' : 'text-black'}`} />
        </button>

        {/* Prev Button */}
        {hasPrev && (
          <button
            onClick={handlePrevClick}
            className={`absolute left-4 top-1/2 -translate-y-1/2 z-[60] p-3 rounded-full transition-all duration-500 ease-fluid group ${
              theme === 'dark' ? 'bg-white/10 hover:bg-white/20' : 'bg-black/5 hover:bg-black/10'
            }`}
            aria-label="Previous photo"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className={`${theme === 'dark' ? 'text-white' : 'text-black'} transition-transform duration-500 group-hover:-translate-x-1`}>
              <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        )}

        {/* Next Button */}
        {hasNext && (
          <button
            onClick={handleNextClick}
            className={`absolute right-4 top-1/2 -translate-y-1/2 z-[60] p-3 rounded-full transition-all duration-500 ease-fluid group ${
              theme === 'dark' ? 'bg-white/10 hover:bg-white/20' : 'bg-black/5 hover:bg-black/10'
            }`}
            aria-label="Next photo"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className={`${theme === 'dark' ? 'text-white' : 'text-black'} transition-transform duration-500 group-hover:translate-x-1`}>
              <path d="M7.5 5L12.5 10L7.5 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        )}

        {/* --- LEFT: IMAGE CONTAINER --- */}
        <div
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="flex-1 h-[50%] md:h-full relative flex items-center justify-center p-6 md:p-16 lg:p-24 order-1"
        >
          {/* Dynamic ambient glow - simulates light cast by the photo */}
          <div
            className="absolute inset-0 pointer-events-none overflow-hidden"
            style={{
              background: `radial-gradient(ellipse 80% 70% at 50% 50%, ${
                theme === 'dark'
                  ? 'rgba(255,255,255,0.06) 0%, transparent 60%'
                  : 'rgba(0,0,0,0.04) 0%, transparent 60%'
              }, transparent 70%)`,
              filter: 'blur(60px)',
              transition: 'background 0.7s ease',
            }}
          />

          {/* Photo Mount (Passe-partout) - the white border like a real mounted print */}
          <div
            className="relative flex items-center justify-center"
            style={{
              // Mount border thickness - proportional to viewport
              padding: 'clamp(12px, 3vw, 40px)',
              background: theme === 'dark' ? '#0a0a0a' : '#fafafa',
              borderRadius: '4px',
              maxHeight: '80vh',
              maxWidth: 'min(85vw, 900px)',
              animation: isVisible && !isSliding ? 'mountRevealIn 0.7s cubic-bezier(0.4, 0, 0.2, 1) 0.15s forwards' : 'none',
              opacity: 0,
            }}
          >
            {/* Mount inner shadow - creates depth between mount and photo */}
            <div
              className="absolute inset-0 rounded"
              style={{
                boxShadow: theme === 'dark'
                  ? 'inset 0 2px 8px rgba(0,0,0,0.4), inset 0 -1px 2px rgba(255,255,255,0.03)'
                  : 'inset 0 2px 8px rgba(0,0,0,0.08), inset 0 -1px 2px rgba(255,255,255,0.8)',
              }}
            />

            {/* The Photo Container - with multi-layer shadow for floating effect */}
            <div
              className="relative rounded-sm overflow-hidden"
              style={{
                aspectRatio: displayPhoto.width && displayPhoto.height
                  ? `${displayPhoto.width} / ${displayPhoto.height}`
                  : 'auto',
                maxHeight: 'calc(80vh - clamp(24px, 6vw, 80px))',
                width: 'auto',
                height: 'auto',
                // Sophisticated multi-layer shadow
                boxShadow: theme === 'dark'
                  ? `
                    0 2px 4px rgba(0,0,0,0.1),
                    0 8px 16px rgba(0,0,0,0.15),
                    0 24px 48px rgba(0,0,0,0.25),
                    0 48px 96px rgba(0,0,0,0.35),
                    0 0 0 1px rgba(255,255,255,0.03),
                    inset 0 0 0 1px rgba(255,255,255,0.02)
                  `
                  : `
                    0 2px 4px rgba(0,0,0,0.04),
                    0 8px 16px rgba(0,0,0,0.08),
                    0 24px 48px rgba(0,0,0,0.12),
                    0 48px 96px rgba(0,0,0,0.16),
                    0 0 0 1px rgba(0,0,0,0.06),
                    inset 0 0 0 1px rgba(255,255,255,0.9)
                  `,
              }}
            >
              {/* Exit photo layer (animating out) - OLD photo slides OUT */}
              {exitPhoto && (
                <div
                  className="absolute inset-0"
                  style={{
                    zIndex: 20,
                    animation: slideDirection === 'left'
                      ? 'slideExitLeft 0.18s cubic-bezier(0.4, 0, 0.2, 1) forwards'
                      : 'slideExitRight 0.18s cubic-bezier(0.4, 0, 0.2, 1) forwards',
                  }}
                >
                  <img
                    src={exitPhoto.url}
                    alt={exitPhoto.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Enter photo layer (animating in) - NEW photo fades/slides IN */}
              <div
                className="relative"
                style={{
                  zIndex: 10,
                  animation: isSliding
                    ? slideDirection === 'left'
                      ? 'slideEnterRight 0.22s cubic-bezier(0.4, 0, 0.2, 1) forwards'
                      : 'slideEnterLeft 0.22s cubic-bezier(0.4, 0, 0.2, 1) forwards'
                    : 'none',
                }}
              >
                <img
                  src={displayPhoto.url}
                  alt={displayPhoto.title}
                  className="block w-full h-auto object-cover cursor-zoom-in"
                  onClick={handleDoubleClick}
                  style={{
                    display: 'block',
                    transform: zoomLevel === 2 ? 'scale(2)' : isSliding ? 'scale(1.02)' : 'scale(1)',
                    transformOrigin: 'center center',
                    transition: 'transform 0.3s ease-out',
                    maxHeight: 'calc(80vh - clamp(24px, 6vw, 80px))',
                    width: 'auto',
                    height: 'auto',
                  }}
                />

                {/* Glass Reflection Layer - top portion subtle white gradient */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: `
                      linear-gradient(
                        180deg,
                        rgba(255,255,255,${theme === 'dark' ? '0.04' : '0.08'}) 0%,
                        rgba(255,255,255,0) 15%,
                        transparent 30%
                      ),
                      linear-gradient(
                        180deg,
                        rgba(255,255,255,0) 70%,
                        rgba(255,255,255,${theme === 'dark' ? '0.02' : '0.04'}) 100%
                      )
                    `,
                    borderRadius: '2px',
                  }}
                />

                {/* Subtle Edge Highlight - light catching the edge of the photo */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    boxShadow: theme === 'dark'
                      ? 'inset 0 0 0 1px rgba(255,255,255,0.05)'
                      : 'inset 0 0 0 1px rgba(255,255,255,0.8)',
                    borderRadius: '2px',
                  }}
                />
              </div>

              {/* Bottom Reflection - subtle mirror of the photo below */}
              <div
                className="absolute left-0 right-0 -bottom-2 h-6 pointer-events-none"
                style={{
                  background: `linear-gradient(to bottom, ${
                    theme === 'dark' ? 'rgba(255,255,255,0.015)' : 'rgba(0,0,0,0.02)'
                  } 0%, transparent 100%)`,
                  maskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.25) 0%, transparent 100%)',
                  WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.25) 0%, transparent 100%)',
                  transform: 'scaleY(-1) translateY(100%)',
                  filter: 'blur(3px)',
                  opacity: 0.5,
                }}
              />
            </div>

            {/* Mount Label - subtle info like on museum prints */}
            <div
              className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[9px] tracking-[0.2em] uppercase font-medium"
              style={{
                color: theme === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)',
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
              }}
            >
              {displayPhoto.location || 'Lumina Pro Vision'}
            </div>
          </div>

          {/* Subtle Bokeh/Glow Orbs in background for depth */}
          <div
            className="absolute w-64 h-64 rounded-full pointer-events-none opacity-30 dark:opacity-20"
            style={{
              background: theme === 'dark'
                ? 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)'
                : 'radial-gradient(circle, rgba(0,0,0,0.05) 0%, transparent 70%)',
              top: '20%',
              left: '15%',
              filter: 'blur(80px)',
              animation: 'breathe 8s ease-in-out infinite',
            }}
          />
          <div
            className="absolute w-96 h-96 rounded-full pointer-events-none opacity-20 dark:opacity-10"
            style={{
              background: theme === 'dark'
                ? 'radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%)'
                : 'radial-gradient(circle, rgba(0,0,0,0.03) 0%, transparent 70%)',
              bottom: '10%',
              right: '10%',
              filter: 'blur(100px)',
              animation: 'breathe 10s ease-in-out infinite reverse',
            }}
          />
        </div>

        {/* --- RIGHT: DETAILS PANEL --- */}
        <div
          className="w-full md:w-[400px] lg:w-[450px] h-[50%] md:h-full overflow-y-auto order-2 bg-white/80 dark:bg-[#1c1c1e]/80 backdrop-blur-xl border-l border-white/20 dark:border-white/5 p-8 md:p-12 flex flex-col gap-8 no-scrollbar"
          style={{
            animation: isVisible && !isSliding ? 'panelSlideIn 0.5s cubic-bezier(0.4, 0, 0.2, 1) 0.25s forwards' : 'none',
            opacity: 0,
            transform: isVisible && !isSliding ? 'translateX(30px)' : 'none',
          }}
        >

          {/* Header Info */}
          <div className=" space-y-2 mt-8 md:mt-20" >
            {/* Photo Position Indicator */}
            <div className=" flex items-center justify-between mb-4" >
              <div className=" flex items-center gap-2 text-[10px] text-apple-gray dark:text-gray-500 font-medium tracking-widest uppercase" >
                <span className=" w-4 h-px bg-apple-gray/30 dark:bg-gray-500/30" ></span>
                Frame
              </div>
              {(hasPrev !== undefined || hasNext !== undefined) && (
                <span className=" text-[10px] text-apple-gray dark:text-gray-500 font-mono" >
                  {currentIndex !== undefined && currentIndex >= 0 ? currentIndex + 1 : ''} / {totalCount}
                </span>
              )}
            </div>
             <div className=" flex items-center gap-2" >
               <span className=" px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-bold uppercase tracking-widest" >
                 {displayPhoto.category}
               </span>
             </div>
             <h2 className=" text-3xl md:text-4xl font-bold text-apple-dark dark:text-white leading-tight" >
               {displayPhoto.title}
             </h2>
          </div>

          {/* Technical Grid */}
          <div className=" grid grid-cols-2 gap-4 py-6 border-y border-gray-200/50 dark:border-white/10" >
             <div className=" flex flex-col gap-1" >
                <span className=" flex items-center gap-2 text-xs text-apple-gray dark:text-gray-500 uppercase tracking-wider font-medium" >
                   <Aperture size={12} /> {t.modal.iso} / {t.modal.focal}
                </span>
                <span className=" text-sm font-medium text-apple-dark dark:text-white" >
                   {displayPhoto.iso || 'ISO 200'} • {displayPhoto.focalLength || '35mm'}
                </span>
             </div>
             <div className=" flex flex-col gap-1" >
                <span className=" flex items-center gap-2 text-xs text-apple-gray dark:text-gray-500 uppercase tracking-wider font-medium" >
                   <Calendar size={12} /> {t.modal.year}
                </span>
                <span className=" text-sm font-medium text-apple-dark dark:text-white" >
                   {displayPhoto.year || '2024'}
                </span>
             </div>
             <div className=" flex flex-col gap-1 col-span-2" >
                <span className=" flex items-center gap-2 text-xs text-apple-gray dark:text-gray-500 uppercase tracking-wider font-medium" >
                   <MapPin size={12} /> {t.modal.location}
                </span>
                <span className=" text-sm font-medium text-apple-dark dark:text-white" >
                   {displayPhoto.location || 'Unknown Location'}
                </span>
             </div>
          </div>

          {/* Actions */}
          <div className=" mt-auto pt-8 pb-12" >
             <button
               onClick={handleDownload}
               className=" w-full py-4 bg-apple-dark dark:bg-white text-white dark:text-black rounded-full font-medium flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-lg" 
             >
                <Download size={18} />
                {t.modal.download}
             </button>
             <p className=" text-center text-[10px] text-gray-400 mt-4 max-w-[80%] mx-auto leading-relaxed" >
               {t.modal.prompt}
             </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default PhotoDetailModal;
