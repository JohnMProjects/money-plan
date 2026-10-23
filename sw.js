// My Money Plan - offline cache. Bump VERSION when you upload a new index.html.
const VERSION = "money-plan-v1";
const FILES = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./apple-touch-icon.png",
  "./icon-192.png",
  "./icon-512.png",
  "./icon-maskable-512.png",
  "./fonts/ibm-plex-mono-latin-400-normal.woff2",
  "./fonts/ibm-plex-mono-latin-500-normal.woff2",
  "./fonts/ibm-plex-mono-latin-600-normal.woff2",
  "./fonts/ibm-plex-mono-latin-ext-400-normal.woff2",
  "./fonts/ibm-plex-mono-latin-ext-500-normal.woff2",
  "./fonts/ibm-plex-mono-latin-ext-600-normal.woff2",
  "./fonts/inter-latin-400-normal.woff2",
  "./fonts/inter-latin-500-normal.woff2",
  "./fonts/inter-latin-600-normal.woff2",
  "./fonts/inter-latin-700-normal.woff2",
  "./fonts/inter-latin-ext-400-normal.woff2",
  "./fonts/inter-latin-ext-500-normal.woff2",
  "./fonts/inter-latin-ext-600-normal.woff2",
  "./fonts/inter-latin-ext-700-normal.woff2",
  "./fonts/newsreader-latin-400-italic.woff2",
  "./fonts/newsreader-latin-400-normal.woff2",
  "./fonts/newsreader-latin-500-normal.woff2",
  "./fonts/newsreader-latin-600-normal.woff2",
];
self.addEventListener("install", e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
// Serve from the phone first (works offline), refresh the copy in the background when online.
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== location.origin) return;
  e.respondWith(caches.open(VERSION).then(async cache => {
    const key = req.mode === "navigate" ? "./index.html" : req;
    const hit = await cache.match(key, {ignoreSearch: true});
    const fresh = fetch(req).then(res => { if (res && res.ok) cache.put(key, res.clone()); return res; }).catch(() => null);
    if (hit) { e.waitUntil(fresh); return hit; }
    return (await fresh) || cache.match("./index.html");
  }));
});
