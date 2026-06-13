
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import './styles/scroll-animations.css';
import './styles/noise-texture.css';
import NavBar from './components/NavBar';
import Hero from './components/Hero';
import BentoGrid from './components/BentoGrid';
import Archive from './components/Archive';
import About from './components/About';
import Footer from './components/Footer';
import PhotoDetailModal from './components/PhotoDetailModal';
import { AppProvider, useApp } from './context';
import { PORTFOLIO_ITEMS } from './constants';
import { Photo } from './types';

const Content: React.FC = () => {
  const { t } = useApp();
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  // Split items to create two sections for demonstration
  const portfolioItems = useMemo(() => PORTFOLIO_ITEMS.slice(0, 5), []);
  const seriesItems = useMemo(() => PORTFOLIO_ITEMS.slice(5), []);

  // Search filtering
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return PORTFOLIO_ITEMS;
    const q = searchQuery.toLowerCase();
    return PORTFOLIO_ITEMS.filter(p =>
      p.title.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      (p.location && p.location.toLowerCase().includes(q)) ||
      (p.year && p.year.toString().includes(q))
    );
  }, [searchQuery]);

  const filteredPortfolio = useMemo(() => {
    return filteredItems.filter(p => portfolioItems.some(pi => pi.id === p.id));
  }, [filteredItems, portfolioItems]);

  const filteredSeries = useMemo(() => {
    return filteredItems.filter(p => seriesItems.some(si => si.id === p.id));
  }, [filteredItems, seriesItems]);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const el = document.documentElement;
          const scrollTop = el.scrollTop || document.body.scrollTop;
          const scrollHeight = el.scrollHeight - el.clientHeight;
          setScrollProgress(scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Retain references to prefetched Image objects so GC doesn't cancel them
  const prefetchRef = useRef<HTMLImageElement[]>([]);

  // Prefetch adjacent photos when a photo is selected (preload 2 ahead, 2 behind)
  useEffect(() => {
    if (!selectedPhoto) return;
    const idx = PORTFOLIO_ITEMS.findIndex(p => p.id === selectedPhoto.id);
    const images: HTMLImageElement[] = [];
    for (let i = 1; i <= 2; i++) {
      const next = PORTFOLIO_ITEMS[idx + i];
      const prev = PORTFOLIO_ITEMS[idx - i];
      if (next) { const img = new Image(); img.src = next.url; images.push(img); }
      if (prev) { const img = new Image(); img.src = prev.url; images.push(img); }
    }
    prefetchRef.current = images;
  }, [selectedPhoto]);

  const handlePhotoClick = useCallback((photo: Photo) => {
    setSelectedPhoto(photo);
  }, []);

  const handleClose = useCallback(() => {
    setSelectedPhoto(null);
  }, []);

  // Navigation uses filtered items when search is active, all items otherwise
  const navItems = searchQuery.trim() ? filteredItems : PORTFOLIO_ITEMS;

  // Keyboard navigation between photos
  const handlePrevPhoto = useCallback(() => {
    if (!selectedPhoto) return;
    const idx = navItems.findIndex(p => p.id === selectedPhoto.id);
    const prev = navItems[idx - 1];
    if (prev) setSelectedPhoto(prev);
  }, [selectedPhoto, navItems]);

  const handleNextPhoto = useCallback(() => {
    if (!selectedPhoto) return;
    const idx = navItems.findIndex(p => p.id === selectedPhoto.id);
    const next = navItems[idx + 1];
    if (next) setSelectedPhoto(next);
  }, [selectedPhoto, navItems]);

  return (
    <div className="bg-gray-50 dark:bg-black min-h-screen text-gray-900 dark:text-white font-sans transition-colors duration-500">
      {/* Skip to content — accessibility */}
      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[99999] focus:px-6 focus:py-3 focus:bg-white dark:focus:bg-black focus:text-apple-dark dark:focus:text-white focus:rounded-full focus:shadow-2xl focus:outline-none focus:ring-2 focus:ring-apple-blue">
        Skip to content
      </a>

      {/* Scroll Progress Bar — thicker, rounded capsule */}
      <div className="fixed top-0 left-0 z-[9999] h-[2px] bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transition-all duration-150 rounded-full"
        style={{ width: `${scrollProgress}%` }} />

      <NavBar onSearch={setSearchQuery} />
      <main id="main-content">
        <Hero />
        {/* Section Transition — smooth gradient bridge from Hero to content */}
        <div className="h-16 md:h-24 bg-gradient-to-b from-transparent via-transparent to-apple-bg dark:to-black pointer-events-none" />
        {searchQuery.trim() && (
          <div className="bg-apple-bg dark:bg-black pt-28 pb-2 text-center transition-colors duration-500">
            <p className="text-sm text-apple-gray dark:text-gray-500">
              {filteredItems.length} {filteredItems.length === 1 ? 'result' : 'results'} for "{searchQuery}"
            </p>
          </div>
        )}
        <div className="relative z-10 noise-texture">
           {(searchQuery.trim() ? filteredPortfolio.length > 0 : true) && (
             <BentoGrid
               id="portfolio"
               title={t.grid.header}
               items={searchQuery.trim() ? filteredPortfolio : portfolioItems}
               onPhotoClick={handlePhotoClick}
               variant="primary"
             />
           )}
           {(searchQuery.trim() ? filteredSeries.length > 0 : true) && (
             <BentoGrid
               id="series"
               title={t.grid.seriesHeader}
               items={searchQuery.trim() ? filteredSeries : seriesItems}
               onPhotoClick={handlePhotoClick}
               variant="secondary"
             />
           )}
           <Archive
             items={filteredItems}
             onPhotoClick={handlePhotoClick}
           />
           {!searchQuery.trim() && <About />}
        </div>
      </main>
      <Footer />

      {/*
        Modal is now rendered at the root level.
        This ensures z-index: 5000 actually sits on top of NavBar (z-999).
      */}
      <PhotoDetailModal
        photo={selectedPhoto}
        onClose={handleClose}
        onPrev={handlePrevPhoto}
        onNext={handleNextPhoto}
        hasPrev={navItems.findIndex(p => p.id === selectedPhoto?.id) > 0}
        hasNext={navItems.findIndex(p => p.id === selectedPhoto?.id) < navItems.length - 1}
        currentIndex={selectedPhoto ? navItems.findIndex(p => p.id === selectedPhoto.id) : -1}
        totalCount={navItems.length}
      />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <Content />
    </AppProvider>
  );
};

export default App;
