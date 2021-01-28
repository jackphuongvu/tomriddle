/* eslint-disable no-restricted-globals */
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches
      .open('typewritesomething')
      .then((cache) =>
        cache.addAll([
          '/',
          '/index.html',
          '/dist/',
          '/dist/main.js',
          '/static/',
          '/static/audio/keypress.mp3',
          '/static/audio/return.mp3',
          '/static/style.css',
          '/static/img/logo-on-bg.png',
          '/static/fonts/specialelite-webfont.ttf',
          '/static/fonts/specialelite-webfont.woff',
          '/static/fonts/specialelite-webfont.woff2',
        ])
      )
  );
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => response || fetch(e.request))
  );
});
