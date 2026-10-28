// ---------- そと：せいちゅう になったら 外へ。🪧 かんばん で エリアを えらび、タップした ところへ 歩いて スポットを しらべる（1日 1エリア） ----------
// 状態：S.explore={area,d,spots:[{k,x,y,cover,ico,z,done}],pos:{x,y},n}（その日だけ。日付が変わると消える）。S.daily.explore＝きょう たんけんした エリア id。
// 画面：S.view="battle" のまま、S.sub が "menu"→かんばん、"map"→たんけん、"spot"→スポットの できごと。ぬし は "fight" 以降（render.js の renderBattle）。
// エリアの解放：くさむら は最初から、あとは ひとつ前の エリアの ぬし を倒すと（data.js の areaOpen）。ぬし は そのエリアの 🪧 から たたかう。
// スポット：いきもの 3（✨レアは 10%）＋ むしとりあみ 1 ＋ ながめる 1。歩く演出は CSS transition。UI.instantWalk=true なら即到着（テスト用）。

const AREA_COVER={grass:"🌿",river:"🪨",sky:"☁️",sea:"🌊",forest:"🍂"};
function zukanOf(a){return (typeof ZUKAN==="undefined"?[]:ZUKAN).filter(z=>z.area===a.id&&!z.hidden)}
function genSpots(a){
  const zs=zukanOf(a);const rare=zs.filter(z=>z.rare),com=zs.filter(z=>!z.rare);
  const pickZ=used=>{let pool=(rare.length&&Math.random()<0.1)?rare:com;pool=pool.filter(z=>!used.has(z.id));if(!pool.length)pool=zs.filter(z=>!used.has(z.id));if(!pool.length)pool=zs;return pool.length?pool[Math.floor(Math.random()*pool.length)]:null};
  const kinds=["creature","creature","creature","net","look"];for(let i=kinds.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[kinds[i],kinds[j]]=[kinds[j],kinds[i]]}
  const [g0,g1]=a.ground;const used=new Set();const out=[];
  kinds.forEach((k,i)=>{const x=Math.round(16+70*(i+0.5)/kinds.length+(Math.random()*8-4));const y=Math.round(g0+3+Math.random()*(g1-g0-8));
    const s={k,x,y,done:false,cover:AREA_COVER[a.id]||"🌿"};
    if(k==="creature"){const z=pickZ(used);if(z){used.add(z.id);s.z=z.id;s.ico=z.ico}else{s.k="look"}}
    if(s.k==="net")s.cover="✨";if(s.k==="look")s.cover=String(a.look).split(" ")[0];
    out.push(s)});
  return out;
}
// ぬし のスポットを そろえる：いま この エリアに ぬし が出ていれば 右はしに 🪧、倒したら消す
function syncBoss(a){const sp=S.explore.spots;const has=sp.findIndex(s=>s.k==="boss");
  if(bossHere(a)){const c=CHAPTERS[S.ch];if(has<0)sp.push({k:"boss",x:90,y:Math.round((a.ground[0]+a.ground[1])/2),ico:c.foe.ico,id:c.foe.id,done:false});else{sp[has].ico=c.foe.ico;sp[has].id=c.foe.id}}
  else if(has>=0)sp.splice(has,1)}
function enterArea(a){const t=ymd();
  if(!S.explore||S.explore.area!==a.id||S.explore.d!==t)S.explore={area:a.id,d:t,spots:genSpots(a),pos:{x:8,y:a.ground[1]-2},n:0};
  S.daily.explore=a.id;S.sub="map";S.msg=null;sfx("tap");say(`${a.n}に きた！ きになる ところを タップしてみよう`);save();render()}
