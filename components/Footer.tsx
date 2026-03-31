
import React, { useEffect, useState } from 'react';
import { useApp } from '../context';
import { ArrowUp } from 'lucide-react';
import { useHeroEntrance } from './animations';

const Footer: React.FC = () => {
  const { t } = useApp();
  const [showScrollTop, setShowScrollTop] = useState(false);
  const { ref, isVisible } = useHeroEntrance(0);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 500);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer id="contact" className="bg-apple-bg dark:bg-black pb-40 md:pb-12 pt-24 text-apple-gray text-xs md:text-sm font-light transition-colors duration-500 border-t border-gray-200 dark:border-white/5 relative">
      <div ref={ref} className={`anim-fade-up ${isVisible ? 'is-visible' : ''}`}>
        <div className="max-w-[1800px] mx-auto px-6 md:px-12 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col items-center md:items-start gap-2" style={{ '--stagger-index': 0 } as React.CSSProperties}>
           <span className="text-apple-dark dark:text-white font-medium tracking-tight">Lumina Photography</span>
           <span className="opacity-50">{t.footer.designed}</span>
        </div>
        
        <div className="flex gap-8" style={{ '--stagger-index': 1 } as React.CSSProperties}>
          <a href="#" className="hover:text-apple-dark dark:hover:text-white transition-colors">Instagram</a>
          <a href="#" className="hover:text-apple-dark dark:hover:text-white transition-colors">Twitter</a>
          <a href="mailto:contact@lumina.art" className="hover:text-apple-dark dark:hover:text-white transition-colors">Email</a>
        </div>

        <div className="opacity-30" style={{ '--stagger-index': 2 } as React.CSSProperties}>
          © {new Date().getFullYear()} {t.footer.rights}
        </div>
        </div>
      </div>

      {/* Floating Back to Top Button - adjusted bottom position for mobile dock */}
      <button
        onClick={scrollToTop}
        className={`fixed bottom-36 md:bottom-8 right-6 md:right-8 p-3.5 rounded-full bg-white dark:bg-white/10 shadow-lg backdrop-blur-md border border-gray-100 dark:border-white/5 text-apple-dark dark:text-white transition-all duration-500 ease-fluid z-40 group ${
          showScrollTop ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0 pointer-events-none'
        } hover:scale-110 active:scale-95 hover:shadow-xl`}
        aria-label="Back to top"
      >
        <ArrowUp size={20} strokeWidth={1.5} className="transition-transform duration-300 group-hover:-translate-y-1" />
      </button>
    </footer>
  );
};

export default Footer;
