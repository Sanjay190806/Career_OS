import { featureFlags } from '../config/featureFlags';

export function registerServiceWorker() {
  if (!featureFlags.enablePWA) return;
  if (!('serviceWorker' in navigator)) return;

  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // Silent fallback: offline shell still works when the registration is unavailable.
    });
  });
}

