self.addEventListener('fetch', function (event) {
    event.respondWith(async function() {
      return fetch(event.request).catch(() => caches.match(event.request));
    }());
    if(event.request.url.startsWith(self.location.origin) && event.request.method === 'GET'){
      event.waitUntil(caches.open('v1').then(function(cache) {
          cache.add(event.request);
        })
      );
    }
});