import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import App from './App.tsx';
import { ThemeProvider } from './context/ThemeContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { isNativeApp, setPwaFlag, setPwaUpdateHandler } from './exam/pwa';
import './index.css';

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <ErrorBoundary>
        <ThemeProvider>
          <App />
        </ThemeProvider>
      </ErrorBoundary>
    </StrictMode>
  );
}

if (typeof window !== 'undefined' && 'serviceWorker' in navigator && !isNativeApp()) {
  if (import.meta.env.PROD) {
    try {
      const updateSW = registerSW({
        immediate: true,
        onNeedRefresh() {
          setPwaFlag('needRefresh', true);
        },
        onOfflineReady() {
          setPwaFlag('offlineReady', true);
        },
      });
      setPwaUpdateHandler(updateSW);
    } catch (err) {
      console.warn('PWA ServiceWorker registration error (ignored in iframes):', err);
    }
  } else {
    navigator.serviceWorker
      .getRegistrations()
      .then((registrations) => {
        for (const reg of registrations) {
          reg.unregister().catch(() => {});
        }
      })
      .catch(() => {});
  }
}
