// Service Worker · 芝芝工作台 PWA
const CACHE_NAME = 'zizhi-workbench-v2';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './icon-maskable.png'
];

// 安装：逐个预缓存核心资源，单个文件404不阻断整体安装
self.addEventListener('install', function(e){
  e.waitUntil(
    caches.open(CACHE_NAME).then(function(cache){
      return Promise.allSettled(
        ASSETS.map(function(url){
          return fetch(url).then(function(res){
            if(res.ok) return cache.put(url, res.clone());
            throw new Error('资源不存在: ' + url);
          }).catch(function(err){
            console.warn('[SW] 跳过失效资源:', err.message);
          });
        })
      );
    }).then(function(){
      return self.skipWaiting();
    })
  );
});

// 激活：清理旧缓存
self.addEventListener('activate', function(e){
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(keys.filter(function(k){ return k !== CACHE_NAME; }).map(function(k){ return caches.delete(k); }));
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
