const CACHE_NAME = 'kangban-m1-data-layer-17';
const CORE_ASSETS = ['./', './index.html', './styles.css', './app.js', './api.js', './manifest.webmanifest', './icon.svg', './vendor/tesseract.min.js', './vendor/worker.min.js', './vendor/tesseract-core-simd-lstm.wasm.js', './vendor/tesseract-core-simd-lstm.wasm', './vendor/lang/chi_sim.traineddata.gz', './vendor/lang/eng.traineddata.gz', './samples/虚构血常规报告.png', './samples/虚构服药医嘱.png'];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(CORE_ASSETS)));
  self.skipWaiting();
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)))));
  self.clients.claim();
});
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request).then(response => {
    const copy = response.clone(); caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy)); return response;
  }).catch(() => caches.match('./index.html'))));
});
