
export interface Photo {
  id: number;
  url: string;
  title: string;
  category: string;
  width: number; 
  height: number; 
  iso?: string;
  focalLength?: string;
  year?: number;
  location?: string;
}

export enum PhotoCategory {
  Landscape = "Landscape",
  Portrait = "Portrait",
  Abstract = "Abstract",
  Architecture = "Architecture",
  Street = "Street"
}

export type Language = 'en' | 'zh';
export type Theme = 'light' | 'dark';

export type Translations = {
  nav: {
    portfolio: string;
    series: string;
    archive: string;
    about: string;
    contact: string;
  };
  hero: {
    title: string;
    subtitle: string;
    desc: string;
    button: string;
  };
  grid: {
    header: string;
    seriesHeader: string;
  };
  archive: {
    title: string;
    subtitle: string;
    modeTime: string;
    modeLocation: string;
    allYears: string;
    allLocations: string;
  };
  modal: {
    category: string;
    download: string;
    iso: string;
    focal: string;
    year: string;
    location: string;
  };
  about: {
    philosophy: string;
    title: string;
    subtitle: string;
    p1: string;
    p2: string;
    years: string;
    exhibitions: string;
    yearsLabel: string;
    exhibitionsLabel: string;
  };
  footer: {
    rights: string;
    designed: string;
  }
};
