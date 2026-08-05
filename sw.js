const CACHE_NAME = 'workbench-v3';
const ASSETS = [
  '/zhizhi/',
  '/zhizhi/index.html',
  '/zhizhi/icon-192.png',
  '/zhizhi/icon-512.png',
  '/zhizhi/icon-maskable.png',
  '/zhizhi/manifest.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async cache => {
      const promises = ASSETS.map(url =>
        fetch(url)
          .then(res => {
            if(res.ok) cache.put(url, res.clone());
          })
          .catch(()=>{})
      );
      await Promise.allSettled(promises);
      return self.skipWaiting();
    })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(names => {
      return Promise.all(
        names.filter(n => n !== CACHE_NAME).map(n => caches.delete(n))
      );
    }).then(()=>self.clients.claim())
  );
})
