export function loadItems<T>(key: string, seed: T[]): T[] {
  try {
    const stored = localStorage.getItem(key);
    if (stored) return JSON.parse(stored);
  } catch (err) {
    console.error(`Error loading ${key}:`, err);
  }
  localStorage.setItem(key, JSON.stringify(seed));
  return seed;
}

export function saveItems<T>(key: string, items: T[]) {
  try {
    localStorage.setItem(key, JSON.stringify(items));
  } catch (err) {
    console.error(`Error saving ${key}:`, err);
  }
}
