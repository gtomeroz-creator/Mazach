// Service Worker — מאגר מז"ח ומד מים
const CACHE = 'mazach-v7';
const FILES = ['./index.html', './manifest.json'];
const JSZIP_URL = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';

self.addEventListener('install', e => {
e.waitUntil(
caches.open(CACHE)
.then(c => c.addAll(FILES).then(() => c.add(JSZIP_URL).catch(() => {})))
.then(() => self.skipWaiting())
);
});

self.addEventListener('activate', e => {
e.waitUntil(
caches.keys().then(keys =>
Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
).then(() => self.clients.claim())
);
});

self.addEventListener('fetch', e => {
if (e.request.method !== 'GET') return;
e.respondWith(
caches.match(e.request).then(cached => {
if (cached) return cached;
return fetch(e.request).then(res => {
if (e.request.url === JSZIP_URL && res && (res.ok || res.type === 'opaque')) {
const copy = res.clone();
caches.open(CACHE).then(c => c.put(e.request, copy));
}
return res;
}).catch(() =>
e.request.mode === 'navigate' ? caches.match('./index.html') : Response.error()
);
})
);
});
