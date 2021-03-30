self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open('v1').then(function (cache) {
      return cache.addAll([
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
      ]);
    })
  );
});

self.addEventListener('fetch', function (event) {
  event.respondWith(
    caches.match(event.request).then(function (response) {
      // caches.match() always resolves
      // but in case of success response will have value
      if (response !== undefined) {
        return response;
      } else {
        return fetch(event.request)
          .then(function (response) {
            // response may be used only once
            // we need to save clone to put one copy in cache
            // and serve second one
            let responseClone = response.clone();

            caches.open('v1').then(function (cache) {
              cache.put(event.request, responseClone);
            });
            return response;
          })
          .catch(function () {
            return caches.match('/sw-test/gallery/myLittleVader.jpg');
          });
      }
    })
  );
});
