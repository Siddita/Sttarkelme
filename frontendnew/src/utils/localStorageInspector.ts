// Simple localStorage inspector for development
// Adds `window.ls` helper to inspect, set, and clear storage
// Usage in console:
//   ls.all()        -> returns all key/value pairs
//   ls.get('key')   -> get a value
//   ls.set('k','v') -> set a value
//   ls.remove('k')  -> remove a key
//   ls.clear()      -> clear all
// This file is safe to import in main.tsx; it does nothing in production.

type LSHelper = {
  all: () => Record<string, string | null>;
  get: (key: string) => string | null;
  set: (key: string, value: string) => void;
  remove: (key: string) => void;
  clear: () => void;
};

declare global {
  interface Window {
    ls?: LSHelper;
  }
}

if (import.meta.env.DEV) {
  const helper: LSHelper = {
    all: () =>
      Object.fromEntries(
        Object.keys(localStorage).map((k) => [k, localStorage.getItem(k)])
      ),
    get: (key) => localStorage.getItem(key),
    set: (key, value) => localStorage.setItem(key, value),
    remove: (key) => localStorage.removeItem(key),
    clear: () => localStorage.clear(),
  };

  window.ls = helper;
  // eslint-disable-next-line no-console
  console.log(
    "[localStorageInspector] window.ls available (dev only). Try ls.all()"
  );
}

export {};

