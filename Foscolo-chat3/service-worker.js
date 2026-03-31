
const CACHE_NAME = 'foscolo-pwa-v5';
const APP_SHELL = [
  './',
  'index.html',
  'styles.css',
  'app.js',
  'pwa.js',
  'manifest.json',
  'offline.html',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/apple-touch-icon.png'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL)));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  if (url.origin !== location.origin) {
    if (url.hostname.includes('heygen.com')) {
      event.respondWith(fetch(req).catch(() => caches.match('offline.html')));
    }
    return;
  }

  const destination = req.destination;
  const isAsset = ['style','script','image','font'].includes(destination) ||
    /\.(png|jpg|jpeg|webp|svg|gif|css|js|json|txt)$/i.test(url.pathname);

  if (destination === 'document' || req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then(res => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(req, copy));
          return res;
        })
        .catch(async () => (await caches.match(req)) || caches.match('offline.html'))
    );
    return;
  }

  if (isAsset) {
    event.respondWith(
      caches.match(req).then(cached => cached || fetch(req).then(res => {
        const copy = res.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(req, copy));
        return res;
      }).catch(() => caches.match(req)))
    );
  }
});
