import { useSyncExternalStore } from 'react';

import { analyticsEnabled, loadAnalytics } from '../config/analytics';

/**
 * The visitor's choice about optional (analytics) cookies, kept in the browser.
 * Strictly necessary storage (language, theme, sign-in) does not depend on it.
 */
export type Consent = 'granted' | 'denied';

const STORAGE_KEY = 'app_consent';
const listeners = new Set<() => void>();
let analyticsLoaded = false;

function read(): Consent | null {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value === 'granted' || value === 'denied' ? value : null;
  } catch {
    return null;
  }
}

let current = read();

function write(value: Consent | null) {
  try {
    if (value) localStorage.setItem(STORAGE_KEY, value);
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Storage may be unavailable (private mode): the choice lasts until the page closes.
  }
  current = value;
  for (const listener of listeners) listener();
}

export function applyConsent() {
  if (analyticsEnabled && current === 'granted' && !analyticsLoaded) {
    analyticsLoaded = true;
    loadAnalytics();
  }
}

export function setConsent(value: Consent) {
  const revoked = analyticsLoaded && value === 'denied';
  write(value);
  // A loaded script cannot be removed: reload the page without it
  if (revoked) window.location.reload();
  else applyConsent();
}

export function resetConsent() {
  write(null);
}

export function useConsent(): Consent | null {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => current,
  );
}
