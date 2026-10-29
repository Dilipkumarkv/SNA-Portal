import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { registerSW } from 'virtual:pwa-register';
import App from './App.tsx';
import { ThemeProvider } from './context/ThemeContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import './index.css';

declare global {
  interface Window {
    deferredPrompt: any;
  }
}

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

try {
  if (typeof window !== 'undefined') {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      window.deferredPrompt = e;
    });
  }
} catch {
  // Ignore in sandboxed iframes
}

// Render the application root immediately
const rootElement = document.getElementById('root');
if (rootElement) {
  const app = (
    <StrictMode>
      <ErrorBoundary>
        <ThemeProvider>
          <App />
        </ThemeProvider>
      </ErrorBoundary>
    </StrictMode>
  );

  // Only wrap with Google OAuth provider when a client ID is configured.
  // Without it, the student portal remains fully open; admin sign-in is unavailable.
  const root = CLIENT_ID ? (
    <GoogleOAuthProvider clientId={CLIENT_ID}>{app}</GoogleOAuthProvider>
  ) : (
    app
  );

  createRoot(rootElement).render(root);
}

// Defer Service Worker management until after render
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  if (import.meta.env.PROD) {
    try {
      registerSW({
        immediate: true,
        onNeedRefresh() {},
        onOfflineReady() {},
      });
    } catch (err) {
      console.warn('PWA ServiceWorker registration error (ignored in iframes):', err);
    }
  } else {
    // In dev mode, unregister any old stale service workers to prevent cached blank screens
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      for (const reg of registrations) {
        reg.unregister().catch(() => {});
      }
    }).catch(() => {});
  }
}
