import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { en, TranslationKey } from '../locales/en';
import { mr } from '../locales/mr';

export type Language = 'en' | 'mr';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey, fallback?: string) => string;
  formatCurrency: (amount: number | string | null | undefined) => string;
  formatNumber: (num: number | string | null | undefined) => string;
  formatDate: (date: string | Date | null | undefined) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = 'pikmoolya_web_lang';

const dictionaries: Record<Language, Record<TranslationKey, string>> = {
  en,
  mr,
};

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'en' || saved === 'mr') {
        return saved;
      }
    } catch (e) {
      // localStorage unavailable or private browsing
    }
    return 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch (e) {
      console.log('Unable to save language preference:', e);
    }
    // Update document lang
    document.documentElement.lang = lang;
  };

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const t = (key: TranslationKey, fallback?: string): string => {
    const dict = dictionaries[language] || dictionaries.en;
    return dict[key] || dictionaries.en[key] || fallback || key;
  };

  const formatCurrency = (amount: number | string | null | undefined): string => {
    if (amount === null || amount === undefined || amount === '') return '₹0';
    const num = Number(amount);
    if (!Number.isFinite(num)) return '₹0';
    if (language === 'mr') {
      return `₹${num.toLocaleString('mr-IN', { maximumFractionDigits: 2 })}`;
    }
    return `₹${num.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
  };

  const formatNumber = (numVal: number | string | null | undefined): string => {
    if (numVal === null || numVal === undefined || numVal === '') return '0';
    const num = Number(numVal);
    if (!Number.isFinite(num)) return '0';
    if (language === 'mr') {
      return num.toLocaleString('mr-IN');
    }
    return num.toLocaleString('en-IN');
  };

  const formatDate = (dateVal: string | Date | null | undefined): string => {
    if (!dateVal) return '';
    try {
      const d = new Date(dateVal);
      if (isNaN(d.getTime())) return String(dateVal);
      if (language === 'mr') {
        return d.toLocaleDateString('mr-IN', { day: 'numeric', month: 'short', year: 'numeric' });
      }
      return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch {
      return String(dateVal);
    }
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t,
        formatCurrency,
        formatNumber,
        formatDate,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
