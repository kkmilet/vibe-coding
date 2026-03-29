
import { Photo, PhotoCategory, Translations } from './types';

export const NAV_LINKS = [
  { label: 'portfolio', href: '#portfolio' },
  { label: 'series', href: '#series' },
  { label: 'archive', href: '#archive' },
  { label: 'about', href: '#about' },
  { label: 'contact', href: '#contact' },
];

export const TRANSLATIONS: Record<string, Translations> = {
  en: {
    nav: { portfolio: 'Portfolio', series: 'Series', archive: 'Archive', about: 'About', contact: 'Contact' },
    hero: { title: 'Capture', subtitle: 'Invisible.', desc: 'A study of light, shadow, and the silence between them.', button: 'View Works' },
    grid: { header: 'Selected Works', seriesHeader: 'Featured Series' },
    archive: { title: 'The Archive', subtitle: 'Fragments organized by time and space.', modeTime: 'Timeline', modeLocation: 'Atlas', allYears: 'All Years', allLocations: 'Global' },
    modal: { category: 'Category', download: 'Download Original', iso: 'ISO', focal: 'Lens', year: 'Year', location: 'Location' },
    about: { 
      philosophy: 'The Philosophy', 
      title: 'Obsessed with', 
      subtitle: 'silence.', 
      p1: 'Photography is not about looking, it’s about feeling. If you can’t feel what you’re looking at, then you’re never going to get others to feel anything when they look at your pictures.',
      p2: 'I strive to strip away the noise, leaving only the essential geometry of light and the raw emotion of the moment.',
      years: '12', exhibitions: '56', yearsLabel: 'Years Active', exhibitionsLabel: 'Exhibitions'
    },
    footer: { rights: 'All rights reserved.', designed: 'Designed with precision.' }
  },
  zh: {
    nav: { portfolio: '作品集', series: '系列', archive: '归档', about: '关于', contact: '联系' },
    hero: { title: '捕捉', subtitle: '无形之美', desc: '对光影的研习，以及其间的静默。', button: '鉴赏作品' },
    grid: { header: '精选辑', seriesHeader: '专题系列' },
    archive: { title: '影像归档', subtitle: '按时间与空间整理的记忆碎片。', modeTime: '时间轴', modeLocation: '地理图集', allYears: '全部年份', allLocations: '全球足迹' },
    modal: { category: '分类', download: '下载原图', iso: '感光度', focal: '焦距', year: '拍摄年份', location: '拍摄地点' },
    about: { 
      philosophy: '创作哲学', 
      title: '沉溺于', 
      subtitle: '静。', 
      p1: '摄影不在于观看，而在于感受。如果你无法感受你所拍摄的，那么观者也永远无法从你的照片中感受到任何东西。',
      p2: '我致力于剥离喧嚣，只留下光线的本质几何与瞬间的原始情感。',
      years: '12', exhibitions: '56', yearsLabel: '从业年限', exhibitionsLabel: '个展记录'
    },
    footer: { rights: '版权所有', designed: '以精密设计铸造。' }
  }
};

export const PORTFOLIO_ITEMS: Photo[] = [
  {
    id: 1,
    url: "https://picsum.photos/seed/arch1/1000/1500", 
    title: "Structure & Void",
    category: PhotoCategory.Architecture,
    width: 1000,
    height: 1500,
    iso: "ISO 200",
    focalLength: "35mm",
    year: 2023,
    location: "Tokyo, Japan"
  },
  {
    id: 2,
    url: "https://picsum.photos/seed/port1/1600/900", 
    title: "Silent Gaze",
    category: PhotoCategory.Portrait,
    width: 1600,
    height: 900,
    iso: "ISO 800",
    focalLength: "85mm",
    year: 2024,
    location: "Paris, France"
  },
  {
    id: 3,
    url: "https://picsum.photos/seed/land1/1200/1200", 
    title: "Morning Mist",
    category: PhotoCategory.Landscape,
    width: 1200,
    height: 1200,
    iso: "ISO 100",
    focalLength: "24mm",
    year: 2022,
    location: "Kyoto, Japan"
  },
  {
    id: 4,
    url: "https://picsum.photos/seed/abs1/1000/1200", 
    title: "Neon Dreams",
    category: PhotoCategory.Abstract,
    width: 1000,
    height: 1200,
    iso: "ISO 3200",
    focalLength: "50mm",
    year: 2023,
    location: "Hong Kong"
  },
  {
    id: 5,
    url: "https://picsum.photos/seed/street1/1500/1000", 
    title: "Urban Solitude",
    category: PhotoCategory.Street,
    width: 1500,
    height: 1000,
    iso: "ISO 400",
    focalLength: "35mm",
    year: 2024,
    location: "New York, USA"
  },
  {
    id: 6,
    url: "https://picsum.photos/seed/arch2/900/1600", 
    title: "Concrete Waves",
    category: PhotoCategory.Architecture,
    width: 900,
    height: 1600,
    iso: "ISO 100",
    focalLength: "16mm",
    year: 2021,
    location: "Berlin, Germany"
  },
  {
    id: 7,
    url: "https://picsum.photos/seed/nature5/1200/800",
    title: "Ephemeral",
    category: PhotoCategory.Landscape,
    width: 1200,
    height: 800,
    iso: "ISO 50",
    focalLength: "70mm",
    year: 2022,
    location: "Reykjavik, Iceland"
  },
  {
    id: 8,
    url: "https://picsum.photos/seed/bw1/1000/1000",
    title: "Monochrome Study",
    category: PhotoCategory.Abstract,
    width: 1000,
    height: 1000,
    iso: "ISO 1600",
    focalLength: "50mm",
    year: 2021,
    location: "London, UK"
  },
   {
    id: 9,
    url: "https://picsum.photos/seed/port99/800/1200",
    title: "The Observer",
    category: PhotoCategory.Portrait,
    width: 800,
    height: 1200,
    iso: "ISO 400",
    focalLength: "85mm",
    year: 2024,
    location: "Seoul, Korea"
  }
];

export const HERO_IMAGE = "https://picsum.photos/seed/hero_dark/1920/1080";
