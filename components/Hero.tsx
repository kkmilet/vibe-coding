
import React, { useEffect, useState, useRef, useMemo } from 'react';
import { PORTFOLIO_ITEMS } from '../constants';
import { useApp } from '../context';
import { Photo } from '../types';

const Hero: React.FC = () => {
  const { t } = useApp();
  const contentRef = useRef<HTMLDivElement>(null);
  const [highResLoaded, setHighResLoaded] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [parallaxY, setParallaxY] = useState(0);
  
  // Deterministic hero photo — always use the best landscape-oriented photo
  const heroPhoto = useMemo<Photo | null>(() => {
    if (PORTFOLIO_ITEMS.length === 0) return null;
    // Prefer landscape photos for hero, with a stable fallback
    const landscapes = PORTFOLIO_ITEMS.filter(p => p.width > p.height);
    return landscapes.length > 0 ? landscapes[0] : PORTFOLIO_ITEMS[0];
  }, []);

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
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const offset = window.scrollY;
          if (offset < window.innerHeight + 100) {
            setParallaxY(offset * 0.4);
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    let lastUpdate = 0;
    let cachedRect: DOMRect | null = null;
    let rectTimestamp = 0;
    const handleMouseMove = (e: MouseEvent) => {
      const now = performance.now();
      if (now - lastUpdate < 16) return;
      lastUpdate = now;
      if (!contentRef.current) return;
      // Cache getBoundingClientRect for 200ms to avoid layout thrashing
      if (!cachedRect || now - rectTimestamp > 200) {
        cachedRect = contentRef.current.getBoundingClientRect();
        rectTimestamp = now;
      }
      // Disable parallax on touch devices (no mouse)
      if (!('onmousemove' in window) || !matchMedia('(pointer: fine)').matches) return;
      const centerX = cachedRect.left + cachedRect.width / 2;
      const centerY = cachedRect.top + cachedRect.height / 2;
      const x = (e.clientX - centerX) / cachedRect.width;
      const y = (e.clientY - centerY) / cachedRect.height;
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
            src={fullUrl}
            srcSet={generateHeroSrcSet(fullUrl || thumbUrl || '')}
            sizes="100vw"
            alt={heroPhoto?.title || "Hero Background"}
            width={heroPhoto?.width}
            height={heroPhoto?.height}
            onLoad={() => setHighResLoaded(true)}
            loading="eager"
            fetchPriority="high"
            className={`absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-1000 ease-out-expo ${
              highResLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            style={{ transform: `scale(1.1) translate3d(0, ${parallaxY}px, 0)` }}
          />
        )}
        
        {/* Overlays */}
        <div className="absolute inset-0 bg-black/50 dark:bg-black/60 z-10 transition-colors duration-700" />
        {/* Gradient Blend: Blends into 'apple-bg' (#f5f5f7) for light mode, black for dark mode */}
        <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-[#f5f5f7] via-[#f5f5f7]/40 to-transparent dark:from-black dark:via-black/60 dark:to-transparent z-20 pointer-events-none transition-colors duration-700" />
      </div>

      {/* Content Layer */}
      <div ref={contentRef} className="relative z-30 text-center px-6 max-w-5xl mx-auto mt-0 mix-blend-normal flex flex-col items-center transition-transform duration-200 ease-out"
           style={{ transform: `translate(${mousePos.x * 28}px, ${mousePos.y * 15}px)` }}>
        
        <div className="overflow-visible mb-4 md:mb-6 min-h-[2.5rem] md:min-h-[5rem] lg:min-h-[6rem]">
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter text-white drop-shadow-2xl leading-[0.9] animate-blur-in opacity-0"
              style={{ animationDelay: '150ms', animationFillMode: 'forwards' }}>
            {t.hero.title}
          </h1>
        </div>

        <div className="overflow-visible mb-10 min-h-[2rem] md:min-h-[3rem]">
           <span className="block text-3xl md:text-5xl lg:text-6xl font-light text-white/90 animate-blur-in opacity-0"
               style={{ animationDelay: '400ms', animationFillMode: 'forwards' }}>
             {t.hero.subtitle}
           </span>
        </div>

        <div className="min-h-[2rem] md:min-h-[3rem] max-w-2xl mx-auto mb-12">
          <p className="text-lg md:text-xl text-white/90 font-light leading-relaxed tracking-wide drop-shadow-md animate-blur-in opacity-0"
              style={{ animationDelay: '650ms', animationFillMode: 'forwards' }}>
            {t.hero.desc}
          </p>
        </div>

        <div className="flex flex-col items-center gap-8">
          {/* Button */}
          <div className="flex gap-6 justify-center items-center animate-slide-up" style={{ animationDelay: '900ms', opacity: 0, animationFillMode: 'forwards' }}>
            <button
              onClick={() => document.getElementById('portfolio')?.scrollIntoView({ behavior: 'smooth' })}
              className="group relative px-8 md:px-10 py-3.5 md:py-4 border border-white/60 text-white rounded-full font-medium overflow-hidden transition-[transform,border-color,background-color] duration-500 ease-fluid hover:scale-105 hover:border-white hover:bg-white/10 backdrop-blur-sm"
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
          <div className="animate-slide-up" style={{ animationDelay: '1200ms', opacity: 0, animationFillMode: 'forwards' }}>
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
