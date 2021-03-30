const CACHE_NAME = `typewritesomething@${process.env.npm_package_version}-${process.env.git_hash}`;

// list the files you want cached by the service worker
const PRECACHE_URLS = [
  '/',
  '/dist/main.js',
  '/favicon.ico',
  '/index.html',
  '/manifest.json',
  '/static/style.css',
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
