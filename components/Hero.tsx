
import React, { useEffect, useState, useRef, useMemo } from 'react';
import { PORTFOLIO_ITEMS } from '../constants';
import { useApp } from '../context';
import { Photo } from '../types';

const Hero: React.FC = () => {
  const { t } = useApp();
  const parallaxRef = useRef<HTMLImageElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [highResLoaded, setHighResLoaded] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  
  const [heroPhoto] = useState<Photo | null>(() => {
    if (PORTFOLIO_ITEMS.length === 0) return null;
    return PORTFOLIO_ITEMS[Math.floor(Math.random() * PORTFOLIO_ITEMS.length)];
  });

  const { thumbUrl, fullUrl } = useMemo(() => {
    if (!heroPhoto) return { thumbUrl: null, fullUrl: null };

    let base = heroPhoto.url;
    if (base.includes("picsum.photos")) {
         base = base.replace(/\/\d+\/\d+$/, '');
         return {
            thumbUrl: `${base}/200/120?blur=5`,
            fullUrl: `${base}/1600/900`
         };
    }
    return { thumbUrl: base, fullUrl: base };
  }, [heroPhoto]);

  const generateHeroSrcSet = (base: string) => {
    if (!base.includes("picsum.photos")) return '';
    const sizes = [800, 1600, 2400];
    return sizes
      .map(w => {
        const h = Math.round(w * 0.5625); // 16:9 aspect
        const resizedUrl = base.replace(/\/\d+\/\d+$/, `/${w}/${h}`);
        return `${resizedUrl} ${w}w`;
      })
      .join(', ');
  };

  useEffect(() => {
    const handleScroll = () => {
      if (parallaxRef.current) {
        const offset = window.scrollY;
        if (offset < window.innerHeight + 100) {
          parallaxRef.current.style.transform = `scale(1.1) translate3d(0, ${offset * 0.4}px, 0)`;
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    let lastUpdate = 0;
    const handleMouseMove = (e: MouseEvent) => {
      const now = performance.now();
      if (now - lastUpdate < 16) return; // ~60fps cap
      lastUpdate = now;
      if (!contentRef.current) return;
      const rect = contentRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const x = (e.clientX - centerX) / rect.width;
      const y = (e.clientY - centerY) / rect.height;
      setMousePos({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <section id="home" className="relative h-screen w-full overflow-hidden flex flex-col items-center justify-center bg-apple-bg dark:bg-black transition-colors duration-700">
      
      {/* Background Image Layer */}
      <div className="absolute inset-0 z-0 overflow-hidden bg-gray-900">
        {thumbUrl && (
            <img 
                src={thumbUrl}
                alt="background placeholder"
                className="absolute inset-0 w-full h-full object-cover object-center scale-110" 
                style={{ filter: 'blur(10px)' }} 
            />
        )}
        {fullUrl && (
          <img
            ref={parallaxRef}
            src={fullUrl}
            srcSet={generateHeroSrcSet(fullUrl || thumbUrl || '')}
            sizes="100vw"
            alt={heroPhoto?.title || "Hero Background"}
            onLoad={() => setHighResLoaded(true)}
            loading="eager"
            fetchPriority="high"
            className={`absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-1000 ease-out-expo will-change-transform ${
              highResLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            style={{ transform: 'scale(1.1)' }}
          />
        )}
        
        {/* Overlays */}
        <div className="absolute inset-0 bg-black/50 dark:bg-black/60 z-10 transition-colors duration-700" />
        {/* Gradient Blend: Blends into 'apple-bg' (#f5f5f7) for light mode, black for dark mode */}
        <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-[#f5f5f7] via-[#f5f5f7]/40 to-transparent dark:from-black dark:via-black/60 dark:to-transparent z-20 pointer-events-none transition-colors duration-700" />
      </div>

      {/* Content Layer */}
      <div ref={contentRef} className="relative z-30 text-center px-6 max-w-5xl mx-auto mt-0 mix-blend-normal flex flex-col items-center transition-transform duration-200 ease-out"
           style={{ transform: `translate(${mousePos.x * 10}px, ${mousePos.y * 6}px)` }}>
        
        <div className="overflow-visible mb-4 md:mb-6 min-h-[3.5rem] md:min-h-[6rem] lg:min-h-[7rem]">
          <h1 className="text-6xl md:text-8xl lg:text-9xl font-bold tracking-tighter text-white drop-shadow-2xl leading-[0.9] md:leading-[0.9] animate-blur-in opacity-0"
              style={{ animationDelay: '300ms', animationFillMode: 'forwards' }}>
            {t.hero.title}
          </h1>
        </div>
        
        <div className="overflow-visible mb-10 min-h-[2.5rem] md:min-h-[4rem]">
           <span className="block text-4xl md:text-6xl lg:text-7xl font-light text-white/90 animate-blur-in opacity-0"
               style={{ animationDelay: '800ms', animationFillMode: 'forwards' }}>
             {t.hero.subtitle}
           </span>
        </div>

        <div className="min-h-[3rem] md:min-h-[4rem] max-w-2xl mx-auto mb-12">
          <p className="text-xl md:text-2xl text-white/90 font-light leading-relaxed tracking-wide drop-shadow-md animate-blur-in opacity-0"
              style={{ animationDelay: '1300ms', animationFillMode: 'forwards' }}>
            {t.hero.desc}
          </p>
        </div>
        
        <div className="flex flex-col items-center gap-8">
          {/* Button */}
          <div className="flex gap-6 justify-center items-center animate-slide-up" style={{ animationDelay: '1800ms', opacity: 0, animationFillMode: 'forwards' }}>
            <button
              onClick={() => document.getElementById('portfolio')?.scrollIntoView({ behavior: 'smooth' })}
              className="group relative px-10 py-4 border border-white/60 text-white rounded-full font-medium overflow-hidden transition-all duration-500 ease-fluid hover:scale-105 hover:border-white hover:bg-white/10 backdrop-blur-sm"
            >
              {/* Shine sweep effect on hover */}
              <span className="absolute inset-0 translate-x-[-100%] group-hover:animate-shineSweep opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              {/* Subtle glow effect on hover */}
              <span className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <span className="absolute inset-0 bg-white/10 animate-ping [animation-duration:2s]" />
              </span>
              <span className="relative z-10 tracking-wide">{t.hero.button}</span>
            </button>
          </div>

          {/* Scroll indicator with breathing animation */}
          <div className="animate-slide-up" style={{ animationDelay: '2400ms', opacity: 0, animationFillMode: 'forwards' }}>
            <div className="flex flex-col items-center gap-3 text-white/90">
              <span className="text-[11px] uppercase tracking-[0.3em] font-medium animate-[breathing_3s_ease-in-out_infinite]">Scroll</span>
              <div className="w-[1px] h-12 bg-gradient-to-b from-white/90 to-transparent relative overflow-hidden">
                <div className="w-full h-1/2 bg-white animate-[subtleSlideDown_2s_ease-in-out_infinite]" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {heroPhoto && (
         <div className={`absolute bottom-8 right-8 z-30 text-[10px] md:text-xs font-mono tracking-widest text-apple-dark/40 dark:text-white/30 animate-fade-in hidden md:block transition-opacity duration-1000 ${highResLoaded ? 'opacity-100' : 'opacity-0'}`}>
            FEATURED: {heroPhoto.title.toUpperCase()}
         </div>
      )}
    </section>
  );
};

export default Hero;
