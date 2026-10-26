// ---------- きどう ----------
function start(){
  let bad=false;
  try{load();if(!valid(S))S=FRESH();migrate();dayRoll()}
  catch(e){S=FRESH();bad=true} // 読めなくても旧データは消さない（kabun4 / kabun5 はそのまま残る）
  if(bad)S.msg="⚠️ セーブデータを よみこめませんでした。おうちのひとに つたえてね（データは けしていません）";
  render();
  loadMedia().then(()=>{if(S.view==="settings")render();updateQuota()}).catch(()=>{});
}
start();
// BGM は最初のタップで始まる（ブラウザの制限で、タップの中でしか音を出し始められない）
document.addEventListener("pointerdown",()=>{try{bgmSync()}catch(e){}},{passive:true});
// 開いたまま日付をまたいだとき、きょうの分 を描き直す
document.addEventListener("visibilitychange",()=>{if(!document.hidden&&dayRoll()&&S.sub==="menu"){save();render()}});
window.addEventListener("focus",()=>{if(dayRoll()&&S.sub==="menu"){save();render()}});

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
