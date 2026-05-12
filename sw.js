const CACHE = 'spendly-v5-1778555024';
const ASSETS = ['/', '/index.html', '/manifest.json'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => 
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ));
  self.clients.claim();
});
self.addEventListener('fetch', e => {
  if (e.request.url.includes('.html') || e.request.url.endsWith('/')) {
    e.respondWith(fetch(e.request).then(res => { 
      const c = res.clone(); 
      caches.open(CACHE).then(ch => ch.put(e.request, c)); 
      return res; 
    }).catch(() => 
      caches.match(e.request)
    ));
  } else {
    e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
  }
});
