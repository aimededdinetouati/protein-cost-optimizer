export type Category = 'animal' | 'plant';

export type UnitType = 'kg' | '100g' | 'piece' | 'liter';

export interface FoodItem {
  id: string;
  category: Category;
  nameEn: string;
  nameAr: string;
  price: number; // in DZD
  unit: UnitType;
  rawProteinPer100gOrUnit: number; // grams of protein per 100g/100ml (or per piece if pieceWeightGrams not set)
  pieceWeightGrams?: number; // custom net weight in grams for a piece/container (e.g. 90g for Soummam cheese, 140g for tuna)
  caloriesPer100gOrUnit?: number; // kcal per 100g/100ml (or per piece if pieceWeightGrams not set)
  yieldPercent: number; // 0 to 100 (e.g. 53% for sardines, 68% for chicken thighs, 100% for boneless breasts/eggs)
  wasteDescriptionEn?: string;
  wasteDescriptionAr?: string;
  isCustom?: boolean;
}

export interface BasketItem {
  foodId: string;
  quantity: number; // in native units: kg, liter, 100g, piece
}

export interface UserProfile {
  email: string;
  updatedAt: string;
  targetDailyProtein: number; // e.g., 140g
  foods: FoodItem[];
  basket?: BasketItem[];
}

export interface CalculatedFoodItem extends FoodItem {
  netProteinPerUnit: number; // Net edible protein in grams per unit (per kg, per 100g, or per piece)
  netCaloriesPerUnit: number; // Net kcal per unit (per kg, per 100g, per liter, or per piece)
  costPerGramProtein: number; // DZD/g of net edible protein
  dailyQuantityNeeded: number; // Quantity in item's unit to meet targetDailyProtein
  dailyCost: number; // DZD/day
  monthlyCost: number; // DZD/month (30 days)
  rank: number; // Rank within category (1 = cheapest cost per gram of protein)
}

export type Language = 'ar' | 'en';
