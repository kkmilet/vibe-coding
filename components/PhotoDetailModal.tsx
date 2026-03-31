
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
  const [isVisible, setIsVisible] = useState(false);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right' | 'none'>('none');
  const [isSliding, setIsSliding] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const lastTapRef = useRef<number>(0);

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
        setIsSliding(true);
        setTimeout(() => {
          setDisplayPhoto(photo);
          requestAnimationFrame(() => {
            setIsSliding(false);
          });
        }, 200);
      } else {
        setDisplayPhoto(photo);
        requestAnimationFrame(() => setIsVisible(true));
      }
    } else {
      setIsVisible(false);
      const timer = setTimeout(() => {
        if (isMounted.current) {
          setDisplayPhoto(null);
        }
      }, 500); // Match the transition duration (500ms)
      return () => clearTimeout(timer);
    }
  }, [photo]);

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

  const bgUrl = useMemo(() => {
    if (!displayPhoto) return '';
    if (displayPhoto.url.includes("picsum.photos")) {
        return displayPhoto.url.replace(/\/\d+\/\d+$/, '/100/100?blur=10');
    }
    return displayPhoto.url;
  }, [displayPhoto]);

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
      className={`fixed inset-0 z-[5000] flex items-center justify-center overflow-hidden h-[100dvh] transition-opacity duration-500 ease-fluid ${isVisible ? 'opacity-100' : 'opacity-0'}`}
    >
      
      {/* --- IMMERSIVE BACKGROUND --- */}
      <div className={`absolute inset-0 z-0 transition-colors duration-700 ${theme === 'dark' ? 'bg-black' : 'bg-apple-bg'}`} />

      {/* Optimized Blurred Background */}
      <div className="absolute inset-0 z-0 pointer-events-none select-none overflow-hidden">
        <div 
          className={`absolute inset-0 bg-cover bg-center transition-all duration-[1.5s] ease-out blur-[100px] opacity-40 dark:opacity-30 transform ${isVisible ? 'scale-110' : 'scale-150'}`}
          style={{ 
            backgroundImage: `url(${bgUrl})`,
          }}
        />
        <div className={`absolute inset-0 transition-all duration-500 ${
          theme === 'dark' 
            ? 'bg-black/40' 
            : 'bg-white/40'
        }`} />
      </div>

      {/* --- MAIN CONTENT --- */}
      <div
        className={`relative z-10 w-full h-full flex flex-col md:flex-row transition-all duration-500 ease-fluid ${
          isVisible
            ? isSliding
              ? slideDirection === 'left'
                ? 'translate-x-0 opacity-100'
                : 'translate-x-0 opacity-100'
              : 'translate-y-0 scale-100 opacity-100'
            : 'translate-y-10 scale-95 opacity-0'
        }`}
        style={{
          animation: isSliding
            ? slideDirection === 'left'
              ? 'slideInRight 0.3s ease-out forwards'
              : 'slideInLeft 0.3s ease-out forwards'
            : 'none',
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
          className="flex-1 h-[50%] md:h-full relative flex items-center justify-center p-4 md:p-12 lg:p-20 order-1"
        >
           <div className="relative w-full max-w-5xl max-h-full shadow-2xl rounded-md overflow-hidden bg-white dark:bg-[#1c1c1e]">
              <img
                src={displayPhoto.url}
                alt={displayPhoto.title}
                className="w-full h-full object-contain max-h-[80vh] cursor-zoom-in"
                onClick={handleDoubleClick}
                style={{
                  transform: zoomLevel === 2 ? 'scale(2)' : 'scale(1)',
                  transformOrigin: 'center center',
                  transition: 'transform 0.3s ease-out',
                }}
              />
           </div>
        </div>

        {/* --- RIGHT: DETAILS PANEL --- */}
        <div className=" w-full md:w-[400px] lg:w-[450px] h-[50%] md:h-full overflow-y-auto order-2 bg-white/80 dark:bg-[#1c1c1e]/80 backdrop-blur-xl border-l border-white/20 dark:border-white/5 p-8 md:p-12 flex flex-col gap-8 no-scrollbar" >

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
