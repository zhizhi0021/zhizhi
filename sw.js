// Service Worker · 芝芝工作台 PWA
const CACHE_NAME = 'zizhi-workbench-v1';
const ASSETS = [
  './',
  './index.html',
  './words.js',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

// 安装：预缓存核心资源
self.addEventListener('install', function(e){
  e.waitUntil(
    caches.open(CACHE_NAME).then(function(cache){
      return cache.addAll(ASSETS).catch(function(){});
    }).then(function(){
      return self.skipWaiting();
    })
  );
});

// 激活：清理旧缓存
self.addEventListener('activate', function(e){
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)));
    }).then(function(){
      return self.clients.claim();
    })
  );
});

// 拦截请求：缓存优先，网络兜底
self.addEventListener('fetch', function(e){
  if(e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(function(cached){
      if(cached) return cached;
      return fetch(e.request).then(function(resp){
        // 同源响应才缓存
        if(resp && resp.status === 200 && new URL(e.request.url).origin === location.origin){
          const clone = resp.clone();
          caches.open(CACHE_NAME).then(function(cache){ cache.put(e.request, clone); });
        }
        return resp;
      }).catch(function(){ return cached; });
    })
  );
});
