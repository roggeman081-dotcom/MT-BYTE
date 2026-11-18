// Höj versionen när du laddar upp nya filer, så hämtar telefonen uppdateringen.
const CACHE = 'mataren-v40-name-refresh';
const FILES = ['./', './index.html', './jspdf.umd.min.js', './protocol-pdf.js', './manifest.webmanifest', './icon-transformator-vit-192.png', './icon-transformator-vit-512.png', './icon-transformator-vit-maskable-512.png', './zxing-reader.js', './zxing_reader.wasm', './logo-pdf.png', './stromtransformator.webp'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE && /^(mtbyte|mataren)-/.test(k)).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  if(req.mode==='navigate'){
    e.respondWith((async()=>{
      try{const response=await fetch(req,{cache:'no-cache'});if(response.ok){const cache=await caches.open(CACHE);await cache.put(req,response.clone());}return response;}
      catch(error){return (await caches.match(req,{ignoreSearch:true}))||(await caches.match('./index.html'))||Response.error();}
    })());return;
  }
  e.respondWith(
    caches.match(req, { ignoreSearch: true }).then(hit => {
      const net = fetch(req).then(res => {
        if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
        return res;
      }).catch(() => hit || caches.match('./index.html'));
      return hit || net;
    })
  );
});

