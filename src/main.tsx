import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { ErrorBoundary } from './components/common/ErrorBoundary.tsx';
import './index.css';

declare global {
  interface Window {
    __KATHAVAHINI_MOUNTED__?: boolean;
  }
}

// Recover automatically if an open browser tab requests an outdated JS/CSS chunk right after a live deploy
if (typeof window !== 'undefined') {
  window.addEventListener('vite:preloadError', (event) => {
    event.preventDefault();
    const key = 'kathavahini_vite_preload_reload';
    try {
      const last = Number(sessionStorage.getItem(key) || '0');
      if (Date.now() - last > 15_000) {
        sessionStorage.setItem(key, String(Date.now()));
        window.location.reload();
      }
    } catch {
      window.location.reload();
    }
  });

  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason;
    const message = typeof reason === 'string' ? reason : String(reason?.message || '');
    const stack = typeof reason?.stack === 'string' ? reason.stack : '';
    if (
      message.includes('WebSocket closed without opened') ||
      (stack.includes('/@vite/client') && message.toLowerCase().includes('websocket'))
    ) {
      event.preventDefault();
      return;
    }
    console.error('[Kathavahini Unhandled Rejection]', reason);
  });
}

const rootElement = document.getElementById('root');

if (!rootElement) {
  console.error('[Kathavahini Boot Failure] Root container #root not found in document.');
} else {
  try {
    createRoot(rootElement).render(
      <StrictMode>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </StrictMode>,
    );
    if (typeof window !== 'undefined') {
      window.__KATHAVAHINI_MOUNTED__ = true;
    }
  } catch (err) {
    console.error('[Kathavahini Mount Failure]', err);
    throw err;
  }
}
