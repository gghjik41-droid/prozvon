const CACHE_NAME = 'pso-v3'; // Подняли версию
const filesToCache = [
  './',
  './index.html',
  './short.html',
  './elderly.html',
  './teens.html',
  './forest.html',
  './adults.html',
  './manifest.json',
  './favicon.png',
  './apple-touch-icon.png'
];

// Установка
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(filesToCache))
  );
  self.skipWaiting();
});

// Активация и удаление старого хлама
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.map((key) => {
        if (key !== CACHE_NAME) return caches.delete(key);
      })
    ))
  );
  return self.clients.claim();
});

// Главный обработчик запросов
self.addEventListener('fetch', (event) => {
  // Пропускаем аналитику
  if (event.request.url.includes('goatcounter')) return;

  event.respondWith(
    caches.match(event.request).then((response) => {
      // 1. Если нашли в кэше — отдаем сразу
      if (response) return response;

      // 2. Если нет в кэше, пробуем сеть
      return fetch(event.request).catch(() => {
        // 3. Если СЕТИ НЕТ и это переход/обновление страницы (navigate)
        if (event.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
        // Если это картинка или другой файл, которого нет в кэше — просто отдаем ошибку
      });
    })
  );
});