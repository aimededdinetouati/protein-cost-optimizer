'use client';

import React from 'react';
import { Language } from '@/types';
import { translations } from '@/lib/translations';
import { Dumbbell, User, RotateCcw, Check, RefreshCw, AlertCircle, Globe } from 'lucide-react';

interface HeaderProps {
  lang: Language;
  onToggleLang: () => void;
  email: string | null;
  onOpenAuthModal: () => void;
  onOpenResetModal: () => void;
  saveStatus: 'idle' | 'saving' | 'saved' | 'error';
}

export const Header: React.FC<HeaderProps> = ({
  lang,
  onToggleLang,
  email,
  onOpenAuthModal,
  onOpenResetModal,
  saveStatus,
}) => {
  const t = translations[lang];

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo & Title */}
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
              <Dumbbell className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 font-sans">
                  {t.appTitle}
                </h1>
                <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                  DZ 🇩🇿
                </span>
              </div>
              <p className="hidden sm:block text-xs text-slate-500 max-w-md truncate">
                {t.appSubtitle}
              </p>
            </div>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Auto-save status */}
            <div className="hidden lg:flex items-center text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
              {saveStatus === 'saving' && (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin me-1.5 text-emerald-600" />
                  <span>{t.saving}</span>
                </>
              )}
              {saveStatus === 'saved' && (
                <>
                  <Check className="w-3.5 h-3.5 me-1.5 text-emerald-600" />
                  <span>{t.saved}</span>
                </>
              )}
              {saveStatus === 'error' && (
                <>
                  <AlertCircle className="w-3.5 h-3.5 me-1.5 text-rose-600" />
                  <span className="text-rose-600">{t.saveError}</span>
                </>
              )}
              {saveStatus === 'idle' && (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 me-1.5"></span>
                  <span className="text-slate-500">{t.saved}</span>
                </>
              )}
            </div>

            {/* Account / Auth Button */}
            <button
              onClick={onOpenAuthModal}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition shadow-xs"
              title={email ? email : t.guestMode}
            >
              <User className="w-4 h-4 text-slate-500" />
              <span className="max-w-[110px] sm:max-w-[150px] truncate">
                {email ? email : t.guestMode}
              </span>
            </button>

            {/* Reset Defaults Button */}
            <button
              onClick={onOpenResetModal}
              className="flex items-center gap-1 p-2 sm:px-3 sm:py-1.5 text-xs sm:text-sm font-medium rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition shadow-xs"
              title={t.resetDefaults}
            >
              <RotateCcw className="w-4 h-4 text-slate-500" />
              <span className="hidden md:inline">{t.resetDefaults}</span>
            </button>

            {/* Language Toggle */}
            <button
              onClick={onToggleLang}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/60 transition shadow-xs"
            >
              <Globe className="w-4 h-4 text-emerald-700" />
              <span>{lang === 'ar' ? 'English' : 'العربية'}</span>
            </button>

          </div>
        </div>
      </div>
    </header>
  );
};
