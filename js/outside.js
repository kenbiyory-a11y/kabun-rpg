// ---------- そと：せいちゅう になったら 外へ。🪧 かんばん で エリアを えらび、タップした ところへ 歩いて スポットを しらべる（1日 1エリア） ----------
// 状態：S.explore={area,d,spots:[{k,x,y,cover,z,flee,ico,done}],pos:{x,y},n}（その日だけ。日付が変わると消える）。S.daily.explore＝きょう たんけんした エリア id。
// 画面：S.view="battle" のまま、S.sub が "menu"→かんばん、"map"→たんけん、"spot"→できごと、"enc"→かげが でた、"mg"→ミニゲーム、"caught"→つかまえた。ぬし・うらボス は "fight" 以降（render.js の renderBattle）。
// エリアの解放：くさむら は最初から、あとは ひとつ前の エリアの ぬし を倒すと（data.js の areaOpen）。
// スポット（2026-11-11〜）：いきもの 3（まだ つかまえていない ものだけ。ダブりなし）＋ むしとりあみ 1 ＋ ながめる 1。
//   いきもの の スポットは 半分（FLEE_RATE）が「にげていった」。のこりは かげ が出て、むしとりあみ を つかって ミニゲーム（minigame.js）。かつと つかまえて しゃしんと せつめい、ずかんへ。
//   まけても あみ は へらない（かったときだけ 1こ つかう）。あみ が 0 なら あそべない（とっくんで もらえる）。ぜんぶ つかまえた エリアは 🏅 コンプリート。
// うらボス：その エリアの ぬし を たおしたあと、地図の 右はしに でる（data.js の URA）。バトルして かつと ずかんの「ぬし」に のる。1かい きり。
// 歩く演出は CSS transition。UI.instantWalk=true なら 即到着・ミニゲームの結果も すぐ反映（テスト用）。

const AREA_COVER={grass:"🌿",river:"🪨",sky:"☁️",sea:"🌊",forest:"🍂"};
const FLEE_RATE=0.5,BUG_SPOTS=3,RARE_WEIGHT=0.3;
function zukanAll(){return (typeof ZUKAN==="undefined"?[]:ZUKAN).filter(z=>!z.hidden)}
function zukanOf(a){return zukanAll().filter(z=>z.area===a.id)}
function zById(id){return zukanAll().find(z=>z.id===id)||null}
function zLeft(a){return zukanOf(a).filter(z=>!S.dex[z.id])}
// しゃしん（img/zukan/<id>.jpg）と かげ（きりぬき img/zukan/<id>_cut.png を まっくろに）。画像が無い・読めないときは 絵文字
function zPhotoHtml(z){return z.img?`<img class="zphoto" src="${IMG_BASE}zukan/${z.id}.jpg" alt="" data-fb="${z.ico}" onerror="zFail(this,'zemo')">`:`<span class="zemo">${z.ico}</span>`}
function zSilHtml(z){return z.cut?`<img class="zsil" src="${IMG_BASE}zukan/${z.id}_cut.png" alt="" data-fb="${z.ico}" onerror="zFail(this,'zsil emo')">`:`<span class="zsil emo">${z.ico}</span>`}
function zFail(im,cls){try{im.replaceWith(el("span",cls,im.dataset.fb||"❓"))}catch(e){}}
function uraOf(id){return (typeof URA==="undefined"?[]:URA).find(u=>u.id===id)||null}
function uraOfArea(a){return (typeof URA==="undefined"?[]:URA).find(u=>u.area===a.id)||null}
// うらボス が いま この エリアに いるか：ぬし を たおしていて、まだ うらボス に かっていない
function uraHere(a){const u=uraOfArea(a);return !!(u&&S.ch>areaBossIdx(a)&&!S.dex[u.id])}

