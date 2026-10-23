/* カブーンのせいちょう物語 — Service Worker
 * 役割：アプリ本体（HTML/CSS/JS/アイコン/JSZip）を端末にキャッシュして、オフラインでも開けるようにする。
 * 写真・動画・セーブデータは IndexedDB / localStorage にあり、この SW は一切さわらない。
 *
 * 更新のしかた：ファイルを変えたら VERSION を変える（例：2026-10-19-1 → 2026-10-19-2）。
 * 古いキャッシュは activate 時に消え、開いている画面には「さいよみこみ」ボタンが出る。
 */
const VERSION = "2026-10-23-1";
const CACHE = "kabun-app-" + VERSION;
const FONT_CACHE = "kabun-fonts";

// GitHub Pages はサブパス（/リポジトリ名/）で配信されるので、すべて相対パスで書く
const SHELL = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./css/style.css",
  "./js/data.js",
  "./js/quiz.js",
  "./js/quiz/num.js",
  "./js/quiz/eng.js",
  "./js/quiz/flag.js",
  "./js/quiz/animal.js",
  "./js/state.js",
  "./js/media.js",
  "./js/backup.js",
  "./js/bgm.js",
  "./js/voice.js",
  "./js/render.js",
  "./js/diary.js",
  "./js/settings.js",
  "./js/app.js",
  "./vendor/jszip.min.js",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/maskable-512.png",
  "./icons/apple-touch-icon.png"
];

self.addEventListener("install", (e) => {
  e.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    // HTTP キャッシュを飛ばして必ず最新を取る
    await cache.addAll(SHELL.map((u) => new Request(u, { cache: "reload" })));
    await self.skipWaiting();
  })());
});

self.addEventListener("activate", (e) => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((k) => k.startsWith("kabun-app-") && k !== CACHE).map((k) => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener("message", (e) => {
  if (e.data && e.data.type === "SKIP_WAITING") self.skipWaiting();
});

const isFont = (url) => url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com";

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);

  // Google Fonts：キャッシュがあれば即返し、裏で更新（オフラインでもフォントが出る）
  if (isFont(url)) {
    e.respondWith((async () => {
      const cache = await caches.open(FONT_CACHE);
      const hit = await cache.match(req);
      const refresh = fetch(req).then((res) => { if (res && (res.ok || res.type === "opaque")) cache.put(req, res.clone()); return res; }).catch(() => null);
      return hit || (await refresh) || Response.error();
    })());
    return;
  }

  if (url.origin !== self.location.origin) return;

  // 同一オリジン：キャッシュ優先。無ければネットから取ってキャッシュに入れる。
  // ページ遷移（起動）でどちらも無ければ index.html を返す。
  e.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const hit = await cache.match(req, { ignoreSearch: true });
    if (hit) return hit;
    try {
      const res = await fetch(req);
      if (res && res.ok) cache.put(req, res.clone());
      return res;
    } catch (err) {
      if (req.mode === "navigate") {
        const index = await cache.match("./index.html");
        if (index) return index;
      }
      return Response.error();
    }
  })());
});
