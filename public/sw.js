const CACHE_NAME = 'techforma-v3';
const RUNTIME_CACHE = 'techforma-runtime-v1';

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
          if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Игнорируем не-GET запросы
  if (request.method !== 'GET') return;

  // Не кешируем API запросы к функциям
  if (url.hostname.includes('functions.poehali.dev')) return;

  // HTML страницы: Network First (всегда свежие данные)
  if (request.mode === 'navigate' || (request.headers.get('accept') && request.headers.get('accept').includes('text/html'))) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, responseClone));
          }
          return response;
        })
        .catch(() => caches.match(request).then(cached => cached || caches.match('/index.html')))
    );
    return;
  }

  // Статика (JS, CSS, шрифты, изображения): Cache First с проверкой свежести
  const isStatic = url.pathname.match(/\.(js|css|woff|woff2|ttf|png|jpg|jpeg|svg|gif|webp)$/);
  const isCDN = url.hostname.includes('cdn.poehali.dev') || url.hostname.includes('fonts.googleapis.com') || url.hostname.includes('fonts.gstatic.com');
  
  if (isStatic || isCDN) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        // Проверяем свежесть кеша для изображений
        if (cachedResponse && url.pathname.match(/\.(jpg|png|webp|jpeg)$/)) {
          const cachedDate = cachedResponse.headers.get('date');
          const cacheAge = cachedDate ? Date.now() - new Date(cachedDate).getTime() : 0;
          if (cacheAge < CACHE_TIMES.images) {
            return cachedResponse;
          }
        }
        
        // Для остальной статики - сразу возвращаем кеш
        if (cachedResponse) return cachedResponse;

        // Если нет в кеше - загружаем и кешируем
        return fetch(request).then((response) => {
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
          }
          return response;
        });
      })
    );
    return;
  }

  // Остальные запросы: Network First с кешем как fallback
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.status === 200) {
          const responseClone = response.clone();
          caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, responseClone));
        }
        return response;
      })
      .catch(() => caches.match(request))
  );
});