function genSpots(a){
  // まだ つかまえていない いきもの から、かさならないように えらぶ（✨レアは でにくい）
  const pool=zLeft(a);const picks=[];
  while(picks.length<BUG_SPOTS&&pool.length){const w=pool.map(z=>z.rare?RARE_WEIGHT:1);let r=Math.random()*w.reduce((x,y)=>x+y,0);let i=0;for(;i<pool.length-1;i++){r-=w[i];if(r<=0)break}picks.push(pool.splice(i,1)[0])}
  const kinds=[...picks.map(()=>"creature"),"net","look"];if(picks.length<BUG_SPOTS)kinds.push("look");
  for(let i=kinds.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[kinds[i],kinds[j]]=[kinds[j],kinds[i]]}
  const [g0,g1]=a.ground;const out=[];let pi=0;
  kinds.forEach((k,i)=>{const x=Math.round(16+70*(i+0.5)/kinds.length+(Math.random()*8-4));const y=Math.round(g0+3+Math.random()*(g1-g0-8));
    const s={k,x,y,done:false,cover:AREA_COVER[a.id]||"🌿"};
    if(k==="creature"){s.z=picks[pi++].id;s.flee=Math.random()<FLEE_RATE}
    if(k==="net")s.cover="✨";if(k==="look")s.cover=String(a.look).split(" ")[0];
    out.push(s)});
  // ぜんぶ にげる 日は つくらない（1ぴきは かならず かげが でる）
  const cs=out.filter(s=>s.k==="creature");if(cs.length&&cs.every(s=>s.flee))cs[Math.floor(Math.random()*cs.length)].flee=false;
  return out;
}
// ぬし／うらボス のスポットを そろえる：右はしに 1つだけ。ぬし が出ていれば ぬし、たおしたあとは うらボス（かつまで）
function syncBoss(a){const sp=S.explore.spots;for(let i=sp.length-1;i>=0;i--)if(sp[i].k==="boss"||sp[i].k==="ura")sp.splice(i,1);
  const y=Math.round((a.ground[0]+a.ground[1])/2);
  if(bossHere(a)){const c=CHAPTERS[S.ch];sp.push({k:"boss",x:90,y,ico:c.foe.ico,id:c.foe.id,done:false})}
  else if(uraHere(a)){const u=uraOfArea(a);sp.push({k:"ura",x:90,y,ico:u.ico,id:u.id,done:false})}}
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
  let done=false;const fin=()=>{if(done)return;done=true;UI.walking=false;sp.classList.remove("walk");sp.removeEventListener("transitionend",fin);if(S.view==="battle"&&S.sub==="map"&&S.explore)cb&&cb()}; // 歩いている間に タブを移ったら 到着は なかったことに
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
  S.explore.spots.forEach((s,i)=>{const big=s.k==="boss"||s.k==="ura";
    const e=el("div","spot "+s.k+(s.done?" done":"")+(UI.enc&&UI.enc.i===i?" rustle":""),big?spriteHtml(s.id,s.ico):(s.done&&s.ico?s.ico:s.cover));
    e.style.left=s.x+"%";e.style.top=s.y+"%";e.dataset.i=i;
    e.onclick=ev=>{ev.stopPropagation();if(!(S.view==="battle"&&S.sub==="map"))return;if(UI.walking||(s.done&&!big))return;walkTo(s.x,s.y,()=>arriveSpot(i))};
    f.append(e)});
}
// スポットに着いた
function arriveSpot(i){if(!(S.view==="battle"&&S.sub==="map"))return;const ex=S.explore;if(!ex)return;const s=ex.spots[i];if(!s)return;const a=areaOf(ex.area);
  if(s.k==="boss"){if(bossHere(a))startFight();return}
  if(s.k==="ura"){if(uraHere(a))startUra(s.id);return}
  if(s.done)return;
  let t="";
  if(s.k==="creature"){const z=zById(s.z);
    if(!z||S.dex[z.id]){s.done=true;t=a.look;sfx("tap")}
    else if(s.flee){s.done=true;ex.n=(ex.n||0)+1;t="がさがさ……！\nなにかが とびだして、にげていった！";sfx("tap");say("がさがさ。なにかが にげていった！")}
    else if((S.items.net||0)<=0){t="がさがさ…… なにかの かげが みえる！\nでも むしとりあみが ない……。\nとっくんを すると あみが もらえるよ";sfx("tap");say("かげが みえる！ でも むしとりあみが ない。とっくんを すると あみが もらえるよ")} // スポットは のこす（あみを もらって もどれる）
    else{UI.enc={i,z:z.id,over:false,stop:null,game:null};S.seen[z.id]=true;S.sub="enc";S.msg=null;sfx("ok");say("がさがさ。なにか いる！ あみで つかまえよう");save();render();return}}
  else if(s.k==="net"){s.done=true;ex.n=(ex.n||0)+1;const full=(S.items.net||0)>=NET_MAX;if(!full)S.items.net=(S.items.net||0)+1;t=full?"✨ むしとりあみを みつけた！ でも もう いっぱい（"+NET_MAX+"こ）。また こんど":`✨ むしとりあみを みつけた！\nいま ${S.items.net}こ。かげを みつけたら つかおう`;sfx("ok");say("むしとりあみを みつけた！")}
  else{s.done=true;ex.n=(ex.n||0)+1;t=a.look;sfx("tap");say(String(a.look).replace(/^\S+\s/,""))}
  S.msg=t;S.sub="spot";save();render();
}
// ミニゲームの かたづけ（render のたびに呼ぶ。うごいている タイマーを 止める）
function mgCleanup(){if(UI.enc&&UI.enc.stop){try{UI.enc.stop()}catch(e){}UI.enc.stop=null}const o=$("mgfull");if(o)o.remove()}
// ミニゲームの まど（画面いっぱい）を 開いて ゲームを はじめる。戻り値は かたづけ関数
function mgOpen(g,z){const old=$("mgfull");if(old)old.remove();
  const o=el("div","mgfull");o.id="mgfull";const win=el("div","mgwin");o.append(win);
  win.append(el("div","mghead",`<span class="mgwho">${zSilHtml(z)}</span><span class="mgtitle"><b>${esc(g.n)}</b><small>${esc(g.how)}</small></span>`));
  const box=el("div","mgarena");box.id="mgbox";const foot=el("div","mgfoot");win.append(box,foot);
  const quit=el("button","mgquit","やめる");quit.onclick=()=>{if(UI.enc&&UI.enc.over)return;UI.enc=null;S.sub="map";sfx("tap");render()};win.append(quit);
  document.body.append(o);
  const st={dead:false,timers:[]};
  const later=(fn,ms)=>{if(UI.instantWalk){if(!st.dead)fn();return}st.timers.push(setTimeout(()=>{if(!st.dead)fn()},ms))};
  let stop2=null;try{stop2=g.start({box,foot,z,done:encResult,later})}catch(e){console.error(e);stop2=null}
  return ()=>{st.dead=true;st.timers.forEach(clearTimeout);if(typeof stop2==="function"){try{stop2()}catch(e){}}}}
