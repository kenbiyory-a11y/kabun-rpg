# カブーンのせいちょう物語（PWA 版）

4歳の子供向け・レトロRPG風の知育ゲーム。ペットのカブトムシ「カブーン」をクイズで育て、壁（敵）と戦い、進化させる。
ホーム画面に追加すると、オフラインでもアプリのように遊べる。

ゲームの仕様・データの置き場所・環境依存の注意は [KABUN_HANDOFF.md](KABUN_HANDOFF.md) を参照。

## ファイル構成

```
index.html             画面の骨組み（コンソール・タブ・更新のおしらせ）
manifest.webmanifest   PWA のマニフェスト（名前・アイコン・起動URL）
sw.js                  Service Worker（アプリ本体をキャッシュしてオフライン対応）
css/style.css          見た目ぜんぶ
js/data.js             ステータス・技・相性・進化段階・章（かべ）・はじまりの おはなし（INTRO / PLAYERS）・各種定数
js/quiz.js             クイズの器と 5問セッションの組み立て・採点・復習箱・段階式難易度
js/quiz/num.js         問題データ：かず（旧 すうじ。70問 ＋ かぞえる・あわせて・のこり は quiz.js が自動生成）
js/quiz/eng.js         問題データ：ことば（旧 えいご。えいご60問 ＋ ひらがな10問）
js/quiz/flag.js        問題データ：せかい（旧 こっき。手書き70問 ＋ 70か国の表 COUNTRIES。表から quiz.js が こっき→くに／くに→こっき を自動生成）
js/quiz/animal.js      問題データ：しぜん（旧 いきもの。70問）
js/state.js            セーブデータ S（localStorage "kabun5"、旧 "kabun4" から自動移行）、UI 状態、共通ヘルパー
js/media.js            写真・動画・音楽の保存（IndexedDB "kabun-photos"）
js/backup.js           バックアップの書き出し・読み込み（json / zip）
js/bgm.js              ゲームボーイ風シンセ：BGM（へや／バトル／かち。オリジナル曲）と効果音 sfx
js/voice.js            よみあげ（端末内蔵の音声合成）
js/chars.js            キャラの絵（img/chars/<id>.png があれば絵文字の代わりに表示。無ければ絵文字）
js/render.js           描画部品・画面の振り分け・せいちょう画面（5問セッション）・バトル画面
js/diary.js            ものがたり（ひびの きろく）
js/settings.js         おうちのひと向け（暗証番号・せいせき・1日のかず・おと・バックアップ・開発用）
js/app.js              起動と Service Worker の登録
js/theater.js          おもいでシアター（v2 では読み込んでいない。データは残しているので戻せる）
vendor/jszip.min.js    JSZip 3.10.1（zip バックアップ用。オフラインでも動くよう同梱）
icons/                 PWA アイコン（192 / 512 / maskable / apple-touch-icon）
img/flags/             国旗の SVG（flag-icons、MIT。LICENSE.txt 同梱）。絵文字の国旗が文字になる端末向け
img/chars/             キャラの絵（PNG）を置く場所。ファイル名と条件は img/chars/README.md
dev/                   開発用テスト（下記）。アプリからは読み込まない
.nojekyll              GitHub Pages で Jekyll 処理をさせない
seichou-rpg.html       分割前の 1 ファイル版（参考。公開する必要がなければ削除してよい）
```

JS は `<script defer>` で **index.html に書いてある順番**に読み込まれ、グローバルを共有する（ES モジュールではない）。
後のファイルが前のファイルの定数・関数を使うので、順番は変えないこと。新しいファイルを足すときは index.html と sw.js の `SHELL` の両方に追加する。

## テスト（開発用）

```
node dev/harness.js .          # セーブ移行・セッション・採点・章の出現など、ロジックだけを node で確認
```

画面の流れ（名前入力 → 5問 → 結果 → バトル → 進化 → きろく → 暗証番号）は `dev/smoke.html` で確認する。ローカルサーバーを起動して http://localhost:8000/dev/smoke.html を開くと、ページの下に ok / FAIL の一覧が出る（ヘッドレスなら `chrome --headless=new --dump-dom http://127.0.0.1:8000/dev/smoke.html` でも見られる）。問題データを増やしたときは、各ファイルで id の重複と「正解が はずれ に含まれていないか」を確認する。`dev/sweep.html` は全問題（生成問題込み）を実際の画面で描いて、よみあげ ON の経路でも選択肢が必ず出ることを確かめる（にせの音声合成を入れて動かす。同じく headless Chrome で `--dump-dom` し、`<title>` が DONE OK なら合格）。

## ローカルで動かす

Service Worker は `file://` では動かないので、ローカルサーバーで開く。

```
cd kabun-rpg
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
cd kabun-rpg
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

- 写真・動画・セーブデータは端末の中（IndexedDB / localStorage）にだけ保存される。GitHub Pages には一切送られない。全消去・読み込みの直前のセーブは `kabun5-prev` に退避され、⚙️ → バックアップ → 「ひとつ前の セーブに もどす」で戻せる。読めなくなったセーブは `kabun5-broken` に退避され、「こわれたセーブを書き出す」で取り出せる。
- おうちのひと向け画面の暗証番号は localStorage `kabun-pin` に別保存している（バックアップには入らない）。忘れたときはロック画面の「ばんごうを わすれた」を押すと24時間後に番号だけが消える（セーブは消えない。その前に ⚙️ に入れたら取り消せる）。**ブラウザの「サイトデータを削除」はセーブ・写真・記録もすべて消えるので使わない。** PC の Chrome なら F12 → Application → Local Storage → `kabun-pin` だけを消す方法もある。
- よみあげは端末内蔵の音声を使う。日本語音声が無い端末では 🔊 が出ない。iPhone は消音スイッチがオンだと鳴らない。声は ⚙️ → おと → 「こえを えらぶ」でその端末に入っている日本語の声から選べる（localStorage `kabun-voice-ja`、バックアップには入らない。選んでいなければ端末内蔵の声を優先）。
- BGM と効果音は Web Audio で合成している（音源ファイルなし）。曲はこのリポジトリで書いたオリジナルで、既存ゲームの曲は使っていない。ブラウザの制限で最初のタップから鳴り始める。⚙️ → おと で切れる。
- 国旗は `img/flags/*.svg`（70か国）を使う。国を増やすときは `js/quiz/flag.js` の `COUNTRIES` に1行足し、SVG を置き、`js/data.js` の `FLAG_CODES` と `sw.js` の `SHELL` に同じ国コードを追加する（出典：https://github.com/lipis/flag-icons 、MIT）。`node dev/checkquiz.js .` が抜けを見つける。
- Service Worker がキャッシュするのはアプリ本体とフォントだけ。ユーザーのデータにはさわらない。
- フォント（DotGothic16）は Google Fonts から取得し、一度取れたらキャッシュされる。初回がオフラインのときは端末のフォントで表示される。
