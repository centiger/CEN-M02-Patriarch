const CACHE_NAME = 'patriarch-matrix-abraham-integrated-v2-splitfooter-fix2-footer-nogap-footer-gradient-scrollclamp-scrollclamp';
const ASSETS_TO_CACHE = [
  './', './index.html', './style.css', './manifest.json', './manifest.webmanifest',
  './assets/patriarch-bg.png', './assets/patriarch-main.png', './assets/patriarch-matrix-bg.png',
  './hubs/index.html', './hubs/data/hubs.json', './hubs/js/app.js', './hubs/assets/maps/abraham-hub-map.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE)).finally(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys().then((names) => Promise.all(names.map((name) => name !== CACHE_NAME && caches.delete(name)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  const networkFirst = /\/hubs\/(index\.html|js\/app\.js|data\/hubs\.json)$/.test(url.pathname) || url.pathname.endsWith('/index.html');
  if (networkFirst) {
    event.respondWith(fetch(event.request).then((response) => {
      const clone = response.clone();
      caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
      return response;
    }).catch(() => caches.match(event.request)));
    return;
  }
  event.respondWith(caches.match(event.request).then((cached) => cached || fetch(event.request)));
});
