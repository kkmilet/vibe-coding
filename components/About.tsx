
import React, { useEffect, useState, useRef } from 'react';
import { useApp } from '../context';
import { useScrollReveal } from './animations';

const useCountUp = (end: number, duration: number = 2000, start: number = 0, isVisible: boolean) => {
  const [count, setCount] = useState(start);
  const countRef = useRef(start);
  const frameRef = useRef<number>();

  useEffect(() => {
    if (!isVisible) return;

    const startTime = performance.now();
    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      countRef.current = Math.round(start + (end - start) * eased);
      setCount(countRef.current);

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      }
    };

    frameRef.current = requestAnimationFrame(animate);

    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [end, duration, start, isVisible]);

  return count;
};

const StatCounter = ({ value, label }: { value: string; label: string }) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const numericValue = parseInt(value, 10);
  const count = useCountUp(numericValue, 2000, 0, isVisible);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.5 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref}>
      <span className="block text-4xl font-semibold text-apple-dark dark:text-white mb-2 tabular-nums">
        {isVisible ? count : '0'}
      </span>
      <span className="text-xs text-apple-gray dark:text-gray-600 uppercase tracking-widest">{label}</span>
    </div>
  );
};

const About: React.FC = () => {
  const { t } = useApp();
  const [loaded, setLoaded] = useState(false);
  const { ref, isVisible } = useScrollReveal({ threshold: 0.1, once: true });

  return (
    <section id="about" ref={ref} className="py-40 bg-apple-bg dark:bg-black transition-colors duration-500">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">

          {/* Text Content */}
          <div className={`order-2 lg:order-1 anim-fade-up ${isVisible ? 'is-visible' : ''}`}>
            <p className="text-blue-600 dark:text-blue-500 text-xs font-bold uppercase tracking-[0.2em] mb-6" style={{ '--stagger-index': 0 } as React.CSSProperties}>
              {t.about.philosophy}
            </p>
            <h2 className="text-5xl md:text-7xl font-bold text-apple-dark dark:text-white tracking-tight mb-12 leading-[0.9] transition-colors duration-500" style={{ '--stagger-index': 1 } as React.CSSProperties}>
              {t.about.title} <br />
              <span className="text-gray-300 dark:text-white/20">{t.about.subtitle}</span>
            </h2>

            <div className="space-y-8 text-xl md:text-2xl text-apple-gray dark:text-gray-400 font-light leading-relaxed transition-colors duration-500" style={{ '--stagger-index': 2 } as React.CSSProperties}>
              <p>
                {t.about.p1}
              </p>
              <p className="text-gray-500 dark:text-gray-500" style={{ '--stagger-index': 3 } as React.CSSProperties}>
                {t.about.p2}
              </p>
            </div>

            <div className="mt-16 flex gap-16" style={{ '--stagger-index': 4 } as React.CSSProperties}>
              <StatCounter value={t.about.years} label={t.about.yearsLabel} />
              <StatCounter value={t.about.exhibitions} label={t.about.exhibitionsLabel} />
            </div>
          </div>

          {/* Visual Content - Frameless */}
          <div className="order-1 lg:order-2 relative group">
             <div className="relative overflow-hidden aspect-[3/4] opacity-90 dark:opacity-80 group-hover:opacity-100 transition-opacity duration-1000 shadow-2xl dark:shadow-none">
                {/* Placeholder - gray background while loading */}
                <div className="absolute inset-0 bg-gray-200 dark:bg-gray-800" />

                {/* Main image with fade-in on load */}
                <img
                  src="https://picsum.photos/seed/photographer/800/1000"
                  alt="Portrait of Photographer"
                  onLoad={() => setLoaded(true)}
                  className={`relative w-full h-full object-cover grayscale contrast-125 transition-opacity duration-500 ${loaded ? 'opacity-100' : 'opacity-0'}`}
                />

                {/* Gradient Fade at bottom of image: Matches theme */}
                <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-apple-bg dark:from-black to-transparent transition-colors duration-500"></div>
             </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default About;
