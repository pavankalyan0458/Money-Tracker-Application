// frontend/src/contexts/CurrencyContext.js
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const DEFAULT_CURRENCY = 'USD';

export const CurrencyContext = createContext({
  currency: DEFAULT_CURRENCY,
  setCurrency: () => {},
  formatAmount: (amount) => `$${Number(amount || 0).toFixed(2)}`,
});

export const useCurrency = () => useContext(CurrencyContext);

const currencyToLocale = {
  USD: 'en-US',
  EUR: 'de-DE',
  INR: 'en-IN',
  GBP: 'en-GB',
  JPY: 'ja-JP',
};

export function CurrencyProvider({ children }) {
  const [currency, setCurrency] = useState(() => localStorage.getItem('currency') || DEFAULT_CURRENCY);

  useEffect(() => {
    localStorage.setItem('currency', currency);
  }, [currency]);

  const formatAmount = useMemo(() => {
    const locale = currencyToLocale[currency] || 'en-US';
    try {
      const formatter = new Intl.NumberFormat(locale, { style: 'currency', currency });
      return (amount) => formatter.format(Number(amount || 0));
    } catch {
      return (amount) => `${currency} ${Number(amount || 0).toFixed(2)}`;
    }
  }, [currency]);

  const value = useMemo(() => ({ currency, setCurrency, formatAmount }), [currency, formatAmount]);

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
}


