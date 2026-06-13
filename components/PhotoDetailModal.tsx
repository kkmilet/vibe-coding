
import React, { useEffect, useState, useRef } from 'react';
import { Photo } from '../types';
import { X, MapPin, Download, ChevronLeft, ChevronRight } from 'lucide-react';
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
  const [displayPhoto, setDisplayPhoto] = useState<Photo | null>(photo);
  // exitPhoto: briefly holds old photo for crossfade-out via CSS transition
  const [exitPhoto, setExitPhoto] = useState<Photo | null>(null);
  const [exitOpacity, setExitOpacity] = useState(0);
  // modalPhase: 'closed' | 'entering' (first-open animation) | 'open' (idle or switching)
  const [modalPhase, setModalPhase] = useState<'closed' | 'entering' | 'open'>('closed');
  const [slideDirection, setSlideDirection] = useState<'left' | 'right' | 'none'>('none');
  const [isSliding, setIsSliding] = useState(false);
  const touchStartRef = useRef<number | null>(null);
  const touchEndRef = useRef<number | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const panStart = useRef({ x: 0, y: 0 });
  const panOrigin = useRef({ x: 0, y: 0 });
  const lastTapRef = useRef<number>(0);
  const [bgUrl, setBgUrl] = useState('');
  const [showHints, setShowHints] = useState(false);
  const [downloadState, setDownloadState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const modalRef = useRef<HTMLDivElement>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const { t, theme } = useApp();
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  // Sync photo prop — crossfade via exitPhoto CSS transition
  useEffect(() => {
    let cleanupTimer: ReturnType<typeof setTimeout> | undefined;
    let enterTimer: ReturnType<typeof setTimeout> | undefined;
    let enterRaf: number | undefined;

    if (photo) {
      if (displayPhoto && photo.id !== displayPhoto.id) {
        // Crossfade: old photo becomes exit layer, fades out via CSS transition
        setExitPhoto(displayPhoto);
        setExitOpacity(1);
        setDisplayPhoto(photo);
        setIsSliding(true);
        setBgUrl(getBgUrl(photo));
        setZoomLevel(1);
        setPanOffset({ x: 0, y: 0 });
        setDownloadState('idle');
        setModalPhase('open');
        // Next frame: trigger exit fade
        enterRaf = requestAnimationFrame(() => {
          setExitOpacity(0);
          cleanupTimer = setTimeout(() => {
            if (!isMounted.current) return;
            setExitPhoto(null);
            setIsSliding(false);
          }, 450);
        });
      } else if (!displayPhoto) {
        setDisplayPhoto(photo);
        setBgUrl(getBgUrl(photo));
        setZoomLevel(1);
        setPanOffset({ x: 0, y: 0 });
        setModalPhase('entering');
        enterRaf = requestAnimationFrame(() => {
          enterTimer = setTimeout(() => {
            if (isMounted.current) setModalPhase('open');
          }, 600);
        });
      }
    } else {
      setModalPhase('closed');
      const closeTimer = setTimeout(() => {
        if (isMounted.current) {
          setDisplayPhoto(null);
          setExitPhoto(null);
          setExitOpacity(0);
        }
      }, 500);
      return () => clearTimeout(closeTimer);
    }

    return () => {
      if (cleanupTimer) clearTimeout(cleanupTimer);
      if (enterTimer) clearTimeout(enterTimer);
      if (enterRaf !== undefined) cancelAnimationFrame(enterRaf);
    };
  }, [photo]);

  // Save/restore focus
  useEffect(() => {
    if (photo && modalPhase !== 'closed') {
      previousFocusRef.current = document.activeElement as HTMLElement;
      const focusTimer = setTimeout(() => modalRef.current?.focus(), 100);
      setShowHints(true);
      const hintTimer = setTimeout(() => setShowHints(false), 6000);
      return () => { clearTimeout(focusTimer); clearTimeout(hintTimer); };
    } else if (!photo && previousFocusRef.current) {
      previousFocusRef.current.focus?.();
    }
  }, [photo, modalPhase]);

  const getBgUrl = (p: Photo | null) => {
    if (!p) return '';
    if (p.url.includes("picsum.photos")) {
      return p.url.replace(/\/\d+\/\d+$/, '/100/100?blur=10');
    }
    return p.url;
  };

  // Body scroll lock
  useEffect(() => {
    let restoreTimer: ReturnType<typeof setTimeout> | undefined;
    if (modalPhase !== 'closed') {
      document.body.style.overflow = 'hidden';
      if (restoreTimer) clearTimeout(restoreTimer);
    } else {
      restoreTimer = setTimeout(() => { document.body.style.overflow = ''; }, 500);
    }
    return () => {
      document.body.style.overflow = '';
      if (restoreTimer) clearTimeout(restoreTimer);
    };
  }, [modalPhase]);

  // Keyboard
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!displayPhoto) return;
      if (e.key === 'Escape') { onClose(); return; }
      if (e.key === 'ArrowLeft' && hasPrev) { setSlideDirection('left'); onPrev?.(); return; }
      if (e.key === 'ArrowRight' && hasNext) { setSlideDirection('right'); onNext?.(); return; }
      if (e.key === 'Tab' && modalRef.current) {
        const focusable = modalRef.current.querySelectorAll<HTMLElement>('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey) { if (document.activeElement === first) { e.preventDefault(); last?.focus(); } }
        else { if (document.activeElement === last) { e.preventDefault(); first?.focus(); } }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [displayPhoto, onClose, onPrev, onNext, hasPrev, hasNext]);

  const handlePrevClick = () => { setSlideDirection('left'); onPrev?.(); };
  const handleNextClick = () => { setSlideDirection('right'); onNext?.(); };

  // Download
  const handleDownload = async (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (!displayPhoto || downloadState === 'loading') return;
    setDownloadState('loading');
    try {
      const response = await fetch(displayPhoto.url);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = displayPhoto.title.replace(/\s+/g, '-').replace(/[^a-z0-9-]/gi, '').toLowerCase() + '.jpg';
        document.body.appendChild(link); link.click(); document.body.removeChild(link);
        setTimeout(() => window.URL.revokeObjectURL(url), 1000);
        setDownloadState('done'); setTimeout(() => setDownloadState('idle'), 2000);
        return;
      }
    } catch {}
    const popup = window.open(displayPhoto.url, '_blank', 'noopener,noreferrer');
    if (popup) { setDownloadState('done'); setTimeout(() => setDownloadState('idle'), 2000); }
    else { setDownloadState('error'); setTimeout(() => setDownloadState('idle'), 2500); }
  };

  // Touch
  const handleTouchStart = (e: React.TouchEvent) => {
    if (zoomLevel > 1) {
      if (e.touches.length === 1) { setIsPanning(true); panStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }; panOrigin.current = { ...panOffset }; }
      return;
    }
    touchStartRef.current = e.targetTouches[0].clientX; touchEndRef.current = null;
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    if (zoomLevel > 1 && isPanning) {
      setPanOffset({ x: panOrigin.current.x + e.touches[0].clientX - panStart.current.x, y: panOrigin.current.y + e.touches[0].clientY - panStart.current.y });
      return;
    }
    touchEndRef.current = e.targetTouches[0].clientX;
  };
  const handleTouchEnd = () => {
    if (zoomLevel > 1) { setIsPanning(false); return; }
    const start = touchStartRef.current, end = touchEndRef.current;
    touchStartRef.current = null; touchEndRef.current = null;
    if (start === null || end === null) return;
    const d = start - end;
    if (d > 50 && hasNext) { setSlideDirection('left'); onNext?.(); }
    if (d < -50 && hasPrev) { setSlideDirection('right'); onPrev?.(); }
  };

  // Mouse pan
  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoomLevel > 1) { setIsPanning(true); panStart.current = { x: e.clientX, y: e.clientY }; panOrigin.current = { ...panOffset }; }
  };
  const handleMouseMove = (e: React.MouseEvent) => {
    if (zoomLevel > 1 && isPanning) setPanOffset({ x: panOrigin.current.x + e.clientX - panStart.current.x, y: panOrigin.current.y + e.clientY - panStart.current.y });
  };
  const handleMouseUp = () => { if (zoomLevel > 1) setIsPanning(false); };

  const handleImageClick = (e: React.MouseEvent) => {
    if (zoomLevel > 1) { e.stopPropagation(); setZoomLevel(1); setPanOffset({ x: 0, y: 0 }); return; }
    const now = Date.now();
    if (now - lastTapRef.current < 300) { e.stopPropagation(); setZoomLevel(2); lastTapRef.current = 0; }
    else { lastTapRef.current = now; }
  };

  if (!displayPhoto) return null;

  return (
    <div
      ref={modalRef}
      tabIndex={-1}
      className="fixed inset-0 z-[5000] flex items-center justify-center overflow-hidden h-[100dvh] outline-none transition-opacity duration-500 overscroll-contain"
      style={{ animation: modalPhase === 'entering' ? 'modalBackdropIn 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards' : 'none', opacity: modalPhase === 'closed' ? 0 : 1 }}
      role="dialog" aria-modal="true" aria-label={displayPhoto.title} aria-describedby="modal-photo-title"
    >
      <div className={`absolute inset-0 z-0 transition-opacity duration-500 ${theme === 'dark' ? 'bg-black' : 'bg-apple-bg'}`} style={{ opacity: modalPhase !== 'closed' ? 1 : 0 }} />
      <div className="absolute inset-0 z-0 pointer-events-none select-none overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center transition-[opacity,transform,filter] duration-700"
          style={{ backgroundImage: `url(${bgUrl})`, filter: 'blur(100px)', opacity: modalPhase !== 'closed' ? 0.4 : 0, transform: modalPhase !== 'closed' ? 'scale(1.2)' : 'scale(1)' }} />
        <div className={`absolute inset-0 transition-opacity duration-500 ${theme === 'dark' ? 'bg-black/40' : 'bg-white/40'}`} style={{ opacity: modalPhase !== 'closed' ? 1 : 0 }} />
      </div>

      <div className="relative z-10 w-full h-full flex flex-col md:flex-row"
        style={{ animation: modalPhase === 'entering' ? 'contentRevealIn 0.6s cubic-bezier(0.4, 0, 0.2, 1) 0.1s forwards' : 'none', opacity: modalPhase !== 'closed' ? 1 : 0 }}>

        <button onClick={onClose} className={`absolute top-6 right-6 md:top-8 md:right-8 z-[60] p-3 rounded-full transition-[opacity,transform,background-color] duration-500 ease-fluid group touch-manipulation ${theme === 'dark' ? 'bg-black/50 hover:bg-black/70 backdrop-blur-md' : 'bg-white/70 hover:bg-white/90 backdrop-blur-md'}`} aria-label="Close">
          <X size={20} className={`transition-transform duration-500 group-hover:rotate-90 ${theme === 'dark' ? 'text-white' : 'text-black'}`} />
        </button>

        {hasPrev && (
          <button onClick={handlePrevClick} className={`absolute left-3 md:left-4 top-[35%] md:top-1/2 -translate-y-1/2 z-[60] p-2.5 md:p-3 rounded-full transition-[opacity,transform,background-color] duration-500 ease-fluid group touch-manipulation ${theme === 'dark' ? 'bg-black/50 hover:bg-black/70 backdrop-blur-md' : 'bg-white/70 hover:bg-white/90 backdrop-blur-md'}`} aria-label="Previous photo">
            <ChevronLeft size={22} className={`${theme === 'dark' ? 'text-white' : 'text-black'} transition-transform duration-500 group-hover:-translate-x-1`} />
          </button>
        )}
        {hasNext && (
          <button onClick={handleNextClick} className={`absolute right-3 md:right-4 top-[35%] md:top-1/2 -translate-y-1/2 z-[60] p-2.5 md:p-3 rounded-full transition-[opacity,transform,background-color] duration-500 ease-fluid group touch-manipulation ${theme === 'dark' ? 'bg-black/50 hover:bg-black/70 backdrop-blur-md' : 'bg-white/70 hover:bg-white/90 backdrop-blur-md'}`} aria-label="Next photo">
            <ChevronRight size={22} className={`${theme === 'dark' ? 'text-white' : 'text-black'} transition-transform duration-500 group-hover:translate-x-1`} />
          </button>
        )}

        <div className={`absolute top-20 md:bottom-4 md:top-auto left-1/2 -translate-x-1/2 z-[60] flex items-center gap-2 md:gap-3 px-4 md:px-5 py-2 md:py-2.5 rounded-full backdrop-blur-xl border text-[9px] md:text-[10px] font-medium tracking-wide transition-all duration-500 ${theme === 'dark' ? 'bg-white/10 border-white/10 text-white/70' : 'bg-black/5 border-black/5 text-black/60'} ${showHints ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'}`} aria-hidden="true">
          <span className="hidden md:flex items-center gap-1.5"><kbd className="px-1.5 py-0.5 rounded bg-white/20 text-[9px] font-mono">←</kbd><kbd className="px-1.5 py-0.5 rounded bg-white/20 text-[9px] font-mono">→</kbd><span className="opacity-50">{t.modal.hintsNavigate}</span></span>
          <span className="hidden md:block w-px h-3 bg-current opacity-20" />
          <span className="flex md:hidden items-center gap-1.5"><span className="opacity-50">← → {t.modal.hintsNavigate} · Esc {t.modal.hintsClose}</span></span>
          <span className="hidden md:block w-px h-3 bg-current opacity-20" />
          <span className="hidden md:flex items-center gap-1.5"><span className="opacity-50">{t.modal.hintsZoom}</span></span>
        </div>

        {/* --- IMAGE AREA --- */}
        <div ref={imageContainerRef}
          onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}
          className={`flex-1 relative flex items-center justify-center pb-[40vh] md:pb-0 ${zoomLevel > 1 ? 'cursor-grab active:cursor-grabbing' : 'cursor-zoom-in'} ${isPanning ? 'cursor-grabbing' : ''}`}>

          <div className="absolute inset-0 pointer-events-none overflow-hidden"
            style={{ background: `radial-gradient(ellipse 60% 50% at 50% 45%, ${theme === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)'} 0%, transparent 50%, transparent 70%)`, filter: 'blur(80px)' }} />

          {/* --- MOUNT + PHOTO --- */}
          <div
            style={{
              padding: 'clamp(8px, 2vw, 32px)',
              background: `radial-gradient(ellipse 70% 60% at 50% 35%, ${theme === 'dark' ? '#1a1a1a' : '#ffffff'} 0%, ${theme === 'dark' ? '#080808' : '#f3f3f3'} 100%)`,
              borderRadius: '4px',
              maxWidth: 'min(90vw, 900px)',
              maxHeight: 'clamp(40vh, 60vh, 85vh)',
              animation: modalPhase === 'entering' ? 'mountRevealIn 0.7s cubic-bezier(0.4, 0, 0.2, 1) 0.15s forwards' : 'none',
              opacity: modalPhase === 'entering' ? 0 : 1,
              boxShadow: theme === 'dark' ? '0 1px 2px rgba(0,0,0,0.3), 0 4px 8px rgba(0,0,0,0.25), 0 16px 32px rgba(0,0,0,0.3), 0 48px 96px rgba(0,0,0,0.4)' : '0 1px 2px rgba(0,0,0,0.04), 0 4px 8px rgba(0,0,0,0.06), 0 16px 32px rgba(0,0,0,0.08), 0 48px 96px rgba(0,0,0,0.12)',
            }}>
            {/* Inner shadow */}
            <div style={{ position: 'absolute', inset: 0, borderRadius: '4px', pointerEvents: 'none',
              boxShadow: theme === 'dark' ? 'inset 0 1px 4px rgba(255,255,255,0.02), inset 0 2px 8px rgba(0,0,0,0.5), inset 0 -1px 2px rgba(255,255,255,0.02)' : 'inset 0 1px 4px rgba(255,255,255,0.9), inset 0 2px 8px rgba(0,0,0,0.06), inset 0 -1px 2px rgba(0,0,0,0.04)' }} />

            {/* Photo */}
            <img src={displayPhoto.url} alt={displayPhoto.title} width={displayPhoto.width} height={displayPhoto.height}
              onClick={handleImageClick} draggable={false}
              style={{
                display: 'block', width: '100%', height: 'auto', maxHeight: 'calc(100vh - 40vh - 120px)',
                objectFit: 'cover', borderRadius: '2px', userSelect: 'none',
                transform: zoomLevel === 2 ? `scale(2) translate(${panOffset.x / 2}px, ${panOffset.y / 2}px)` : 'scale(1)',
                transformOrigin: 'center center',
                transition: isPanning ? 'none' : 'transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
              }} />

            {/* Exit photo overlay — crossfade out */}
            {exitPhoto && (
              <img src={exitPhoto.url} alt={exitPhoto.title}
                style={{
                  position: 'absolute', top: 'clamp(8px, 2vw, 32px)', left: 'clamp(8px, 2vw, 32px)',
                  right: 'clamp(8px, 2vw, 32px)', bottom: 'clamp(8px, 2vw, 32px)',
                  width: undefined, height: undefined, objectFit: 'cover', borderRadius: '2px', zIndex: 20,
                  transition: 'opacity 0.4s ease-out', opacity: exitOpacity,
                }} />
            )}

            {/* Mount label */}
            <div style={{ position: 'absolute', bottom: '6px', left: '50%', transform: 'translateX(-50%)', fontSize: '8px', letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 500,
              color: theme === 'dark' ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.12)', fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif' }}>
              <span translate="no">{displayPhoto.location || 'Lumina Pro Vision'}</span>
            </div>
          </div>
        </div>

        {/* --- DETAILS PANEL --- */}
        <div className={`w-full md:w-[400px] lg:w-[450px] overflow-y-auto no-scrollbar bg-white/80 dark:bg-[#1c1c1e]/80 backdrop-blur-xl border-white/20 dark:border-white/5 md:h-full md:border-l md:static md:flex md:flex-col md:gap-8 md:p-12 absolute bottom-0 left-0 right-0 max-h-[40vh] md:max-h-none rounded-t-3xl md:rounded-none border-t md:border-t-0 p-5 md:p-6 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] dark:shadow-[0_-4px_20px_rgba(0,0,0,0.5)] md:shadow-none`}
          style={{ paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom, 0px))', animation: modalPhase === 'entering' ? 'panelSlideIn 0.5s cubic-bezier(0.4, 0, 0.2, 1) 0.25s forwards' : 'none', opacity: modalPhase === 'entering' ? 0 : 1 }}>

          <div className="md:hidden flex justify-center -mt-2 mb-4"><div className={`w-10 h-1 rounded-full ${theme === 'dark' ? 'bg-white/20' : 'bg-black/20'}`} /></div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-[10px] text-apple-gray dark:text-gray-500 font-medium tracking-[0.25em] uppercase">{displayPhoto.category}</p>
              {(hasPrev !== undefined || hasNext !== undefined) && (
                <span className="tabular-nums text-[11px] text-apple-gray/60 dark:text-gray-500/60 font-mono tracking-tight">{currentIndex !== undefined && currentIndex >= 0 ? currentIndex + 1 : ''} / {totalCount}</span>
              )}
            </div>
            <h2 id="modal-photo-title" className="text-2xl md:text-3xl lg:text-4xl font-light text-apple-dark dark:text-white leading-[1.15] tracking-tight">{displayPhoto.title}</h2>
          </div>

          <div className="space-y-5 py-6 border-t border-gray-200/40 dark:border-white/[0.06]">
            <div className="flex gap-8">
              <div className="flex flex-col gap-1"><span className="text-[10px] text-apple-gray/60 dark:text-gray-500/60 uppercase tracking-[0.15em] font-medium">{t.modal.iso}</span><span className="text-sm font-medium text-apple-dark dark:text-white tabular-nums">{displayPhoto.iso || 'ISO 200'}</span></div>
              <div className="flex flex-col gap-1"><span className="text-[10px] text-apple-gray/60 dark:text-gray-500/60 uppercase tracking-[0.15em] font-medium">{t.modal.focal}</span><span className="text-sm font-medium text-apple-dark dark:text-white">{displayPhoto.focalLength || '35mm'}</span></div>
              <div className="flex flex-col gap-1"><span className="text-[10px] text-apple-gray/60 dark:text-gray-500/60 uppercase tracking-[0.15em] font-medium">{t.modal.year}</span><span className="text-sm font-medium text-apple-dark dark:text-white tabular-nums">{displayPhoto.year || '2024'}</span></div>
            </div>
            <div className="flex flex-col gap-1"><span className="text-[10px] text-apple-gray/60 dark:text-gray-500/60 uppercase tracking-[0.15em] font-medium flex items-center gap-1.5"><MapPin size={10} strokeWidth={1.5} /> {t.modal.location}</span><span className="text-sm font-light text-apple-dark/80 dark:text-white/70 leading-relaxed">{displayPhoto.location || 'Unknown Location'}</span></div>
          </div>

          <div className="mt-auto pt-8 pb-4 md:pb-16">
            <button onClick={handleDownload} disabled={downloadState === 'loading'}
              className={`w-full py-4 rounded-full font-medium text-sm tracking-wide flex items-center justify-center gap-3 transition-[transform,background-color,box-shadow] duration-300 ${downloadState === 'done' ? 'bg-emerald-600 text-white' : 'bg-apple-dark dark:bg-white text-white dark:text-black hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl'}`}>
              {downloadState === 'loading' ? <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
               : downloadState === 'done' ? <><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>{t.modal.downloaded}</>
               : <><Download size={16} strokeWidth={1.5} />{t.modal.download}</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhotoDetailModal;
