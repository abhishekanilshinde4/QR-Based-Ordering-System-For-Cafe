import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient } from '../services/apiClient';

interface BrandContextType {
  brandName: string;
  tagline: string;
  updateBrand: (name: string, tagline?: string) => Promise<void>;
}

const BrandContext = createContext<BrandContextType | undefined>(undefined);

export const BrandProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [brandName, setBrandName] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('scandine_brand_name');
      if (saved && saved.trim()) return saved.trim();
    } catch {}
    return 'ScanDine';
  });

  const [tagline, setTagline] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('scandine_tagline');
      if (saved && saved.trim()) return saved.trim();
    } catch {}
    return 'Smart QR Hotel Table Ordering System';
  });

  // Fetch saved settings on load
  useEffect(() => {
    apiClient.getSettings().then((settings) => {
      if (settings && settings.brandName) {
        setBrandName(settings.brandName);
        if (settings.tagline) setTagline(settings.tagline);
      }
    });

    const unsubscribe = apiClient.onEvent((type, data) => {
      if (type === 'brand:updated' && data && data.brandName) {
        setBrandName(data.brandName);
        if (data.tagline) setTagline(data.tagline);
      }
    });

    return () => unsubscribe();
  }, []);

  const updateBrand = async (name: string, newTagline?: string) => {
    const trimmed = name.trim() || 'ScanDine';
    const finalTagline = (newTagline ?? tagline).trim() || 'Smart QR Hotel Table Ordering System';

    setBrandName(trimmed);
    setTagline(finalTagline);

    try {
      localStorage.setItem('scandine_brand_name', trimmed);
      localStorage.setItem('scandine_tagline', finalTagline);
    } catch {}

    await apiClient.saveSettings({ brandName: trimmed, tagline: finalTagline });
  };

  return (
    <BrandContext.Provider value={{ brandName, tagline, updateBrand }}>
      {children}
    </BrandContext.Provider>
  );
};

export const useBrand = () => {
  const context = useContext(BrandContext);
  if (!context) {
    throw new Error('useBrand must be used within BrandProvider');
  }
  return context;
};
