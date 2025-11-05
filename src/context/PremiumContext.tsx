// src/context/PremiumContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import PremiumService, { PremiumStatus } from '../services/premiumService';

interface PremiumContextType {
  isPremium: boolean;
  premiumExpiresAt: string | null;
  daysRemaining: number | null;
  loading: boolean;
  refreshPremiumStatus: () => Promise<void>;
}

const PremiumContext = createContext<PremiumContextType | undefined>(undefined);

export const PremiumProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isPremium, setIsPremium] = useState(false);
  const [premiumExpiresAt, setPremiumExpiresAt] = useState<string | null>(null);
  const [daysRemaining, setDaysRemaining] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const refreshPremiumStatus = async () => {
    // Only fetch if user is authenticated (has token)
    const token = localStorage.getItem('auth_token');
    if (!token) {
      setIsPremium(false);
      setPremiumExpiresAt(null);
      setDaysRemaining(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const status = await PremiumService.getPremiumStatus();
      setIsPremium(status.is_premium);
      setPremiumExpiresAt(status.premium_expires_at);
      setDaysRemaining(status.days_remaining);
    } catch (error) {
      console.error('Failed to fetch premium status:', error);
      setIsPremium(false);
      setPremiumExpiresAt(null);
      setDaysRemaining(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Only fetch on mount if authenticated
    const token = localStorage.getItem('auth_token');
    if (token) {
      refreshPremiumStatus();
    }
  }, []);

  const value: PremiumContextType = {
    isPremium,
    premiumExpiresAt,
    daysRemaining,
    loading,
    refreshPremiumStatus,
  };

  return <PremiumContext.Provider value={value}>{children}</PremiumContext.Provider>;
};

export const usePremium = (): PremiumContextType => {
  const context = useContext(PremiumContext);
  if (context === undefined) {
    // Return default values instead of throwing error to prevent crashes
    return {
      isPremium: false,
      premiumExpiresAt: null,
      daysRemaining: null,
      loading: false,
      refreshPremiumStatus: async () => {},
    };
  }
  return context;
};
