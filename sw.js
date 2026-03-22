const CACHE_NAME = 'pso-v16';

// Список всех твоих файлов. 
// ОБЯЗАТЕЛЬНО проверь, что названия совпадают до буквы!
const filesToCache = [
  './',
  './index.html',
  './short.html',
  './elderly.html',
  './teens.html',
  './forest.html',
  './adults.html',
  './manifest.json',
  './favicon.png'
];

// 1. Установка: открываем сейф и складываем файлы
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Кэшируем файлы для ПСО...');
      return cache.addAll(filesToCache);
    })
  );
  self.skipWaiting(); // Принудительно вытесняем старую версию v3
});

// 2. Активация: сжигаем старые версии кэша, если они есть
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

// 3. Перехват: магия офлайна тут
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Игнорируем внешние запросы (аналитика GoatCounter и прочее)
  // Мы обрабатываем ТОЛЬКО то, что лежит на твоем домене
  if (url.origin !== self.location.origin) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      // Если нашли файл в кэше — отдаем его мгновенно
      if (response) {
        return response;
      }

      // Если в кэше нет — пытаемся сходить в интернет
      return fetch(event.request).catch((err) => {
        // Если интернета НЕТ и это попытка открыть страницу (HTML)
        if (event.request.mode === 'navigate') {
          console.log('Сети нет, отдаем главную из кэша');
          return caches.match('./index.html');
        }
        
        // Для картинок или мелких скриптов просто возвращаем пустой ответ, 
        // чтобы браузер не выкидывал критическую ошибку
        return new Response('Offline', { status: 503, statusText: 'Offline' });
      });
    })
  );
});