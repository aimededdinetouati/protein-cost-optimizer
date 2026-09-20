'use client';

import React, { useState } from 'react';
import { Language } from '@/types';
import { translations } from '@/lib/translations';
import { Mail, ArrowRight, ArrowLeft, X, Sparkles } from 'lucide-react';

interface EmailAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitEmail: (email: string) => void;
  onContinueAsGuest: () => void;
  currentEmail: string | null;
  lang: Language;
}

export const EmailAuthModal: React.FC<EmailAuthModalProps> = ({
  isOpen,
  onClose,
  onSubmitEmail,
  onContinueAsGuest,
  currentEmail,
  lang,
}) => {
  const [emailInput, setEmailInput] = useState(currentEmail || '');
  const [error, setError] = useState<string | null>(null);
  const t = translations[lang];

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = emailInput.trim().toLowerCase();
    
    // Basic email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      setError(t.invalidEmail);
      return;
    }

    setError(null);
    onSubmitEmail(cleanEmail);
  };

  const ArrowIcon = lang === 'ar' ? ArrowLeft : ArrowRight;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Banner decoration */}
        <div className="h-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500" />
        
        {/* Close button if user already has an active session */}
        {currentEmail && (
          <button
            onClick={onClose}
            className="absolute top-4 end-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg transition"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        <div className="p-6 sm:p-8">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4 shadow-xs">
            <Mail className="w-6 h-6" />
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">
            {t.authModalTitle}
          </h2>

          <p className="text-sm text-slate-600 mb-6 leading-relaxed">
            {t.authModalDesc}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-slate-700 mb-1.5">
                {t.fieldNameEn === 'Name in English' ? (lang === 'ar' ? 'البريد الإلكتروني' : 'Email Address') : 'Email'}
              </label>
              <div className="relative">
                <input
                  id="email"
                  type="email"
                  value={emailInput}
                  onChange={(e) => {
                    setEmailInput(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder={t.emailPlaceholder}
                  dir="ltr"
                  className={`w-full px-4 py-3 text-sm rounded-xl border text-slate-900 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 transition ${
                    error 
                      ? 'border-rose-400 focus:ring-rose-200' 
                      : 'border-slate-200 focus:border-emerald-500 focus:ring-emerald-200'
                  }`}
                  autoFocus
                  required
                />
              </div>
              {error && (
                <p className="mt-1.5 text-xs text-rose-600 font-medium">
                  {error}
                </p>
              )}
            </div>

            <div className="pt-2 flex flex-col gap-2.5">
              <button
                type="submit"
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-md shadow-emerald-600/20 transition active:scale-[0.98]"
              >
                <span>{t.continueBtn}</span>
                <ArrowIcon className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={onContinueAsGuest}
                className="w-full text-xs font-medium text-slate-500 hover:text-slate-800 py-2 rounded-lg transition"
              >
                {t.guestBtn}
              </button>
            </div>
          </form>

          {/* Quick note on Netlify Blobs frictionless sync */}
          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-500">
            <Sparkles className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>
              {lang === 'ar'
                ? 'مزامنة سحابية فورية بدون كلمات سر عبر Netlify Blobs'
                : 'Instant serverless sync with zero passwords via Netlify Blobs'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
