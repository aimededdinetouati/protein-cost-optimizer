'use client';

import React, { useState, useEffect } from 'react';
import { Category, FoodItem, Language, UnitType } from '@/types';
import { translations } from '@/lib/translations';
import { X, Pencil, Calculator, Info } from 'lucide-react';

interface EditFoodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdateFood: (food: FoodItem) => void;
  food: FoodItem | null;
  lang: Language;
}

export const EditFoodModal: React.FC<EditFoodModalProps> = ({
  isOpen,
  onClose,
  onUpdateFood,
  food,
  lang,
}) => {
  const t = translations[lang];

  const [category, setCategory] = useState<Category>('animal');
  const [nameAr, setNameAr] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [unit, setUnit] = useState<UnitType>('kg');
  const [pieceWeight, setPieceWeight] = useState<string>('');
  const [price, setPrice] = useState<number>(500);
  const [rawProtein, setRawProtein] = useState<number>(20);
  const [calories, setCalories] = useState<string>('');
  const [yieldPercent, setYieldPercent] = useState<number>(100);
  const [wasteDescAr, setWasteDescAr] = useState('');
  const [wasteDescEn, setWasteDescEn] = useState('');

  useEffect(() => {
    if (food) {
      setCategory(food.category);
      setNameAr(food.nameAr || '');
      setNameEn(food.nameEn || '');
      setUnit(food.unit);
      setPieceWeight(food.pieceWeightGrams ? String(food.pieceWeightGrams) : '');
      setPrice(food.price);
      setRawProtein(food.rawProteinPer100gOrUnit);
      setCalories(food.caloriesPer100gOrUnit !== undefined ? String(food.caloriesPer100gOrUnit) : '');
      setYieldPercent(food.yieldPercent);
      setWasteDescAr(food.wasteDescriptionAr || '');
      setWasteDescEn(food.wasteDescriptionEn || '');
    }
  }, [food, isOpen]);

  if (!isOpen || !food) return null;

  // Calculate live preview metrics
  const yieldRatio = Math.max(0.01, yieldPercent / 100);
  const parsedPieceWeight = parseFloat(pieceWeight);
  const parsedCals = parseFloat(calories);
  const rawCals = !isNaN(parsedCals) && parsedCals > 0 ? parsedCals : 0;

  let netProtein = 0;
  let netCals = 0;
  if (unit === 'kg' || unit === 'liter') {
    netProtein = rawProtein * 10 * yieldRatio;
    netCals = rawCals * 10 * yieldRatio;
  } else if (unit === '100g') {
    netProtein = rawProtein * yieldRatio;
    netCals = rawCals * yieldRatio;
  } else if (unit === 'piece') {
    if (!isNaN(parsedPieceWeight) && parsedPieceWeight > 0) {
      netProtein = rawProtein * (parsedPieceWeight / 100) * yieldRatio;
      netCals = rawCals * (parsedPieceWeight / 100) * yieldRatio;
    } else {
      netProtein = rawProtein * yieldRatio;
      netCals = rawCals * yieldRatio;
    }
  }

  const previewCostPerGram = netProtein > 0 ? price / netProtein : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameAr.trim() && !nameEn.trim()) return;

    onUpdateFood({
      ...food,
      category,
      nameAr: nameAr.trim() || nameEn.trim(),
      nameEn: nameEn.trim() || nameAr.trim(),
      unit,
      price: Math.max(1, price),
      rawProteinPer100gOrUnit: Math.max(0.1, rawProtein),
      pieceWeightGrams:
        unit === 'piece' && !isNaN(parsedPieceWeight) && parsedPieceWeight > 0
          ? parsedPieceWeight
          : undefined,
      caloriesPer100gOrUnit: !isNaN(parsedCals) && parsedCals > 0 ? parsedCals : undefined,
      yieldPercent: Math.min(100, Math.max(5, yieldPercent)),
      wasteDescriptionAr: wasteDescAr.trim() || undefined,
      wasteDescriptionEn: wasteDescEn.trim() || undefined,
    });

    onClose();
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
            <div className="p-2 rounded-xl bg-amber-100 text-amber-700">
              <Pencil className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">
                {t.editModalTitle}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {lang === 'ar' ? food.nameAr : food.nameEn}
              </p>
            </div>
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
                placeholder="مثلاً: صدر الديك الرومي..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500"
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
                placeholder="e.g. Turkey breast..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500"
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
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              >
                <option value="kg">{t.unit_kg} (1 Kilogram)</option>
                <option value="liter">{t.unit_liter} (1 {lang === 'ar' ? 'لتر' : 'Liter'})</option>
                <option value="100g">{t.unit_100g} (100 Grams / 100ml)</option>
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
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                />
                <span className="absolute end-3 top-2.5 text-xs text-slate-400 select-none">
                  {t.currency}
                </span>
              </div>
            </div>
          </div>

          {/* Piece / Container Weight in Grams (Only when unit === 'piece') */}
          {unit === 'piece' && (
            <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80">
              <label className="block text-xs font-bold text-amber-900 mb-1">
                {t.fieldPieceWeight}
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={pieceWeight}
                  onChange={(e) => setPieceWeight(e.target.value)}
                  placeholder={lang === 'ar' ? 'مثلاً: 90 لعلبة جبن صومام، 140 لعلبة تونة...' : 'e.g. 90 for Soummam cheese, 140 for tuna...'}
                  className="w-full px-3.5 py-2 rounded-xl border border-amber-200 bg-white text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                />
                <span className="absolute end-3 top-2 text-xs font-bold text-slate-400 select-none">
                  {t.gram}
                </span>
              </div>
              <p className="text-[11px] text-amber-800/80 mt-1.5 leading-relaxed">
                {t.fieldPieceWeightHelp}
              </p>
            </div>
          )}

          {/* Raw Protein */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              {unit === 'piece' && !isNaN(parsedPieceWeight) && parsedPieceWeight > 0
                ? (lang === 'ar' ? `كمية البروتين لكل 100غ من المنتج (غرام)` : `Raw Protein per 100g of product (grams)`)
                : `${t.fieldProtein} (غرام)`}
            </label>
            <input
              type="number"
              required
              min="0.1"
              step="0.5"
              value={rawProtein}
              onChange={(e) => setRawProtein(parseFloat(e.target.value) || 0)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              {unit === 'piece'
                ? !isNaN(parsedPieceWeight) && parsedPieceWeight > 0
                  ? (lang === 'ar'
                      ? `💡 العلبة (${parsedPieceWeight}غ) تحتوي على ${(rawProtein * (parsedPieceWeight / 100)).toFixed(2)}غ بروتين صافي`
                      : `💡 Container (${parsedPieceWeight}g) provides ${(rawProtein * (parsedPieceWeight / 100)).toFixed(2)}g net protein`)
                  : (lang === 'ar' ? 'كمية البروتين في الحبة / العلبة الواحدة مباشرة' : 'Protein in one single piece / unit directly')
                : unit === 'liter'
                ? (lang === 'ar' ? 'كمية البروتين لكل 100 مل' : 'Protein per 100 ml')
                : (lang === 'ar' ? 'كمية البروتين لكل 100 غرام خام' : 'Protein per 100 grams raw')}
            </p>
          </div>

          {/* Calories (Optional) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              {t.fieldCalories}
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                step="1"
                value={calories}
                onChange={(e) => setCalories(e.target.value)}
                placeholder={lang === 'ar' ? 'مثلاً: 120 لصدر الدجاج، 72 للبيضة...' : 'e.g. 120 for chicken, 72 for egg...'}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              />
              <span className="absolute end-3 top-2.5 text-xs font-semibold text-slate-400 select-none">kcal</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              {t.fieldCaloriesHelp}
            </p>
          </div>

          {/* Edible Yield Slider & Presets */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700">
                {t.fieldYield}: <span className="text-amber-700 font-extrabold">{yieldPercent}%</span>
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
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
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
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:ring-2 focus:ring-amber-500"
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
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* Live Calculated Metrics Preview (Read-Only) */}
          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calculator className="w-5 h-5 text-amber-700" />
                <div>
                  <span className="block text-xs font-bold text-amber-900">
                    {lang === 'ar' ? 'التكلفة المحسوبة للغرام الصافي:' : 'Calculated Net Cost / g:'}
                  </span>
                  <span className="text-[11px] text-amber-700 font-medium">
                    {netProtein.toFixed(1)}g {lang === 'ar' ? 'بروتين صافي' : 'net protein'}
                    {netCals > 0 && ` • ~${Math.round(netCals)} kcal`}
                  </span>
                </div>
              </div>
              <div className="text-end">
                <span className="text-xl font-black text-amber-900">
                  {previewCostPerGram.toFixed(2)}
                </span>
                <span className="text-xs font-bold text-amber-700 ms-1">
                  {t.perGram}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-1.5 text-[11px] text-amber-800/80 bg-white/70 p-2 rounded-xl border border-amber-200/50">
              <Info className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-600" />
              <span>{t.calculatedNotice}</span>
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
              className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-amber-600/20 transition active:scale-95"
            >
              {t.submitEditBtn}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
