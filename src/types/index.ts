export type Category = 'animal' | 'plant';

export type UnitType = 'kg' | '100g' | 'piece' | 'liter';

export interface FoodItem {
  id: string;
  category: Category;
  nameEn: string;
  nameAr: string;
  price: number; // in DZD
  unit: UnitType;
  rawProteinPer100gOrUnit: number; // grams of protein per 100g/100ml (or per piece if unit is 'piece')
  yieldPercent: number; // 0 to 100 (e.g. 53% for sardines, 68% for chicken thighs, 100% for boneless breasts/eggs)
  wasteDescriptionEn?: string;
  wasteDescriptionAr?: string;
  isCustom?: boolean;
}

export interface UserProfile {
  email: string;
  updatedAt: string;
  targetDailyProtein: number; // e.g., 140g
  foods: FoodItem[];
}

export interface CalculatedFoodItem extends FoodItem {
  netProteinPerUnit: number; // Net edible protein in grams per unit (per kg, per 100g, or per piece)
  costPerGramProtein: number; // DZD/g of net edible protein
  dailyQuantityNeeded: number; // Quantity in item's unit to meet targetDailyProtein
  dailyCost: number; // DZD/day
  monthlyCost: number; // DZD/month (30 days)
  rank: number; // Rank within category (1 = cheapest cost per gram of protein)
}

export type Language = 'ar' | 'en';
