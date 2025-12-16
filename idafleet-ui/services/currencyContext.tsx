
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Currency } from '../types';
import { exchangeRates as exchangeRatesApi } from './api';

// Initial default rates (will be replaced by backend data)
const DEFAULT_RATES: Record<Currency, number> = {
  USD: 1,      // Base currency
  RWF: 1300,   // 1 USD = 1300 RWF
  EUR: 0.91,   // 1 USD = 0.91 EUR
};

interface CurrencyContextType {
  displayCurrency: Currency;
  setDisplayCurrency: (c: Currency) => void;
  exchangeRates: Record<Currency, number>;
  updateRate: (currency: Currency, rate: number) => void;
  convert: (amount: number, from: Currency, to?: Currency) => number;
  format: (amount: number, currency?: Currency) => string;
  loading: boolean;
  refreshRates: () => Promise<void>;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

const STORAGE_KEY_CURRENCY = 'ida_display_currency';
const STORAGE_KEY_RATES = 'ida_exchange_rates';
const STORAGE_KEY_RATES_CUSTOM = 'ida_custom_rates'; // Track if user has set custom rates

export const CurrencyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Initialize from localStorage if available
  const [displayCurrency, setDisplayCurrencyState] = useState<Currency>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_CURRENCY);
    return (saved as Currency) || 'USD';
  });

  const [exchangeRates, setExchangeRatesState] = useState<Record<Currency, number>>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_RATES);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return DEFAULT_RATES;
      }
    }
    return DEFAULT_RATES;
  });

  const [hasCustomRates, setHasCustomRates] = useState<boolean>(() => {
    return localStorage.getItem(STORAGE_KEY_RATES_CUSTOM) === 'true';
  });

  const [loading, setLoading] = useState(true);

  // Wrapper to persist displayCurrency to localStorage
  const setDisplayCurrency = (currency: Currency) => {
    setDisplayCurrencyState(currency);
    localStorage.setItem(STORAGE_KEY_CURRENCY, currency);
  };

  // Wrapper to persist exchange rates to localStorage
  const setExchangeRates = (rates: Record<Currency, number>) => {
    setExchangeRatesState(rates);
    localStorage.setItem(STORAGE_KEY_RATES, JSON.stringify(rates));
  };

  // Fetch exchange rates from backend (only if no custom rates are set)
  const fetchRates = async () => {
    // If user has set custom rates, don't overwrite with backend rates
    if (hasCustomRates) {
      setLoading(false);
      return;
    }

    try {
      const ratesMap = await exchangeRatesApi.getRatesMap();

      // Convert backend rates to our format (rates relative to USD)
      const newRates: Record<Currency, number> = {
        USD: 1, // Base currency
        RWF: 1300, // Default fallback
        EUR: 0.91, // Default fallback
      };

      // If we have USD rates from backend, use them
      if (ratesMap['USD']) {
        if (ratesMap['USD']['RWF']) {
          newRates.RWF = ratesMap['USD']['RWF'];
        }
        if (ratesMap['USD']['EUR']) {
          newRates.EUR = ratesMap['USD']['EUR'];
        }
      }

      setExchangeRates(newRates);
    } catch (error) {
      console.error('Failed to fetch exchange rates, using defaults:', error);
      // Keep using default/saved rates
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRates();
  }, []);

  // Update a specific currency rate (relative to USD) - marks as custom
  const updateRate = (currency: Currency, rate: number) => {
    const newRates = {
      ...exchangeRates,
      [currency]: rate
    };
    setExchangeRates(newRates);
    // Mark that user has set custom rates (won't be overwritten by backend)
    setHasCustomRates(true);
    localStorage.setItem(STORAGE_KEY_RATES_CUSTOM, 'true');
  };

  // Convert amount from one currency to another
  const convert = (amount: number, from: Currency, to: Currency = displayCurrency): number => {
    if (from === to) return amount;

    // Step 1: Convert FROM currency to USD (base currency)
    let amountInUSD: number;
    if (from === 'USD') {
      amountInUSD = amount;
    } else {
      // For all other currencies: divide by their USD rate
      // e.g., 1300 RWF / (1300 RWF per USD) = 1 USD
      amountInUSD = amount / exchangeRates[from];
    }

    // Step 2: Convert FROM USD to target currency
    if (to === 'USD') {
      return amountInUSD;
    } else {
      // Multiply by the target currency's rate
      // e.g., 1 USD * 1300 = 1300 RWF
      return amountInUSD * exchangeRates[to];
    }
  };

  // Format currency with proper localization
  const format = (amount: number, currency: Currency = displayCurrency): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
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
      format,
      loading,
      refreshRates: fetchRates,
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
