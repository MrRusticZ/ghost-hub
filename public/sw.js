const CACHE = 'ghost-hub-__GHOST_HUB_BUILD__';
const scope = new URL('./', self.location.href);
self.addEventListener('install', event => {
  event.waitUntil((async()=>{
    const response=await fetch(new URL('offline-assets.json',scope),{cache:'no-store'});
    if(!response.ok)throw Error('Offline asset manifest unavailable');
    const files=await response.json();
    const paths=['./','data/manifest.json','data/hub-catalog.json','data/news.json','assets/haunted-house.png','favicon.svg',...files];
    const cache=await caches.open(CACHE);
    await cache.addAll(paths.map(path=>new URL(path,scope).href));
  })());
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith('ghost-hub-') && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if(event.request.method !== 'GET' || url.origin !== scope.origin || !url.pathname.startsWith(scope.pathname) || url.pathname.includes('/api/')) return;
  event.respondWith(fetch(event.request).then(response => {
    if(response.ok && (event.request.mode === 'navigate' || /\.(js|css|woff2|png|svg|json)$/.test(url.pathname))) {
      const copy = response.clone(); event.waitUntil(caches.open(CACHE).then(cache => cache.put(event.request, copy)));
    }
    return response;
  }).catch(async () => {
    const cached = await caches.match(event.request); if(cached) return cached;
    if(event.request.mode === 'navigate') {const home = await caches.match(scope.href); if(home) return home;}
    return new Response('Offline resource unavailable', {status:503,headers:{'Content-Type':'text/plain'}});
  }));
});
