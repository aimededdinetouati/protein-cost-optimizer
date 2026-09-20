'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { FoodItem, Category, Language, BasketItem } from '@/types';
import { defaultFoods, rankAndCalculateFoods, mergeWithDefaults, defaultBasket } from '@/lib/defaultData';
import { translations } from '@/lib/translations';
import { Header } from '@/components/Header';
import { TargetCalculator } from '@/components/TargetCalculator';
import { ProteinTable } from '@/components/ProteinTable';
import { EmailAuthModal } from '@/components/EmailAuthModal';
import { AddFoodModal } from '@/components/AddFoodModal';
import { ResetDefaultsModal } from '@/components/ResetDefaultsModal';
import { LayoutList, Calculator, Target, ChevronLeft, ChevronRight, ArrowLeft, ArrowRight } from 'lucide-react';

export default function Home() {
  const [lang, setLang] = useState<Language>('ar');
  const [email, setEmail] = useState<string | null>(null);
  const [foods, setFoods] = useState<FoodItem[]>(defaultFoods);
  const [targetDailyProtein, setTargetDailyProtein] = useState<number>(140);
  const [basket, setBasket] = useState<BasketItem[]>(defaultBasket);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  // Navigation tab state: 'tables' (default main view) | 'simulator'
  const [activeTab, setActiveTab] = useState<'tables' | 'simulator'>('tables');

  // Modal states
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [addModalCategory, setAddModalCategory] = useState<Category>('animal');
  const [isResetModalOpen, setIsResetModalOpen] = useState<boolean>(false);

  // Critical flag: prevent auto-saving until user profile is completely loaded
  const isDataLoaded = useRef(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const t = translations[lang];

  // Fetch or Seed user profile from API
  const loadUserProfile = useCallback(async (userEmail: string) => {
    setSaveStatus('saving');
    try {
      const res = await fetch(`/api/user-data?email=${encodeURIComponent(userEmail)}`, {
        cache: 'no-store',
      });
      if (res.ok) {
        const data = await res.json();
        if (data.foods && Array.isArray(data.foods)) {
          setFoods(mergeWithDefaults(data.foods));
        }
        if (data.targetDailyProtein) {
          setTargetDailyProtein(data.targetDailyProtein);
        }
        if (data.basket && Array.isArray(data.basket)) {
          setBasket(data.basket);
        }
        setSaveStatus('saved');
        return data;
      } else {
        setSaveStatus('error');
        return null;
      }
    } catch (err) {
      console.error('Failed to load user profile:', err);
      setSaveStatus('error');
      return null;
    }
  }, []);

  // Initialize client state from localStorage on mount
  useEffect(() => {
    const initApp = async () => {
      const savedLang = localStorage.getItem('app_language') as Language;
      if (savedLang && (savedLang === 'ar' || savedLang === 'en')) {
        setLang(savedLang);
        document.documentElement.dir = savedLang === 'ar' ? 'rtl' : 'ltr';
        document.documentElement.lang = savedLang;
      } else {
        document.documentElement.dir = 'rtl';
        document.documentElement.lang = 'ar';
      }

      const storedEmail = localStorage.getItem('current_user_email');
      if (storedEmail) {
        setEmail(storedEmail);
        await loadUserProfile(storedEmail);
        isDataLoaded.current = true;
      } else {
        // Check for guest data
        const guestData = localStorage.getItem('guest_user_data');
        if (guestData) {
          try {
            const parsed = JSON.parse(guestData);
            if (parsed.foods && Array.isArray(parsed.foods)) {
              setFoods(mergeWithDefaults(parsed.foods));
            }
            if (parsed.targetDailyProtein) {
              setTargetDailyProtein(parsed.targetDailyProtein);
            }
            if (parsed.basket && Array.isArray(parsed.basket)) {
              setBasket(parsed.basket);
            }
          } catch {
            // ignore corrupted guest data
          }
        }
        isDataLoaded.current = true;
        // Open auth modal on initial visit
        setIsAuthModalOpen(true);
      }
    };

    initApp();
  }, [loadUserProfile]);

  const handleToggleLang = () => {
    const newLang = lang === 'ar' ? 'en' : 'ar';
    setLang(newLang);
    document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = newLang;
    localStorage.setItem('app_language', newLang);
  };

  // Debounced auto-save (500ms) - ONLY runs when isDataLoaded.current is true
  useEffect(() => {
    if (!isDataLoaded.current) {
      return;
    }

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    const timer = setTimeout(() => {
      setSaveStatus('saving');
    }, 0);

    saveTimeoutRef.current = setTimeout(async () => {
      if (email) {
        try {
          const res = await fetch('/api/user-data', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email,
              targetDailyProtein,
              foods,
              basket,
            }),
          });
          if (res.ok) {
            setSaveStatus('saved');
          } else {
            setSaveStatus('error');
          }
        } catch (err) {
          console.error('Auto-save error:', err);
          setSaveStatus('error');
        }
      } else {
        // Save guest state in localStorage
        localStorage.setItem(
          'guest_user_data',
          JSON.stringify({
            targetDailyProtein,
            foods,
            basket,
            updatedAt: new Date().toISOString(),
          })
        );
        setSaveStatus('saved');
      }
    }, 500);

    return () => {
      clearTimeout(timer);
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [foods, targetDailyProtein, basket, email]);

  // Calculations & Sorting
  const { animal: animalCalculated, plant: plantCalculated } = useMemo(() => {
    return rankAndCalculateFoods(foods, targetDailyProtein);
  }, [foods, targetDailyProtein]);

  // In-place update handlers
  const handleUpdatePrice = (id: string, newPrice: number) => {
    setFoods((prev) =>
      prev.map((item) => (item.id === id ? { ...item, price: newPrice } : item))
    );
  };

  const handleUpdateYield = (id: string, newYield: number) => {
    setFoods((prev) =>
      prev.map((item) => (item.id === id ? { ...item, yieldPercent: newYield } : item))
    );
  };

  const handleDeleteFood = (id: string) => {
    setFoods((prev) => prev.filter((item) => item.id !== id));
  };

  const handleAddFood = (newFoodData: Omit<FoodItem, 'id'>) => {
    const newItem: FoodItem = {
      ...newFoodData,
      id: `custom-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    };
    setFoods((prev) => [newItem, ...prev]);
  };

  const handleResetDefaults = () => {
    setFoods(defaultFoods);
    setTargetDailyProtein(140);
    setBasket(defaultBasket);
  };

  const handleSubmitEmail = async (newEmail: string) => {
    setIsAuthModalOpen(false);
    // Block auto-save while loading remote profile for the new email
    isDataLoaded.current = false;
    setEmail(newEmail);
    localStorage.setItem('current_user_email', newEmail);
    await loadUserProfile(newEmail);
    isDataLoaded.current = true;
  };

  const handleContinueAsGuest = () => {
    setIsAuthModalOpen(false);
  };

  const handleOpenAddModal = (category: Category) => {
    setAddModalCategory(category);
    setIsAddModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Top Navigation & App Bar */}
      <Header
        lang={lang}
        onToggleLang={handleToggleLang}
        email={email}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onOpenResetModal={() => setIsResetModalOpen(true)}
        saveStatus={saveStatus}
      />

      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        {/* Navigation Tabs (Tables View vs Simulator View) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-7">
          
          {/* Segmented Control */}
          <div className="inline-flex p-1.5 rounded-2xl bg-slate-200/80 border border-slate-300/60 shadow-2xs">
            <button
              onClick={() => setActiveTab('tables')}
              className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all duration-150 cursor-pointer ${
                activeTab === 'tables'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutList className="w-4 h-4 text-emerald-600" />
              <span>{t.tabTables}</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                activeTab === 'tables' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-300/70 text-slate-600'
              }`}>
                {foods.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('simulator')}
              className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all duration-150 cursor-pointer ${
                activeTab === 'simulator'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Calculator className="w-4 h-4 text-emerald-600" />
              <span>{t.tabSimulator}</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                activeTab === 'simulator' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-300/70 text-slate-600'
              }`}>
                {targetDailyProtein}g
              </span>
            </button>
          </div>

          {/* Quick Context Action based on active tab */}
          {activeTab === 'tables' ? (
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200/80 shadow-2xs text-xs text-slate-600">
              <Target className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="text-slate-500 font-medium">{t.activeTargetQuickNote}</span>
              <span className="font-extrabold text-slate-900">{targetDailyProtein} {t.gram}/{t.day}</span>
              <button
                onClick={() => setActiveTab('simulator')}
                className="text-emerald-700 hover:text-emerald-800 font-bold ms-2 hover:underline inline-flex items-center gap-0.5 cursor-pointer"
              >
                <span>{t.openSimulatorBtn}</span>
                {lang === 'ar' ? <ChevronLeft className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
              </button>
            </div>
          ) : (
            <button
              onClick={() => setActiveTab('tables')}
              className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-slate-900 bg-white border border-slate-200/80 px-3.5 py-2 rounded-xl shadow-2xs transition hover:bg-slate-50 cursor-pointer"
            >
              {lang === 'ar' ? <ArrowRight className="w-3.5 h-3.5 text-emerald-600" /> : <ArrowLeft className="w-3.5 h-3.5 text-emerald-600" />}
              <span>{t.openTablesBtn}</span>
            </button>
          )}

        </div>

        {/* TAB 1: Main Tables View */}
        {activeTab === 'tables' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            {/* Table 1: Animal Protein Sources */}
            <ProteinTable
              category="animal"
              title={t.animalCategoryTitle}
              description={t.animalCategoryDesc}
              items={animalCalculated}
              lang={lang}
              onUpdatePrice={handleUpdatePrice}
              onUpdateYield={handleUpdateYield}
              onDeleteFood={handleDeleteFood}
              onOpenAddModal={handleOpenAddModal}
            />

            {/* Table 2: Plant Protein Sources */}
            <ProteinTable
              category="plant"
              title={t.plantCategoryTitle}
              description={t.plantCategoryDesc}
              items={plantCalculated}
              lang={lang}
              onUpdatePrice={handleUpdatePrice}
              onUpdateYield={handleUpdateYield}
              onDeleteFood={handleDeleteFood}
              onOpenAddModal={handleOpenAddModal}
            />
          </div>
        )}

        {/* TAB 2: Dedicated Simulator View */}
        {activeTab === 'simulator' && (
          <div className="animate-in fade-in duration-150">
            <TargetCalculator
              targetProtein={targetDailyProtein}
              onTargetChange={setTargetDailyProtein}
              animalItems={animalCalculated}
              plantItems={plantCalculated}
              lang={lang}
              basket={basket}
              onBasketChange={setBasket}
            />
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/80 bg-white py-6 text-center text-xs text-slate-500 mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>
            {t.appTitle} • {lang === 'ar' ? 'بيانات السوق الجزائري المعتمدة' : 'Verified Algerian Market Benchmarks'}
          </p>
          <p className="text-slate-400">
            {lang === 'ar'
              ? 'مستضاف مجاناً 100% على Netlify بواسطة Next.js App Router و Netlify Blobs'
              : '100% Free Tier on Netlify via Next.js App Router & Netlify Blobs'}
          </p>
        </div>
      </footer>

      {/* Modals */}
      <EmailAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSubmitEmail={handleSubmitEmail}
        onContinueAsGuest={handleContinueAsGuest}
        currentEmail={email}
        lang={lang}
      />

      <AddFoodModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddFood={handleAddFood}
        defaultCategory={addModalCategory}
        lang={lang}
      />

      <ResetDefaultsModal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        onConfirm={handleResetDefaults}
        lang={lang}
      />
    </div>
  );
}
