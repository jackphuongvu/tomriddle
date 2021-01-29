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
    caches.match(e.request).then(function getCache(response) {
      if (response) {
        console.error('cached');
        return response;
      }
      console.error('NOT cached');
      return fetch(e.request).then(function fetched(_resp) {
        // Check if we received a valid response
        if (!_resp || _resp.status !== 200 || _resp.type !== 'basic') {
          console.log('invalid response');
          return _resp;
        }

        // IMPORTANT: Clone the response. A response is a stream
        // and because we want the browser to consume the response
        // as well as the cache consuming the response, we need
        // to clone it so we have two streams.
        const responseToCache = _resp.clone();

        caches.open(CACHE_NAME).then(function putCache(cache) {
          console.log('putting the cache');
          cache.put(e.request, responseToCache);
          console.log('put the cache');
        });

        console.log('valid response?', e.request);

        return _resp;
      });
    })
  );
});
