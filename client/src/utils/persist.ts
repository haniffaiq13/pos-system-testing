// LocalStorage persistence utilities with pointhub: prefix

const PREFIX = 'pointhub:';

export function persist<T>(key: string, data: T): void {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(data));
  } catch (error) {
    console.error(`Failed to persist ${key}:`, error);
  }
}

export function retrieve<T>(key: string): T | null {
  try {
    const item = localStorage.getItem(PREFIX + key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error(`Failed to retrieve ${key}:`, error);
    return null;
  }
}

export function remove(key: string): void {
  localStorage.removeItem(PREFIX + key);
}

export function clearAll(): void {
  const keys = Object.keys(localStorage);
  keys.forEach(key => {
    if (key.startsWith(PREFIX)) {
      localStorage.removeItem(key);
    }
  });
}

export function has(key: string): boolean {
  return localStorage.getItem(PREFIX + key) !== null;
}
