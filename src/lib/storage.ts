import { MemoryState, MemoryStore } from '../types/memory';

const MEMORY_STORE_KEY = 'context_bridge_memories';
const API_KEY_STORAGE_KEY = 'context_bridge_api_key';

async function getRawStore(): Promise<MemoryStore> {
  const result = await chrome.storage.local.get(MEMORY_STORE_KEY);
  return (result[MEMORY_STORE_KEY] ?? {}) as MemoryStore;
}

export async function getAllMemories(): Promise<MemoryState[]> {
  const store = await getRawStore();
  return Object.values(store).sort((a, b) => {
    if (a.pinned === b.pinned) return b.createdAt - a.createdAt;
    return a.pinned ? -1 : 1;
  });
}

export async function getMemory(id: string): Promise<MemoryState | null> {
  const store = await getRawStore();
  return store[id] ?? null;
}

export async function saveMemory(memory: MemoryState): Promise<void> {
  const store = await getRawStore();
  store[memory.id] = memory;
  await chrome.storage.local.set({ [MEMORY_STORE_KEY]: store });
}

export async function deleteMemory(id: string): Promise<void> {
  const store = await getRawStore();
  delete store[id];
  await chrome.storage.local.set({ [MEMORY_STORE_KEY]: store });
}

export async function updateMemory(id: string, updates: Partial<MemoryState>): Promise<void> {
  const store = await getRawStore();
  const memory = store[id];
  if (!memory) throw new Error(`Memory ${id} not found`);
  store[id] = { ...memory, ...updates };
  await chrome.storage.local.set({ [MEMORY_STORE_KEY]: store });
}

export async function saveApiKey(key: string): Promise<void> {
  await chrome.storage.local.set({ [API_KEY_STORAGE_KEY]: key });
}

export async function getApiKey(): Promise<string | null> {
  const result = await chrome.storage.local.get(API_KEY_STORAGE_KEY);
  const key = result[API_KEY_STORAGE_KEY];
  return typeof key === 'string' ? key : null;
}

export async function clearApiKey(): Promise<void> {
  await chrome.storage.local.remove(API_KEY_STORAGE_KEY);
}

export async function hasApiKey(): Promise<boolean> {
  const key = await getApiKey();
  return !!key;
}

export async function clearAllMemories(): Promise<void> {
  await chrome.storage.local.remove(MEMORY_STORE_KEY);
}
