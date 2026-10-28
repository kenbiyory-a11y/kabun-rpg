/* カブーンのせいちょう物語 — Service Worker
 * 役割：アプリ本体（HTML/CSS/JS/アイコン/JSZip）を端末にキャッシュして、オフラインでも開けるようにする。
 * 写真・動画・セーブデータは IndexedDB / localStorage にあり、この SW は一切さわらない。
 *
 * 更新のしかた：ファイルを変えたら VERSION を変える（例：2026-10-19-1 → 2026-10-19-2）。
 * 古いキャッシュは activate 時に消え、開いている画面には「さいよみこみ」ボタンが出る。
 */
const VERSION = "2026-10-28-7";
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
  "./js/quiz/pref.js",
  "./js/quiz/trip.js",
  "./js/zukan.js",
  "./js/outside.js",
  "./img/pref/01.svg",
  "./img/pref/02.svg",
  "./img/pref/03.svg",
  "./img/pref/04.svg",
  "./img/pref/05.svg",
  "./img/pref/06.svg",
  "./img/pref/07.svg",
  "./img/pref/08.svg",
  "./img/pref/09.svg",
  "./img/pref/10.svg",
  "./img/pref/11.svg",
  "./img/pref/12.svg",
  "./img/pref/13.svg",
  "./img/pref/14.svg",
  "./img/pref/15.svg",
  "./img/pref/16.svg",
  "./img/pref/17.svg",
  "./img/pref/18.svg",
  "./img/pref/19.svg",
  "./img/pref/20.svg",
  "./img/pref/21.svg",
  "./img/pref/22.svg",
  "./img/pref/23.svg",
  "./img/pref/24.svg",
  "./img/pref/25.svg",
  "./img/pref/26.svg",
  "./img/pref/27.svg",
  "./img/pref/28.svg",
  "./img/pref/29.svg",
  "./img/pref/30.svg",
  "./img/pref/31.svg",
  "./img/pref/32.svg",
  "./img/pref/33.svg",
  "./img/pref/34.svg",
  "./img/pref/35.svg",
  "./img/pref/36.svg",
  "./img/pref/37.svg",
  "./img/pref/38.svg",
  "./img/pref/39.svg",
  "./img/pref/40.svg",
  "./img/pref/41.svg",
  "./img/pref/42.svg",
  "./img/pref/43.svg",
  "./img/pref/44.svg",
  "./img/pref/45.svg",
  "./img/pref/46.svg",
  "./img/pref/47.svg",
  "./js/state.js",
  "./js/media.js",
  "./js/backup.js",
  "./js/bgm.js",
  "./js/voice.js",
  "./js/chars.js",
  "./js/render.js",
  "./js/diary.js",
  "./js/settings.js",
  "./js/app.js",
  "./vendor/jszip.min.js",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/maskable-512.png",
  "./icons/apple-touch-icon.png",
  // 国旗 SVG（flag-icons、MIT）。js/data.js の FLAG_CODES と同じ 70 か国にすること
  "./img/flags/jp.svg","./img/flags/us.svg","./img/flags/cn.svg","./img/flags/kr.svg","./img/flags/gb.svg","./img/flags/fr.svg","./img/flags/it.svg","./img/flags/de.svg",
  "./img/flags/ca.svg","./img/flags/au.svg","./img/flags/br.svg","./img/flags/in.svg","./img/flags/es.svg","./img/flags/ru.svg","./img/flags/mx.svg","./img/flags/th.svg",
  "./img/flags/vn.svg","./img/flags/ph.svg","./img/flags/id.svg","./img/flags/tw.svg","./img/flags/sg.svg","./img/flags/my.svg","./img/flags/eg.svg","./img/flags/tr.svg",
  "./img/flags/nl.svg","./img/flags/ch.svg","./img/flags/se.svg","./img/flags/no.svg","./img/flags/dk.svg","./img/flags/fi.svg","./img/flags/gr.svg","./img/flags/be.svg",
  "./img/flags/ie.svg","./img/flags/pl.svg","./img/flags/ua.svg","./img/flags/ar.svg","./img/flags/cl.svg","./img/flags/pe.svg","./img/flags/za.svg","./img/flags/ke.svg",
  "./img/flags/nz.svg","./img/flags/np.svg","./img/flags/sa.svg","./img/flags/jm.svg",
  "./img/flags/pt.svg","./img/flags/at.svg","./img/flags/cu.svg","./img/flags/mn.svg","./img/flags/is.svg","./img/flags/cz.svg","./img/flags/hu.svg","./img/flags/hr.svg",
  "./img/flags/ro.svg","./img/flags/il.svg","./img/flags/ir.svg","./img/flags/iq.svg","./img/flags/pk.svg","./img/flags/bd.svg","./img/flags/lk.svg","./img/flags/kh.svg",
  "./img/flags/mm.svg","./img/flags/kz.svg","./img/flags/ng.svg","./img/flags/gh.svg","./img/flags/ma.svg","./img/flags/et.svg","./img/flags/co.svg","./img/flags/ve.svg",
  "./img/flags/fj.svg","./img/flags/pw.svg"
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
