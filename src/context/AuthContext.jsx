'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '../services/auth.service';

const AuthContext = createContext(undefined);

const normalizeUser = (userData) => {
  if (!userData) return userData;

  const fullName = userData.fullName
    || userData.full_name
    || userData.name
    || [userData.firstName || userData.first_name, userData.lastName || userData.last_name].filter(Boolean).join(' ');
  const branding = userData.branding || userData.hospital?.branding;

  return {
    ...userData,
    fullName: fullName || '',
    hospitalName: userData.hospitalName || userData.hospital_name || userData.hospital?.hospitalName || userData.hospital?.hospital_name || userData.hospital?.name || branding?.hospitalName || branding?.hospital_name || '',
    ...(branding ? {
      branding: {
        ...branding,
        hospitalName: branding.hospitalName || branding.hospital_name || userData.hospital?.hospitalName || userData.hospital?.hospital_name || userData.hospital?.name,
      },
    } : {}),
    hospitalCode: userData.hospitalCode
      || userData.hospital_code
      || userData.hospital?.hospitalCode
      || userData.hospital?.hospital_code
      || userData.hospital?.code
      || '',
  };
};

export const AuthProvider = ({ children }) => {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Hydrate session on client mount to prevent Next.js SSR hydration mismatches
    if (typeof window !== 'undefined') {
      const hydrationTask = window.setTimeout(() => {
        const savedMeta = localStorage.getItem('userMeta');
        const token = localStorage.getItem('accessToken');

        if (savedMeta && token) {
          try {
            setUser(normalizeUser(JSON.parse(savedMeta)));
          } catch (e) {
            console.error('Failed to parse user session metadata:', e);
            localStorage.clear();
          }
        }

        setLoading(false);
      }, 0);

      return () => window.clearTimeout(hydrationTask);
    }
  }, []);

  const login = async (credentials) => {
    try {
      const response = await authService.login(credentials);
      // Support both token payload structures from backend enums
      const baseUser = response.data.user || response.data;
      const userData = normalizeUser({
        ...baseUser,
        hospital: baseUser.hospital || response.data.hospital,
        hospitalCode: baseUser.hospitalCode || response.data.hospitalCode || response.data.hospital_code,
      });
      const tokens = response.data.tokens || {
        accessToken: response.data.accessToken,
        refreshToken: response.data.refreshToken,
      };

      localStorage.setItem('accessToken', tokens.accessToken);
      localStorage.setItem('refreshToken', tokens.refreshToken);
      localStorage.setItem('userMeta', JSON.stringify(userData));

      setUser(userData);
      return userData;
    } catch (error) {
      throw error;
    }
  };

  const registerHospital = async (details) => {
    const response = await authService.registerHospital(details);
    const result = response?.data || response;
    const rawUser = result.user || result.data?.user;
    const hospital = result.hospital || result.data?.hospital;
    const userData = normalizeUser({
      ...rawUser,
      hospital,
      hospitalCode: rawUser?.hospitalCode
        || rawUser?.hospital_code
        || hospital?.hospitalCode
        || hospital?.hospital_code
        || hospital?.code
        || result.hospitalCode
        || result.hospital_code,
    });
    const tokens = result.tokens || result.data?.tokens;

    if (!userData || !tokens?.accessToken) {
      throw new Error('Hospital registration succeeded, but the backend did not return an account session.');
    }

    localStorage.setItem('accessToken', tokens.accessToken);
    if (tokens.refreshToken) localStorage.setItem('refreshToken', tokens.refreshToken);
    localStorage.setItem('userMeta', JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userMeta');
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, login, registerHospital, logout, loading, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
