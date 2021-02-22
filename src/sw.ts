/* eslint-disable prefer-arrow-callback */
/* eslint-disable no-restricted-globals */
const CACHE_NAME = `typewritesomething@${process.env.npm_package_version}`;

self.addEventListener('install', function install(e: any) {
  e.waitUntil(
    caches.open(CACHE_NAME).then(function caching(cache) {
      return cache.addAll([
        '/',
        '/dist/',
        '/dist/main.js',
        '/favicon.ico',
        '/index.html',
        '/manifest.json',
        '/static/',
        '/static/audio/keypress.mp3',
        '/static/audio/return.mp3',
        '/static/fonts/specialelite-webfont.ttf',
        '/static/fonts/specialelite-webfont.woff',
        '/static/fonts/specialelite-webfont.woff2',
        '/static/img/handmadepaper.png',
        '/static/img/logo-on-bg-144.png',
        '/static/img/logo-on-bg-192.png',
        '/static/img/logo-on-bg-36.png',
        '/static/img/logo-on-bg-48.png',
        '/static/img/logo-on-bg-512.png',
        '/static/img/logo-on-bg-72.png',
        '/static/img/logo-on-bg-96.png',
        '/static/img/logo-on-bg.png',
        '/static/style.css',
      ]);
    })
  );
});

self.addEventListener('fetch', function handleFetch(e: any) {
  e.respondWith(
    caches.match(e.request).then(function getCache(cached) {
      if (cached) {
        return cached;
      }
      // eslint-disable-next-line no-console
      console.log(e.request.url, 'NOT cached');

      // let's force caching
      // TODO: maybe this is silly in the long run
      return null;
    })
  );
});
