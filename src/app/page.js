'use client';

import React from 'react';
import Link from 'next/link';
import { Building2, UserPlus, LogIn, ArrowRight, ShieldCheck, Activity, HeartPulse } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between selection:bg-teal-500 selection:text-white">
      {/* Top Header */}
      <header className="px-6 py-6 border-b border-slate-800/80 flex items-center justify-between max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-teal-600 text-white flex items-center justify-center shadow-lg shadow-teal-600/30">
            <HeartPulse size={22} />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white">MediPulse HMS</h1>
            <p className="text-[10px] font-semibold text-teal-400 uppercase tracking-widest">Multi-Tenant Platform</p>
          </div>
        </div>
      </header>

      {/* Hero Content & Action Cards */}
      <main className="max-w-6xl mx-auto w-full px-6 py-12 md:py-20 flex flex-col items-center text-center">
        {/* Subtitle Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-semibold mb-6">
          <Activity size={14} />
          <span>Next-Generation Enterprise Healthcare OS</span>
        </div>

        <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight leading-tight max-w-3xl">
          Unified Multi-Tenant Hospital & Clinical Management System
        </h1>
        <p className="text-sm md:text-base text-slate-400 mt-4 max-w-2xl leading-relaxed">
          Select your portal entry below to access patient records, live OPD queues, pharmacy inventory, and executive billing metrics[cite: 5, 9, 12, 14].
        </p>

        {/* 3 Entry Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mt-12 text-left">
          
          {/* Card 2: Create a Hospital Site */}
          <Link
            href="/register-hospital"
            className="group relative bg-slate-800/50 border border-slate-700/80 hover:border-sky-500 rounded-2xl p-6 transition-all duration-200 hover:-translate-y-1 shadow-xl hover:shadow-2xl hover:shadow-sky-500/10 flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center mb-6 border border-sky-500/20 group-hover:scale-110 transition-transform">
                <Building2 size={24} />
              </div>
              <h3 className="text-lg font-bold text-white group-hover:text-sky-400 transition-colors flex items-center justify-between">
                <span>Create Hospital Site</span>
                <ArrowRight size={18} className="opacity-0 group-hover:opacity-100 transition-opacity text-sky-400" />
              </h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Setup a brand new hospital tenant, assign custom branding, and activate your Chief Medical Director (CMD) portal[cite: 1, 5, 7].
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-700/50 text-[11px] font-semibold text-sky-400 flex items-center gap-1.5">
              <span>Onboard New Hospital</span>
              <span>→</span>
            </div>
          </Link>

          {/* Card 2: Join a Hospital */}
          <Link
            href="/register-staff"
            className="group relative bg-slate-800/50 border border-slate-700/80 hover:border-teal-500 rounded-2xl p-6 transition-all duration-200 hover:-translate-y-1 shadow-xl hover:shadow-2xl hover:shadow-teal-500/10 flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center mb-6 border border-teal-500/20 group-hover:scale-110 transition-transform">
                <UserPlus size={24} />
              </div>
              <h3 className="text-lg font-bold text-white group-hover:text-teal-400 transition-colors flex items-center justify-between">
                <span>Join a Hospital</span>
                <ArrowRight size={18} className="opacity-0 group-hover:opacity-100 transition-opacity text-teal-400" />
              </h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Register as a staff member using an existing facility code (HOS-XXXXXX) to request workspace access.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-700/50 text-[11px] font-semibold text-teal-400 flex items-center gap-1.5">
              <span>Apply with Hospital Code</span>
              <span>→</span>
            </div>
          </Link>

          

          {/* Card 3: Login to Account */}
          <Link
            href="/login"
            className="group relative bg-slate-800/50 border border-slate-700/80 hover:border-emerald-500 rounded-2xl p-6 transition-all duration-200 hover:-translate-y-1 shadow-xl hover:shadow-2xl hover:shadow-emerald-500/10 flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-6 border border-emerald-500/20 group-hover:scale-110 transition-transform">
                <LogIn size={24} />
              </div>
              <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors flex items-center justify-between">
                <span>Sign In to Account</span>
                <ArrowRight size={18} className="opacity-0 group-hover:opacity-100 transition-opacity text-emerald-400" />
              </h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Existing user? Connect to your hospital portal, verify credentials, and access active department workspaces[cite: 5, 8].
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-700/50 text-[11px] font-semibold text-emerald-400 flex items-center gap-1.5">
              <span>Access Portal</span>
              <span>→</span>
            </div>
          </Link>

        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-6 border-t border-slate-800/80 text-center text-xs text-slate-500 max-w-7xl mx-auto w-full flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <ShieldCheck size={16} className="text-teal-500" />
          <span>Encrypted Multi-Tenant Health Architecture</span>
        </div>
        <p>© 2026 MediPulse Healthcare Systems. All rights reserved.</p>
      </footer>
    </div>
  );
}