// ミニゲームの 結果。すこし まってから 反映（○× の 見た目を 見せる）
function encResult(win){const e=UI.enc;if(!e||e.over)return;e.over=true;e.win=!!win;sfx(win?"ok":"ng");
  const mo=$("mgfull");const w=mo&&mo.querySelector(".mgwin");if(w)w.append(el("div","mgresult "+(win?"win":"lose"),win?"🥅 やったー！":"💨 にげちゃった"));
  if(UI.instantWalk)return applyEnc();setTimeout(()=>{if(UI.enc===e)applyEnc()},800)}
function applyEnc(){const e=UI.enc;if(!e)return;mgCleanup();UI.enc=null;const ex=S.explore;const s=ex&&ex.spots[e.i];const z=zById(e.z);
  if(!s||!z||!(S.view==="battle")){S.sub="map";return render()}
  s.done=true;ex.n=(ex.n||0)+1;const a=areaOf(ex.area);
  if(e.win){S.items.net=Math.max(0,(S.items.net||0)-1);S.dex[z.id]={d:ymd(),n:1};s.ico=z.ico;
    if(a&&!zLeft(a).length)S.flags["comp_"+a.id]=true;
    UI.caught=z.id;UI.caughtSaid=false;S.sub="caught";sfx("gain")}
  else{S.msg="あっ、にげちゃった！\nでも だいじょうぶ。また あえるよ";S.sub="spot";say("にげちゃった。でも だいじょうぶ。また あえるよ")}
  save();render()}
