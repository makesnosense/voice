import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import './index.css';
import App from './App.tsx';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('failed to find root element');
}

createRoot(rootElement).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);

// remove loader after react mounts
requestAnimationFrame(() => {
  const loader = document.getElementById('app-loader');
  const root = document.getElementById('root');

  if (loader) {
    loader.classList.add('fade-out');
    // remove from DOM after fade
    setTimeout(() => loader.remove(), 200);
  }
  if (root) {
    root.classList.add('loaded');
  }
});
