'use client';

import React from 'react';
import { CalculatedFoodItem, Language } from '@/types';
import { translations } from '@/lib/translations';
import { Target, Flame, Award, TrendingDown } from 'lucide-react';

interface TargetCalculatorProps {
  targetProtein: number;
  onTargetChange: (newTarget: number) => void;
  animalItems: CalculatedFoodItem[];
  plantItems: CalculatedFoodItem[];
  lang: Language;
}

export const TargetCalculator: React.FC<TargetCalculatorProps> = ({
  targetProtein,
  onTargetChange,
  animalItems,
  plantItems,
  lang,
}) => {
  const t = translations[lang];

  // Best animal source
  const bestAnimal = animalItems.length > 0 ? animalItems[0] : null;

  // Chicken breast benchmark
  const chickenBenchmark =
    animalItems.find((item) => item.id === 'chicken-breast') ||
    animalItems.find((item) => item.nameEn.toLowerCase().includes('chicken breast')) ||
    bestAnimal;

  // Best plant source
  const bestPlant = plantItems.length > 0 ? plantItems[0] : null;

  const presets = [100, 120, 140, 160, 180, 200];

  const formatQuantity = (item: CalculatedFoodItem) => {
    const qty = item.dailyQuantityNeeded;
    const unitLabel =
      item.unit === 'kg' ? t.unit_kg : item.unit === '100g' ? t.unit_100g : t.unit_piece;

    if (item.unit === 'kg') {
      return `${qty.toFixed(2)} ${unitLabel} (~${Math.round(qty * 1000)} ${t.gram})`;
    }
    return `${qty.toFixed(1)} ${unitLabel}`;
  };

  return (
    <section className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80 mb-8">
      {/* Title & Slider Row */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-100">
        <div className="max-w-xl">
          <div className="flex items-center gap-2.5 mb-1.5">
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
              <Target className="w-5 h-5 text-emerald-600" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              {t.simulatorTitle}
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
            {t.simulatorDesc}
          </p>
        </div>

        {/* Current Protein Target Badge & Presets */}
        <div className="flex flex-col sm:items-end gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {t.targetDailyProtein}:
            </span>
            <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-emerald-600 text-white font-black text-lg tracking-tight shadow-md shadow-emerald-600/20">
              {targetProtein} {t.gram} / {t.day}
            </span>
          </div>

          {/* Preset Buttons */}
          <div className="flex flex-wrap gap-1.5">
            {presets.map((preset) => (
              <button
                key={preset}
                onClick={() => onTargetChange(preset)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition ${
                  targetProtein === preset
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {preset}g
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Interactive Slider */}
      <div className="py-6 border-b border-slate-100">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-400 mb-2">
          <span>50 {t.gram}</span>
          <span>100 {t.gram}</span>
          <span>140 {t.gram} ({lang === 'ar' ? 'الافتراضي' : 'Default'})</span>
          <span>180 {t.gram}</span>
          <span>240 {t.gram}</span>
        </div>
        <div className="relative flex items-center">
          <input
            type="range"
            min={50}
            max={240}
            step={5}
            value={targetProtein}
            onChange={(e) => onTargetChange(Number(e.target.value))}
            className="w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600 focus:outline-hidden"
          />
        </div>
      </div>

      {/* 3 Summary Benchmark Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-6">
        
        {/* Card 1: Cheapest Animal Source */}
        {bestAnimal && (
          <div className="relative rounded-2xl p-5 bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border border-amber-200/80 shadow-xs hover:shadow-md transition">
            <div className="flex items-center justify-between mb-3">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500 text-white shadow-xs">
                <Award className="w-3.5 h-3.5" />
                <span>{t.cheapestAnimal}</span>
              </span>
              <span className="text-xs font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md">
                {bestAnimal.costPerGramProtein.toFixed(2)} {t.perGram}
              </span>
            </div>

            <h3 className="text-base font-bold text-slate-900 mb-1">
              {lang === 'ar' ? bestAnimal.nameAr : bestAnimal.nameEn}
            </h3>
            
            <p className="text-xs text-slate-500 mb-4">
              {lang === 'ar' ? 'الكمية المطلوبة: ' : 'Portion needed: '}
              <span className="font-semibold text-slate-700">{formatQuantity(bestAnimal)}</span>
            </p>

            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-amber-200/60">
              <div>
                <span className="block text-[11px] font-medium text-slate-500">{t.estimatedDailyCost}</span>
                <span className="text-base font-extrabold text-slate-900">
                  {Math.round(bestAnimal.dailyCost).toLocaleString()} {t.currency}
                </span>
              </div>
              <div>
                <span className="block text-[11px] font-medium text-slate-500">{t.estimatedMonthlyCost}</span>
                <span className="text-base font-extrabold text-amber-700">
                  {Math.round(bestAnimal.monthlyCost).toLocaleString()} {t.currency}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Card 2: Chicken Breast Benchmark */}
        {chickenBenchmark && (
          <div className="relative rounded-2xl p-5 bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-transparent border border-blue-200/80 shadow-xs hover:shadow-md transition">
            <div className="flex items-center justify-between mb-3">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-600 text-white shadow-xs">
                <Flame className="w-3.5 h-3.5" />
                <span>{t.chickenBenchmark}</span>
              </span>
              <span className="text-xs font-semibold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-md">
                {chickenBenchmark.costPerGramProtein.toFixed(2)} {t.perGram}
              </span>
            </div>

            <h3 className="text-base font-bold text-slate-900 mb-1">
              {lang === 'ar' ? chickenBenchmark.nameAr : chickenBenchmark.nameEn}
            </h3>
            
            <p className="text-xs text-slate-500 mb-4">
              {lang === 'ar' ? 'الكمية المطلوبة: ' : 'Portion needed: '}
              <span className="font-semibold text-slate-700">{formatQuantity(chickenBenchmark)}</span>
            </p>

            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-blue-200/60">
              <div>
                <span className="block text-[11px] font-medium text-slate-500">{t.estimatedDailyCost}</span>
                <span className="text-base font-extrabold text-slate-900">
                  {Math.round(chickenBenchmark.dailyCost).toLocaleString()} {t.currency}
                </span>
              </div>
              <div>
                <span className="block text-[11px] font-medium text-slate-500">{t.estimatedMonthlyCost}</span>
                <span className="text-base font-extrabold text-blue-700">
                  {Math.round(chickenBenchmark.monthlyCost).toLocaleString()} {t.currency}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Card 3: Cheapest Plant Source */}
        {bestPlant && (
          <div className="relative rounded-2xl p-5 bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-200/80 shadow-xs hover:shadow-md transition">
            <div className="flex items-center justify-between mb-3">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-600 text-white shadow-xs">
                <TrendingDown className="w-3.5 h-3.5" />
                <span>{t.cheapestPlant}</span>
              </span>
              <span className="text-xs font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                {bestPlant.costPerGramProtein.toFixed(2)} {t.perGram}
              </span>
            </div>

            <h3 className="text-base font-bold text-slate-900 mb-1">
              {lang === 'ar' ? bestPlant.nameAr : bestPlant.nameEn}
            </h3>
            
            <p className="text-xs text-slate-500 mb-4">
              {lang === 'ar' ? 'الكمية المطلوبة: ' : 'Portion needed: '}
              <span className="font-semibold text-slate-700">{formatQuantity(bestPlant)}</span>
            </p>

            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-emerald-200/60">
              <div>
                <span className="block text-[11px] font-medium text-slate-500">{t.estimatedDailyCost}</span>
                <span className="text-base font-extrabold text-slate-900">
                  {Math.round(bestPlant.dailyCost).toLocaleString()} {t.currency}
                </span>
              </div>
              <div>
                <span className="block text-[11px] font-medium text-slate-500">{t.estimatedMonthlyCost}</span>
                <span className="text-base font-extrabold text-emerald-700">
                  {Math.round(bestPlant.monthlyCost).toLocaleString()} {t.currency}
                </span>
              </div>
            </div>
          </div>
        )}

      </div>
    </section>
  );
};
