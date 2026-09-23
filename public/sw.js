/* The build replaces these placeholders with the current build's asset list and unique cache ID. */
const CACHE_VERSION = '__CACHE_VERSION__';
const BUILD_ID = '__BUILD_ID__';
const CACHE_NAME = `${CACHE_VERSION}-${BUILD_ID}`;
const PRECACHE_URLS = __PRECACHE_URLS__;

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(PRECACHE_URLS)));

});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(key => key.startsWith('bus-track-') && key !== CACHE_NAME).map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener('message', event => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    // Navigation is network-first so a deploy's HTML is used as soon as it is reachable.
    event.respondWith(fetch(request).catch(async () => (await caches.match('/')) || Response.error()));
    return;
  }

  // Only build-time shell assets are cached. Other same-origin requests remain network-only
  // so changing transport data can never become permanently stale in Cache Storage.
  if (PRECACHE_URLS.includes(url.pathname)) {
    event.respondWith(caches.match(request).then(cached => cached || fetch(request)));
  }
});

