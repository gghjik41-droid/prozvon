const CACHE_NAME = 'pso-v1';
// ПЕРЕЧИСЛИ ТУТ ВСЕ СВОИ ФАЙЛЫ (html, css, js)
const filesToCache = [
  'index.html',
  'short.html',
  'elderly.html',
  'teens.html',
  'forest.html',
  'adults.html'
];

// При установке кэшируем всё
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(filesToCache);
    })
  );
});

// При запросе: сначала ищем в кэше, если нет - идем в сеть
self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request).then(function(response) {
      return response || fetch(event.request);
    })
  );
});