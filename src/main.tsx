import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Guard against third-party browser extension errors (e.g. MetaMask inpage provider)
if (typeof window !== 'undefined') {
  const isExtensionError = (err: any) => {
    if (!err) return false;
    const msg = (typeof err === 'string' ? err : (err.message || err.description || '')).toLowerCase();
    const stack = (err.stack || '').toLowerCase();
    return (
      msg.includes('metamask') ||
      msg.includes('failed to connect to metamask') ||
      msg.includes('ethereum') ||
      stack.includes('chrome-extension://') ||
      stack.includes('moz-extension://')
    );
  };

  window.addEventListener('unhandledrejection', (event) => {
    if (isExtensionError(event.reason)) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  });

  window.addEventListener('error', (event) => {
    if (isExtensionError(event.error) || isExtensionError(event.message)) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

