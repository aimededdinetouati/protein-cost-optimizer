'use client';

import React from 'react';
import { Language } from '@/types';
import { translations } from '@/lib/translations';
import { RotateCcw, AlertTriangle, X } from 'lucide-react';

interface ResetDefaultsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  lang: Language;
}

export const ResetDefaultsModal: React.FC<ResetDefaultsModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  lang,
}) => {
  const t = translations[lang];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 sm:p-7 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 end-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-lg transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mb-4 shadow-xs">
          <AlertTriangle className="w-6 h-6 text-amber-600" />
        </div>

        <h3 className="text-xl font-bold text-slate-900 mb-2">
          {t.resetModalTitle}
        </h3>

        <p className="text-sm text-slate-600 mb-6 leading-relaxed">
          {t.resetModalDesc}
        </p>

        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-semibold transition"
          >
            {t.cancelBtn}
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-sm font-bold shadow-md shadow-amber-600/20 transition active:scale-95"
          >
            <RotateCcw className="w-4 h-4" />
            <span>{t.confirmResetBtn}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
