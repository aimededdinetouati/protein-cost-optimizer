'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { FoodItem, Category, Language } from '@/types';
import { defaultFoods, rankAndCalculateFoods, mergeWithDefaults } from '@/lib/defaultData';
import { translations } from '@/lib/translations';
import { Header } from '@/components/Header';
import { TargetCalculator } from '@/components/TargetCalculator';
import { ProteinTable } from '@/components/ProteinTable';
import { EmailAuthModal } from '@/components/EmailAuthModal';
import { AddFoodModal } from '@/components/AddFoodModal';
import { ResetDefaultsModal } from '@/components/ResetDefaultsModal';

export default function Home() {
  const [lang, setLang] = useState<Language>('ar');
  const [email, setEmail] = useState<string | null>(null);
  const [foods, setFoods] = useState<FoodItem[]>(defaultFoods);
  const [targetDailyProtein, setTargetDailyProtein] = useState<number>(140);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  // Modal states
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [addModalCategory, setAddModalCategory] = useState<Category>('animal');
  const [isResetModalOpen, setIsResetModalOpen] = useState<boolean>(false);

  // Flags to avoid auto-saving during initial load
  const isInitialMount = useRef(true);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const t = translations[lang];

  // Fetch or Seed user profile from API
  const loadUserProfile = useCallback(async (userEmail: string) => {
    setSaveStatus('saving');
    try {
      const res = await fetch(`/api/user-data?email=${encodeURIComponent(userEmail)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.foods && Array.isArray(data.foods)) {
          setFoods(mergeWithDefaults(data.foods));
        }
        if (data.targetDailyProtein) {
          setTargetDailyProtein(data.targetDailyProtein);
        }
        setSaveStatus('saved');
      } else {
        setSaveStatus('error');
      }
    } catch (err) {
      console.error('Failed to load user profile:', err);
      setSaveStatus('error');
    }
  }, []);

  // Initialize client state from localStorage on mount
  useEffect(() => {
    const timer = setTimeout(() => {
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
        loadUserProfile(storedEmail);
      } else {
        // Check for guest data
        const guestData = localStorage.getItem('guest_user_data');
        if (guestData) {
          try {
            const parsed = JSON.parse(guestData);
            if (parsed.foods && Array.isArray(parsed.foods)) {
              setFoods(mergeWithDefaults(parsed.foods));
            }
            if (parsed.targetDailyProtein) setTargetDailyProtein(parsed.targetDailyProtein);
          } catch {
            // ignore corrupted guest data
          }
        }
        // Open auth modal on initial visit
        setIsAuthModalOpen(true);
      }
    }, 0);

    return () => clearTimeout(timer);
  }, [loadUserProfile]);

  const handleToggleLang = () => {
    const newLang = lang === 'ar' ? 'en' : 'ar';
    setLang(newLang);
    document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = newLang;
    localStorage.setItem('app_language', newLang);
  };

  // Debounced auto-save (500ms)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
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
  }, [foods, targetDailyProtein, email]);

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
  };

  const handleSubmitEmail = (newEmail: string) => {
    setEmail(newEmail);
    localStorage.setItem('current_user_email', newEmail);
    setIsAuthModalOpen(false);
    loadUserProfile(newEmail);
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
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        
        {/* Interactive Target Budget Simulator */}
        <TargetCalculator
          targetProtein={targetDailyProtein}
          onTargetChange={setTargetDailyProtein}
          animalItems={animalCalculated}
          plantItems={plantCalculated}
          lang={lang}
        />

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

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/80 bg-white py-6 text-center text-xs text-slate-500">
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
