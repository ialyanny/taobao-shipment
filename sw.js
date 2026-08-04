self.addEventListener('install', function () {
  self.skipWaiting();
});

self.addEventListener('activate', function (event) {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', function (event) {
  if (event.request.method !== 'GET') return;
  var url = new URL(event.request.url);
  if (url.origin !== location.origin) return;
  var req = event.request;
  event.respondWith(
    fetch(req).then(function (resp) {
      var copy = resp.clone();
      caches.open('taobao-shipment-v1').then(function (c) { c.put(req, copy); });
      return resp;
    }).catch(function () { return caches.match(req); })
  );
});
