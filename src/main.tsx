import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'

// Оптимизация рендеринга
const rootElement = document.getElementById("root")!;

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>
);

// Service Worker - отложенная регистрация
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    setTimeout(() => {
      navigator.serviceWorker.register('/sw.js')
        .catch(() => {
          // Игнорируем ошибки SW
        });
    }, 2000);
  });
}