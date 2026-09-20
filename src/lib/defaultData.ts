import { FoodItem, CalculatedFoodItem } from '@/types';

export const defaultFoods: FoodItem[] = [
  // Animal Sources
  {
    id: 'whole-eggs',
    category: 'animal',
    nameAr: 'بيض كامل',
    nameEn: 'Whole Eggs',
    price: 20,
    unit: 'piece',
    rawProteinPer100gOrUnit: 6.0,
    yieldPercent: 100,
    wasteDescriptionAr: 'بدون فضلات',
    wasteDescriptionEn: 'No waste',
    isCustom: false,
  },
  {
    id: 'chicken-breast',
    category: 'animal',
    nameAr: 'صدر دجاج',
    nameEn: 'Chicken Breast',
    price: 1050,
    unit: 'kg',
    rawProteinPer100gOrUnit: 23.0,
    yieldPercent: 100,
    wasteDescriptionAr: 'صدر منزوع الجلد والعظم',
    wasteDescriptionEn: 'Boneless, skinless breast',
    isCustom: false,
  },
  {
    id: 'turkey-breast',
    category: 'animal',
    nameAr: 'إسكالوب دند',
    nameEn: 'Turkey Breast / Escalope',
    price: 1050,
    unit: 'kg',
    rawProteinPer100gOrUnit: 24.0,
    yieldPercent: 100,
    wasteDescriptionAr: 'إسكالوب هبرة صافي',
    wasteDescriptionEn: 'Lean escalope fillet',
    isCustom: false,
  },
  {
    id: 'chicken-thighs',
    category: 'animal',
    nameAr: 'أفخاذ دجاج',
    nameEn: 'Chicken Thighs',
    price: 600,
    unit: 'kg',
    rawProteinPer100gOrUnit: 19.5,
    yieldPercent: 68,
    wasteDescriptionAr: '32% فضلات (عظام وجلد)',
    wasteDescriptionEn: '32% waste (bones and skin)',
    isCustom: false,
  },
  {
    id: 'egg-whites',
    category: 'animal',
    nameAr: 'بياض بيض مفصول',
    nameEn: 'Separated Egg Whites',
    price: 20,
    unit: 'piece',
    rawProteinPer100gOrUnit: 3.6,
    yieldPercent: 100,
    wasteDescriptionAr: 'بياض بيضة واحدة فقط',
    wasteDescriptionEn: 'White of 1 egg only',
    isCustom: false,
  },
  {
    id: 'sardines',
    category: 'animal',
    nameAr: 'سردين طازج',
    nameEn: 'Fresh Whole Sardines',
    price: 800,
    unit: 'kg',
    rawProteinPer100gOrUnit: 21.0,
    yieldPercent: 53,
    wasteDescriptionAr: '47% فضلات (الرأس، الأحشاء، السلسول)',
    wasteDescriptionEn: '47% waste (head, viscera, spine)',
    isCustom: false,
  },
  {
    id: 'skyr-yogurt',
    category: 'animal',
    nameAr: 'ياغورت سكير 0%',
    nameEn: 'Skyr Yogurt 0%',
    price: 60,
    unit: '100g',
    rawProteinPer100gOrUnit: 8.0,
    yieldPercent: 100,
    wasteDescriptionAr: 'بدون فضلات',
    wasteDescriptionEn: 'No waste',
    isCustom: false,
  },
  {
    id: 'candia-milk',
    category: 'animal',
    nameAr: 'حليب كانديا (1 لتر)',
    nameEn: 'Candia Milk (1L)',
    price: 140,
    unit: 'liter',
    rawProteinPer100gOrUnit: 3.0,
    yieldPercent: 100,
    wasteDescriptionAr: 'بدون فضلات (3غ بروتين / 100مل)',
    wasteDescriptionEn: 'No waste (3g protein / 100ml)',
    isCustom: false,
  },
  {
    id: 'soummam-cheese',
    category: 'animal',
    nameAr: 'جبن طبيعي صومام (علبة 90غ)',
    nameEn: 'Soummam Natural Cheese (90g pot)',
    price: 45,
    unit: 'piece',
    pieceWeightGrams: 90,
    rawProteinPer100gOrUnit: 7.5,
    yieldPercent: 100,
    wasteDescriptionAr: 'علبة 90غ (7.5غ بروتين لكل 100غ)',
    wasteDescriptionEn: '90g container (7.5g protein per 100g)',
    isCustom: false,
  },

  // Plant Sources
  {
    id: 'red-lentils',
    category: 'plant',
    nameAr: 'عدس أحمر جاف',
    nameEn: 'Red Lentils (Dry)',
    price: 300,
    unit: 'kg',
    rawProteinPer100gOrUnit: 24.0,
    yieldPercent: 100,
    wasteDescriptionAr: 'حبوب جافة 100% صالحة للاستهلاك',
    wasteDescriptionEn: '100% edible dry legumes',
    isCustom: false,
  },
  {
    id: 'white-beans',
    category: 'plant',
    nameAr: 'لوبيا بيضاء جافة',
    nameEn: 'White Haricot Beans / Loubia',
    price: 340,
    unit: 'kg',
    rawProteinPer100gOrUnit: 21.0,
    yieldPercent: 100,
    wasteDescriptionAr: 'حبوب جافة 100% صالحة للاستهلاك',
    wasteDescriptionEn: '100% edible dry legumes',
    isCustom: false,
  },
  {
    id: 'chickpeas',
    category: 'plant',
    nameAr: 'حمص جاف',
    nameEn: 'Chickpeas / Homs',
    price: 420,
    unit: 'kg',
    rawProteinPer100gOrUnit: 19.0,
    yieldPercent: 100,
    wasteDescriptionAr: 'حبوب جافة 100% صالحة للاستهلاك',
    wasteDescriptionEn: '100% edible dry legumes',
    isCustom: false,
  },
];

