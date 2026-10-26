// ---------- おと：ゲームボーイ風のシンセ（BGM と 効果音）。素材ファイルなし ----------
// 4チャンネル構成に寄せる：パルス波（デューティ 12.5 / 25 / 50%）、三角波（ベース）、ノイズ（ドラム）。
// 曲はすべてこのファイルの中で書いたオリジナル（既存ゲームの曲は使わない）。
// 音は必ずユーザー操作の中で始める（actx() はタップ内で呼ばれる前提。suspended のままなら bgmSync は何もしない）。
const synth={ctx:null,waves:{},noise:null};
function actx(){if(!synth.ctx){const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return null;try{synth.ctx=new AC();synth.ctx.onstatechange=()=>{if(synth.ctx&&synth.ctx.state==="running")try{bgmSync()}catch(e){}}}catch(e){return null}}
  const st=synth.ctx.state;if(st!=="running"&&st!=="closed"){try{synth.ctx.resume().then(()=>{try{bgmSync()}catch(e){}}).catch(()=>{})}catch(e){}} // iOS の "interrupted" からも戻す
  return synth.ctx}
// デューティ比 duty のパルス波（フーリエ級数）
function pulseWave(ctx,duty){const key="p"+duty;if(synth.waves[key])return synth.waves[key];const N=32;const re=new Float32Array(N),im=new Float32Array(N);for(let n=1;n<N;n++)re[n]=(2/(n*Math.PI))*Math.sin(n*Math.PI*duty);synth.waves[key]=ctx.createPeriodicWave(re,im);return synth.waves[key]}
function noiseBuf(ctx){if(synth.noise)return synth.noise;const b=ctx.createBuffer(1,Math.floor(ctx.sampleRate*0.5),ctx.sampleRate);const d=b.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;synth.noise=b;return b}
const NOTE_IDX={C:0,"C#":1,D:2,"D#":3,E:4,F:5,"F#":6,G:7,"G#":8,A:9,"A#":10,B:11};
function midiOf(n){const m=/^([A-G]#?)(-?\d)$/.exec(n);if(!m)return 60;return (parseInt(m[2],10)+1)*12+NOTE_IDX[m[1]]}
// 1音。type: "p12" | "p25" | "p50"（=square）| "tri" | "triangle" | "square"
function note(ctx,dest,type,midi,t,dur,vol){const o=ctx.createOscillator();
  if(type==="p12")o.setPeriodicWave(pulseWave(ctx,0.125));else if(type==="p25")o.setPeriodicWave(pulseWave(ctx,0.25));else if(type==="p50"||type==="square")o.type="square";else o.type="triangle";
  o.frequency.value=440*Math.pow(2,(midi-69)/12);const g=ctx.createGain();g.gain.setValueAtTime(0.0001,t);g.gain.linearRampToValueAtTime(vol,t+0.012);g.gain.setValueAtTime(vol,t+Math.max(0.02,dur*0.55));g.gain.exponentialRampToValueAtTime(0.0001,t+dur);o.connect(g);g.connect(dest);o.start(t);o.stop(t+dur+0.03)}
// ドラム：K＝キック（三角波を落とす）、S＝スネア、H＝ハイハット（ノイズ）
function drum(ctx,dest,kind,t,vol){
  if(kind==="K"){const o=ctx.createOscillator();o.type="triangle";o.frequency.setValueAtTime(160,t);o.frequency.exponentialRampToValueAtTime(42,t+0.12);const g=ctx.createGain();g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(0.0001,t+0.15);o.connect(g);g.connect(dest);o.start(t);o.stop(t+0.17);return}
  const s=ctx.createBufferSource();s.buffer=noiseBuf(ctx);const f=ctx.createBiquadFilter();f.type=kind==="H"?"highpass":"bandpass";f.frequency.value=kind==="H"?7000:1800;f.Q.value=kind==="H"?0.7:0.9;
  const g=ctx.createGain();const d=kind==="H"?0.035:0.11;g.gain.setValueAtTime(vol*(kind==="H"?0.45:0.8),t);g.gain.exponentialRampToValueAtTime(0.0001,t+d);s.connect(f);f.connect(g);g.connect(dest);s.start(t);s.stop(t+d+0.02)}

// ---------- 曲データ（16分音符＝1ステップ。"C5:2" は 2ステップ、"R:4" は休符、ドラムは K/S/H/.） ----------
const CHORD={C:["C","E","G"],G:["G","B","D"],Am:["A","C","E"],F:["F","A","C"],Dm:["D","F","A"],Em:["E","G","B"],E:["E","G#","B"],D:["D","F#","A"]};
// ベース：ルートをオクターブで行き来する8分音符（1小節＝8音）
const bassOf=(chs,o1,o2)=>chs.map(c=>{const r=CHORD[c][0];return Array.from({length:4},()=>`${r}${o1}:2 ${r}${o2}:2`).join(" ")}).join(" ");
// アルペジオ：3度・5度・ルート(上)・5度 を step ステップずつ（1小節＝16ステップ）
const arpOf=(chs,oct,step)=>chs.map(c=>{const [r,t,f]=CHORD[c];const seq=[`${t}${oct}:${step}`,`${f}${oct}:${step}`,`${r}${oct+1}:${step}`,`${f}${oct}:${step}`];return Array.from({length:16/(4*step)},()=>seq.join(" ")).join(" ")}).join(" ");
const rep=(s,n)=>Array.from({length:n},()=>s).join(" ");
// 移調：音名トークンを semi 半音ずらす（ドラムや休符はそのまま）
const NOTE_NAMES=["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"];
function tp(pat,semi){return pat.trim().split(/\s+/).map(tok=>{const [n,l]=tok.split(":");if(!/^[A-G]#?-?\d$/.test(n))return tok;const m=midiOf(n)+semi;return `${NOTE_NAMES[m%12]}${Math.floor(m/12)-1}${l?":"+l:""}`}).join(" ")}
// バトルのベース：オクターブを行き来しつつ、小節の終わりで駆け上がる（1小節＝16ステップ）
const bass2=(chs)=>chs.map(c=>{const r=CHORD[c][0];return `${r}2:2 ${r}3:2 ${r}2:2 ${r}3:2 ${r}2:2 ${r}3:2 ${r}2:1 ${r}2:1 ${r}3:2`}).join(" ");
const ROOM_CH=["C","G","Am","F","C","G","F","G"], BATTLE_CH=["Am","Am","Dm","E","Am","Am","F","E"];
// バトルの主旋律（8小節、Aマイナー）。2周目は2半音上げて（Bマイナー）緊張感を出し、またイントロ無しで戻る
const BATTLE_MEL="A4:1 A4:1 R:1 A4:1 C5:2 E5:2 A5:3 G5:1 E5:2 D5:2  C5:2 B4:1 C5:1 D5:2 C5:2 B4:4 R:2 E4:2  D5:1 D5:1 R:1 D5:1 F5:2 A5:2 D6:3 C6:1 A5:2 F5:2  G#5:2 B5:2 E6:2 D6:2 B5:2 G#5:2 E5:2 R:2  A5:1 A5:1 R:1 A5:1 G5:2 E5:2 C5:3 D5:1 E5:2 C5:2  B4:2 C5:2 D5:2 E5:2 F5:2 E5:2 D5:2 B4:2  F5:1 F5:1 R:1 F5:1 A5:2 C6:2 F6:3 E6:1 C6:2 A5:2  G#5:2 E5:2 B5:2 E5:2 G#5:1 A5:1 B5:1 C6:1 D6:2 E6:2";
const BATTLE_DR="K H . H S H . H K H K H S H . H", BATTLE_FILL="K H . H S H . H K K S S K K S S";
const TUNES={
 // へや：のんびり、歩くようなベース
 room:{bpm:120,tracks:[
  {w:"p50",v:0.055,p:"E5:2 G5:2 C6:4 G5:2 E5:2 G5:4  D5:2 B4:2 D5:4 G5:2 F5:2 D5:4  A4:2 C5:2 E5:4 D5:2 C5:2 E5:4  F5:2 A5:2 C6:2 A5:2 G5:4 E5:4  E5:2 G5:2 C6:4 B5:2 C6:2 D6:4  B5:2 G5:2 D5:4 G5:2 A5:2 B5:4  A5:2 C6:2 A5:2 G5:2 F5:4 E5:4  D5:2 E5:2 F5:2 G5:2 R:4 G5:2 B5:2"},
  {w:"p25",v:0.03,p:arpOf(ROOM_CH,4,2)},
  {w:"tri",v:0.16,p:bassOf(ROOM_CH,2,3)},
  {w:"drum",v:0.3,p:rep("K . H . S . H . K . H . S . H H",8)}]},
 // バトル：1小節のイントロ（半音で駆け下りる）→ 8小節 → 2半音上で8小節 → イントロを飛ばして繰り返す
 battle:{bpm:168,loopStart:16,tracks:[
  {w:"p50",v:0.06,p:"A6:1 G#6:1 G6:1 F#6:1 F6:1 E6:1 D#6:1 D6:1 C#6:1 C6:1 B5:1 A#5:1 A5:1 R:3 "+BATTLE_MEL+" "+tp(BATTLE_MEL,2)},
  {w:"p25",v:0.028,p:"R:16 "+arpOf(BATTLE_CH,4,1)+" "+tp(arpOf(BATTLE_CH,4,1),2)},
  {w:"tri",v:0.17,p:"A2:4 A2:4 A2:4 A2:2 G#2:1 A2:1 "+bass2(BATTLE_CH)+" "+tp(bass2(BATTLE_CH),2)},
  {w:"drum",v:0.32,p:"K . . . K . . . K . . . S S S S "+rep(BATTLE_DR,7)+" "+BATTLE_FILL+" "+rep(BATTLE_DR,7)+" "+BATTLE_FILL}]},
 // かち：1回だけ鳴るジングル
 win:{bpm:140,once:true,tracks:[
  {w:"p50",v:0.065,p:"C5:2 E5:2 G5:2 C6:4 R:2 G5:2 B5:2 C6:8"},
  {w:"p25",v:0.035,p:"E4:2 G4:2 C5:2 E5:4 R:2 E5:2 G5:2 G5:8"},
  {w:"tri",v:0.16,p:"C2:4 G2:4 C3:4 R:2 G2:2 C2:8"},
  {w:"drum",v:0.3,p:"K . . . S . . . K . . . . . . . K . . . . . . ."}]}
};
function compile(tune){const spb=60/tune.bpm/4;const ev=[];let total=0;
  for(const tr of tune.tracks){let step=0;for(const tok of tr.p.trim().split(/\s+/)){const [n,l]=tok.split(":");const len=l?parseInt(l,10):1;if(n!=="R"&&n!==".")ev.push({t:step*spb,dur:len*spb,w:tr.w,v:tr.v,n});step+=len}total=Math.max(total,step)}
  ev.sort((a,b)=>a.t-b.t);const loopT=(tune.loopStart||0)*spb;let loopIdx=ev.findIndex(e=>e.t>=loopT-1e-6);if(loopIdx<0)loopIdx=0;
  return {ev,len:total*spb,loopT,loopIdx}}

// ---------- 再生 ----------
const bgm={cur:null,master:null,timer:null,vol:0.35,played:null};
function bgmStop(){if(bgm.timer){clearInterval(bgm.timer);bgm.timer=null}bgm.cur=null;
  if(bgm.master){const m=bgm.master;bgm.master=null;try{m.gain.setTargetAtTime(0.0001,synth.ctx.currentTime,0.08)}catch(e){}setTimeout(()=>{try{m.disconnect()}catch(e){}},600)}}
function bgmStart(name,onEnd){bgmStop();const ctx=actx();if(!ctx||ctx.state!=="running")return false;const tune=TUNES[name];if(!tune)return false;
  const c=compile(tune);const m=ctx.createGain();m.gain.setValueAtTime(0.0001,ctx.currentTime);m.gain.setTargetAtTime(bgm.vol,ctx.currentTime,0.1);m.connect(ctx.destination); // setTarget 同士は後勝ちなので、直後の stop / duck が効く
  bgm.master=m;bgm.cur=name;let base=ctx.currentTime+0.12,idx=0;
  const sched=()=>{if(bgm.master!==m)return;const horizon=ctx.currentTime+1.0;
    for(;;){
      if(idx>=c.ev.length){if(tune.once){if(ctx.currentTime>=base+c.len){bgmStop();onEnd&&onEnd()}return}base+=c.len-c.loopT;idx=c.loopIdx;if(!c.ev.length||c.loopIdx>=c.ev.length)return}
      const e=c.ev[idx];const t=base+e.t;if(t>horizon)return;
      if(e.w==="drum")drum(ctx,m,e.n,t,e.v);else note(ctx,m,e.w,midiOf(e.n),t,e.dur*0.95,e.v);idx++}};
  sched();bgm.timer=setInterval(sched,200);return true}
function setBgmLevel(v){if(bgm.master&&synth.ctx){try{bgm.master.gain.setTargetAtTime(v,synth.ctx.currentTime,0.15)}catch(e){}}}
function duck(on){setBgmLevel(on?bgm.vol*0.3:bgm.vol)}
// 画面に合わせて曲を選ぶ。render() の最後と、タップのたびに呼ばれる
function bgmWanted(){if(!S||!S.bgmOn)return null;if(!S.name||UI.replay||!S.flags.intro)return "room";
  if(S.view==="battle"){if(["fight","turn","lose"].includes(S.sub))return "battle";if(["win","evolve"].includes(S.sub))return "win"}
  return "room"}
function bgmSync(){const want=bgmWanted();
  if(!want){if(bgm.cur)bgmStop();return}
  if(want==="win"){const key="win:"+S.ch;if(bgm.cur==="win"||bgm.played===key)return;if(bgmStart("win",()=>{bgm.played=key}))return;return} // 章ごとに1回だけ
  if(bgm.cur===want)return;
  const ctx=actx();if(!ctx||ctx.state!=="running")return; // まだ音を出せない（resume 後に onstatechange から戻ってくる）
  bgmStart(want)}
function stopBgm(){bgmStop()}
document.addEventListener("visibilitychange",()=>{if(document.hidden)bgmStop()});

// ---------- 効果音（同じシンセ。BGM とは独立のゲイン） ----------
const SFX={tap:[[76,.05]],ok:[[76,.08],[84,.14]],ng:[[62,.22]],gain:[[72,.08],[76,.08],[79,.08],[84,.2]],hit:[[40,.12]],batsu:[[79,.06],[86,.06],[91,.22]],guard:[[45,.12]],evolve:[[60,.1],[64,.1],[67,.1],[72,.1],[76,.1],[79,.4]],catch:[[67,.08],[72,.08],[76,.3]],lvup:[[72,.07],[79,.07],[84,.25]]};
let sfxGain=null;
function sfx(n){if(!S||!S.se)return;const ctx=actx();if(!ctx||ctx.state!=="running")return;if(!sfxGain){sfxGain=ctx.createGain();sfxGain.gain.value=.5;sfxGain.connect(ctx.destination)}
  let t=ctx.currentTime;for(const [m,d] of SFX[n]||[]){note(ctx,sfxGain,(n==="ng"||n==="guard"||n==="hit")?"tri":"p50",m,t,d,.18);t+=d}}
