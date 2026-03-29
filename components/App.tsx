
import React, { useState } from 'react';
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

  const portfolioItems = PORTFOLIO_ITEMS.slice(0, 5);
  const seriesItems = PORTFOLIO_ITEMS.slice(5);

  return (
    <div className="bg-apple-bg dark:bg-black min-h-screen text-apple-dark dark:text-white font-sans transition-colors duration-500">
      <NavBar />
      <main>
        <Hero />
        <div className="relative z-10">
           <BentoGrid 
             id="portfolio" 
             title={t.grid.header} 
             items={portfolioItems} 
             onPhotoClick={setSelectedPhoto}
           />
           <BentoGrid 
             id="series" 
             title={t.grid.seriesHeader} 
             items={seriesItems} 
             onPhotoClick={setSelectedPhoto}
           />
           <Archive 
             items={PORTFOLIO_ITEMS} 
             onPhotoClick={setSelectedPhoto}
           />
           <About />
        </div>
      </main>
      <Footer />

      <PhotoDetailModal 
        photo={selectedPhoto} 
        onClose={() => setSelectedPhoto(null)} 
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