// ---- うらボス ----
function startUra(id){const u=uraOf(id);if(!u)return render();
  if(S.foe&&!S.foe.ura&&!S.foe.trial&&S.foe.ch===S.ch)S.foeKeep=S.foe; // ぬし と たたかいかけ なら のこしておく
  const hp=Math.min(u.hp,Math.max(1,S.uraHp[id]||u.hp));
  S.foe={ch:S.ch,id:u.id,ico:u.ico,alt:null,name:u.name,hp,max:u.hp,dmg:u.dmg,weak:u.weak||null,guard:u.guard||null,shift:false,src:"ura",ura:u.id,whySaid:false};
  S.hp=maxHp();S.line=0;S.msg=`${u.name} が あらわれた！\n★の ボタンを おしてみよう`;S.sub="fight";sfx("tap");say(`${u.name}が あらわれた！ ほしの ボタンを おしてみよう`);save();render()}
// うらボス との たたかいを はなれる：のこり HP を おぼえて、ぬし との たたかいかけ を もどす
function uraLeave(){const f=S.foe;if(!f||!f.ura)return;if(f.hp>0)S.uraHp[f.ura]=f.hp;const k=S.foeKeep;S.foe=(k&&typeof k==="object"&&k.ch===S.ch)?k:null;S.foeKeep=null}
function uraWin(){const f=S.foe;if(!f||!f.ura)return;const id=f.ura;S.dex[id]={d:ymd(),n:1};delete S.uraHp[id];f.hp=1;uraLeave();delete S.uraHp[id];
  S.hp=maxHp();S.line=0;S.msg=null;UI.caught=id;UI.caughtSaid=false;S.sub="caught"}
function backToMap(){const a=S.explore&&areaOf(S.explore.area);S.sub=(a&&S.explore.d===ymd())?"map":"menu";S.msg=null}

