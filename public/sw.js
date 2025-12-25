const CACHE_NAME = 'techforma-v2';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json'
];

// Время жизни кеша для разных типов ресурсов
const CACHE_TIMES = {
  images: 7 * 24 * 60 * 60 * 1000, // 7 дней
  assets: 30 * 24 * 60 * 60 * 1000, // 30 дней
  api: 5 * 60 * 1000, // 5 минут
};

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  
  const url = new URL(event.request.url);
  
  // Не кешируем API запросы к функциям
  if (url.hostname.includes('functions.poehali.dev')) {
    return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Проверяем свежесть кеша для изображений
        if (response && (url.pathname.includes('.jpg') || url.pathname.includes('.png') || url.pathname.includes('.webp'))) {
          const cachedDate = response.headers.get('date');
          const cacheAge = cachedDate ? Date.now() - new Date(cachedDate).getTime() : 0;
          if (cacheAge < CACHE_TIMES.images) {
            return response;
          }
        }
        
        // Возвращаем кешированный ответ для других ресурсов
        if (response) {
          return response;
        }
        
        return fetch(event.request).then((response) => {
          if (!response || response.status !== 200) {
            return response;
          }

          const responseToCache = response.clone();
          
          // Кешируем статические ресурсы
          if (event.request.url.includes('/assets/') || 
              event.request.url.includes('.css') ||
              event.request.url.includes('.js') ||
              event.request.url.includes('.woff2') ||
              event.request.url.includes('.jpg') ||
              event.request.url.includes('.png') ||
              event.request.url.includes('.webp') ||
              event.request.url.includes('cdn.poehali.dev')) {
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });
          }

          return response;
        }).catch(() => {
          if (event.request.mode === 'navigate') {
            return caches.match('/index.html');
          }
        });
      })
  );
});