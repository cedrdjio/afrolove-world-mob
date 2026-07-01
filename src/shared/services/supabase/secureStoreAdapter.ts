import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

/**
 * Supabase persists the full auth session (access + refresh token, user
 * metadata) as one JSON string, which routinely exceeds SecureStore's
 * ~2048 byte per-item limit on Android. This adapter transparently splits
 * large values across numbered chunk keys so nothing ever touches
 * AsyncStorage or any other unencrypted storage.
 */
const CHUNK_SIZE = 1800;

// expo-secure-store has no web implementation (SecureStore.getItemAsync
// throws "getValueWithKeyAsync is not a function" there), so the web build
// falls back to localStorage instead of crashing the whole session load.
const webStorageAdapter = {
  async getItem(key: string): Promise<string | null> {
    return globalThis.localStorage?.getItem(key) ?? null;
  },
  async setItem(key: string, value: string): Promise<void> {
    globalThis.localStorage?.setItem(key, value);
  },
  async removeItem(key: string): Promise<void> {
    globalThis.localStorage?.removeItem(key);
  },
};

function chunkKey(key: string, index: number) {
  return `${key}_chunk_${index}`;
}

async function readChunked(key: string): Promise<string | null> {
  const chunkCountRaw = await SecureStore.getItemAsync(`${key}_chunks`);
  if (!chunkCountRaw) {
    return SecureStore.getItemAsync(key);
  }

  const chunkCount = Number(chunkCountRaw);
  const chunks = await Promise.all(
    Array.from({ length: chunkCount }, (_, index) => SecureStore.getItemAsync(chunkKey(key, index))),
  );
  if (chunks.some((chunk) => chunk === null)) return null;
  return chunks.join('');
}

async function clearChunked(key: string): Promise<void> {
  const chunkCountRaw = await SecureStore.getItemAsync(`${key}_chunks`);
  if (chunkCountRaw) {
    const chunkCount = Number(chunkCountRaw);
    await Promise.all(
      Array.from({ length: chunkCount }, (_, index) => SecureStore.deleteItemAsync(chunkKey(key, index))),
    );
    await SecureStore.deleteItemAsync(`${key}_chunks`);
  }
  await SecureStore.deleteItemAsync(key);
}

const nativeStorageAdapter = {
  getItem: readChunked,
  async setItem(key: string, value: string): Promise<void> {
    await clearChunked(key);

    if (value.length <= CHUNK_SIZE) {
      await SecureStore.setItemAsync(key, value);
      return;
    }

    const chunks: string[] = [];
    for (let i = 0; i < value.length; i += CHUNK_SIZE) {
      chunks.push(value.slice(i, i + CHUNK_SIZE));
    }
    await SecureStore.setItemAsync(`${key}_chunks`, String(chunks.length));
    await Promise.all(chunks.map((chunk, index) => SecureStore.setItemAsync(chunkKey(key, index), chunk)));
  },
  removeItem: clearChunked,
};

export const secureStoreAdapter = Platform.OS === 'web' ? webStorageAdapter : nativeStorageAdapter;
