
import React, { useState, useEffect, useCallback } from 'react';
import './styles/scroll-animations.css';
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

  // Split items to create two sections for demonstration
  const portfolioItems = PORTFOLIO_ITEMS.slice(0, 5);
  const seriesItems = PORTFOLIO_ITEMS.slice(5);

  useEffect(() => {
    const handleScroll = () => {
      const el = document.documentElement;
      const scrollTop = el.scrollTop || document.body.scrollTop;
      const scrollHeight = el.scrollHeight - el.clientHeight;
      setScrollProgress(scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handlePhotoClick = useCallback((photo: Photo) => {
    setSelectedPhoto(photo);
  }, []);

  const handleClose = useCallback(() => {
    setSelectedPhoto(null);
  }, []);

  // Keyboard navigation between photos
  const handlePrevPhoto = useCallback(() => {
    if (!selectedPhoto) return;
    const idx = PORTFOLIO_ITEMS.findIndex(p => p.id === selectedPhoto.id);
    const prev = PORTFOLIO_ITEMS[idx - 1];
    if (prev) setSelectedPhoto(prev);
  }, [selectedPhoto]);

  const handleNextPhoto = useCallback(() => {
    if (!selectedPhoto) return;
    const idx = PORTFOLIO_ITEMS.findIndex(p => p.id === selectedPhoto.id);
    const next = PORTFOLIO_ITEMS[idx + 1];
    if (next) setSelectedPhoto(next);
  }, [selectedPhoto]);

  return (
    <div className="bg-gray-50 dark:bg-black min-h-screen text-gray-900 dark:text-white font-sans transition-colors duration-500">
      {/* Scroll Progress Bar */}
      <div className="fixed top-0 left-0 z-[9999] h-px bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transition-all duration-150"
        style={{ width: `${scrollProgress}%` }} />

      <NavBar />
      <main>
        <Hero />
        <div className="relative z-10">
           <BentoGrid
             id="portfolio"
             title={t.grid.header}
             items={portfolioItems}
             onPhotoClick={handlePhotoClick}
           />
           <BentoGrid
             id="series"
             title={t.grid.seriesHeader}
             items={seriesItems}
             onPhotoClick={handlePhotoClick}
           />
           <Archive
             items={PORTFOLIO_ITEMS}
             onPhotoClick={handlePhotoClick}
           />
           <About />
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
        hasPrev={PORTFOLIO_ITEMS.findIndex(p => p.id === selectedPhoto?.id) > 0}
        hasNext={PORTFOLIO_ITEMS.findIndex(p => p.id === selectedPhoto?.id) < PORTFOLIO_ITEMS.length - 1}
        currentIndex={selectedPhoto ? PORTFOLIO_ITEMS.findIndex(p => p.id === selectedPhoto.id) : -1}
        totalCount={PORTFOLIO_ITEMS.length}
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
