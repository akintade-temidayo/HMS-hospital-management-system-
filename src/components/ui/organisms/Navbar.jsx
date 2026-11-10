'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import { useTheme } from '../../../context/ThemeContext';
import { NotificationBadge } from '../molecules/NotificationBadge';
import { NotificationDrawer } from './NotificationDrawer';
import { api } from '../../../services/api';
import { hospitalThemeService } from '../../../services/hospitalTheme.service';
import { subscribeToNotificationsRefresh } from '@/utils/notificationEvents';
import { LogOut, Building, Menu, CheckSquare } from 'lucide-react';
import { TaskDrawer } from './TaskDrawer';
import { getTaskList } from '@/utils/taskUtils';
import { subscribeToTasksRefresh } from '@/utils/notificationEvents';

const themePresets = {
  'medical-teal': { primaryColor: '#0F766E', secondaryColor: '#14B8A6' },
  'ocean-blue': { primaryColor: '#1D4ED8', secondaryColor: '#38BDF8' },
  'forest-green': { primaryColor: '#15803D', secondaryColor: '#4ADE80' },
  'royal-violet': { primaryColor: '#6D28D9', secondaryColor: '#A78BFA' },
};

export const Navbar = ({ onMenuClick }) => {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { branding, applyBranding } = useTheme();
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [taskCount, setTaskCount] = useState(0);
  const [isTaskDrawerOpen, setIsTaskDrawerOpen] = useState(false);

  const hospitalName = user?.hospitalName || user?.hospital_name || user?.hospital?.hospitalName || user?.hospital?.hospital_name || user?.hospital?.name || branding.hospitalName;

  const fetchNotificationsCount = useCallback(async () => {
    try {
      const res = await api.get('/notifications');
      const payload = res.data?.data ?? res.data ?? [];
      const list = Array.isArray(payload) ? payload : payload.notifications || payload.items || payload.results || [];
      const unreadCount = payload.unreadCount ?? payload.unread_count;
      setUnreadCount(unreadCount ?? list.filter((notification) => !(notification.isRead || notification.is_read || notification.read_at || notification.readAt)).length);
    } catch {
      // Keep the last known count when notifications are temporarily unavailable.
    }
  }, []);

  const fetchTaskCount = useCallback(async () => {
    try {
      const response = await api.get('/tasks');
      const tasks = getTaskList(response);
      setTaskCount(tasks.filter((task) => !['COMPLETED', 'DONE', 'CANCELLED', 'CANCELED'].includes(String(task.status || '').toUpperCase())).length);
    } catch {
      // Keep the last known task count if the task service is temporarily unavailable.
    }
  }, []);

  useEffect(() => {
    if (!user) return;

    const initialFetchTimer = window.setTimeout(fetchNotificationsCount, 0);
    const unsubscribe = subscribeToNotificationsRefresh(fetchNotificationsCount);
    const timer = window.setInterval(fetchNotificationsCount, 30_000);
    return () => {
      window.clearTimeout(initialFetchTimer);
      unsubscribe();
      window.clearInterval(timer);
    };
  }, [user, fetchNotificationsCount]);

  useEffect(() => {
    if (!user || user.role === 'CMD') return undefined;

    const initialFetchTimer = window.setTimeout(fetchTaskCount, 0);
    const unsubscribe = subscribeToTasksRefresh(fetchTaskCount);
    const timer = window.setInterval(fetchTaskCount, 30_000);
    return () => {
      window.clearTimeout(initialFetchTimer);
      window.clearInterval(timer);
      unsubscribe();
    };
  }, [user, fetchTaskCount]);

  useEffect(() => {
    const hospitalCode = user?.hospitalCode || user?.hospital_code;
    if (!user || (!hospitalCode && user.role !== 'CMD')) return;
    let active = true;
    const loadTheme = user.role === 'CMD'
      ? hospitalThemeService.getCmdTheme()
      : hospitalThemeService.getByHospitalCode(hospitalCode);

    loadTheme.then((response) => {
      const payload = response?.data?.data ?? response?.data ?? response;
      const theme = payload?.theme && typeof payload.theme === 'object' ? payload.theme : payload;
      const themeKey = typeof payload?.theme === 'string' ? payload.theme : payload?.themeKey || payload?.theme_key;
      if (!active) return;
      const hospital = payload?.hospital || {};
      applyBranding({
        ...(themePresets[themeKey] || {}),
        ...(typeof theme === 'object' ? theme : {}),
        hospitalName: payload?.hospitalName || payload?.hospital_name || hospital?.hospitalName || hospital?.hospital_name || hospital?.name || hospitalName,
      });
    }).catch((err) => console.error('Failed to load hospital theme:', err));

    return () => { active = false; };
  }, [user, applyBranding, hospitalName]);

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b border-slate-200/80 bg-white px-4 md:px-6">
        {/* Left: Branding / Hospital Name */}
        <div className="flex items-center gap-3">
          {user?.role === 'CMD' && (
            <button type="button" onClick={onMenuClick} aria-label="Open navigation" className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 md:hidden">
              <Menu size={20} />
            </button>
          )}
          {branding.logoUrl ? (
            <Image src={branding.logoUrl} alt="Logo" width={128} height={32} className="h-8 w-auto object-contain" />
          ) : (
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-(--primary-color) text-white shadow-sm">
              <Building size={18} />
            </div>
          )}
          <div>
            <h2 className="text-sm font-bold text-slate-900 tracking-tight">
              {hospitalName || 'Hospital'}
            </h2>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              {user?.role || 'Portal'} Workspace
            </span>
          </div>
        </div>

        {/* Right: Notifications & Profile */}
        <div className="flex items-center gap-4">
          <NotificationBadge 
            count={unreadCount} 
            onClick={() => setIsDrawerOpen(true)} 
          />
          {user?.role !== 'CMD' && (
            <button
              type="button"
              onClick={() => setIsTaskDrawerOpen(true)}
              aria-label={`Open tasks${taskCount ? `, ${taskCount} open` : ''}`}
              title="My tasks"
              className="relative rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-slate-600 transition-colors outline-none hover:bg-slate-100"
            >
              <CheckSquare size={20} />
              {taskCount > 0 && (
                <span className="absolute -right-1 -top-1 rounded-full bg-(--primary-color) px-1.5 py-0.5 text-[10px] font-bold text-white shadow-sm">
                  {taskCount > 99 ? '99+' : taskCount}
                </span>
              )}
            </button>
          )}

          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="border-l border-slate-200 pl-3 text-left outline-none hover:text-(--primary-color)]"
            >
              <span className="block text-xs font-bold text-slate-900">
                {user?.fullName || user?.full_name || ''}
              </span>
              <span className="mt-0.5 block text-[10px] font-medium uppercase tracking-wide text-slate-500">
                {user?.role || ''}
              </span>
            </button>

            {showDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-xl py-1 z-50 animate-in fade-in zoom-in-95">
                <button
                  onClick={logout}
                  className="w-full px-4 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition-colors text-left"
                >
                  <LogOut size={14} />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Slide-in Notifications Drawer */}
      <NotificationDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onNotificationUpdate={fetchNotificationsCount}
      />
      {user?.role !== 'CMD' && (
        <TaskDrawer isOpen={isTaskDrawerOpen} onClose={() => setIsTaskDrawerOpen(false)} />
      )}
    </>
  );
};