function renderOut(msg,menu,tapBtn){
  if(!S.flags.outIntro){if(S.sub!=="exit"){S.sub="exit";S.line=0}return renderExit(msg,menu,tapBtn)} // はじめて そとに出た よる の演出（一度だけ）
  if(S.foe&&S.foe.ura)uraLeave(); // ここに来るのは たたかっていない とき
  if(S.sub!=="enc"&&S.sub!=="mg")UI.enc=null; // であい の のこりかす を 消す（タブを 移ったあと など）
  if(S.sub==="caught")return renderCaught(msg,menu,tapBtn);
  if((S.sub==="enc"||S.sub==="mg")&&!UI.enc)S.sub="map"; // 読み込みなおし などで であい が消えたら 地図へ（スポットは のこる）
  if(["map","spot","enc","mg"].includes(S.sub)){
    const a=S.explore&&areaOf(S.explore.area);
    if(!a||S.explore.d!==ymd()){S.explore=null;UI.enc=null;S.sub="menu";return renderOut(msg,menu,tapBtn)}
    syncBoss(a);fieldMap(a);
    const sps=S.explore.spots.filter(s=>s.k!=="boss"&&s.k!=="ura");const total=sps.length,done=sps.filter(s=>s.done).length;
    if(S.sub==="spot"){msg.append(el("span","tx big2",rich(S.msg||"")),el("span","cur","▼"));tapBtn("▶ つぎへ",()=>{S.sub="map";S.msg=null;save();render()});return}
    if(S.sub==="enc"){const z=zById(UI.enc.z);
      msg.innerHTML=`<div class="encsil">${zSilHtml(z)}</div><div class="ctr big2">がさがさ…… なにか いる！</div><div class="ctr note">🥅 むしとりあみ ${S.items.net||0}こ。ミニゲームに かつと つかまえられる</div>`;
      menu.className="menu one";const go=el("button","tap","🥅 あみで つかまえる！");
      go.onclick=()=>{UI.enc.game=pickMinigame(z).id;UI.enc.over=false;S.sub="mg";sfx("tap");render()};
      const no=el("button","wide","そっと しておく");no.onclick=()=>{UI.enc=null;S.sub="map";sfx("tap");render()};
      menu.append(go,no);return}
    if(S.sub==="mg"){const z=zById(UI.enc.z);const g=MINIGAMES.find(x=>x.id===UI.enc.game)||MINIGAMES[0];
      msg.innerHTML=`<div class="ctr big2">🎮 ${esc(g.n)}</div><div class="ctr note">${esc(g.how)}</div>`;menu.className="menu one";
      if(UI.enc.over)return; // 結果まち の あいだに 描きなおされた
      UI.enc.stop=mgOpen(g,z);if(UI.mgSaid!==UI.enc)if(say(g.how))UI.mgSaid=UI.enc;
      return}
    const boss=S.explore.spots.find(s=>s.k==="boss");const ura=S.explore.spots.find(s=>s.k==="ura");const c=CHAPTERS[S.ch];
    const all=zukanOf(a).length,got=all-zLeft(a).length;
    let h=`<b>${a.ico} ${esc(a.n)}</b>　つかまえた ${got} / ${all}${S.flags["comp_"+a.id]?" 🏅":""}　🥅 ${S.items.net||0}`;
    if(boss&&c)h+=`<div class="note2">${c.foe.ico} ${esc(c.foe.name)}が まっている！ ${esc(c.foe.name)}の ところまで あるいて いこう</div>`;
    if(ura)h+=`<div class="note2">❗ みたことの ない おおきな かげが いる……！ ちかづいてみよう</div>`;
    h+=done<total?`<div class="note">きになる ところを タップしてみよう（しらべた ${done} / ${total}）</div>`:`<div class="note2">きょうの たんけんは おしまい！ また あした</div>`;
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
    const all=zukanOf(a).length,got=all-zLeft(a).length;const prog=`つかまえた ${got} / ${all}${S.flags["comp_"+a.id]?" 🏅":""}`;
    let sub="";
    if(!open){const prev=AREAS[i-1];const bc=prev&&CHAPTERS[areaBossIdx(prev)];sub=bc?`🔒 ${bc.foe.name}に かったら ひらく`:"🔒"}
    else if(boss)sub=`${c.foe.ico} ${c.foe.name}が まっている！`;
    else if(busy)sub=`また あした（${prog}）`;
    else sub=(today===a.id?"たんけんの つづき":"たんけんに いく")+`（${prog}）`+(uraHere(a)?"　❗ おおきな かげ":"");
    const b=el("button",open&&(!busy||boss)?"":"dim",`${a.ico} ${esc(a.n)}${boss?' <span class="bang">！</span>':""}<small>${esc(sub)}</small>`);
    b.disabled=!open||(busy&&!boss);
    b.onclick=()=>{if(busy&&boss){startFight();return}enterArea(a)};
    menu.append(b)});
}
// つかまえた！（いきもの／うらボス）：しゃしん と せつめい
function renderCaught(msg,menu,tapBtn){
  const z=zById(UI.caught);const u=z?null:uraOf(UI.caught);
  if(!z&&!u){backToMap();return renderOut(msg,menu,tapBtn)}
  const a=S.explore&&areaOf(S.explore.area);if(a&&S.explore.d===ymd()){syncBoss(a);fieldMap(a)}else fieldGrowth(stageIdx(),false,"day");
  if(z){const za=areaOf(z.area);const all=zukanOf(za).length,got=all-zLeft(za).length;const comp=!zLeft(za).length;
    msg.innerHTML=`<div class="zcard${z.rare?" rare":""}">${zPhotoHtml(z)}</div><div class="ctr big2">🎉 ${esc(z.n)}を つかまえた！${z.rare?" ✨レア！":""}</div><div class="ctr">${esc(z.fact)}</div><div class="note2">📗 ずかんに のった！（${esc(za.n)} ${got} / ${all}）${comp?`<br>🏅 ${esc(za.n)} コンプリート！ ぜんぶ つかまえた！`:""}</div>`;
    if(!UI.caughtSaid&&say(String(z.say||`${z.n}を つかまえた！ ${z.fact}`).replace("みつけた","つかまえた")+(comp?` ${za.n} コンプリート！`:"")))UI.caughtSaid=true}
  else{msg.innerHTML=`<div class="zcard boss"><span class="zemo">${spriteHtml(u.id,u.ico)}</span></div><div class="ctr big2">🎉 ${esc(u.name)}に かった！</div><div class="ctr">${esc(u.fact||"")}</div><div class="note2">📗 ずかんの「ぬし」に のった！</div>`;
    if(!UI.caughtSaid&&say(`${u.name}に かった！ ずかんに のったよ`))UI.caughtSaid=true}
  tapBtn("▶ つぎへ",()=>{UI.caught=null;backToMap();save();render()});
}
// 📗 ずかん（ものがたり タブから）。つかまえた＝しゃしん、であった だけ＝かげ、まだ＝❓。タップで くわしく
function renderDex(msg,menu){
  fieldGrowth(stageIdx(),false,"diary");
  const all=zukanAll();const got=all.filter(z=>S.dex[z.id]);
  const dz=UI.dexId&&zById(UI.dexId);
  if(dz&&S.dex[dz.id]){const d=S.dex[dz.id];
    msg.innerHTML=`<div class="zcard${dz.rare?" rare":""}">${zPhotoHtml(dz)}</div><div class="ctr big2">${esc(dz.n)}${dz.rare?" ✨":""}</div><div class="ctr">${esc(dz.fact)}</div><div class="ctr note">${esc(areaOf(dz.area).n)}で つかまえた${d.d?"（"+esc(d.d)+"）":""}</div>`;
    menu.className="menu one";const sp=el("button","wide","🔊 きいてみる");sp.disabled=!voiceOK();sp.onclick=()=>say(`${dz.n}。${dz.fact}`);
    const b=el("button","wide","もどる");b.onclick=()=>{UI.dexId=null;sfx("tap");render()};menu.append(sp,b);return}
  UI.dexId=null;
  msg.append(el("div","",`<b>📗 ずかん</b>　つかまえた ${got.length} / ${all.length}`));
  for(const a of AREAS){const zs=all.filter(z=>z.area===a.id);if(!zs.length)continue;const g=zs.filter(z=>S.dex[z.id]).length;
    msg.append(el("div","dexa",`${a.ico} ${esc(a.n)}　${g} / ${zs.length}${S.flags["comp_"+a.id]?" 🏅":""}${areaOpen(a)?"":" 🔒"}`));
    const grid=el("div","dexgrid");
    zs.forEach(z=>{let c;
      if(S.dex[z.id]){c=el("button","dz on",zPhotoHtml(z));c.setAttribute("aria-label",z.n);c.onclick=()=>{UI.dexId=z.id;sfx("tap");say(z.n);render()}}
      else if(S.seen&&S.seen[z.id])c=el("span","dz seen",zSilHtml(z));
      else c=el("span","dz","❓");
      grid.append(c)});
    msg.append(grid)}
  // ぬし：エリアの ぬし（たおすと のる）と うらボス（かつと のる）
  const bossN=AREAS.filter(a=>S.ch>areaBossIdx(a)).length+(typeof URA==="undefined"?0:URA.filter(u=>S.dex[u.id]).length);
  msg.append(el("div","dexa",`👑 ぬし　${bossN} / ${AREAS.length+(typeof URA==="undefined"?0:URA.length)}`));
  const bg=el("div","dexgrid boss");
  AREAS.forEach(a=>{const c=CHAPTERS[areaBossIdx(a)];const beat=S.ch>areaBossIdx(a);const u=uraOfArea(a);
    const x=beat?el("button","dz on",spriteHtml(c.foe.id,c.foe.ico)):el("span","dz","❓");if(beat)x.onclick=()=>{say(c.foe.name);sfx("tap")};bg.append(x);
    if(u){const y=S.dex[u.id]?el("button","dz on gold",spriteHtml(u.id,u.ico)):el("span","dz",beat?"❗":"❓");if(S.dex[u.id])y.onclick=()=>{say(u.name);sfx("tap")};bg.append(y)}});
  msg.append(bg);
  if(!got.length)msg.append(el("div","note",stageIdx()>=3?"そとを たんけんして、かげを みつけたら あみで つかまえよう":"せいちゅうに なったら そとで いきものを さがせるよ"));
  menu.className="menu one";const b=el("button","wide","もどる");b.onclick=()=>{S.sub="menu";save();render()};menu.append(b);
}

