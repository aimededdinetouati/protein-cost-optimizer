'use client';

import React from 'react';
import { CalculatedFoodItem, Category, Language } from '@/types';
import { translations } from '@/lib/translations';
import { Award, Plus, Trash2, Info } from 'lucide-react';

interface ProteinTableProps {
  category: Category;
  title: string;
  description: string;
  items: CalculatedFoodItem[];
  lang: Language;
  onUpdatePrice: (id: string, price: number) => void;
  onUpdateYield: (id: string, yieldPercent: number) => void;
  onDeleteFood: (id: string) => void;
  onOpenAddModal: (category: Category) => void;
}

export const ProteinTable: React.FC<ProteinTableProps> = ({
  category,
  title,
  description,
  items,
  lang,
  onUpdatePrice,
  onUpdateYield,
  onDeleteFood,
  onOpenAddModal,
}) => {
  const t = translations[lang];

  const getUnitLabel = (item: CalculatedFoodItem) => {
    switch (item.unit) {
      case 'kg':
        return t.unit_kg;
      case 'liter':
        return t.unit_liter;
      case '100g':
        return t.unit_100g;
      case 'piece':
        if (item.pieceWeightGrams && item.pieceWeightGrams > 0) {
          return lang === 'ar' ? `علبة (${item.pieceWeightGrams}غ)` : `container (${item.pieceWeightGrams}g)`;
        }
        return t.unit_piece;
      default:
        return item.unit;
    }
  };

  const isAnimal = category === 'animal';

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-200/80 mb-10 overflow-hidden">
      {/* Table Header / Action Bar */}
      <div className={`p-6 sm:p-7 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
        isAnimal 
          ? 'bg-gradient-to-r from-amber-50/50 via-white to-transparent' 
          : 'bg-gradient-to-r from-emerald-50/50 via-white to-transparent'
      }`}>
        <div>
          <div className="flex items-center gap-2.5">
            <span className={`w-3 h-3 rounded-full ${isAnimal ? 'bg-amber-500' : 'bg-emerald-500'}`} />
            <h3 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              {title}
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {description}
          </p>
        </div>

        <button
          onClick={() => onOpenAddModal(category)}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition shadow-xs active:scale-95 shrink-0 ${
            isAnimal
              ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-600/20'
              : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
          }`}
        >
          <Plus className="w-4 h-4" />
          <span>{t.addFoodBtn}</span>
        </button>
      </div>

      {/* Responsive Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-start text-sm">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">
              <th className="py-3.5 px-4 text-center w-16">{t.colRank}</th>
              <th className="py-3.5 px-4 text-start min-w-[200px]">{t.colFood}</th>
              <th className="py-3.5 px-4 text-center min-w-[130px]">{t.colPrice}</th>
              <th className="py-3.5 px-4 text-center min-w-[140px]">{t.colYield}</th>
              <th className="py-3.5 px-4 text-center min-w-[130px]">{t.colNetProtein}</th>
              <th className="py-3.5 px-4 text-center min-w-[150px]">{t.colCostPerGram}</th>
              <th className="py-3.5 px-4 text-center min-w-[160px]">{t.colDailyQuantity}</th>
              <th className="py-3.5 px-4 text-center w-16">{t.colActions}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-slate-400">
                  {lang === 'ar' ? 'لا توجد عناصر في هذه القائمة' : 'No food items in this list'}
                </td>
              </tr>
            ) : (
              items.map((item) => {
                const isBest = item.rank === 1;
                const wasteDesc = lang === 'ar' ? item.wasteDescriptionAr : item.wasteDescriptionEn;

                return (
                  <tr
                    key={item.id}
                    className={`transition-colors hover:bg-slate-50/80 ${
                      isBest ? (isAnimal ? 'bg-amber-50/30' : 'bg-emerald-50/30') : ''
                    }`}
                  >
                    {/* Rank Column */}
                    <td className="py-4 px-3 text-center align-middle">
                      {isBest ? (
                        <div className="flex flex-col items-center">
                          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-400 text-white font-black text-sm shadow-md shadow-amber-500/30">
                            1
                          </span>
                        </div>
                      ) : (
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-100 text-slate-600 font-bold text-xs">
                          {item.rank}
                        </span>
                      )}
                    </td>

                    {/* Food Name & Details */}
                    <td className="py-4 px-4 align-middle">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-sm sm:text-base">
                            {lang === 'ar' ? item.nameAr : item.nameEn}
                          </span>
                          {isBest && (
                            <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                              <Award className="w-3 h-3" />
                              {t.bestValueBadge}
                            </span>
                          )}
                          {item.isCustom && (
                            <span className="px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-purple-100 text-purple-700">
                              {t.customBadge}
                            </span>
                          )}
                        </div>

                        {/* Secondary language name */}
                        <span className="text-xs text-slate-400 font-medium">
                          {lang === 'ar' ? item.nameEn : item.nameAr}
                        </span>

                        {/* Waste description if any */}
                        {wasteDesc && item.yieldPercent < 100 && (
                          <div className="mt-1 flex items-center gap-1 text-[11px] text-amber-700 font-medium bg-amber-50/80 px-2 py-0.5 rounded-md w-fit">
                            <Info className="w-3 h-3 shrink-0" />
                            <span>{wasteDesc}</span>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Market Price (Inline Editable) */}
                    <td className="py-4 px-4 text-center align-middle">
                      <div className="inline-flex items-center border border-slate-200 rounded-xl bg-white shadow-2xs focus-within:ring-2 focus-within:ring-emerald-500 focus-within:border-emerald-500 overflow-hidden">
                        <input
                          type="number"
                          min="1"
                          step="5"
                          value={item.price}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value);
                            onUpdatePrice(item.id, isNaN(val) ? 0 : val);
                          }}
                          className="w-20 px-2 py-1.5 text-center text-sm font-bold text-slate-800 bg-transparent focus:outline-hidden"
                        />
                        <span className="pe-2 text-xs font-semibold text-slate-400 select-none">
                          {t.currency}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1">
                        / {getUnitLabel(item)}
                      </div>
                    </td>

                    {/* Net Edible Yield (Inline Editable) */}
                    <td className="py-4 px-4 text-center align-middle">
                      <div className="flex flex-col items-center">
                        <div className="inline-flex items-center border border-slate-200 rounded-xl bg-white shadow-2xs focus-within:ring-2 focus-within:ring-emerald-500 overflow-hidden px-1.5 py-0.5">
                          <input
                            type="number"
                            min="5"
                            max="100"
                            step="1"
                            value={item.yieldPercent}
                            onChange={(e) => {
                              const val = parseInt(e.target.value, 10);
                              onUpdateYield(item.id, isNaN(val) ? 100 : Math.min(100, Math.max(5, val)));
                            }}
                            className="w-12 text-center text-xs font-bold text-slate-800 bg-transparent focus:outline-hidden"
                          />
                          <span className="text-xs font-bold text-slate-400 select-none">%</span>
                        </div>
                        
                        {/* Yield bar */}
                        <div className="w-16 bg-slate-200 h-1.5 rounded-full overflow-hidden mt-1.5">
                          <div
                            className={`h-full ${item.yieldPercent === 100 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                            style={{ width: `${item.yieldPercent}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Net Protein per Unit */}
                    <td className="py-4 px-4 text-center align-middle">
                      <div className="font-bold text-slate-800 text-sm">
                        {item.netProteinPerUnit.toFixed(1)} {t.gram}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {lang === 'ar' ? 'صافي لكل ' : 'net / '}
                        {getUnitLabel(item)}
                      </div>
                    </td>

                    {/* Cost per 1g of Protein */}
                    <td className="py-4 px-4 text-center align-middle">
                      <div className={`inline-flex flex-col items-center px-3 py-1.5 rounded-xl border ${
                        isBest
                          ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                          : item.costPerGramProtein <= 4
                          ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                          : 'bg-slate-50 text-slate-800 border-slate-200'
                      }`}>
                        <span className="text-base font-extrabold tracking-tight">
                          {item.costPerGramProtein.toFixed(2)}
                        </span>
                        <span className={`text-[10px] font-semibold ${isBest ? 'text-amber-100' : 'text-slate-500'}`}>
                          {t.perGram}
                        </span>
                      </div>
                    </td>

                    {/* Daily Quantity Needed & Daily Cost */}
                    <td className="py-4 px-4 text-center align-middle">
                      <div className="font-bold text-slate-800 text-xs sm:text-sm">
                        {item.unit === 'kg'
                          ? `${item.dailyQuantityNeeded.toFixed(2)} ${t.unit_kg}`
                          : item.unit === 'liter'
                          ? `${item.dailyQuantityNeeded.toFixed(2)} ${t.unit_liter}`
                          : item.unit === '100g'
                          ? `${item.dailyQuantityNeeded.toFixed(1)} ${t.unit_100g}`
                          : item.pieceWeightGrams
                          ? `${item.dailyQuantityNeeded.toFixed(1)} ${lang === 'ar' ? 'علبة' : 'pots'}`
                          : `${item.dailyQuantityNeeded.toFixed(1)} ${t.unit_piece}`}
                      </div>
                      <div className="text-[11px] font-semibold text-emerald-700 mt-0.5">
                        ~{Math.round(item.dailyCost).toLocaleString()} {t.currency} / {t.day}
                      </div>
                    </td>

                    {/* Action Column */}
                    <td className="py-4 px-3 text-center align-middle">
                      <button
                        onClick={() => {
                          if (confirm(t.deleteConfirm)) {
                            onDeleteFood(item.id);
                          }
                        }}
                        className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 p-2 rounded-lg transition"
                        title={lang === 'ar' ? 'حذف' : 'Delete'}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
