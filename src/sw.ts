/* eslint-disable no-console */
/* eslint-disable prefer-arrow-callback */
/* eslint-disable no-restricted-globals */
const CACHE_NAME = `typewritesomething@${process.env.npm_package_version}-${process.env.git_hash}`;

const URLS = [
  '/',
  '/index.html',
  '/dist/main.js',
  '/favicon.ico',
  '/manifest.json',
  '/static/audio/keypress.mp3',
  '/static/audio/return.mp3',
  '/static/fonts/specialelite-webfont.ttf',
  '/static/fonts/specialelite-webfont.woff',
  '/static/fonts/specialelite-webfont.woff2',
  '/static/img/handmadepaper.png',
  '/static/style.css',
  '/static/img/logo-on-bg-36.png',
  '/static/img/logo-on-bg-96.png',
  '/static/img/logo-on-bg-144.png',
  '/static/img/logo-on-bg-512.png',
  '/static/img/logo-on-bg.png',
];

self.addEventListener('install', (e: any) => {
  console.log('installing');
  e.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(URLS))
      .then((self as any).skipWaiting())
  );
});

// On version update, remove old cached files
self.addEventListener('activate', function activate(e: any) {
  console.log('activating');
  e.waitUntil(
    caches
      .keys()
      .then(
        (keys) =>
          console.log('deleting keys') ||
          Promise.all(
            keys
              .filter((key) => key !== CACHE_NAME)
              .map((key) => caches.delete(key))
          )
      )
      .then(() => console.log('claiming') || (self as any).clients.claim())
  );
});

self.addEventListener('fetch', function handleFetch(e: any) {
  console.log('fetching');
  if (e.request.url.startsWith(self.location.origin)) {
    e.respondWith(
      caches.match(e.request).then((cachedResponse) => {
        if (cachedResponse) {
          console.log('cached', e.request);
          return cachedResponse;
        }
        console.log('NOT Cached', e.request);

        return caches.open(CACHE_NAME).then(() =>
          fetch(e.request).then((response) => {
            console.log('fetched', response);
            return response;
          })
        );
      })
    );
  }
});