// ---------- はじめて そとに出た よる：ちょうろう クガーン の「しけん」 ----------
// どう がんばっても ダメージは 1 しか入らず、5ターン目に おうさまの いちげき で ふきとばされる。そのあと「せかいを まわって ちからを つけてこい」。
// 一度だけ（S.flags.outIntro）。S.sub="exit"（場面、S.line がページ）→ startTrial() で S.foe.trial=true の ふつうの バトル画面 → まけ の場面は renderTrialEnd
const EXIT_SCENES=[
 {bg:"night",ico:"🌙",char:"kabun_adult",t:"よる。かごの ふたが あいた。\nカブーンは はじめて そとに でた！"},
 {bg:"night",ico:"🍃",char:"kabun_adult",t:"つきの ひかり。くさの におい。\nカブーンは おおきく いきを すった。"},
 {bg:"night",ico:"🐉",char:"kugaan",t:"……！？ おおきな かげが おりてきた！"},
 {bg:"night",ico:"🐉",char:"kugaan",t:"ちょうろう クガーン『おまえが あたらしい カブトムシか。\nわしの つよさを みせてやろう。かかってこい！』"},
];
const TRIAL_TURNS=5;
const TRIAL_END=[
 "カブーンは ふきとばされて、くさむらに ころがった……。",
 "クガーン『まだまだじゃな。だが、よい めを しておる』",
 "クガーン『せかいを まわって ちからを つけてこい。\nくさむら、かわ、そら、うみ…… ぬしたちに かてたら、\nもりの おくで まっておるぞ』",
];
function renderExit(msg,menu,tapBtn){
  const i=Math.min(S.line||0,EXIT_SCENES.length-1);const sc=EXIT_SCENES[i];
  fieldScene(sc.bg,sc.ico,sc);
  typeText(msg,sc.t,()=>{msg.append(el("span","cur","▼"))});
  if(UI.exitSaid!==i&&say(sc.t.replace(/\n/g," ")))UI.exitSaid=i;
  const last=i>=EXIT_SCENES.length-1;
  tapBtn(last?"▶ ……！":"▶ つぎへ",()=>{if(!last){S.line=i+1;save();render();return}startTrial()});
}
function startTrial(){const f=mkFoe(CHAPTERS.findIndex(c=>c.foe.id==="kugaan"));f.ch=S.ch;f.trial=true;f.turn=0;f.src="trial";f.shift=false;S.foe=f;S.hp=maxHp();S.line=0;
  S.msg="ちょうろう クガーンの しけん！\n★の ボタンを おしてみよう";S.sub="fight";sfx("tap");say("ちょうろう クガーンの しけん！ ほしの ボタンを おしてみよう");save();render()}
