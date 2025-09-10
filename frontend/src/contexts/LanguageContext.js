// frontend/src/contexts/LanguageContext.js
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const DEFAULT_LANGUAGE = 'en';

export const LanguageContext = createContext({
  language: DEFAULT_LANGUAGE,
  setLanguage: () => {},
  t: (key) => key,
});

export const useLanguage = () => useContext(LanguageContext);

const translations = {
  en: {
    logout: 'Logout',
    theme: 'Theme',
    currency: 'Currency',
    language: 'Language',
    security: 'Security',
    changePassword: 'Change Password',
    enable2FA: 'Enable 2FA',
    disable2FA: 'Disable 2FA',
    totalTransactions: 'Total transactions (month)',
    totalBalance: 'Total balance',
    lastLogin: 'Last login',
    uploadPhoto: 'Upload Photo',
    removePhoto: 'Remove Photo',
  },
  hi: {
    logout: 'लॉगआउट',
    theme: 'थीम',
    currency: 'मुद्रा',
    language: 'भाषा',
    security: 'सुरक्षा',
    changePassword: 'पासवर्ड बदलें',
    enable2FA: '2FA सक्षम करें',
    disable2FA: '2FA अक्षम करें',
    totalTransactions: 'कुल लेनदेन (महीना)',
    totalBalance: 'कुल शेष',
    lastLogin: 'अंतिम लॉगिन',
    uploadPhoto: 'फोटो अपलोड करें',
    removePhoto: 'फोटो हटाएं',
  },
  te: {
    logout: 'లాగ్ అవుట్',
    theme: 'థీమ్',
    currency: 'కరెన్సీ',
    language: 'భాష',
    security: 'భద్రత',
    changePassword: 'పాస్‌వర్డ్ మార్చండి',
    enable2FA: '2FA ప్రారంభించండి',
    disable2FA: '2FA నిలిపివేయండి',
    totalTransactions: 'మొత్తం లావాదేవీలు (నెల)',
    totalBalance: 'మొత్తం బ్యాలెన్స్',
    lastLogin: 'చివరి లాగిన్',
    uploadPhoto: 'ఫోటో అప్లోడ్ చేయండి',
    removePhoto: 'ఫోటో తొలగించండి',
  },
};

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => localStorage.getItem('language') || DEFAULT_LANGUAGE);

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const t = useMemo(() => {
    const dict = translations[language] || translations.en;
    return (key) => dict[key] || key;
  }, [language]);

  const value = useMemo(() => ({ language, setLanguage, t }), [language, t]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}


