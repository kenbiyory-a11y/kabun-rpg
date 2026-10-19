// ---------- きどう ----------
function start(){try{load();if(!valid(S))S=FRESH();migrate();if(!S.used||typeof S.used!=="object")S.used={};if(S.sub==="entry"&&!S.memories[S.pidx])S.sub="menu";if(S.sub==="dentry"&&!S.diary[S.pidx])S.sub="menu";
  render();loadMedia().then(()=>{if(S.bgm.startsWith("a:")&&!AU.has(S.bgm.slice(2)))S.bgm="gen1";if(S.view==="diary"||S.view==="settings")render();updateQuota()})}
  catch(e){S=FRESH();try{localStorage.removeItem("kabun4")}catch(_){}render()}}
start();

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
