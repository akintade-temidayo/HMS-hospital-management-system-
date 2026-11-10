'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const ThemeContext = createContext(undefined);
const defaultBranding = {
  primaryColor: '#0F766E',
  secondaryColor: '#1488A6',
  logoUrl: null,
  hospitalName: '',
};

export const ThemeProvider = ({ children }) => {
  const [branding, setBranding] = useState(defaultBranding);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      try {
        const savedMeta = localStorage.getItem('userMeta');
        const savedBranding = savedMeta ? JSON.parse(savedMeta).branding : null;
        if (!savedBranding) return;
        setBranding({
          ...defaultBranding,
          ...savedBranding,
          primaryColor: savedBranding.primaryColor || savedBranding.primary_color || defaultBranding.primaryColor,
          secondaryColor: savedBranding.secondaryColor || savedBranding.secondary_color || defaultBranding.secondaryColor,
        });
      } catch (error) {
        console.error('Failed to parse saved hospital branding:', error);
      }
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, []);

  // Apply branding colors to CSS root variables dynamically
  const applyBranding = useCallback((customBranding) => {
    if (!customBranding) return;

    const root = document.documentElement;
    if (customBranding.primary_color || customBranding.primaryColor) {
      const primary = customBranding.primary_color || customBranding.primaryColor;
      root.style.setProperty('--primary-color', primary);
    }
    if (customBranding.secondary_color || customBranding.secondaryColor) {
      const secondary = customBranding.secondary_color || customBranding.secondaryColor;
      root.style.setProperty('--secondary-color', secondary);
    }

    setBranding((prev) => ({
      ...prev,
      ...customBranding,
      primaryColor: customBranding.primaryColor || customBranding.primary_color || prev.primaryColor,
      secondaryColor: customBranding.secondaryColor || customBranding.secondary_color || prev.secondaryColor,
    }));

    try {
      const savedMeta = localStorage.getItem('userMeta');
      if (savedMeta) {
        const parsed = JSON.parse(savedMeta);
        parsed.branding = {
          ...parsed.branding,
          ...customBranding,
          primaryColor: customBranding.primaryColor || customBranding.primary_color,
          secondaryColor: customBranding.secondaryColor || customBranding.secondary_color,
        };
        localStorage.setItem('userMeta', JSON.stringify(parsed));
      }
    } catch (error) {
      console.error('Unable to save hospital theme locally:', error);
    }
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--primary-color', branding.primaryColor);
    root.style.setProperty('--secondary-color', branding.secondaryColor);
  }, [branding]);

  return (
    <ThemeContext.Provider value={{ branding, applyBranding }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
