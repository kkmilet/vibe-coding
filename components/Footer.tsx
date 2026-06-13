
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
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer id="contact" className="bg-apple-bg dark:bg-black pb-40 md:pb-12 pt-24 text-apple-gray text-xs md:text-sm font-light transition-colors duration-500 border-t border-gray-200 dark:border-white/5 relative noise-texture">
      <div ref={ref} className={`anim-fade-up ${isVisible ? 'is-visible' : ''}`}>
        {/* Contact CTA */}
        <div className="max-w-[1800px] mx-auto px-6 md:px-12 mb-20 text-center">
          <p className="text-2xl md:text-4xl font-light text-apple-dark dark:text-white mb-4 tracking-tight" style={{ '--stagger-index': 0 } as React.CSSProperties}>
            Let&rsquo;s create something beautiful together.
          </p>
          <a
            href="mailto:hello@lumina.vision"
            className="inline-block mt-6 px-10 py-4 bg-apple-dark dark:bg-white text-white dark:text-black rounded-full font-medium text-sm tracking-wide hover:scale-105 active:scale-95 transition-[transform,box-shadow] duration-300 shadow-lg"
            style={{ '--stagger-index': 1 } as React.CSSProperties}
          >
            Get in Touch
          </a>
        </div>

        <div className="max-w-[1800px] mx-auto px-6 md:px-12 flex flex-col md:flex-row justify-between items-center gap-6 pt-12 border-t border-gray-200 dark:border-white/5">
          <div className="flex flex-col items-center md:items-start gap-2" style={{ '--stagger-index': 2 } as React.CSSProperties}>
           <span className="text-apple-dark dark:text-white font-medium tracking-tight">Lumina Photography</span>
           <span className="opacity-50">{t.footer.designed}</span>
        </div>

        <div className="flex gap-8" style={{ '--stagger-index': 3 } as React.CSSProperties}>
          <a href="https://instagram.com/luminaprovision" target="_blank" rel="noopener noreferrer" className="hover:text-apple-dark dark:hover:text-white transition-colors">Instagram</a>
          <a href="https://x.com/luminavision" target="_blank" rel="noopener noreferrer" className="hover:text-apple-dark dark:hover:text-white transition-colors">Twitter</a>
          <a href="mailto:hello@lumina.vision" className="hover:text-apple-dark dark:hover:text-white transition-colors">Email</a>
        </div>

        <div className="opacity-30" style={{ '--stagger-index': 4 } as React.CSSProperties}>
          © {new Date().getFullYear()} {t.footer.rights}
        </div>
        </div>
      </div>

      {/* Floating Back to Top Button - adjusted bottom position for mobile dock */}
      <button
        onClick={scrollToTop}
        className={`fixed bottom-36 md:bottom-8 right-6 md:right-8 p-3.5 rounded-full bg-white dark:bg-white/10 shadow-lg backdrop-blur-md border border-gray-100 dark:border-white/5 text-apple-dark dark:text-white transition-[opacity,transform] duration-500 ease-fluid z-40 group ${
          showScrollTop ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0 pointer-events-none'
        } hover:scale-110 active:scale-95 hover:shadow-xl`}
        style={{ marginBottom: 'env(safe-area-inset-bottom, 0px)' }}
        aria-label="Back to top"
      >
        <ArrowUp size={20} strokeWidth={1.5} className="transition-transform duration-300 group-hover:-translate-y-1" />
      </button>
    </footer>
  );
};

export default Footer;
