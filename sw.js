const CACHE_NAME = 'pso-v2'; // Поменял версию на v2
const filesToCache = [
  './',
  './index.html',
  './short.html',
  './elderly.html',
  './teens.html',
  './forest.html',
  './adults.html',
  './favicon.png',
  './apple-touch-icon.png',
  './manifest.json'
];

// Установка: кэшируем файлы
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(filesToCache);
    })
  );
  self.skipWaiting(); // Принудительно активируем новый SW
});

// Активация: чистим старый кэш
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
});

// ПЕРЕХВАТ ЗАПРОСОВ (Самое важное!)
self.addEventListener('fetch', (event) => {
  // Игнорируем запросы к аналитике и внешним скриптам, чтобы не ломать офлайн
  if (event.request.url.includes('goatcounter') || event.request.url.includes('gc.zgo.at')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      // Если файл есть в кэше — отдаем его
      if (response) {
        return response;
      }
      // Если файла нет в кэше (например, при попытке загрузки JSON или обновлении)
      // Пытаемся взять из сети, а если сети нет — не выдаем ошибку "страница не найдена"
      return fetch(event.request).catch(() => {
        // Если это был переход на страницу, отдаем хотя бы индекс
        if (event.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
      });
    })
  );
});