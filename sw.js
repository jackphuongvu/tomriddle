/* eslint-disable prefer-arrow-callback */
/* eslint-disable no-restricted-globals */
const CACHE_NAME = 'typewritesomething-v1.0.0';

self.addEventListener('install', function install(e) {
  e.waitUntil(
    caches.open(CACHE_NAME).then(function caching(cache) {
      console.log('opened cache');

      return cache
        .addAll([
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
        .then(function cached() {
          console.log('finished caching?');
        });
    })
  );
});

self.addEventListener('fetch', function handleFetch(e) {
  e.respondWith(
    caches
      .match(e.request)
      .then(function getCache(response) {
        if (response) {
          console.error('cached');
          return response;
        }
        console.error('NOT cached');
        return fetch(e.request);
      })
      .catch(function fail(err) {
        console.error(err);

        return fetch(e.request);
      })
  );
});
