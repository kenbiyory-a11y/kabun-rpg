# カブーンのせいちょう物語（PWA 版）

4歳の子供向け・レトロRPG風の知育ゲーム。ペットのカブトムシ「カブーン」をクイズで育て、壁（敵）と戦い、進化させる。
ホーム画面に追加すると、オフラインでもアプリのように遊べる。

ゲームの仕様・データの置き場所・環境依存の注意は [KABUN_HANDOFF.md](KABUN_HANDOFF.md) を参照。

## ファイル構成

```
index.html             画面の骨組み（コンソール・タブ・シアター・更新のおしらせ）
manifest.webmanifest   PWA のマニフェスト（名前・アイコン・起動URL）
sw.js                  Service Worker（アプリ本体をキャッシュしてオフライン対応）
css/style.css          見た目ぜんぶ
js/data.js             ステータス・技・進化段階・バトルの章・各種上限値
js/quiz.js             クイズの問題データ（すうじ / えいご / こっき / いきもの）
js/state.js            セーブデータ S（localStorage "kabun4"）、UI 状態、共通ヘルパー
js/media.js            写真・動画・音楽の保存（IndexedDB "kabun-photos"）
js/backup.js           バックアップの書き出し・読み込み（json / zip）
js/bgm.js              BGM（Web Audio の生成曲 2 曲 + 端末内の音楽ファイル）
js/theater.js          おもいでシアター（スライドショー）
js/render.js           描画部品・画面の振り分け・せいちょう画面・バトル画面
js/diary.js            ものがたり（ひびの きろく / おもいでシアター一覧）
js/settings.js         おうちのひと向け設定（バックアップ・BGM）
js/app.js              起動と Service Worker の登録
vendor/jszip.min.js    JSZip 3.10.1（zip バックアップ用。オフラインでも動くよう同梱）
icons/                 PWA アイコン（192 / 512 / maskable / apple-touch-icon）
.nojekyll              GitHub Pages で Jekyll 処理をさせない
seichou-rpg.html       分割前の 1 ファイル版（参考。公開する必要がなければ削除してよい）
```

JS は `<script defer>` で **index.html に書いてある順番**に読み込まれ、グローバルを共有する（ES モジュールではない）。
後のファイルが前のファイルの定数・関数を使うので、順番は変えないこと。新しいファイルを足すときは index.html と sw.js の `SHELL` の両方に追加する。

## ローカルで動かす

Service Worker は `file://` では動かないので、ローカルサーバーで開く。

```
cd kaboon
python -m http.server 8000
```

ブラウザで http://localhost:8000/ を開く。

## GitHub Pages で公開する

公開済み：**https://kenbiyory-a11y.github.io/kabun-rpg/**
リポジトリ：https://github.com/kenbiyory-a11y/kabun-rpg（`main` ブランチの root から配信）

別のアカウント・リポジトリで公開し直す場合の手順：

1. GitHub で新しい公開リポジトリを作る（例：`kabun-rpg`）。
2. このフォルダを push する。

```
cd kaboon
git init
git add .
git commit -m "カブーン PWA 版"
git branch -M main
git remote add origin https://github.com/<ユーザー名>/kabun-rpg.git
git push -u origin main
```

3. リポジトリの **Settings → Pages → Build and deployment** で
   Source: **Deploy from a branch**、Branch: **main** / **/ (root)** を選んで Save。
4. 1〜2 分後に `https://<ユーザー名>.github.io/kabun-rpg/` で開ける。
5. iPhone は Safari で開いて「共有 → ホーム画面に追加」。Android は Chrome のメニューから「アプリをインストール」。

パスはすべて相対（`./`）で書いてあるので、サブパス（`/kabun-rpg/`）でもそのまま動く。

## 更新のしかた

1. ファイルを編集する。
2. **`sw.js` の先頭の `VERSION` を変える**（例：`2026-10-19-1` → `2026-10-19-2`）。これを忘れると、インストール済みの端末に新しいファイルが届かない。
3. commit して push する。
4. 開いている端末には「あたらしい バージョンが あります」と出るので「さいよみこみ」を押す。

## 注意

- 写真・動画・セーブデータは端末の中（IndexedDB / localStorage）にだけ保存される。GitHub Pages には一切送られない。
- Service Worker がキャッシュするのはアプリ本体とフォントだけ。ユーザーのデータにはさわらない。
- フォント（DotGothic16）は Google Fonts から取得し、一度取れたらキャッシュされる。初回がオフラインのときは端末のフォントで表示される。
