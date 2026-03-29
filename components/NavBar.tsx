
import React, { useState, useEffect } from 'react';
import { NAV_LINKS } from '../constants';
import { Sun, Moon, Globe, Grid, Layers, Archive, User, Mail } from 'lucide-react';
import { useApp } from '../context';
import { Translations } from '../types';

const NavBar: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('');
    
  const { language, setLanguage, theme, toggleTheme, t } = useApp();

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 50;
      setScrolled(prev => {
        if (prev !== isScrolled) return isScrolled;
        return prev;
      });

      // Determine active section
      const scrollPosition = window.scrollY + 250; 
      
      const sections = NAV_LINKS.map(link => link.href.substring(1));
      
      let current = '';
      for (const sectionId of sections) {
        const element = document.getElementById(sectionId);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            current = sectionId;
          }
        }
      }
      setActiveSection(current);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial check
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const targetId = href.replace('#', '');
    const element = document.getElementById(targetId);
    
    if (element) {
      const headerOffset = 80; 
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
      
      setActiveSection(targetId);
    }
  };

  const getIconForLabel = (label: string) => {
    switch (label) {
      case 'portfolio': return <Grid size={22} strokeWidth={1.5} />;
      case 'series': return <Layers size={22} strokeWidth={1.5} />;
      case 'archive': return <Archive size={22} strokeWidth={1.5} />;
      case 'about': return <User size={22} strokeWidth={1.5} />;
      case 'contact': return <Mail size={22} strokeWidth={1.5} />;
      default: return <Grid size={22} />;
    }
  };

  return (
    <>
      {/* --- Desktop & Mobile Top Bar --- */}
      <nav
        className={`fixed top-0 left-0 right-0 z-[999] transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] border-b ${
          scrolled
            ? 'bg-white/80 dark:bg-black/70 backdrop-blur-xl py-4 border-gray-200/50 dark:border-white/5'
            : 'bg-transparent py-6 border-transparent'
        }`}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="max-w-[1800px] mx-auto px-6 md:px-12 flex items-center justify-between relative">
          {/* Minimal Logo */}
          <a
            href="#"
            onClick={(e) => handleNavClick(e, '#home')}
            className="text-lg tracking-tight text-apple-dark dark:text-white font-medium flex items-center gap-2 opacity-90 hover:opacity-100 transition-all duration-500 hover:scale-105"
            aria-label="Lumina Home"
          >
            <span className="relative">
              Lumina
              <span className="absolute inset-0 blur-xl bg-apple-blue/20 dark:bg-white/10 opacity-0 hover:opacity-100 transition-opacity duration-500 rounded-full" />
            </span>
          </a>

          {/* Desktop Menu - Center */}
          <div className="hidden md:flex items-center space-x-12">
            {NAV_LINKS.map((link) => {
              const isActive = activeSection === link.href.substring(1);
              return (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href)}
                  className={`text-xs uppercase tracking-widest font-medium transition-colors cursor-pointer relative group py-2 ${
                    isActive 
                      ? 'text-apple-dark dark:text-white' 
                      : 'text-apple-gray hover:text-apple-dark dark:text-gray-400 dark:hover:text-white'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {t.nav[link.label as keyof Translations['nav']]}
                  <span className={`absolute bottom-0 left-0 w-full h-[1px] bg-current transform origin-left transition-transform duration-300 ${isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-50'}`} />
                </a>
              );
            })}
          </div>

          {/* Top Right Actions (Visible on Mobile now too) */}
          <div className="flex items-center gap-4 md:gap-6">
             {/* Lang Toggle */}
             <button 
               onClick={() => setLanguage(language === 'en' ? 'zh' : 'en')}
               className="text-xs font-medium text-apple-gray dark:text-gray-400 hover:text-apple-dark dark:hover:text-white transition-colors flex items-center gap-1"
               aria-label="Switch Language"
             >
               <Globe size={14} />
               {language === 'en' ? 'ZH' : 'EN'}
             </button>

             {/* Theme Toggle */}
             <button 
               onClick={toggleTheme}
               className="text-apple-gray dark:text-gray-400 hover:text-apple-dark dark:hover:text-white transition-colors"
               aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
             >
               {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
             </button>
          </div>
        </div>

      </nav>

      {/* --- Mobile Bottom Dock Navigation --- */}
      <div className="md:hidden fixed bottom-8 left-4 right-4 z-[999] animate-slide-up delay-700 opacity-0" style={{ animationFillMode: 'forwards', paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <div className="bg-white/90 dark:bg-[#1a1a1a]/90 backdrop-blur-2xl border border-gray-200/50 dark:border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.12)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.5)] rounded-3xl px-2 py-3">
          <div className="grid grid-cols-5 place-items-center">
            {NAV_LINKS.map((link) => {
               const isActive = activeSection === link.href.substring(1);
               return (
                 <a
                   key={link.label}
                   href={link.href}
                   onClick={(e) => handleNavClick(e, link.href)}
                   className={`flex flex-col items-center justify-center w-full gap-1 transition-all duration-300 group ${
                     isActive 
                       ? 'text-apple-blue dark:text-white' 
                       : 'text-gray-400 dark:text-gray-500'
                   }`}
                   aria-label={t.nav[link.label as keyof Translations['nav']]}
                 >
                   <div className={`transition-all duration-300 ease-fluid ${isActive ? 'scale-110' : 'scale-100'}`}>
                      {getIconForLabel(link.label)}
                   </div>
                   <span className={`text-[9px] font-medium tracking-wide leading-none transition-all duration-300 ${
                      isActive 
                          ? 'opacity-100 font-semibold' 
                          : 'sr-only'
                   }`}>
                      {t.nav[link.label as keyof Translations['nav']]}
                   </span>
                 </a>
               );
            })}
          </div>
        </div>
      </div>
    </>
  );
};

export default NavBar;
