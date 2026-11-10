const CACHE_NAME = 'kangban-auth-community-28';
const CORE_ASSETS = ['./', './index.html', './styles.css', './app.js', './api.js', './auth.js', './manifest.webmanifest', './icon.svg', './vendor/tesseract.min.js', './vendor/worker.min.js', './vendor/tesseract-core-simd-lstm.wasm.js', './vendor/tesseract-core-simd-lstm.wasm', './vendor/lang/chi_sim.traineddata.gz', './vendor/lang/eng.traineddata.gz', './samples/虚构血常规报告.png', './samples/虚构服药医嘱.png'];
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
  /* 页面导航：在线时一律走网络。
     原来和静态资源一样 cache-first，老访客会一直拿到旧 index.html，
     而 app.js?v=N 因为查询参数不同又能取到新内容，两者拼在一起就是
     「新脚本 + 旧结构」——新代码要操作的元素在旧页面里根本不存在。 */
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).then(response => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
        return response;
      }).catch(() => caches.match(event.request).then(cached => cached || caches.match('./index.html')))
    );
    return;
  }
  event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request).then(response => {
    const copy = response.clone(); caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy)); return response;
  }).catch(() => caches.match('./index.html'))));
});
