'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { billingService } from '../../services/billing.service';
import { hospitalThemeService } from '../../services/hospitalTheme.service';
import { MetricCard } from '../../components/ui/molecules/MetricCard';
import { Users, DollarSign, Activity, FileText, Copy, Check, Palette } from 'lucide-react';

const metricIcons = [DollarSign, FileText, Activity, Users];
const themes = [
  { key: 'medical-teal', name: 'Medical Teal', primaryColor: '#0F766E', secondaryColor: '#14B8A6' },
  { key: 'ocean-blue', name: 'Ocean Blue', primaryColor: '#1D4ED8', secondaryColor: '#38BDF8' },
  { key: 'forest-green', name: 'Forest Green', primaryColor: '#15803D', secondaryColor: '#4ADE80' },
  { key: 'royal-violet', name: 'Royal Violet', primaryColor: '#6D28D9', secondaryColor: '#A78BFA' },
];

const responseData = (response) => response?.data?.data ?? response?.data ?? response;
const themeKeyOf = (value) => value?.theme?.key || value?.theme?.name || (typeof value?.theme === 'string' ? value.theme : '') || value?.themeKey || value?.theme_key;

const formatMetric = (value) => {
  if (value === null || value === undefined || value === '') return '—';
  const numericValue = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(numericValue) ? numericValue.toLocaleString() : '—';
};

export default function DashboardPageClient() {
  const { user } = useAuth();
  const { branding, applyBranding } = useTheme();
  const [requestState, setRequestState] = useState({ role: null, summary: null, error: '' });
  const [copied, setCopied] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState('medical-teal');
  const [themeSaving, setThemeSaving] = useState(false);
  const [themeMessage, setThemeMessage] = useState('');
  const isManager = ['CMD', 'ADMIN'].includes(user?.role);
  const hasMatchingResult = requestState.role === user?.role;
  const summary = hasMatchingResult ? requestState.summary : null;
  const error = hasMatchingResult ? requestState.error : '';
  const loading = isManager && !hasMatchingResult;
  const summaryData = summary?.summary || summary?.metrics || summary;
  const metrics = summaryData && typeof summaryData === 'object'
    ? Object.entries(summaryData).filter(([, value]) => ['string', 'number'].includes(typeof value) || value === null)
    : [];
  const hospitalCode = user?.hospitalCode || '';

  useEffect(() => {
    if (user?.role !== 'CMD') return;
    let active = true;
    hospitalThemeService.getCmdTheme()
      .then((response) => {
        const data = responseData(response);
        const key = themeKeyOf(data);
        const theme = themes.find((item) => item.key === key);
        if (active && theme) {
          setSelectedTheme(theme.key);
          applyBranding({
            ...theme,
            hospitalName: data?.hospitalName || data?.hospital_name || data?.hospital?.hospitalName || data?.hospital?.hospital_name || data?.hospital?.name,
          });
        }
      })
      .catch((requestError) => {
        if (active) setThemeMessage(requestError?.message || 'Could not load the saved hospital theme.');
      });
    return () => { active = false; };
  }, [user?.role, applyBranding]);

  const saveTheme = async (theme) => {
    if (themeSaving) return;
    setThemeSaving(true);
    setThemeMessage('');
    try {
      const response = await hospitalThemeService.updateCmdTheme(theme.key);
      const data = responseData(response);
      setSelectedTheme(theme.key);
      applyBranding({ ...theme, hospitalName: data?.hospitalName || data?.hospital_name || data?.hospital?.name || branding.hospitalName });
      setThemeMessage('Hospital theme saved.');
    } catch (requestError) {
      setThemeMessage(requestError?.message || 'Could not save the hospital theme.');
    } finally {
      setThemeSaving(false);
    }
  };

  const copyHospitalCode = async () => {
    if (!hospitalCode || !navigator.clipboard) return;
    await navigator.clipboard.writeText(hospitalCode);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  useEffect(() => {
    if (!['CMD', 'ADMIN'].includes(user?.role)) return;

    let active = true;
    billingService.getDashboardSummary()
      .then((response) => {
        if (active) setRequestState({ role: user.role, summary: response?.data ?? response, error: '' });
      })
      .catch((requestError) => {
        if (active) setRequestState({ role: user.role, summary: null, error: requestError?.message || 'Dashboard analytics are unavailable.' });
      });

    return () => { active = false; };
  }, [user?.role]);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {['CMD', 'ADMIN'].includes(user?.role) && (
        <>
          {error && <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</p>}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {metrics.map(([key, value], index) => (
              <MetricCard
                key={key}
                title={key.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/[_-]+/g, ' ')}
                value={loading ? 'Loading…' : formatMetric(value)}
                icon={metricIcons[index % metricIcons.length]}
              />
            ))}
            {!loading && !error && metrics.length === 0 && (
              <p className="col-span-full rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-500">No dashboard metrics were returned for this account.</p>
            )}
          </div>
        </>
      )}

      {user?.role === 'CMD' && (
        <>
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="text-base font-bold text-slate-900">Hospital Code</h2>
            <p className="mt-1 text-sm text-slate-500">Share this code with staff who need to register under your facility.</p>
            {hospitalCode ? (
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <code className="rounded-lg bg-slate-100 px-4 py-3 text-base font-bold tracking-wider text-slate-800">{hospitalCode}</code>
                <button type="button" onClick={copyHospitalCode} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                  {copied ? 'Copied' : 'Copy code'}
                </button>
              </div>
            ) : (
              <p className="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">The hospital code was not included in this account’s login data.</p>
            )}
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-center gap-2">
              <Palette size={18} className="text-(--primary-color)" />
              <h2 className="text-base font-bold text-slate-900">Hospital Theme</h2>
            </div>
            <p className="mt-1 text-sm text-slate-500">Choose the colors shown in the hospital workspace.</p>
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {themes.map((theme) => {
                const selected = selectedTheme === theme.key;
                return (
                  <button
                    key={theme.name}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => saveTheme(theme)}
                    disabled={themeSaving}
                    className={`flex items-center gap-3 rounded-xl border p-3 text-left transition-colors ${selected ? 'border-(--primary-color) ring-2 ring-(--primary-color)/20' : 'border-slate-200 hover:border-slate-300'}`}
                  >
                    <span className="h-8 w-8 rounded-full" style={{ backgroundColor: theme.primaryColor }} />
                    <span className="text-sm font-semibold text-slate-800">{theme.name}</span>
                    {selected && <Check size={16} className="ml-auto text-(--primary-color)" />}
                  </button>
                );
              })}
            </div>
            {themeMessage && <p role="status" className="mt-4 text-xs text-slate-500">{themeMessage}</p>}
          </section>
        </>
      )}

      {user?.role !== 'CMD' && <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
        <h2 className="mb-2 text-base font-bold text-slate-900">Workspace</h2>
        <p className="text-sm text-slate-500">Choose a workspace from the navigation to manage hospital operations.</p>
      </section>}
    </div>
  );
}
