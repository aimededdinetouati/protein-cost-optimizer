import { getStore } from '@netlify/blobs';
import fs from 'fs';
import path from 'path';
import { UserProfile } from '@/types';
import { defaultFoods, mergeWithDefaults, defaultBasket } from './defaultData';

const LOCAL_STORAGE_DIR = path.join(process.cwd(), '.local-blobs-data');

function getLocalFilePath(email: string): string {
  const sanitized = encodeURIComponent(email);
  return path.join(LOCAL_STORAGE_DIR, `${sanitized}.json`);
}

function ensureLocalDir() {
  if (!fs.existsSync(LOCAL_STORAGE_DIR)) {
    fs.mkdirSync(LOCAL_STORAGE_DIR, { recursive: true });
  }
}

export async function getUserProfile(email: string): Promise<UserProfile> {
  const normalizedEmail = email.toLowerCase().trim();

  // Try Netlify Blobs first
  try {
    const store = getStore('protein_users', { consistency: 'strong' });
    const data = (await store.get(normalizedEmail, { type: 'json' })) as UserProfile | null;
    if (data) {
      const mergedFoods = mergeWithDefaults(data.foods);
      const basket = Array.isArray(data.basket) && data.basket.length > 0 ? data.basket : defaultBasket;
      if (mergedFoods.length !== data.foods.length || !data.basket) {
        const updated: UserProfile = {
          ...data,
          foods: mergedFoods,
          basket,
          updatedAt: new Date().toISOString(),
        };
        await store.setJSON(normalizedEmail, updated);
        return updated;
      }
      return { ...data, foods: mergedFoods, basket };
    }

    // Seed new profile with Algerian defaults
    const initialProfile: UserProfile = {
      email: normalizedEmail,
      updatedAt: new Date().toISOString(),
      targetDailyProtein: 140,
      foods: defaultFoods,
      basket: defaultBasket,
    };
    await store.setJSON(normalizedEmail, initialProfile);
    return initialProfile;
  } catch (error) {
    console.warn('[Storage] Netlify Blobs read failed, attempting local fallback:', error);
    // Graceful fallback for local development when Netlify Blobs context is not present
    try {
      ensureLocalDir();
      const filePath = getLocalFilePath(normalizedEmail);
      if (fs.existsSync(filePath)) {
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const parsed: UserProfile = JSON.parse(fileContent);
        const mergedFoods = mergeWithDefaults(parsed.foods);
        const basket = Array.isArray(parsed.basket) && parsed.basket.length > 0 ? parsed.basket : defaultBasket;
        if (mergedFoods.length !== parsed.foods.length || !parsed.basket) {
          const updated: UserProfile = {
            ...parsed,
            foods: mergedFoods,
            basket,
            updatedAt: new Date().toISOString(),
          };
          fs.writeFileSync(filePath, JSON.stringify(updated, null, 2), 'utf-8');
          return updated;
        }
        return { ...parsed, foods: mergedFoods, basket };
      }
      const initialProfile: UserProfile = {
        email: normalizedEmail,
        updatedAt: new Date().toISOString(),
        targetDailyProtein: 140,
        foods: defaultFoods,
        basket: defaultBasket,
      };
      fs.writeFileSync(filePath, JSON.stringify(initialProfile, null, 2), 'utf-8');
      return initialProfile;
    } catch {
      return {
        email: normalizedEmail,
        updatedAt: new Date().toISOString(),
        targetDailyProtein: 140,
        foods: defaultFoods,
        basket: defaultBasket,
      };
    }
  }
}

export async function saveUserProfile(profile: UserProfile): Promise<UserProfile> {
  const normalizedEmail = profile.email.toLowerCase().trim();
  const updatedProfile: UserProfile = {
    ...profile,
    email: normalizedEmail,
    basket: Array.isArray(profile.basket) ? profile.basket : defaultBasket,
    updatedAt: new Date().toISOString(),
  };

  try {
    const store = getStore('protein_users', { consistency: 'strong' });
    await store.setJSON(normalizedEmail, updatedProfile);
    return updatedProfile;
  } catch (error) {
    console.warn('[Storage] Netlify Blobs write failed, attempting local fallback:', error);
    // Graceful fallback for local development
    try {
      ensureLocalDir();
      const filePath = getLocalFilePath(normalizedEmail);
      fs.writeFileSync(filePath, JSON.stringify(updatedProfile, null, 2), 'utf-8');
      return updatedProfile;
    } catch {
      return updatedProfile;
    }
  }
}
