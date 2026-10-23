// My Money Plan offline cache. Change VERSION when you upload a new index.html.
const VERSION = "money-plan-v1";
const APP = ["./", "./index.html", "./manifest.webmanifest", "./apple-touch-icon.png", "./icon-192.png", "./icon-512.png"];
const FONTS = [
  "https://cdn.jsdelivr.net/npm/@fontsource/ibm-plex-mono@5.0.13/files/ibm-plex-mono-latin-400-normal.woff2",
  "https://cdn.jsdelivr.net/npm/@fontsource/ibm-plex-mono@5.0.13/files/ibm-plex-mono-latin-500-normal.woff2",
  "https://cdn.jsdelivr.net/npm/@fontsource/ibm-plex-mono@5.0.13/files/ibm-plex-mono-latin-600-normal.woff2",
  "https://cdn.jsdelivr.net/npm/@fontsource/ibm-plex-mono@5.0.13/files/ibm-plex-mono-latin-ext-400-normal.woff2",
  "https://cdn.jsdelivr.net/npm/@fontsource/ibm-plex-mono@5.0.13/files/ibm-plex-mono-latin-ext-500-normal.woff2",
  "https://cdn.jsdelivr.net/npm/@fontsource/ibm-plex-mono@5.0.13/files/ibm-plex-mono-latin-ext-600-normal.woff2",
  "https://cdn.jsdelivr.net/npm/@fontsource/inter@5.0.18/files/inter-latin-400-normal.woff2",
  "https://cdn.jsdelivr.net/npm/@fontsource/inter@5.0.18/files/inter-latin-500-normal.woff2",
  "https://cdn.jsdelivr.net/npm/@fontsource/inter@5.0.18/files/inter-latin-600-normal.woff2",
  "https://cdn.jsdelivr.net/npm/@fontsource/inter@5.0.18/files/inter-latin-700-normal.woff2",
  "https://cdn.jsdelivr.net/npm/@fontsource/inter@5.0.18/files/inter-latin-ext-400-normal.woff2",
  "https://cdn.jsdelivr.net/npm/@fontsource/inter@5.0.18/files/inter-latin-ext-500-normal.woff2",
  "https://cdn.jsdelivr.net/npm/@fontsource/inter@5.0.18/files/inter-latin-ext-600-normal.woff2",
  "https://cdn.jsdelivr.net/npm/@fontsource/inter@5.0.18/files/inter-latin-ext-700-normal.woff2",
  "https://cdn.jsdelivr.net/npm/@fontsource/newsreader@5.0.13/files/newsreader-latin-400-italic.woff2",
  "https://cdn.jsdelivr.net/npm/@fontsource/newsreader@5.0.13/files/newsreader-latin-400-normal.woff2",
  "https://cdn.jsdelivr.net/npm/@fontsource/newsreader@5.0.13/files/newsreader-latin-500-normal.woff2",
  "https://cdn.jsdelivr.net/npm/@fontsource/newsreader@5.0.13/files/newsreader-latin-600-normal.woff2",
];
self.addEventListener("install", e => {
  e.waitUntil(caches.open(VERSION).then(async c => {
    await c.addAll(APP);
    await Promise.all(FONTS.map(u => c.add(new Request(u, {mode: "cors"})).catch(() => {})));
  }).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(k => Promise.all(k.filter(x => x !== VERSION).map(x => caches.delete(x)))).then(() => self.clients.claim()));
});
// Phone copy first (works offline). When online, refresh it in the background.
self.addEventListener("fetch", e => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== "GET") return;
  const font = url.hostname === "cdn.jsdelivr.net";
  if (url.origin !== location.origin && !font) return;
  e.respondWith(caches.open(VERSION).then(async cache => {
    const key = req.mode === "navigate" ? "./index.html" : req;
    const hit = await cache.match(key, {ignoreSearch: !font});
    if (hit && font) return hit;
    const fresh = fetch(req).then(r => { if (r && r.ok) cache.put(key, r.clone()); return r; }).catch(() => null);
    if (hit) { e.waitUntil(fresh); return hit; }
    return (await fresh) || cache.match("./index.html");
  }));
});
