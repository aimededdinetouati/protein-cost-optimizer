'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { CalculatedFoodItem, Language } from '@/types';
import { translations } from '@/lib/translations';
import {
  Target,
  Flame,
  Award,
  TrendingDown,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Sparkles,
  ShoppingBag,
} from 'lucide-react';

interface BasketItem {
  foodId: string;
  quantity: number; // in native units: kg (0.2), liter (0.5), 100g (1), piece (3)
}

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

  // All foods indexed for fast lookup
  const allFoods = useMemo(() => {
    return [...animalItems, ...plantItems];
  }, [animalItems, plantItems]);

  const foodMap = useMemo(() => {
    const map = new Map<string, CalculatedFoodItem>();
    allFoods.forEach((food) => map.set(food.id, food));
    return map;
  }, [allFoods]);

  // Collapsible state for theoretical single-source benchmarks
  const [showSingleBenchmarks, setShowSingleBenchmarks] = useState(false);

  // Selected food ID to add from dropdown
  const [selectedFoodIdToAdd, setSelectedFoodIdToAdd] = useState<string>('');

  // Daily multi-source basket state (persisted to localStorage)
  const [basket, setBasket] = useState<BasketItem[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('daily_protein_plan_basket');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        } catch {
          // ignore corrupted data
        }
      }
    }
    // Default starter combo (Eggs + Chicken Breast + Candia Milk)
    return [
      { foodId: 'whole-eggs', quantity: 3 },
      { foodId: 'chicken-breast', quantity: 0.25 },
      { foodId: 'candia-milk', quantity: 0.5 },
    ];
  });

  // Persist basket on changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('daily_protein_plan_basket', JSON.stringify(basket));
    }
  }, [basket]);

  // Active selection fallback
  const activeSelectedId = selectedFoodIdToAdd || (allFoods.length > 0 ? allFoods[0].id : '');

  // Target presets
  const presets = [100, 120, 140, 160, 180, 200];

  // Calculate detailed items in the plan
  const detailedBasket = useMemo(() => {
    return basket
      .map((bItem) => {
        const food = foodMap.get(bItem.foodId);
        if (!food) return null;

        let proteinGrams = 0;
        let costDzd = 0;

        if (food.unit === 'kg') {
          proteinGrams = bItem.quantity * food.netProteinPerUnit;
          costDzd = bItem.quantity * food.price;
        } else if (food.unit === 'liter') {
          proteinGrams = bItem.quantity * food.netProteinPerUnit;
          costDzd = bItem.quantity * food.price;
        } else if (food.unit === '100g') {
          proteinGrams = bItem.quantity * food.netProteinPerUnit;
          costDzd = bItem.quantity * food.price;
        } else {
          // piece
          proteinGrams = bItem.quantity * food.netProteinPerUnit;
          costDzd = bItem.quantity * food.price;
        }

        return {
          ...bItem,
          food,
          proteinGrams,
          costDzd,
        };
      })
      .filter(Boolean) as Array<{
      foodId: string;
      quantity: number;
      food: CalculatedFoodItem;
      proteinGrams: number;
      costDzd: number;
    }>;
  }, [basket, foodMap]);

  // Totals
  const totalProtein = useMemo(() => {
    return detailedBasket.reduce((sum, item) => sum + item.proteinGrams, 0);
  }, [detailedBasket]);

  const totalDailyCost = useMemo(() => {
    return detailedBasket.reduce((sum, item) => sum + item.costDzd, 0);
  }, [detailedBasket]);

  const totalMonthlyCost = totalDailyCost * 30;
  const avgCostPerGram = totalProtein > 0 ? totalDailyCost / totalProtein : 0;
  const progressPercent = Math.min(100, Math.round((totalProtein / targetProtein) * 100));
  const isTargetMet = totalProtein >= targetProtein;
  const difference = Math.abs(totalProtein - targetProtein);

  // Basket handlers
  const handleAddFoodToBasket = (foodId: string) => {
    const food = foodMap.get(foodId);
    if (!food) return;

    // Determine default quantity based on unit
    let defaultQty = 1;
    if (food.unit === 'kg') defaultQty = 0.2; // 200g
    else if (food.unit === 'liter') defaultQty = 0.5; // 500ml
    else if (food.unit === 'piece') defaultQty = 2; // 2 pieces
    else if (food.unit === '100g') defaultQty = 1; // 1 pot

    setBasket((prev) => {
      const existing = prev.find((item) => item.foodId === foodId);
      if (existing) {
        return prev.map((item) =>
          item.foodId === foodId
            ? { ...item, quantity: parseFloat((item.quantity + defaultQty).toFixed(2)) }
            : item
        );
      }
      return [...prev, { foodId, quantity: defaultQty }];
    });
  };

  const handleUpdateQuantity = (foodId: string, delta: number) => {
    setBasket((prev) =>
      prev
        .map((item) => {
          if (item.foodId === foodId) {
            const newQty = Math.max(0, parseFloat((item.quantity + delta).toFixed(2)));
            return { ...item, quantity: newQty };
          }
          return item;
        })
        .filter((item) => item.quantity > 0)
    );
  };

  const handleSetExactQuantity = (foodId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveItem(foodId);
      return;
    }
    setBasket((prev) =>
      prev.map((item) => (item.foodId === foodId ? { ...item, quantity } : item))
    );
  };

  const handleRemoveItem = (foodId: string) => {
    setBasket((prev) => prev.filter((item) => item.foodId !== foodId));
  };

  const handleClearBasket = () => {
    setBasket([]);
  };

  const handleLoadPresetCombo = () => {
    setBasket([
      { foodId: 'whole-eggs', quantity: 4 },
      { foodId: 'chicken-breast', quantity: 0.25 },
      { foodId: 'candia-milk', quantity: 0.5 },
      { foodId: 'red-lentils', quantity: 0.15 },
    ]);
  };

  // Helper unit formatting
  const getUnitDisplay = (food: CalculatedFoodItem) => {
    switch (food.unit) {
      case 'kg':
        return t.unit_kg;
      case 'liter':
        return t.unit_liter;
      case '100g':
        return t.unit_100g;
      case 'piece':
        return t.unit_piece;
      default:
        return food.unit;
    }
  };

  // Single-source benchmarks
  const bestAnimal = animalItems.length > 0 ? animalItems[0] : null;
  const chickenBenchmark =
    animalItems.find((item) => item.id === 'chicken-breast') ||
    animalItems.find((item) => item.nameEn.toLowerCase().includes('chicken breast')) ||
    bestAnimal;
  const bestPlant = plantItems.length > 0 ? plantItems[0] : null;

  return (
    <div className="space-y-8">
      {/* SECTION 1: MASTER DAILY PROTEIN TARGET SLIDER */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80">
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
                  className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition cursor-pointer ${
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
        <div className="pt-6">
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
      </section>

      {/* SECTION 2: MULTI-SOURCE PROTEIN PLAN & BUDGET BUILDER */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <div className="p-2 rounded-xl bg-amber-100 text-amber-800">
                <ShoppingBag className="w-5 h-5 text-amber-700" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900">
                {t.comboBuilderTitle}
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-500">
              {t.comboBuilderDesc}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleLoadPresetCombo}
              className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition inline-flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>{lang === 'ar' ? 'خطة متوازنة مقترحة' : 'Balanced Preset Plan'}</span>
            </button>
            {basket.length > 0 && (
              <button
                onClick={handleClearBasket}
                className="px-3 py-1.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold transition cursor-pointer"
              >
                {t.clearBasket}
              </button>
            )}
          </div>
        </div>

        {/* Live Macro & Budget Dashboard Cards */}
        <div className="py-6 border-b border-slate-100">
          
          {/* Main Progress Bar Card */}
          <div className={`rounded-2xl p-5 border mb-5 transition-all ${
            isTargetMet 
              ? 'bg-emerald-50/80 border-emerald-300' 
              : 'bg-slate-50/90 border-slate-200'
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-0.5">
                  {t.totalProteinAchieved}
                </span>
                <div className="flex items-baseline gap-2">
                  <span className={`text-3xl font-black ${isTargetMet ? 'text-emerald-700' : 'text-slate-900'}`}>
                    {totalProtein.toFixed(1)}
                  </span>
                  <span className="text-sm font-bold text-slate-500">
                    / {targetProtein} {t.gram} ({progressPercent}%)
                  </span>
                </div>
              </div>

              {/* Status Badge */}
              <div className="sm:text-end">
                {isTargetMet ? (
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-emerald-600 text-white shadow-xs">
                    <span>{t.targetMet}</span>
                    {totalProtein > targetProtein && (
                      <span className="opacity-90">
                        (+{difference.toFixed(1)} {t.gram})
                      </span>
                    )}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
                    <span>{t.proteinRemaining}</span>
                    <span className="font-black">{difference.toFixed(1)} {t.gram}</span>
                  </span>
                )}
              </div>
            </div>

            {/* Visual Progress Bar */}
            <div className="w-full bg-slate-200 h-3.5 rounded-full overflow-hidden shadow-inner">
              <div
                className={`h-full transition-all duration-300 ${
                  isTargetMet
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                    : 'bg-gradient-to-r from-amber-500 to-emerald-500'
                }`}
                style={{ width: `${Math.min(100, progressPercent)}%` }}
              />
            </div>
          </div>

          {/* 3 Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            {/* Daily Total Cost */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
              <span className="block text-xs font-medium text-slate-500 mb-1">
                {t.totalDailyPlanCost}
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-black text-slate-900">
                  {Math.round(totalDailyCost).toLocaleString()}
                </span>
                <span className="text-xs font-bold text-slate-500">
                  {t.currency} / {t.day}
                </span>
              </div>
            </div>

            {/* Monthly Total Cost */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
              <span className="block text-xs font-medium text-slate-500 mb-1">
                {t.totalMonthlyPlanCost} (30 {t.day})
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-black text-emerald-700">
                  {Math.round(totalMonthlyCost).toLocaleString()}
                </span>
                <span className="text-xs font-bold text-slate-500">
                  {t.currency} / {t.month}
                </span>
              </div>
            </div>

            {/* Avg Cost per 1g Protein */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
              <span className="block text-xs font-medium text-slate-500 mb-1">
                {t.combinedCostPerGram}
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-black text-slate-900">
                  {avgCostPerGram.toFixed(2)}
                </span>
                <span className="text-xs font-bold text-slate-500">
                  {t.perGram}
                </span>
              </div>
            </div>

          </div>
        </div>

        {/* Selected Food Items List */}
        <div className="py-6">
          <h4 className="text-sm font-bold text-slate-800 mb-4 flex items-center justify-between">
            <span>{lang === 'ar' ? 'الأطعمة المحددة في خطتك اليومية:' : 'Foods Included in Your Daily Plan:'}</span>
            <span className="text-xs text-slate-400 font-normal">
              {detailedBasket.length} {lang === 'ar' ? 'عناصر مختارة' : 'items selected'}
            </span>
          </h4>

          {detailedBasket.length === 0 ? (
            <div className="text-center py-12 px-4 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-slate-700 mb-1">{t.emptyBasketTitle}</p>
              <p className="text-xs text-slate-500 max-w-md mx-auto mb-4">{t.emptyBasketDesc}</p>
              <button
                onClick={handleLoadPresetCombo}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs cursor-pointer"
              >
                {lang === 'ar' ? 'تجربة خطة مقترحة جاهزة' : 'Load a Suggested Plan'}
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {detailedBasket.map(({ foodId, quantity, food, proteinGrams, costDzd }) => {
                const isAnimal = food.category === 'animal';
                const unitLabel = getUnitDisplay(food);

                // Step delta based on unit
                const stepDelta = food.unit === 'kg' ? 0.05 : food.unit === 'liter' ? 0.1 : 1;

                return (
                  <div
                    key={foodId}
                    className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 transition shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    {/* Left: Food Identity */}
                    <div className="flex items-center gap-3 min-w-[200px]">
                      <span className="text-xl">
                        {isAnimal ? '🥩' : '🌱'}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-sm sm:text-base">
                            {lang === 'ar' ? food.nameAr : food.nameEn}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isAnimal ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {isAnimal ? t.catAnimal : t.catPlant}
                          </span>
                        </div>
                        <span className="text-xs text-slate-400">
                          {food.price} {t.currency} / {unitLabel} • {food.costPerGramProtein.toFixed(2)} {t.perGram}
                        </span>
                      </div>
                    </div>

                    {/* Center: Quantity Stepper & Quick Adjustment */}
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-slate-500 font-medium">
                        {t.portionAmount}
                      </span>
                      <div className="inline-flex items-center border border-slate-200 rounded-xl bg-slate-50 overflow-hidden shadow-2xs">
                        <button
                          type="button"
                          onClick={() => handleUpdateQuantity(foodId, -stepDelta)}
                          className="px-2.5 py-1.5 text-slate-600 hover:bg-slate-200 font-black text-sm transition cursor-pointer"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          min="0"
                          step={stepDelta}
                          value={quantity}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value);
                            handleSetExactQuantity(foodId, isNaN(val) ? 0 : val);
                          }}
                          className="w-16 px-1 py-1.5 text-center text-xs sm:text-sm font-bold text-slate-800 bg-white focus:outline-hidden"
                        />
                        <button
                          type="button"
                          onClick={() => handleUpdateQuantity(foodId, stepDelta)}
                          className="px-2.5 py-1.5 text-slate-600 hover:bg-slate-200 font-black text-sm transition cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                      <span className="text-xs font-bold text-slate-600">
                        {food.unit === 'kg'
                          ? `${Math.round(quantity * 1000)} ${t.gram}`
                          : food.unit === 'liter'
                          ? `${Math.round(quantity * 1000)} ml`
                          : unitLabel}
                      </span>
                    </div>

                    {/* Right: Calculated Protein & Cost for this item */}
                    <div className="flex items-center justify-between md:justify-end gap-5">
                      <div className="text-end">
                        <span className="block text-sm font-extrabold text-emerald-800">
                          +{proteinGrams.toFixed(1)} {t.gram}
                        </span>
                        <span className="text-xs font-bold text-slate-500">
                          {Math.round(costDzd).toLocaleString()} {t.currency}
                        </span>
                      </div>

                      <button
                        onClick={() => handleRemoveItem(foodId)}
                        className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 p-2 rounded-xl transition cursor-pointer"
                        title={lang === 'ar' ? 'حذف من الخطة' : 'Remove from plan'}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Add Food to Plan Control Bar */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <select
              value={activeSelectedId}
              onChange={(e) => setSelectedFoodIdToAdd(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            >
              {allFoods.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.category === 'animal' ? '🥩' : '🌱'} {lang === 'ar' ? f.nameAr : f.nameEn} ({f.price} {t.currency}/{getUnitDisplay(f)} • {f.costPerGramProtein.toFixed(2)} {t.perGram})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => handleAddFoodToBasket(activeSelectedId)}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-600/20 transition active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{t.addItemToBasket}</span>
          </button>
        </div>

      </section>

      {/* SECTION 3: THEORETICAL SINGLE-SOURCE BENCHMARKS (COLLAPSIBLE REFERENCE) */}
      <section className="bg-slate-100/70 rounded-3xl p-6 border border-slate-200/80">
        <button
          onClick={() => setShowSingleBenchmarks((prev) => !prev)}
          className="w-full flex items-center justify-between text-start cursor-pointer group"
        >
          <div>
            <h4 className="text-base font-bold text-slate-800 group-hover:text-emerald-700 transition flex items-center gap-2">
              <span>{t.singleSourceReferenceTitle}</span>
              <span className="text-xs font-normal text-slate-400">
                ({lang === 'ar' ? 'انقر للمشاهدة أو الإخفاء' : 'Click to toggle'})
              </span>
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              {t.singleSourceReferenceDesc}
            </p>
          </div>
          <div className="p-1.5 rounded-xl bg-white border border-slate-200 text-slate-500 group-hover:text-emerald-700 transition">
            {showSingleBenchmarks ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </button>

        {showSingleBenchmarks && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-6 animate-in fade-in duration-200">
            {/* Card 1: Cheapest Animal Source */}
            {bestAnimal && (
              <div className="relative rounded-2xl p-5 bg-white border border-amber-200/80 shadow-2xs">
                <div className="flex items-center justify-between mb-3">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500 text-white shadow-xs">
                    <Award className="w-3.5 h-3.5" />
                    <span>{t.cheapestAnimal}</span>
                  </span>
                  <span className="text-xs font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md">
                    {bestAnimal.costPerGramProtein.toFixed(2)} {t.perGram}
                  </span>
                </div>

                <h5 className="text-sm font-bold text-slate-900 mb-1">
                  {lang === 'ar' ? bestAnimal.nameAr : bestAnimal.nameEn}
                </h5>

                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100 text-xs">
                  <div>
                    <span className="block text-slate-400">{t.estimatedDailyCost}</span>
                    <span className="font-extrabold text-slate-900">
                      {Math.round(bestAnimal.dailyCost).toLocaleString()} {t.currency}
                    </span>
                  </div>
                  <div>
                    <span className="block text-slate-400">{t.estimatedMonthlyCost}</span>
                    <span className="font-extrabold text-amber-700">
                      {Math.round(bestAnimal.monthlyCost).toLocaleString()} {t.currency}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Card 2: Chicken Breast Benchmark */}
            {chickenBenchmark && (
              <div className="relative rounded-2xl p-5 bg-white border border-blue-200/80 shadow-2xs">
                <div className="flex items-center justify-between mb-3">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-600 text-white shadow-xs">
                    <Flame className="w-3.5 h-3.5" />
                    <span>{t.chickenBenchmark}</span>
                  </span>
                  <span className="text-xs font-semibold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-md">
                    {chickenBenchmark.costPerGramProtein.toFixed(2)} {t.perGram}
                  </span>
                </div>

                <h5 className="text-sm font-bold text-slate-900 mb-1">
                  {lang === 'ar' ? chickenBenchmark.nameAr : chickenBenchmark.nameEn}
                </h5>

                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100 text-xs">
                  <div>
                    <span className="block text-slate-400">{t.estimatedDailyCost}</span>
                    <span className="font-extrabold text-slate-900">
                      {Math.round(chickenBenchmark.dailyCost).toLocaleString()} {t.currency}
                    </span>
                  </div>
                  <div>
                    <span className="block text-slate-400">{t.estimatedMonthlyCost}</span>
                    <span className="font-extrabold text-blue-700">
                      {Math.round(chickenBenchmark.monthlyCost).toLocaleString()} {t.currency}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Card 3: Cheapest Plant Source */}
            {bestPlant && (
              <div className="relative rounded-2xl p-5 bg-white border border-emerald-200/80 shadow-2xs">
                <div className="flex items-center justify-between mb-3">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-600 text-white shadow-xs">
                    <TrendingDown className="w-3.5 h-3.5" />
                    <span>{t.cheapestPlant}</span>
                  </span>
                  <span className="text-xs font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                    {bestPlant.costPerGramProtein.toFixed(2)} {t.perGram}
                  </span>
                </div>

                <h5 className="text-sm font-bold text-slate-900 mb-1">
                  {lang === 'ar' ? bestPlant.nameAr : bestPlant.nameEn}
                </h5>

                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100 text-xs">
                  <div>
                    <span className="block text-slate-400">{t.estimatedDailyCost}</span>
                    <span className="font-extrabold text-slate-900">
                      {Math.round(bestPlant.dailyCost).toLocaleString()} {t.currency}
                    </span>
                  </div>
                  <div>
                    <span className="block text-slate-400">{t.estimatedMonthlyCost}</span>
                    <span className="font-extrabold text-emerald-700">
                      {Math.round(bestPlant.monthlyCost).toLocaleString()} {t.currency}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
};
