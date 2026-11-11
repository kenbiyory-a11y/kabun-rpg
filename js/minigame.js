// ---------- ミニゲーム：そと で いきもの に であったとき、かつと つかまえられる（outside.js から呼ぶ） ----------
// 画面いっぱいの まど（#mgfull、outside.js の mgOpen が作る）の中で あそぶ。
// それぞれ {id,n,how,w,ok(z),start(c)}。c={box（あそぶ場所 #mgbox）,foot（下の 1行：かず や じかん）,z（であった いきもの）,done(かち),later(fn,ms)}。
//   start は box の中を 自分で描き、勝敗が決まったら c.done(true|false) を1回だけ呼ぶ。render() は呼ばない。戻り値は「かたづけ」関数（無くてもよい）。
//   まつ 処理は かならず c.later を使う（まどを 閉じると まとめて 止まる。UI.instantWalk のときは すぐ実行＝テスト用）。
//   いま 押すと 正しい ものに data-ok="1" を付ける（dev/smoke.html が それを押して 通しで確かめる。見た目には出ない）。
// w は 出やすさ（ゲームらしい ものを 多めに）。ふやすときは この配列に 足すだけ。
// 4歳向け：文字が読めなくても 絵で分かる、1回 20秒ほど、まけても「にげちゃった。また あえるよ」で 損はしない。
const MG_EMO=["🍎","🌼","⭐","🍓","🐟","🎈","🍄","🌰"];
const MG_FACE=["🐞","🦋","🐝","🐌","🦗","🌼","🍄","⭐"];
function mgShuffle(a){a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function mgPick(a){return a[Math.floor(Math.random()*a.length)]}
// はこの中の ばらばらな 位置（% 座標、かさなりにくいように ます目に 置く）
function mgCells(n,cols,rows){const cells=[];for(let r=0;r<rows;r++)for(let c=0;c<cols;c++)cells.push([(c+0.5)/cols*100,(r+0.5)/rows*100]);return mgShuffle(cells).slice(0,n).map(([x,y])=>[x+(Math.random()*8-4),y+(Math.random()*8-4)])}
function mgLock(box){box.querySelectorAll("button").forEach(x=>x.disabled=true)}
const MINIGAMES=[
 // 1) しんけいすいじゃく：3くみ（6まい）。はじめに すこしだけ ぜんぶ 見える。5かい まちがえると おしまい
 {id:"memory",n:"しんけいすいじゃく",how:"おなじ えを 2まい めくろう！",w:1.2,ok:()=>true,
  start(c){const pics=mgShuffle(zukanAll().filter(o=>o.area===c.z.area&&o.img&&o.id!==c.z.id)).slice(0,3);
    const faces=pics.length===3?pics.map(o=>zPhotoHtml(o)):mgShuffle(MG_FACE).slice(0,3).map(e=>`<span class="mgface">${e}</span>`);
    const order=mgShuffle([0,0,1,1,2,2]);const grid=el("div","mggrid c3");c.box.append(grid);let open=[],matched=0,miss=0,lock=true,over=false;const LIFE=5;
    const hearts=()=>{c.foot.textContent="❤️".repeat(LIFE-miss)+"🤍".repeat(miss)};hearts();
    const cards=order.map((f,i)=>{const b=el("button","mgflip up",`<span class="front">${faces[f]}</span><span class="back">❓</span>`);b.dataset.f=f;grid.append(b);
      b.onclick=()=>{if(lock||over||b.classList.contains("up"))return;b.classList.add("up");sfx("tap");open.push(b);
        if(open.length<2){mark();return}
        const [p,q]=open;open=[];
        if(p.dataset.f===q.dataset.f){p.classList.add("hit");q.classList.add("hit");matched++;sfx("ok");if(matched>=3){over=true;c.done(true);return}mark()}
        else{miss++;hearts();lock=true;clear();c.later(()=>{p.classList.remove("up");q.classList.remove("up");lock=false;if(miss>=LIFE){over=true;mgLock(c.box);c.done(false)}else mark()},900)}};
      return b});
    const clear=()=>cards.forEach(b=>delete b.dataset.ok);
    const mark=()=>{clear();if(over)return;if(open.length===1){const m=cards.find(b=>b!==open[0]&&b.dataset.f===open[0].dataset.f);if(m)m.dataset.ok="1"}else{const m=cards.find(b=>!b.classList.contains("hit"));if(m)m.dataset.ok="1"}};
    c.later(()=>{cards.forEach(b=>b.classList.remove("up"));lock=false;mark()},2600)}},
 // 2) どこに かくれた？：3まいの はっぱの 1つに かくれて、はっぱが いれかわる。どれに いるか あてる
 {id:"shell",n:"どこに かくれた？",how:"はっぱを よく みて！ どこに いるかな？",w:1.2,ok:()=>true,
  start(c){c.box.classList.add("free");const slots=[20,50,80];const pos=[0,1,2];const home=Math.floor(Math.random()*3);let ready=false,over=false;
    const bug=el("span","mghide",zSilHtml(c.z));c.box.append(bug);
    const cups=[0,1,2].map(k=>{const b=el("button","mgcup up","🍃");b.style.left=slots[k]+"%";b.style.top="58%";c.box.append(b);
      b.onclick=()=>{if(!ready||over)return;over=true;cups.forEach(x=>{x.classList.add("up");x.disabled=true});bug.style.left=slots[pos[home]]+"%";bug.classList.add("show");b.classList.add(k===home?"hit":"miss");c.done(k===home)};return b});
    const place=()=>{cups.forEach((b,k)=>b.style.left=slots[pos[k]]+"%");bug.style.left=slots[pos[home]]+"%"};
    bug.style.top="62%";place();bug.classList.add("show");c.foot.textContent="👀 よく みてね";
    const swaps=3;let n=0;
    const go=()=>{if(n>=swaps){ready=true;cups[home].dataset.ok="1";c.foot.textContent="どれかな？ タッチ！";return}n++;const a=Math.floor(Math.random()*3);let b=Math.floor(Math.random()*2);if(b>=a)b++;[pos[a],pos[b]]=[pos[b],pos[a]];place();sfx("tap");c.later(go,750)};
    c.later(()=>{cups.forEach(b=>b.classList.remove("up"));bug.classList.remove("show");c.later(go,600)},1500)}},
 // 3) かくれんぼ タッチ：6つの くさ の どれかから かげ が かおを だす。でている あいだに 3かい タッチ（9かい でて くる）
 {id:"whack",n:"かくれんぼ タッチ",how:"かおを だしたら すぐ タッチ！",w:1.2,ok:()=>true,
  start(c){const grid=el("div","mggrid c3");c.box.append(grid);let hits=0,pops=0,cur=-1,last=-1,over=false,token=0;const NEED=3,MAX=9;
    const show=()=>{c.foot.textContent=`🥅 ${hits} / ${NEED}　のこり ${"●".repeat(MAX-pops)}`};show();
    const holes=[0,1,2,3,4,5].map(i=>{const b=el("button","mghole",`<span class="peek">${zSilHtml(c.z)}</span><span class="bush">🌿</span>`);grid.append(b);
      b.onclick=()=>{if(over||cur!==i)return;hits++;sfx("tap");b.classList.remove("on");b.classList.add("hit");delete b.dataset.ok;cur=-1;token++;show();
        if(hits>=NEED){over=true;c.done(true);return}c.later(()=>{b.classList.remove("hit");pop()},450)};return b});
    const pop=()=>{if(over)return;if(pops>=MAX){over=true;c.done(false);return}pops++;let i=Math.floor(Math.random()*5);if(i>=last)i++;last=cur=i;const my=++token;holes[i].classList.add("on");holes[i].dataset.ok="1";show();
      if(!UI.instantWalk)c.later(()=>{if(over||token!==my)return;holes[i].classList.remove("on");delete holes[i].dataset.ok;cur=-1;c.later(pop,500)},1400)};
    c.later(pop,700)}},
 // 4) あみで タッチ：にげまわる かげを 3かい タッチ（12びょう）
 {id:"tap",n:"あみで タッチ",how:"にげる かげを 3かい タッチ！",w:1,ok:()=>true,
  start(c){c.box.classList.add("free");const bar=el("div","mgbar",'<i></i>');const cnt=el("span","","🥅 0 / 3");c.foot.append(cnt,bar);
    const t=el("button","mgtarget",zSilHtml(c.z));t.dataset.ok="1";c.box.append(t);
    let hit=0,over=false;const move=()=>{t.style.left=(14+Math.random()*72)+"%";t.style.top=(14+Math.random()*72)+"%"};move();
    const iv=setInterval(move,1100);const T=12000;const t0=Date.now();
    const tick=setInterval(()=>{const r=Math.max(0,1-(Date.now()-t0)/T);bar.firstChild.style.width=(r*100)+"%";if(r<=0)end(false)},100);
    const end=w=>{if(over)return;over=true;clearInterval(iv);clearInterval(tick);t.disabled=true;c.done(w)};
    t.onclick=()=>{if(over)return;hit++;cnt.textContent=`🥅 ${hit} / 3`;sfx("tap");t.classList.remove("pop");void t.offsetWidth;t.classList.add("pop");if(hit>=3)end(true);else move()};
    return ()=>{over=true;clearInterval(iv);clearInterval(tick)}}},
 // 5) かげあわせ：かげ と おなじ かたちの しゃしんを えらぶ（しゃしん と きりぬき が ある いきもの だけ）
 {id:"kage",n:"かげあわせ",how:"かげと おなじ かたちは どれ？",w:1,
  ok:z=>!!(z.cut&&z.img&&zukanAll().filter(o=>o.area===z.area&&o.id!==z.id&&o.img).length>=2),
  start(c){c.box.classList.add("col");c.box.append(el("div","mgsil",zSilHtml(c.z)));
    const others=mgShuffle(zukanAll().filter(o=>o.area===c.z.area&&o.id!==c.z.id&&o.img)).slice(0,2);
    const row=el("div","mgrow");mgShuffle([c.z,...others]).forEach(o=>{const b=el("button","mgcard",zPhotoHtml(o));if(o.id===c.z.id)b.dataset.ok="1";
      b.onclick=()=>{mgLock(c.box);b.classList.add(o.id===c.z.id?"hit":"miss");c.done(o.id===c.z.id)};row.append(b)});
    c.box.append(row)}},
 // 6) じゅんばん タッチ：1 から じゅんばんに。2かい まちがえると おしまい
 {id:"order",n:"じゅんばん タッチ",how:"1 から じゅんばんに タッチ！",w:0.6,ok:()=>true,
  start(c){c.box.classList.add("free");const N=5;let next=1,miss=0,over=false;
    mgCells(N,3,2).forEach(([x,y],i)=>{const b=el("button","mgnum round",String(i+1));b.dataset.n=i+1;if(i===0)b.dataset.ok="1";b.style.left=x+"%";b.style.top=y+"%";
      b.onclick=()=>{if(over)return;if(i+1===next){b.classList.add("hit");b.disabled=true;delete b.dataset.ok;next++;sfx("tap");const nb=c.box.querySelector(`button[data-n="${next}"]`);if(nb)nb.dataset.ok="1";if(next>N){over=true;c.done(true)}}
        else{miss++;b.classList.remove("shake");void b.offsetWidth;b.classList.add("shake");if(miss>=2){over=true;mgLock(c.box);c.done(false)}}};
      c.box.append(b)})}},
 // 7) いくつ かな：えは いくつ？
 {id:"count",n:"いくつ かな",how:"いくつ あるかな？",w:0.4,ok:()=>true,
  start(c){const n=2+Math.floor(Math.random()*5);const e=mgPick(MG_EMO);c.box.classList.add("free");
    mgCells(n,4,2).forEach(([x,y])=>{const s=el("span","mgitem",e);s.style.left=x+"%";s.style.top=y+"%";c.box.append(s)});
    const row=el("div","mgrow");mgShuffle([n,n===2?4:n-1,n+1]).forEach(o=>{const b=el("button","mgnum",String(o));if(o===n)b.dataset.ok="1";b.onclick=()=>{mgLock(row);b.classList.add(o===n?"hit":"miss");c.done(o===n)};row.append(b)});
    c.foot.append(row)}},
 // 8) なかまはずれ：1つだけ ちがう えを さがす
 {id:"odd",n:"なかまはずれ",how:"1つだけ ちがうのは どれ？",w:0.4,ok:()=>true,
  start(c){const pairs=[["🍎","🍊"],["🐶","🐱"],["⭐","🌙"],["🌼","🌷"],["🚗","🚌"],["🐟","🐙"],["🍓","🍒"],["☀️","☁️"]];const [a,b]=mgPick(pairs);
    const grid=el("div","mggrid c3");const odd=Math.floor(Math.random()*6);c.box.append(grid);
    for(let i=0;i<6;i++){const bt=el("button","mgcard emo",i===odd?b:a);if(i===odd)bt.dataset.ok="1";bt.onclick=()=>{mgLock(c.box);bt.classList.add(i===odd?"hit":"miss");c.done(i===odd)};grid.append(bt)}}},
];
// であった いきもの に つかえる ゲームから 1つ えらぶ（出やすさ w で くじびき。まえと おなじ ものは さける。UI.mgForce で 固定＝テスト用）
function pickMinigame(z){const usable=MINIGAMES.filter(g=>g.ok(z));if(UI.mgForce){const f=usable.find(g=>g.id===UI.mgForce);if(f)return f}
  const pool=usable.length>1?usable.filter(g=>g.id!==UI.mgLast):usable;let r=Math.random()*pool.reduce((s,g)=>s+(g.w||1),0);let g=pool[pool.length-1];for(const x of pool){r-=(x.w||1);if(r<=0){g=x;break}}
  UI.mgLast=g.id;return g}
