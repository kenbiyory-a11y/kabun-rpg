// ---------- きどう ----------
function start(){
  let bad=false;
  try{load();if(!valid(S))S=FRESH();migrate();dayRoll()}
  catch(e){S=FRESH();bad=true;UI.loadWarn=true;try{const v=localStorage.getItem(SAVE_KEY);if(v&&!localStorage.getItem(BROKEN_KEY))localStorage.setItem(BROKEN_KEY,v)}catch(_){}} // 読めなくても旧データは消さず、退避しておく
  if(bad)S.msg="⚠️ セーブデータを よみこめませんでした。おうちのひとに つたえてね（データは けしていません）";
  else if(UI.loadWarn)S.msg="⚠️ まえの セーブが よめなかったので、ひとつ まえの データで はじめます。おうちのひとに つたえてね";
  $("msgbox").addEventListener("click",msgboxTap);
  render();
  try{preloadChars()}catch(e){} // img/chars/ の絵があれば読み込んで差し替える
  loadMedia().then(()=>{if(S.view==="settings")render();updateQuota()}).catch(()=>{});
}
start();
// BGM は最初のタップで始まる（ブラウザの制限で、タップの中でしか音を出し始められない）。UI.active は読み上げの可否にも使う
document.addEventListener("pointerdown",()=>{UI.active=true;try{bgmSync()}catch(e){}},{passive:true});
// 開いたまま日付をまたいだとき、きょうの分 を描き直す（とっくんの途中なら、消えたセッションのまま画面が残らないように必ず描き直す）
document.addEventListener("visibilitychange",()=>{if(!document.hidden&&dayRoll()){save();render()}});
window.addEventListener("focus",()=>{if(dayRoll()){save();render()}});

// ---------- PWA：service worker の登録と、更新のおしらせ ----------
// 新しい sw.js が有効になると controllerchange が飛ぶ。自動で再読み込みはせず、ボタンで。
// （バトルの途中などで勝手に画面が変わらないように。進みぐあいは毎操作ごとに保存済みなので、押しても消えない）
if("serviceWorker" in navigator){
  let hadController=!!navigator.serviceWorker.controller;
  navigator.serviceWorker.addEventListener("controllerchange",()=>{
    if(!hadController){hadController=true;return} // 初回インストール時は何も出さない
    const box=$("update");if(!box)return;box.hidden=false;
    $("updateBtn").onclick=()=>location.reload();
  });
  window.addEventListener("load",()=>{navigator.serviceWorker.register("./sw.js").catch(()=>{})});
}