// タップした ところへ 歩く（% 座標）。到着で cb。transitionend が来ない環境のために タイマーも置く
function walkTo(x,y,cb){
  const a=areaOf(S.explore.area);const [g0,g1]=a.ground;x=Math.max(4,Math.min(96,x));y=Math.max(g0,Math.min(g1,y));
  const sp=$("spWalk");const from=S.explore.pos;const dist=Math.hypot(x-from.x,(y-from.y)*0.6);
  const dur=(UI.instantWalk||!sp||(typeof matchMedia==="function"&&matchMedia("(prefers-reduced-motion: reduce)").matches))?0:Math.max(0.25,Math.min(1.2,dist/70));
  S.explore.pos={x,y};save();
  if(sp)sp.classList.toggle("flip",x<from.x);
  if(dur===0){if(sp){sp.style.transitionDuration="0s";sp.style.left=x+"%";sp.style.top=y+"%"}cb&&cb();return}
  UI.walking=true;sp.classList.add("walk");sp.style.transitionDuration=dur+"s";
  requestAnimationFrame(()=>{sp.style.left=x+"%";sp.style.top=y+"%"});
  let done=false;const fin=()=>{if(done)return;done=true;UI.walking=false;sp.classList.remove("walk");sp.removeEventListener("transitionend",fin);cb&&cb()};
  sp.addEventListener("transitionend",fin);setTimeout(fin,dur*1000+80);
}
// 地図を描く。同じ日・同じエリアなら 作り直さない（歩行中の位置を壊さない）。スポットだけ毎回そろえる
function fieldMap(a){
  const f=$("field");const key="map:"+a.id+":"+S.explore.d;
  if(f.dataset.map!==key||!$("spWalk")){
    f.innerHTML="";f.className="field map "+a.bg;f.dataset.map=key;
    const sp=el("div","sprite walker",kabunHtml(stageIdx()));sp.id="spWalk";f.append(sp);
    f.onclick=e=>{if(!(S.view==="battle"&&S.sub==="map"&&S.explore))return;if(UI.walking)return;if(e.target&&e.target.closest&&e.target.closest(".spot"))return;
      const r=f.getBoundingClientRect();if(!r.width)return;walkTo((e.clientX-r.left)/r.width*100,(e.clientY-r.top)/r.height*100)};
  }
  const sp=$("spWalk");sp.style.left=S.explore.pos.x+"%";sp.style.top=S.explore.pos.y+"%";
  f.querySelectorAll(".spot").forEach(e=>e.remove());
  S.explore.spots.forEach((s,i)=>{const e=el("div","spot "+s.k+(s.done?" done":""),s.k==="boss"?spriteHtml(s.id,s.ico):(s.done&&s.ico?s.ico:s.cover));
    e.style.left=s.x+"%";e.style.top=s.y+"%";e.dataset.i=i;
    e.onclick=ev=>{ev.stopPropagation();if(!(S.view==="battle"&&S.sub==="map"))return;if(UI.walking||(s.done&&s.k!=="boss"))return;walkTo(s.x,s.y,()=>arriveSpot(i))};
    f.append(e)});
}
// スポットに着いた
function arriveSpot(i){const ex=S.explore;if(!ex)return;const s=ex.spots[i];if(!s)return;const a=areaOf(ex.area);
  if(s.k==="boss"){if(bossHere(a))startFight();return}
  if(s.done)return;s.done=true;ex.n=(ex.n||0)+1;
  let t="";
  if(s.k==="creature"){const z=(typeof ZUKAN==="undefined"?[]:ZUKAN).find(z=>z.id===s.z);
    if(z){const first=!S.dex[z.id];S.dex[z.id]=first?{d:ymd(),n:1}:Object.assign({},S.dex[z.id],{n:(S.dex[z.id].n||0)+1});
      t=`${z.ico} ${z.n}を みつけた！${z.rare?"　✨ レア！":""}\n${z.fact}${first?"\n📗 ずかんに のった！":""}`;sfx(first?"ok":"tap");say(z.say||`${z.n}を みつけた！ ${z.fact}`)}
    else{t=a.look;sfx("tap")}}
  else if(s.k==="net"){S.items.net=(S.items.net||0)+1;t=`✨ むしとりあみを みつけた！\nいま ${S.items.net}こ。いつか やくに たつよ`;sfx("ok");say("むしとりあみを みつけた！")}
  else{t=a.look;sfx("tap");say(String(a.look).replace(/^\S+\s/,""))}
  S.msg=t;S.sub="spot";save();render();
}
function renderOut(msg,menu,tapBtn){
  if(S.sub==="map"||S.sub==="spot"){
    const a=S.explore&&areaOf(S.explore.area);
    if(!a||S.explore.d!==ymd()){S.explore=null;S.sub="menu";return renderOut(msg,menu,tapBtn)}
    syncBoss(a);fieldMap(a);
    const sps=S.explore.spots.filter(s=>s.k!=="boss");const total=sps.length,done=sps.filter(s=>s.done).length;
    if(S.sub==="spot"){msg.append(el("span","tx big2",rich(S.msg||"")),el("span","cur","▼"));tapBtn("▶ つぎへ",()=>{S.sub="map";S.msg=null;save();render()});return}
    const boss=S.explore.spots.find(s=>s.k==="boss");const c=CHAPTERS[S.ch];
    let h=`<b>${a.ico} ${esc(a.n)}</b>　しらべた ${done} / ${total}`;
    if(boss&&c)h+=`<div class="note2">${c.foe.ico} ${esc(c.foe.name)}が まっている！ ${esc(c.foe.name)}の ところまで あるいて いこう</div>`;
    h+=done<total?`<div class="note">きになる ところを タップしてみよう</div>`:`<div class="note2">きょうの たんけんは おしまい！ また あした</div>`;
    msg.innerHTML=h;
    menu.className="menu one";const b=el("button","wide","🪧 かんばんに もどる");b.onclick=()=>{S.sub="menu";S.msg=null;save();render()};menu.append(b);
    return;
  }
  // 🪧 かんばん
  fieldGrowth(stageIdx(),false,"day");
  const today=S.daily.explore||null;const king=S.ch>=CHAPTERS.length;
  msg.innerHTML=`<span class="big">🪧</span><div class="ctr big2">どこへ いく？</div>`+(king?`<div class="ctr note">👑 ぜんぶの ぬしを のりこえた！ どこでも たんけんできる</div>`:"")+(today?`<div class="ctr note">きょうは ${esc(areaOf(today)?areaOf(today).n:"")} を たんけんちゅう</div>`:`<div class="ctr note">1にち 1かい、すきな ところを たんけんできる</div>`);
  menu.className="menu one";
  AREAS.forEach((a,i)=>{const open=areaOpen(a);const busy=!!today&&today!==a.id;const boss=open&&bossHere(a);const c=CHAPTERS[S.ch];
    let sub="";
    if(!open){const prev=AREAS[i-1];const bc=prev&&CHAPTERS[areaBossIdx(prev)];sub=bc?`🔒 ${bc.foe.name}に かったら ひらく`:"🔒"}
    else if(boss)sub=`${c.foe.ico} ${c.foe.name}が まっている！`;
    else if(busy)sub="また あした";
    else if(today===a.id)sub="たんけんの つづき";
    else sub="たんけんに いく";
    const b=el("button",open&&(!busy||boss)?"":"dim",`${a.ico} ${esc(a.n)}${boss?' <span class="bang">！</span>':""}<small>${esc(sub)}</small>`);
    b.disabled=!open||(busy&&!boss);
    b.onclick=()=>{if(busy&&boss){startFight();return}enterArea(a)};
    menu.append(b)});
}
// 📗 ずかん（ものがたり タブから）
function renderDex(msg,menu){
  fieldGrowth(stageIdx(),false,"diary");
  const all=(typeof ZUKAN==="undefined"?[]:ZUKAN).filter(z=>!z.hidden);const got=all.filter(z=>S.dex[z.id]);
  let h=`<b>📗 ずかん</b>　${got.length} / ${all.length}`;
  for(const a of AREAS){const zs=all.filter(z=>z.area===a.id);if(!zs.length)continue;
    h+=`<div class="dexrow"><span class="dexa">${a.ico} ${esc(a.n)}${areaOpen(a)?"":" 🔒"}</span>`+zs.map(z=>S.dex[z.id]?`<span class="dz on">${z.ico}</span>`:`<span class="dz">❓</span>`).join("")+`</div>`}
  msg.innerHTML=h;
  if(got.length){const list=el("div","diary");for(const z of got){const row=el("div","has");row.innerHTML=`<span class="ico">${z.ico}</span><span><b>${esc(z.n)}</b>${z.rare?" ✨":""}　<small>${esc(z.fact)}</small></span>`;row.onclick=()=>{say(z.say||z.fact);sfx("tap")};list.append(row)}msg.append(list)}
  else msg.append(el("div","note",stageIdx()>=3?"そとを たんけんして いきものを みつけよう":"せいちゅうに なったら そとで いきものを さがせるよ"));
  menu.className="menu one";const b=el("button","wide","もどる");b.onclick=()=>{S.sub="menu";save();render()};menu.append(b);
}
