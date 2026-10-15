/* SAKU Kuliah v1.2.0 — service worker (cache tampilan agar cepat & bisa dibuka offline) */
const CACHE = 'saku-v1.2.0';
const ASET = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './apple-touch-icon.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASET)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(k => Promise.all(k.filter(n => n !== CACHE).map(n => caches.delete(n)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;                       // panggilan API (POST) selalu langsung ke server
  const url = new URL(req.url);
  if (url.origin !== location.origin && !/fonts\.(googleapis|gstatic)\.com/.test(url.host)) return;
  // Jaringan dulu (agar versi baru langsung terpakai), cache sebagai cadangan saat offline
  e.respondWith(fetch(req).then(res => {
    if (res.ok || res.type === 'opaque') { const salin = res.clone(); caches.open(CACHE).then(c => c.put(req, salin)); }
    return res;
  }).catch(() => caches.match(req).then(r => r || caches.match('./index.html'))));
});
