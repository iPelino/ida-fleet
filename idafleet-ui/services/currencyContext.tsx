
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Currency } from '../types';

// Initial default rates
const DEFAULT_RATES: Record<Currency, number> = {
  USD: 1,
  RWF: 1300,
  EUR: 0.92,
};

interface CurrencyContextType {
  displayCurrency: Currency;
  setDisplayCurrency: (c: Currency) => void;
  exchangeRates: Record<Currency, number>;
  updateRate: (currency: Currency, rate: number) => void;
  convert: (amount: number, from: Currency, to?: Currency) => number;
  format: (amount: number, currency?: Currency) => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [displayCurrency, setDisplayCurrency] = useState<Currency>('USD');
  const [exchangeRates, setExchangeRates] = useState<Record<Currency, number>>(DEFAULT_RATES);

  // Update a specific currency rate (relative to USD)
  const updateRate = (currency: Currency, rate: number) => {
    setExchangeRates(prev => ({
      ...prev,
      [currency]: rate
    }));
  };

  // Convert any amount from source currency to target currency (defaulting to global display currency)
  const convert = (amount: number, from: Currency, to: Currency = displayCurrency): number => {
    if (from === to) return amount;
    
    // Convert to Base (USD) first
    const amountInUSD = amount / exchangeRates[from];
    
    // Convert from Base to Target
    const convertedAmount = amountInUSD * exchangeRates[to];
    
    return convertedAmount;
  };

  // Format currency with proper localization
  const format = (amount: number, currency: Currency = displayCurrency): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0, // RWF usually doesn't show cents
      maximumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <CurrencyContext.Provider value={{ 
      displayCurrency, 
      setDisplayCurrency, 
      exchangeRates,
      updateRate,
      convert,
      format
    }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};
