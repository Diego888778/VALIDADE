import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { PinProvider } from './components/PinGate';
import './styles/app.css';
createRoot(document.getElementById('root')).render(<PinProvider><App /></PinProvider>);

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(() => {}));
}
