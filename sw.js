var CACHE_NAME = 'taobao-shipment-v4';
var APP_SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png',
  './apple-touch-icon.png',
  './tb-bookmarklet.js'
];

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(APP_SHELL);
    }).then(function () {
      return self.skipWaiting();
    }).catch(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k !== CACHE_NAME; }).map(function (k) { return caches.delete(k); }));
    }).then(function () {
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', function (event) {
  var url = new URL(event.request.url);
  if (url.origin !== location.origin) return;
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request).then(function (resp) {
      var copy = resp.clone();
      caches.open(CACHE_NAME).then(function (c) { c.put(event.request, copy); });
      return resp;
    }).catch(function () {
      return caches.match(event.request).then(function (hit) {
        if (hit) return hit;
        if (event.request.mode === 'navigate') return caches.match('./index.html');
        return Response.error();
      });
    })
  );
});