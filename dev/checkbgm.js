// 曲データの点検：node dev/checkbgm.js .
// 各トラックのステップ数が同じ長さか（ずれていると小節がずれる）、音名が読めるか を確認する
const fs=require("fs"),path=require("path"),vm=require("vm");
const ROOT=process.argv[2]||".";
const ctx={console,window:{},document:{addEventListener(){}},S:{se:true,bgmOn:true,name:"x",view:"growth",sub:"menu"}};ctx.window=ctx;vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(ROOT,"js/bgm.js"),"utf8"),ctx);
const TUNES=vm.runInContext("TUNES",ctx),compile=vm.runInContext("compile",ctx),midiOf=vm.runInContext("midiOf",ctx);
let bad=0;
for(const [name,t] of Object.entries(TUNES)){
  const c=compile(t);
  const steps=t.tracks.map(tr=>tr.p.trim().split(/\s+/).reduce((a,x)=>a+(x.split(":")[1]?parseInt(x.split(":")[1],10):1),0));
  const same=steps.every(s=>s===steps[0]);if(!same)bad++;
  const badNotes=t.tracks.filter(tr=>tr.w!=="drum").flatMap(tr=>tr.p.trim().split(/\s+/).map(x=>x.split(":")[0]).filter(n=>n!=="R"&&!/^[A-G]#?-?\d$/.test(n)));
  if(badNotes.length){bad++;console.log("  NG 音名:",badNotes.join(" "))}
  console.log(`${name}: ${t.bpm}bpm　${c.len.toFixed(1)}秒${t.once?"（1回）":"（ループ）"}　音数 ${c.ev.length}　トラックのステップ数 ${steps.join(" / ")}${same?"":"  ← ずれている"}`);
}
console.log("midi C4 =",midiOf("C4"),"(60), G#5 =",midiOf("G#5"),"(80)");
console.log(bad?`\n${bad} 件の問題あり`:"\nOK");process.exit(bad?1:0);
