/*
 * @Author: Vincent Wang
 * @Date:   20171114 11:45:27
 * @Last Modified by:   Vincent Wang
 * @Last Modified time: 2017-11-21 14:53:45
 */
const PRECACHE = 'precache-v1';
const RUNTIME = 'runtime-v2';

// list the files you want cached by the service worker
PRECACHE_URLS = [
  // '/static/plugins.js',
];

// the rest below handles the installing and caching
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(PRECACHE)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  const currentCaches = [PRECACHE, RUNTIME];
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

        return caches.open(RUNTIME).then((cache) => {
          return fetch(event.request).then((response) => {
            return response;
          });
        });
      })
    );
  }
});
