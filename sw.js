// tabia service worker — network-first for same-origin GETs.
// Guarantees you always load the freshest files when online; cache is only a
// fallback for offline. This is what stops GitHub Pages' 10-min cache from
// ever showing a stale build again.
const CACHE = 'tabia-runtime';

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  let url; try { url = new URL(req.url); } catch { return; }
  if (url.origin !== location.origin) return;
  e.respondWith(
    fetch(req).then(res => {
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put(req, copy)).catch(() => {});
      return res;
    }).catch(() => caches.match(req))
  );
});
