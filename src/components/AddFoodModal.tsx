'use client';

import React, { useState } from 'react';
import { Category, FoodItem, Language, UnitType } from '@/types';
import { translations } from '@/lib/translations';
import { X, Plus, Calculator } from 'lucide-react';

interface AddFoodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddFood: (food: Omit<FoodItem, 'id'>) => void;
  defaultCategory: Category;
  lang: Language;
}

export const AddFoodModal: React.FC<AddFoodModalProps> = ({
  isOpen,
  onClose,
  onAddFood,
  defaultCategory,
  lang,
}) => {
  const t = translations[lang];

  const [category, setCategory] = useState<Category>(defaultCategory);
  const [nameAr, setNameAr] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [unit, setUnit] = useState<UnitType>('kg');
  const [price, setPrice] = useState<number>(500);
  const [rawProtein, setRawProtein] = useState<number>(20);
  const [yieldPercent, setYieldPercent] = useState<number>(100);
  const [wasteDescAr, setWasteDescAr] = useState('');
  const [wasteDescEn, setWasteDescEn] = useState('');

  if (!isOpen) return null;

  // Calculate live preview
  const yieldRatio = Math.max(0.01, yieldPercent / 100);
  let netProtein = 0;
  if (unit === 'kg') {
    netProtein = rawProtein * 10 * yieldRatio;
  } else {
    netProtein = rawProtein * yieldRatio;
  }
  const previewCostPerGram = netProtein > 0 ? price / netProtein : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameAr.trim() && !nameEn.trim()) return;

    onAddFood({
      category,
      nameAr: nameAr.trim() || nameEn.trim(),
      nameEn: nameEn.trim() || nameAr.trim(),
      unit,
      price: Math.max(1, price),
      rawProteinPer100gOrUnit: Math.max(0.1, rawProtein),
      yieldPercent: Math.min(100, Math.max(5, yieldPercent)),
      wasteDescriptionAr: wasteDescAr.trim() || undefined,
      wasteDescriptionEn: wasteDescEn.trim() || undefined,
      isCustom: true,
    });

    onClose();
    // Reset form
    setNameAr('');
    setNameEn('');
    setPrice(500);
    setRawProtein(20);
    setYieldPercent(100);
    setWasteDescAr('');
    setWasteDescEn('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
              <Plus className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">
              {t.addModalTitle}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5">
          
          {/* Category Toggle */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              {t.fieldCategory}
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setCategory('animal')}
                className={`py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm border transition flex items-center justify-center gap-2 ${
                  category === 'animal'
                    ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                🥩 {t.catAnimal}
              </button>
              <button
                type="button"
                onClick={() => setCategory('plant')}
                className={`py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm border transition flex items-center justify-center gap-2 ${
                  category === 'plant'
                    ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                🌱 {t.catPlant}
              </button>
            </div>
          </div>

          {/* Names */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {t.fieldNameAr} *
              </label>
              <input
                type="text"
                required
                value={nameAr}
                onChange={(e) => setNameAr(e.target.value)}
                placeholder="مثلاً: كبدة خروف، تونة..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {t.fieldNameEn} *
              </label>
              <input
                type="text"
                required
                value={nameEn}
                onChange={(e) => setNameEn(e.target.value)}
                placeholder="e.g. Lamb liver, Tuna..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Unit & Price */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {t.fieldUnit}
              </label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value as UnitType)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              >
                <option value="kg">{t.unit_kg} (1 Kilogram)</option>
                <option value="100g">{t.unit_100g} (100 Grams)</option>
                <option value="piece">{t.unit_piece} (1 Piece / Egg)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {t.fieldPrice}
              </label>
              <div className="relative">
                <input
                  type="number"
                  required
                  min="1"
                  step="5"
                  value={price}
                  onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
                <span className="absolute end-3 top-2.5 text-xs text-slate-400 select-none">
                  {t.currency}
                </span>
              </div>
            </div>
          </div>

          {/* Raw Protein */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              {t.fieldProtein} (غرام)
            </label>
            <input
              type="number"
              required
              min="0.1"
              step="0.5"
              value={rawProtein}
              onChange={(e) => setRawProtein(parseFloat(e.target.value) || 0)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              {unit === 'piece' 
                ? (lang === 'ar' ? 'كمية البروتين في الحبة الواحدة' : 'Protein in one single piece') 
                : (lang === 'ar' ? 'كمية البروتين لكل 100 غرام خام' : 'Protein per 100 grams raw')}
            </p>
          </div>

          {/* Edible Yield Slider & Presets */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700">
                {t.fieldYield}: <span className="text-emerald-700 font-extrabold">{yieldPercent}%</span>
              </label>
              <span className="text-xs text-slate-400">
                {100 - yieldPercent}% {lang === 'ar' ? 'هدر' : 'waste'}
              </span>
            </div>

            <input
              type="range"
              min={10}
              max={100}
              step={1}
              value={yieldPercent}
              onChange={(e) => setYieldPercent(parseInt(e.target.value, 10))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
            />

            {/* Presets */}
            <div className="flex flex-wrap gap-2 mt-2.5">
              <button
                type="button"
                onClick={() => {
                  setYieldPercent(53);
                  setWasteDescAr('47% فضلات (الرأس، الأحشاء، السلسول)');
                  setWasteDescEn('47% waste (head, viscera, spine)');
                }}
                className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
              >
                🐟 {t.yieldPresetSardines}
              </button>
              <button
                type="button"
                onClick={() => {
                  setYieldPercent(68);
                  setWasteDescAr('32% فضلات (عظام وجلد)');
                  setWasteDescEn('32% waste (bones and skin)');
                }}
                className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
              >
                🍗 {t.yieldPresetThighs}
              </button>
              <button
                type="button"
                onClick={() => {
                  setYieldPercent(100);
                  setWasteDescAr('بدون فضلات');
                  setWasteDescEn('No waste');
                }}
                className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
              >
                ✨ {t.yieldPresetPure}
              </button>
            </div>
          </div>

          {/* Waste Descriptions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                {t.fieldWasteDescAr}
              </label>
              <input
                type="text"
                value={wasteDescAr}
                onChange={(e) => setWasteDescAr(e.target.value)}
                placeholder="مثال: عظام وقشور..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                {t.fieldWasteDescEn}
              </label>
              <input
                type="text"
                value={wasteDescEn}
                onChange={(e) => setWasteDescEn(e.target.value)}
                placeholder="e.g. bones, skin..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Live Calculated Metric Card */}
          <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calculator className="w-5 h-5 text-emerald-700" />
              <div>
                <span className="block text-xs font-bold text-emerald-900">
                  {lang === 'ar' ? 'التكلفة المحسوبة للغرام الصافي:' : 'Calculated Net Cost / g:'}
                </span>
                <span className="text-[11px] text-emerald-700">
                  {netProtein.toFixed(1)}g {lang === 'ar' ? 'بروتين صافي لكل وحدة' : 'net protein per unit'}
                </span>
              </div>
            </div>
            <div className="text-end">
              <span className="text-xl font-black text-emerald-900">
                {previewCostPerGram.toFixed(2)}
              </span>
              <span className="text-xs font-bold text-emerald-700 ms-1">
                {t.perGram}
              </span>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs sm:text-sm font-semibold transition"
            >
              {t.cancelBtn}
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-emerald-600/20 transition active:scale-95"
            >
              {t.submitAddBtn}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
