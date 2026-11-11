// ---------- ミニゲーム：そと で いきもの に であったとき、かつと つかまえられる（outside.js から呼ぶ） ----------
// それぞれ {id,n,how,ok(z),start(box,z,done)}。start は box（msgbox の中の箱）に 画面を作り、勝敗が決まったら done(true|false) を1回だけ呼ぶ。
// 戻り値は「かたづけ」関数（タイマーを止める）。画面は 自分で 描きかえ、render() は呼ばない（呼ぶと msgbox ごと作り直される）。
// 正解の ボタンには data-ok="1" を付ける（dev/smoke.html が それを押して 通しで確かめる。見た目には出ない）。
// 4歳向け：文字が読めなくても 絵で分かる、1回 10秒ほど、まちがえても「にげちゃった。また あえるよ」で 損はしない。
const MG_EMO=["🍎","🌼","⭐","🍓","🐟","🎈","🍄","🌰"];
function mgShuffle(a){a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function mgPick(a){return a[Math.floor(Math.random()*a.length)]}
// はこの中の ばらばらな 位置（% 座標、かさなりにくいように ます目に 置く）
function mgCells(n,cols,rows){const cells=[];for(let r=0;r<rows;r++)for(let c=0;c<cols;c++)cells.push([(c+0.5)/cols*100,(r+0.5)/rows*100]);return mgShuffle(cells).slice(0,n).map(([x,y])=>[x+(Math.random()*8-4),y+(Math.random()*8-4)])}
function mgHead(box,text){box.innerHTML="";const h=el("div","mgq",esc(text));const arena=el("div","mgarena");box.append(h,arena);return arena}
const MINIGAMES=[
 // 1) かげあわせ：かげ と おなじ かたちの しゃしんを えらぶ（しゃしん と きりぬき が ある いきもの だけ）
 {id:"kage",n:"かげあわせ",how:"かげと おなじ かたちは どれ？",
  ok:z=>!!(z.cut&&z.img&&ZUKAN.filter(o=>o.area===z.area&&o.id!==z.id&&o.img&&!o.hidden).length>=2),
  start(box,z,done){const arena=mgHead(box,this.how);arena.classList.add("col");
    arena.append(el("div","mgsil",zSilHtml(z)));
    const others=mgShuffle(ZUKAN.filter(o=>o.area===z.area&&o.id!==z.id&&o.img&&!o.hidden)).slice(0,2);
    const row=el("div","mgrow");mgShuffle([z,...others]).forEach(o=>{const b=el("button","mgcard",zPhotoHtml(o));if(o.id===z.id)b.dataset.ok="1";
      b.onclick=()=>{row.querySelectorAll("button").forEach(x=>x.disabled=true);b.classList.add(o.id===z.id?"hit":"miss");done(o.id===z.id)};row.append(b)});
    arena.append(row);return ()=>{}}},
 // 2) あみで タッチ：うごく かげを 3かい タッチ（12びょう）
 {id:"tap",n:"あみで タッチ",how:"うごく かげを 3かい タッチ！",ok:()=>true,
  start(box,z,done){const arena=mgHead(box,this.how);arena.classList.add("free");
    const cnt=el("div","mgcnt","🥅 0 / 3");const bar=el("div","mgbar",'<i></i>');box.append(cnt,bar);
    const t=el("button","mgtarget",zSilHtml(z));t.dataset.ok="1";arena.append(t);
    let hit=0,over=false;const move=()=>{t.style.left=(12+Math.random()*76)+"%";t.style.top=(18+Math.random()*64)+"%"};move();
    const iv=setInterval(move,1100);const T=12000;const t0=Date.now();
    const tick=setInterval(()=>{const r=Math.max(0,1-(Date.now()-t0)/T);bar.firstChild.style.width=(r*100)+"%";if(r<=0)end(false)},100);
    const end=w=>{if(over)return;over=true;clearInterval(iv);clearInterval(tick);t.disabled=true;done(w)};
    t.onclick=()=>{if(over)return;hit++;cnt.textContent=`🥅 ${hit} / 3`;sfx("tap");t.classList.remove("pop");void t.offsetWidth;t.classList.add("pop");if(hit>=3)end(true);else move()};
    return ()=>{over=true;clearInterval(iv);clearInterval(tick)}}},
 // 3) かぞえる：えは いくつ？
 {id:"count",n:"いくつ かな",how:"いくつ あるかな？",ok:()=>true,
  start(box,z,done){const n=2+Math.floor(Math.random()*5);const e=mgPick(MG_EMO);const arena=mgHead(box,this.how);arena.classList.add("free");
    mgCells(n,4,2).forEach(([x,y])=>{const s=el("span","mgitem",e);s.style.left=x+"%";s.style.top=y+"%";arena.append(s)});
    const opts=mgShuffle([n,n===2?4:n-1,n+1]);const row=el("div","mgrow");
    opts.forEach(o=>{const b=el("button","mgnum",String(o));if(o===n)b.dataset.ok="1";b.onclick=()=>{row.querySelectorAll("button").forEach(x=>x.disabled=true);b.classList.add(o===n?"hit":"miss");done(o===n)};row.append(b)});
    box.append(row);return ()=>{}}},
 // 4) じゅんばん タッチ：1 から じゅんばんに。2かい まちがえると おしまい
 {id:"order",n:"じゅんばん タッチ",how:"1 から じゅんばんに タッチ！",ok:()=>true,
  start(box,z,done){const N=4;const arena=mgHead(box,this.how);arena.classList.add("free");let next=1,miss=0,over=false;
    mgCells(N,4,2).forEach(([x,y],i)=>{const b=el("button","mgnum round",String(i+1));b.dataset.n=i+1;if(i===0)b.dataset.ok="1";b.style.left=x+"%";b.style.top=y+"%";
      b.onclick=()=>{if(over)return;if(i+1===next){b.classList.add("hit");b.disabled=true;delete b.dataset.ok;next++;sfx("tap");const nb=arena.querySelector(`button[data-n="${next}"]`);if(nb)nb.dataset.ok="1";if(next>N){over=true;done(true)}}
        else{miss++;b.classList.remove("shake");void b.offsetWidth;b.classList.add("shake");if(miss>=2){over=true;arena.querySelectorAll("button").forEach(x=>x.disabled=true);done(false)}}};
      arena.append(b)});
    return ()=>{over=true}}},
 // 5) なかまはずれ：1つだけ ちがう えを さがす
 {id:"odd",n:"なかまはずれ",how:"1つだけ ちがうのは どれ？",ok:()=>true,
  start(box,z,done){const pairs=[["🍎","🍊"],["🐶","🐱"],["⭐","🌙"],["🌼","🌷"],["🚗","🚌"],["🐟","🐙"],["🍓","🍒"],["☀️","☁️"]];const [a,b]=mgPick(pairs);
    const arena=mgHead(box,this.how);const row=el("div","mgrow wrap");const odd=Math.floor(Math.random()*4);
    for(let i=0;i<4;i++){const bt=el("button","mgcard emo",i===odd?b:a);if(i===odd)bt.dataset.ok="1";bt.onclick=()=>{row.querySelectorAll("button").forEach(x=>x.disabled=true);bt.classList.add(i===odd?"hit":"miss");done(i===odd)};row.append(bt)}
    arena.append(row);return ()=>{}}},
];
// であった いきもの に つかえる ゲームから 1つ えらぶ（まえと おなじ ものは さける。UI.mgForce で 固定＝テスト用）
function pickMinigame(z){const usable=MINIGAMES.filter(g=>g.ok(z));if(UI.mgForce){const f=usable.find(g=>g.id===UI.mgForce);if(f)return f}
  const pool=usable.length>1?usable.filter(g=>g.id!==UI.mgLast):usable;const g=mgPick(pool);UI.mgLast=g.id;return g}
