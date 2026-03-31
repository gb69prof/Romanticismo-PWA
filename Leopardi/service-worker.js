const CACHE_VERSION = 'v3';
const STATIC_CACHE = `eco-leopardi-static-${CACHE_VERSION}`;
const PAGES_CACHE = `eco-leopardi-pages-${CACHE_VERSION}`;

const CORE_ASSETS = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './glossario.js',
  './manifest.json',
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.addAll(CORE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith('eco-leopardi-') && ![STATIC_CACHE, PAGES_CACHE].includes(key))
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

function isSameOrigin(url) {
  return url.origin === self.location.origin;
}

function isNavigationRequest(request) {
  return request.mode === 'navigate';
}

function isStaticAsset(request, url) {
  if (!isSameOrigin(url)) return false;

  if (request.destination && ['style', 'script', 'image', 'font'].includes(request.destination)) {
    return true;
  }

  return /\.(css|js|mjs|png|jpg|jpeg|webp|svg|gif|ico|woff2?)$/i.test(url.pathname);
}

async function networkFirstPage(request) {
  const cache = await caches.open(PAGES_CACHE);

  try {
    const response = await fetch(request);
    if (response && response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await cache.match(request);
    if (cached) return cached;

    return (await caches.match('./index.html')) || Response.error();
  }
}

async function cacheFirstAsset(request) {
  const cache = await caches.open(STATIC_CACHE);
  const cached = await cache.match(request);

  if (cached) return cached;

  const response = await fetch(request);
  if (response && response.ok) {
    cache.put(request, response.clone());
  }
  return response;
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  if (isNavigationRequest(request)) {
    event.respondWith(networkFirstPage(request));
    return;
  }

  if (isStaticAsset(request, url)) {
    event.respondWith(cacheFirstAsset(request));
  }
});
