const CACHE_NAME = `typewritesomething@${process.env.npm_package_version}-${process.env.git_hash}`;

// list the files you want cached by the service worker
const PRECACHE_URLS = [
  '/',
  '/dist/main.js',
  '/favicon.ico',
  '/index.html',
  '/manifest.json',
  '/static/style.css',
  '/static/audio/keypress.mp3',
  '/static/audio/return.mp3',
  '/static/fonts/specialelite-webfont.ttf',
  '/static/fonts/specialelite-webfont.woff',
  '/static/fonts/specialelite-webfont.woff2',
  '/static/img/handmadepaper.png',
  '/static/img/logo-on-bg-36.png',
  '/static/img/logo-on-bg-96.png',
  '/static/img/logo-on-bg-144.png',
  '/static/img/logo-on-bg-512.png',
  '/static/img/logo-on-bg.png',
];

// the rest below handles the installing and caching
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  const currentCaches = [CACHE_NAME];
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return cacheNames.filter(
          (cacheName) => !currentCaches.includes(cacheName)
        );
      })
      .then((cachesToDelete) => {
        return Promise.all(
          cachesToDelete.map((cacheToDelete) => {
            return caches.delete(cacheToDelete);
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.url.startsWith(self.location.origin)) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return caches.open(CACHE_NAME).then((cache) => {
          return fetch(event.request).then((response) => {
            return response;
          });
        });
      })
    );
  }
});
