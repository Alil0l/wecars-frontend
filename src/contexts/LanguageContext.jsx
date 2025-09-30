import { createContext, useContext, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const LanguageContext = createContext(null);

export const LanguageProvider = ({ children }) => {
  const { i18n } = useTranslation();
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('language') || i18n.language || 'en';
  });

  // RTL languages configuration
  const rtlLanguages = ['ar', 'he', 'fa', 'ur'];

  const changeLanguage = (lang) => {
    setLanguage(lang);
    i18n.changeLanguage(lang);
    localStorage.setItem('language', lang);
    
    // Update document direction and language
    const isRTL = rtlLanguages.includes(lang);
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
    
    // Update body class for RTL styling
    document.body.classList.toggle('rtl', isRTL);
    document.body.classList.toggle('ltr', !isRTL);
  };

  // Initialize direction on mount
  useEffect(() => {
    const isRTL = rtlLanguages.includes(language);
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
    document.body.classList.toggle('rtl', isRTL);
    document.body.classList.toggle('ltr', !isRTL);
    i18n.changeLanguage(language);
  }, [language]);

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'ar', name: 'العربية', flag: '🇦🇪' },
  ];

  const isRTL = rtlLanguages.includes(language);

  return (
    <LanguageContext.Provider value={{ 
      language, 
      changeLanguage, 
      languages,
      isRTL,
      rtlLanguages
    }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
