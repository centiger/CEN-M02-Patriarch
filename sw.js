const CACHE_NAME = 'patriarch-hub-revive-20260603-v3';
const ASSETS_TO_CACHE = [
  './style.css', './manifest.json', './manifest.webmanifest',
  './assets/patriarch-bg.png', './assets/patriarch-main.png', './assets/patriarch-matrix-bg.png',
  './assets/patriarch-footer.png', './assets/patriarch-fixed-footer.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE)).finally(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((names) => Promise.all(names.map((name) => name !== CACHE_NAME && caches.delete(name))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  const noStore = url.pathname.endsWith('/index.html') || url.pathname.endsWith('/hubs/') || url.pathname.includes('/hubs/index.html') || url.pathname.includes('/hubs/js/app.js') || url.pathname.includes('/hubs/data/hubs.json');
  if (noStore) {
    event.respondWith(fetch(event.request, {cache:'no-store'}).catch(() => caches.match(event.request)));
    return;
  }
  event.respondWith(caches.match(event.request).then((cached) => cached || fetch(event.request)));
});
