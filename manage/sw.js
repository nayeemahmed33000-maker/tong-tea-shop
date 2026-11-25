// Tong App service worker — installable PWA-r jonno.
// 2026-11-23, Sir-er order: load FAST korte hobe (animation-e haat deya
// hoy ni — intro splash ager motoi 2.4s thakbe). Age SW install-e 36 file
// (~2.9MB, tar moddhe 2MB mp3) ek sathe download hoto — slow net-e install
// deri hoto, kokhono fail-o hoto (ekta file fail hole puro install fail —
// tai notun version phone-e pouchato na). Ekhon precache-e shudhu shell
// (HTML + logo + manifest + icon, ~0.3MB); mp3 prothom bar bajle tokhon
// cache hobe (nicher cache-first branch-e cc.put ache).
// Navigation/HTML: PURE network-first (2026-11-23, v34) — 1200ms race SORANO
// holo. Karon: slow net-e race hariye PURONO cached HTML serve hoto, tai
// notun fix (order popup voice, f396d9d4) phone-e pouchate deri hoto /
// pouchato na — app khola thakle to kono reload-i hoto na. Network fail
// hole tobei cache theke serve hobe. Logo/icon/mp3: cache-first (ager motoi).
const CACHE = 'tong-app-v35'; // 2026-11-23: Web Push (owner order alerts) — push + notificationclick handler jog; purono cache activate-e delete hobe
const ASSETS = ['./', './tong-logo.jpg?v=20261120', './manifest.json', './icon-192.png', './icon-512.png'];
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (url.origin !== self.location.origin) return;
  if (e.request.mode === 'navigate' || url.pathname.endsWith('.html') || url.pathname === '/' || url.pathname === '/manifest.json') {
    e.respondWith((async () => {
      try {
        const fresh = await fetch(e.request);
        const c = fresh.clone();
        caches.open(CACHE).then((cc) => cc.put(e.request, c));
        return fresh;
      } catch (e2) {
        const cached = await caches.match(e.request);
        if (cached) return cached;
        return fetch(e.request);
      }
    })());
    return;
  }
  e.respondWith(caches.match(e.request).then((hit) => hit || fetch(e.request).then((r) => {
    const c = r.clone();
    caches.open(CACHE).then((cc) => cc.put(e.request, c));
    return r;
  })));
});

// Web Push (2026-11-23, Sir-er order): order/bell ele Worker push pathay —
// app bondho/screen-off thakleo system notification + vibration asbe.
// App khola thakle in-app popup-i jothesto, tai visible client thakle
// notification dekhano hoy na (double alert hobe na). Tap korle app khulbe.
self.addEventListener('push', (e) => {
  let data = {};
  try { data = e.data ? e.data.json() : {}; } catch { data = {}; }
  const title = data.title || '🔔 টং — নতুন অর্ডার';
  const body = data.body || 'নতুন অর্ডার এসেছে — অ্যাপ খুলে দেখুন।';
  const url = data.url || '/manage/#/app/orders';
  e.waitUntil((async () => {
    const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    if (clients.some((c) => c.visibilityState === 'visible')) return; // app khola — popup-i jothesto
    await self.registration.showNotification(title, { body, tag: data.tag || 'tong-order', icon: '/manage/icon-192.png', badge: '/manage/icon-192.png', vibrate: [200, 100, 200, 100, 200], data: { url } });
  })());
});
self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  const url = (e.notification.data && e.notification.data.url) || '/manage/#/app/orders';
  e.waitUntil((async () => {
    const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const c of clients) {
      if ('focus' in c) {
        try { if ('navigate' in c) await c.navigate(url); } catch {}
        try { await c.focus(); } catch {}
        return;
      }
    }
    await self.clients.openWindow(url);
  })());
});
