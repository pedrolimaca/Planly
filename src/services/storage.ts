import { readSyncStore, writeSyncedCollection, type RecordData } from './syncStore';
/* ============================================================
   Local Storage Data Service
   
   This provides a fully functional data layer using localStorage.
   When Supabase is configured, the app can switch to remote storage.
   All CRUD operations are real and persist across sessions.
   ============================================================ */

import { v4 as uuidv4 } from 'uuid';

export function subscribeToData(callback: () => void): () => void {
  window.addEventListener('planly:data', callback);
  window.addEventListener('storage', callback);
  return () => { window.removeEventListener('planly:data', callback); window.removeEventListener('storage', callback); };
}

function notifyData() { queueMicrotask(() => window.dispatchEvent(new Event('planly:data'))); }

const STORAGE_PREFIX = 'lifeos_';

function getStorageKey(collection: string, userId: string): string {
  return `${STORAGE_PREFIX}${userId}_${collection}`;
}

export function getAllItems<T>(collection: string, userId: string): T[] {
  const synced=readSyncStore(userId);
  if(synced)return (synced.collections[collection]||[]) as T[];
  const data = localStorage.getItem(getStorageKey(collection, userId));
  if (!data) return [];
  const parsed: unknown = JSON.parse(data);
  if (!Array.isArray(parsed)) throw new Error(`Dados inválidos em ${collection}. Exporte o armazenamento antes de reparar.`);
  return parsed as T[];
}

export function getItemById<T extends { id: string }>(collection: string, userId: string, id: string): T | null {
  const items = getAllItems<T>(collection, userId);
  return items.find(item => item.id === id) || null;
}

export function createItem<T extends { id: string }>(
  collection: string,
  userId: string,
  item: Omit<T, 'id' | 'created_at' | 'updated_at'> & { id?: string }
): T {
  const items = getAllItems<T>(collection, userId);
  if(item.id && items.some(i=>i.id===item.id))throw new Error('Já existe um registro com este ID.');
  const now = new Date().toISOString();
  const newItem = {
    ...item,
    id: item.id || uuidv4(),
    created_at: now,
    updated_at: now,
  } as unknown as T;
  items.push(newItem);
  if(!writeSyncedCollection(userId,collection,items as unknown as RecordData[]))localStorage.setItem(getStorageKey(collection, userId), JSON.stringify(items));
  notifyData();
  return newItem;
}

export function updateItem<T extends { id: string }>(
  collection: string,
  userId: string,
  id: string,
  updates: Partial<T>
): T | null {
  const items = getAllItems<T>(collection, userId);
  const index = items.findIndex(item => item.id === id);
  if (index === -1) return null;
  
  const updatedItem = {
    ...items[index],
    ...updates,
    id, // prevent id from being overwritten
    updated_at: new Date().toISOString(),
  };
  items[index] = updatedItem;
  if(!writeSyncedCollection(userId,collection,items as unknown as RecordData[]))localStorage.setItem(getStorageKey(collection, userId), JSON.stringify(items));
  notifyData();
  return updatedItem;
}

export function deleteItem<T extends { id: string }>(
  collection: string,
  userId: string,
  id: string
): boolean {
  const items = getAllItems<T>(collection, userId);
  const filtered = items.filter(item => item.id !== id);
  if (filtered.length === items.length) return false;
  if(!writeSyncedCollection(userId,collection,filtered as unknown as RecordData[]))localStorage.setItem(getStorageKey(collection, userId), JSON.stringify(filtered));
  notifyData();
  return true;
}

export function deleteMultipleItems<T extends { id: string }>(
  collection: string,
  userId: string,
  ids: string[]
): number {
  const items = getAllItems<T>(collection, userId);
  const filtered = items.filter(item => !ids.includes(item.id));
  const deletedCount = items.length - filtered.length;
  if(!writeSyncedCollection(userId,collection,filtered as unknown as RecordData[]))localStorage.setItem(getStorageKey(collection, userId), JSON.stringify(filtered));
  notifyData();
  return deletedCount;
}

export function queryItems<T>(
  collection: string,
  userId: string,
  filter: (item: T) => boolean
): T[] {
  return getAllItems<T>(collection, userId).filter(filter);
}

export function countItems<T>(
  collection: string,
  userId: string,
  filter?: (item: T) => boolean
): number {
  const items = getAllItems<T>(collection, userId);
  return filter ? items.filter(filter).length : items.length;
}

export function clearCollection(collection: string, userId: string): void {
  if(!writeSyncedCollection(userId,collection,[]))localStorage.removeItem(getStorageKey(collection, userId));
  notifyData();
}

export function exportAllData(userId: string): Record<string, unknown[]> {
  const collections = [
    'tasks', 'events', 'reminders', 'finance', 'budgets',
    'habits', 'habit_logs', 'workouts', 'workout_logs',
    'health', 'meals', 'spiritual', 'projects', 'goals', 'notes',
    'notifications', 'day_preferences', 'self_care', 'content_library', 'agent_history'
  ];
  
  const synced=readSyncStore(userId);
  if(synced)for(const collection of Object.keys(synced.collections))if(!collections.includes(collection))collections.push(collection);
  const prefix = `${STORAGE_PREFIX}${userId}_`;
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith(prefix) && !collections.includes(key.slice(prefix.length))) collections.push(key.slice(prefix.length));
  }
  const data: Record<string, unknown[]> = {};
  collections.forEach(collection => {
    data[collection] = getAllItems(collection, userId);
  });
  return data;
}

export function generateCSV(data: Record<string, unknown>[]): string {
  if (data.length === 0) return '';
  const headers = Object.keys(data[0]);
  const rows = data.map(item =>
    headers.map(h => {
      const val = (item as Record<string, unknown>)[h];
      const str = typeof val === 'object' ? JSON.stringify(val) : String(val ?? '');
      return `"${str.replace(/"/g, '""')}"`;
    }).join(',')
  );
  return [headers.join(','), ...rows].join('\n');
}
