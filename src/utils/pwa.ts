// Lightweight PWA Helper & Prompt Manager
let deferredPrompt: any = null;

if (typeof window !== 'undefined') {
  // Capture beforeinstallprompt globally at early boot
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    window.dispatchEvent(new CustomEvent('pwa-prompt-ready'));
  });

  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    window.dispatchEvent(new CustomEvent('pwa-installed'));
  });

  // Register Service Worker
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .catch((err) => {
          console.warn('[PWA] Service worker registration failed:', err);
        });
    });
  }
}

export function getDeferredPrompt(): any {
  return deferredPrompt;
}

export function clearDeferredPrompt(): void {
  deferredPrompt = null;
}

export function isStandaloneMode(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true ||
    document.referrer.includes('android-app://')
  );
}

export function isIOSDevice(): boolean {
  if (typeof window === 'undefined') return false;
  const ua = navigator.userAgent || '';
  return /iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream;
}

export async function triggerPwaInstall(): Promise<'accepted' | 'dismissed' | 'unsupported'> {
  if (!deferredPrompt) {
    return 'unsupported';
  }
  try {
    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice.outcome === 'accepted') {
      deferredPrompt = null;
      return 'accepted';
    }
    return 'dismissed';
  } catch (err) {
    console.warn('[PWA] Prompt trigger error:', err);
    return 'unsupported';
  }
}
