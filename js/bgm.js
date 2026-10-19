// ---------- BGM：生成曲（Web Audio）と 端末内の音楽ファイル ----------
const GEN={
 gen1:{name:"♪ ほのぼの（生成曲）",bpm:92,
  tracks:[{type:"square",vol:.06,len:.9,seq:[[72,1],[76,1],[79,1],[81,2],[79,1],[76,1],[79,1],[76,1],[74,3],[72,1],[76,1],[79,1],[84,2],[81,1],[79,1],[76,1],[74,1],[72,3]]},
          {type:"triangle",vol:.14,len:.8,seq:[[48,3],[45,3],[41,3],[43,3],[48,3],[45,3],[41,1.5],[43,1.5],[48,3]]}]},
 gen2:{name:"♪ わくわく（生成曲）",bpm:126,
  tracks:[{type:"square",vol:.055,len:.85,seq:[[67,.5],[67,.5],[71,.5],[74,.5],[72,1],[71,1],[69,.5],[69,.5],[72,.5],[76,.5],[74,2],[67,.5],[67,.5],[71,.5],[74,.5],[76,1],[74,1],[72,.5],[71,.5],[69,.5],[71,.5],[67,2]]},
          {type:"triangle",vol:.15,len:.5,seq:[[43,1],[43,1],[43,1],[43,1],[40,1],[40,1],[40,1],[40,1],[48,1],[48,1],[48,1],[48,1],[50,1],[50,1],[43,1],[43,1]]}]}
};
const synth={ctx:null,master:null,timer:null,nextT:0};
function actx(){if(!synth.ctx){const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return null;try{synth.ctx=new AC()}catch(e){return null}}if(synth.ctx.state==="suspended")synth.ctx.resume().catch(()=>{});return synth.ctx}
function note(ctx,dest,type,midi,t,dur,vol){const o=ctx.createOscillator();o.type=type;o.frequency.value=440*Math.pow(2,(midi-69)/12);const g=ctx.createGain();g.gain.setValueAtTime(0.0001,t);g.gain.linearRampToValueAtTime(vol,t+0.015);g.gain.setValueAtTime(vol,t+dur*0.5);g.gain.exponentialRampToValueAtTime(0.0001,t+dur);o.connect(g);g.connect(dest);o.start(t);o.stop(t+dur+0.03)}
function synthStart(tune){synthStop();const ctx=actx();if(!ctx)return;const m=ctx.createGain();m.gain.value=0.0001;m.connect(ctx.destination);m.gain.linearRampToValueAtTime(BGM_VOL,ctx.currentTime+1);synth.master=m;
  const spb=60/tune.bpm;const loop=tune.tracks[0].seq.reduce((a,n)=>a+n[1],0)*spb;synth.nextT=ctx.currentTime+0.1;
  const sched=()=>{if(!synth.master)return;while(synth.nextT<ctx.currentTime+1.0){for(const tr of tune.tracks){let t=synth.nextT;for(const [n,b] of tr.seq){if(n!=null)note(ctx,synth.master,tr.type,n,t,b*spb*tr.len,tr.vol);t+=b*spb}}synth.nextT+=loop}};
  sched();synth.timer=setInterval(sched,250)}
function synthStop(){if(synth.timer){clearInterval(synth.timer);synth.timer=null}if(synth.master){const m=synth.master;synth.master=null;try{m.gain.setTargetAtTime(0.0001,synth.ctx.currentTime,0.15)}catch(e){}setTimeout(()=>{try{m.disconnect()}catch(e){}},900)}}
const bgmEl=new Audio();bgmEl.loop=true;let bgmNode=null;
function bgmFileStart(url){const ctx=actx();if(ctx&&!bgmNode){try{const src=ctx.createMediaElementSource(bgmEl);bgmNode=ctx.createGain();src.connect(bgmNode);bgmNode.connect(ctx.destination)}catch(e){}}
  if(bgmNode)bgmNode.gain.value=BGM_VOL;else{try{bgmEl.volume=BGM_VOL}catch(e){}}
  if(bgmEl.src!==url)bgmEl.src=url;try{bgmEl.currentTime=0}catch(e){}bgmEl.play().catch(()=>{})}
function bgmFileStop(){try{bgmEl.pause()}catch(e){}}
function setBgmLevel(v){const t=synth.ctx?synth.ctx.currentTime:0;if(synth.master)synth.master.gain.setTargetAtTime(v,t,0.2);if(bgmNode)bgmNode.gain.setTargetAtTime(v,t,0.2);else{try{bgmEl.volume=Math.min(1,v)}catch(e){}}}
function playBgmOpt(opt){stopBgm();if(opt==="none")return;if(GEN[opt])synthStart(GEN[opt]);else if(opt.startsWith("a:")){const a=AU.get(opt.slice(2));if(a)bgmFileStart(a.url)}}
function startBgm(){if(S.bgmOn)playBgmOpt(S.bgm||"gen1")}
function stopBgm(){synthStop();bgmFileStop()}
function duck(on){setBgmLevel(on?BGM_VOL*0.25:BGM_VOL)}
let testTimer=null;
function testBgm(opt){clearTimeout(testTimer);playBgmOpt(opt);testTimer=setTimeout(stopBgm,7000)}
function bgmName(opt){if(GEN[opt])return GEN[opt].name;if(opt==="none")return "なし";if(opt&&opt.startsWith("a:")){const a=AU.get(opt.slice(2));return a?"♪ "+a.name:"（見つかりません）"}return "？"}