export function calculateFoodMetrics(item: FoodItem, targetDailyProtein: number): CalculatedFoodItem {
  const yieldRatio = Math.max(0.01, (item.yieldPercent || 100) / 100);
  let netProteinPerUnit = 0;

  if (item.unit === 'kg' || item.unit === 'liter') {
    // rawProteinPer100gOrUnit * 10 = raw protein in 1000g / 1000ml (1L) * yieldRatio
    netProteinPerUnit = item.rawProteinPer100gOrUnit * 10 * yieldRatio;
  } else if (item.unit === '100g') {
    netProteinPerUnit = item.rawProteinPer100gOrUnit * yieldRatio;
  } else {
    // piece / container
    if (item.pieceWeightGrams && item.pieceWeightGrams > 0) {
      // rawProteinPer100gOrUnit is per 100g, scaled to container weight
      netProteinPerUnit = item.rawProteinPer100gOrUnit * (item.pieceWeightGrams / 100) * yieldRatio;
    } else {
      netProteinPerUnit = item.rawProteinPer100gOrUnit * yieldRatio;
    }
  }

  const costPerGramProtein = netProteinPerUnit > 0 ? item.price / netProteinPerUnit : 0;
  const dailyQuantityNeeded = netProteinPerUnit > 0 ? targetDailyProtein / netProteinPerUnit : 0;
  const dailyCost = targetDailyProtein * costPerGramProtein;
  const monthlyCost = dailyCost * 30;

  return {
    ...item,
    netProteinPerUnit,
    costPerGramProtein,
    dailyQuantityNeeded,
    dailyCost,
    monthlyCost,
    rank: 0,
  };
}

export function rankAndCalculateFoods(foods: FoodItem[], targetDailyProtein: number): {
  animal: CalculatedFoodItem[];
  plant: CalculatedFoodItem[];
} {
  const animalCalculated = foods
    .filter((f) => f.category === 'animal')
    .map((f) => calculateFoodMetrics(f, targetDailyProtein))
    .sort((a, b) => a.costPerGramProtein - b.costPerGramProtein)
    .map((item, idx) => ({ ...item, rank: idx + 1 }));

  const plantCalculated = foods
    .filter((f) => f.category === 'plant')
    .map((f) => calculateFoodMetrics(f, targetDailyProtein))
    .sort((a, b) => a.costPerGramProtein - b.costPerGramProtein)
    .map((item, idx) => ({ ...item, rank: idx + 1 }));

  return { animal: animalCalculated, plant: plantCalculated };
}

export function mergeWithDefaults(savedFoods: FoodItem[]): FoodItem[] {
  if (!Array.isArray(savedFoods) || savedFoods.length === 0) {
    return defaultFoods;
  }
  const existingIds = new Set(savedFoods.map((f) => f.id));
  const missingDefaults = defaultFoods.filter((df) => !existingIds.has(df.id));
  return [...savedFoods, ...missingDefaults];
}
