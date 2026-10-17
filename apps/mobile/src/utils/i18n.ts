import AsyncStorage from '@react-native-async-storage/async-storage';
import en from '../locales/en.json';
import mr from '../locales/mr.json';
import hi from '../locales/hi.json';

export type Language = 'en' | 'mr' | 'hi';

const translations: Record<Language, Record<string, string>> = {
  en,
  mr,
  hi,
};

const STORAGE_KEY = 'pikmoolya_language';

let currentLanguage: Language = 'en';
const listeners = new Set<(lang: Language) => void>();

export const getLanguage = (): Language => currentLanguage;

export const setLanguage = async (lang: Language) => {
  currentLanguage = lang;
  try {
    await AsyncStorage.setItem(STORAGE_KEY, lang);
  } catch (err) {
    console.log('Error saving language:', err);
  }
  listeners.forEach((listener) => listener(lang));
};

export const initLanguage = async (): Promise<Language> => {
  try {
    const saved = await AsyncStorage.getItem(STORAGE_KEY);
    if (saved && (saved === 'en' || saved === 'mr' || saved === 'hi')) {
      currentLanguage = saved as Language;
    }
  } catch (err) {
    console.log('Error initializing language:', err);
  }
  return currentLanguage;
};

export const subscribeLanguageChange = (listener: (lang: Language) => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

export const t = (key: string, lang?: Language): string => {
  const targetLang = lang || currentLanguage;
  const dict = translations[targetLang] || translations.en;
  return dict[key] || translations.en[key] || key;
};
