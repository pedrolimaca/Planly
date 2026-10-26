/* ============================================================
   Local Storage Data Service
   
   This provides a fully functional data layer using localStorage.
   When Supabase is configured, the app can switch to remote storage.
   All CRUD operations are real and persist across sessions.
   ============================================================ */

import { v4 as uuidv4 } from 'uuid';

const STORAGE_PREFIX = 'lifeos_';

function getStorageKey(collection: string, userId: string): string {
  return `${STORAGE_PREFIX}${userId}_${collection}`;
}

export function getAllItems<T>(collection: string, userId: string): T[] {
  try {
    const data = localStorage.getItem(getStorageKey(collection, userId));
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
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
  const now = new Date().toISOString();
  const newItem = {
    ...item,
    id: item.id || uuidv4(),
    created_at: now,
    updated_at: now,
  } as unknown as T;
  items.push(newItem);
  localStorage.setItem(getStorageKey(collection, userId), JSON.stringify(items));
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
  localStorage.setItem(getStorageKey(collection, userId), JSON.stringify(items));
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
  localStorage.setItem(getStorageKey(collection, userId), JSON.stringify(filtered));
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
  localStorage.setItem(getStorageKey(collection, userId), JSON.stringify(filtered));
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
  localStorage.removeItem(getStorageKey(collection, userId));
}

export function exportAllData(userId: string): Record<string, unknown[]> {
  const collections = [
    'tasks', 'events', 'reminders', 'finance', 'budgets',
    'habits', 'habit_logs', 'workouts', 'workout_logs',
    'health', 'meals', 'spiritual', 'projects', 'goals', 'notes',
    'notifications'
  ];
  
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
