import { getStore } from '@netlify/blobs';
import fs from 'fs';
import path from 'path';
import { UserProfile } from '@/types';
import { defaultFoods } from './defaultData';

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
    const store = getStore({ name: 'protein_users', consistency: 'strong' });
    const data = (await store.get(normalizedEmail, { type: 'json' })) as UserProfile | null;
    if (data) {
      return data;
    }

    // Seed new profile with Algerian defaults
    const initialProfile: UserProfile = {
      email: normalizedEmail,
      updatedAt: new Date().toISOString(),
      targetDailyProtein: 140,
      foods: defaultFoods,
    };
    await store.setJSON(normalizedEmail, initialProfile);
    return initialProfile;
  } catch {
    // Graceful fallback for local development when Netlify Blobs context is not present
    try {
      ensureLocalDir();
      const filePath = getLocalFilePath(normalizedEmail);
      if (fs.existsSync(filePath)) {
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        return JSON.parse(fileContent);
      }
      const initialProfile: UserProfile = {
        email: normalizedEmail,
        updatedAt: new Date().toISOString(),
        targetDailyProtein: 140,
        foods: defaultFoods,
      };
      fs.writeFileSync(filePath, JSON.stringify(initialProfile, null, 2), 'utf-8');
      return initialProfile;
    } catch {
      return {
        email: normalizedEmail,
        updatedAt: new Date().toISOString(),
        targetDailyProtein: 140,
        foods: defaultFoods,
      };
    }
  }
}

export async function saveUserProfile(profile: UserProfile): Promise<UserProfile> {
  const normalizedEmail = profile.email.toLowerCase().trim();
  const updatedProfile: UserProfile = {
    ...profile,
    email: normalizedEmail,
    updatedAt: new Date().toISOString(),
  };

  try {
    const store = getStore({ name: 'protein_users', consistency: 'strong' });
    await store.setJSON(normalizedEmail, updatedProfile);
    return updatedProfile;
  } catch {
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