// しけん の1ターン（render.js の attack から呼ばれる）
function trialAttack(k){const f=S.foe;const m=moveOf(k);const mult=multOf(k,f);f.turn=(f.turn||0)+1;f.hp=Math.max(1,f.hp-1);
  let t=`カブーンの ${m.n}！`;t+=mult>1?"\n★ ばつぐん！！ ……でも クガーンは びくとも しない！":"\n……クガーンは びくとも しない！";
  if(f.turn>=TRIAL_TURNS){S.hp=0;t+="\nクガーン『みごとな きあいじゃ。だが……』\nクガーンの おうさまの いちげき！！ カブーンは ふきとばされた！"}
  else{S.hp=Math.max(1,S.hp-f.dmg);t+=`\nクガーンの はんげき！ カブーンに ${f.dmg}の ダメージ！`}
  S.msg=t;S.sub="turn";say(f.turn>=TRIAL_TURNS?"ふきとばされた！":"びくとも しない！");save();render();playFx(k,m.n,mult,true)}
function renderTrialEnd(msg,menu,tapBtn){
  fieldBattle(true);const i=Math.min(S.line||0,TRIAL_END.length-1);const t=TRIAL_END[i];
  typeText(msg,t,()=>{msg.append(el("span","cur","▼"))});if(UI.trialSaid!==i&&say(t.replace(/\n/g," ")))UI.trialSaid=i;
  const last=i>=TRIAL_END.length-1;
  tapBtn(last?"▶ わかった！":"▶ つぎへ",()=>{if(!last){S.line=i+1;save();render();return}
    S.flags.outIntro=true;S.foe=null;S.hp=maxHp();S.line=0;S.sub="menu";S.msg=null;sfx("ok");save();render()});
}
