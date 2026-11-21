import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const SESSION_TOKEN_KEY = 'goa_session_token';

export async function saveToken(token: string): Promise<void> {
  try {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined') localStorage.setItem(SESSION_TOKEN_KEY, token);
    } else {
      await SecureStore.setItemAsync(SESSION_TOKEN_KEY, token);
    }
  } catch {}
}

export async function getToken(): Promise<string | null> {
  try {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined') return localStorage.getItem(SESSION_TOKEN_KEY);
    } else {
      return await SecureStore.getItemAsync(SESSION_TOKEN_KEY);
    }
  } catch {}
  return null;
}

export async function removeToken(): Promise<void> {
  try {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined') localStorage.removeItem(SESSION_TOKEN_KEY);
    } else {
      await SecureStore.deleteItemAsync(SESSION_TOKEN_KEY);
    }
  } catch {}
}

