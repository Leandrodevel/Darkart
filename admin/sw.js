const CACHE_NAME = 'equalize-adm-v1';
const urlsToCache = [
  './index.html',
  './manifest.json',
  // Adicione aqui os arquivos essenciais do Equalize-se (ex: estilos, scripts de cálculo, etc.)
];

// Instalação do Service Worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

// Ativação e limpeza de caches antigos
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Estratégia Network First para garantir dados e conteúdos atualizados ao abrir
self.addEventListener('fetch', event => {
  // Ignora métodos que não sejam GET
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Ignora esquemas sem suporte a cache (como chrome-extension://, file://, etc.)
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then(networkResponse => {
        return caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, networkResponse.clone());
          return networkResponse;
        });
      })
      .catch(() => {
        return caches.match(event.request);
      })
  );
});
