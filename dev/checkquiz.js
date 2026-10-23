// 問題データの点検：node dev/checkquiz.js .
// 各分野の問題数、id の重複、正解が はずれ に含まれていないか、形式・レベルの値、新しすぎる絵文字 を確認する
const fs=require("fs"),path=require("path"),vm=require("vm");
const ROOT=process.argv[2]||".";
const ctx={console};vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(ROOT,"js/quiz.js"),"utf8"),ctx); // QUIZ の器だけ使う（const なので runInContext("QUIZ") で取り出す）
const QUIZ=vm.runInContext("QUIZ",ctx);
const NEW_EMOJI=/[\u{1FAB0}-\u{1FABF}\u{1FAC0}-\u{1FAFF}\u{1FA70}-\u{1FA7C}]/u; // Unicode 13 以降の新しめの絵文字（🪰🪼🫘🪽 など）
let bad=0;const warn=(m)=>{bad++;console.log("  NG:",m)};
for(const cat of ["num","eng","flag","animal"]){
  const p=path.join(ROOT,`js/quiz/${cat}.js`);if(!fs.existsSync(p)){warn(`${cat}.js が無い`);continue}
  vm.runInContext(fs.readFileSync(p,"utf8"),ctx,{filename:cat+".js"});
  const qs=QUIZ[cat];const ids=new Set();const lv={1:0,2:0,3:0};const t={pick:0,ico:0,listen:0};
  for(const q of qs){
    if(!q.id||!q.id.startsWith(cat+"_"))warn(`${cat}: id が変 ${q.id}`);
    if(ids.has(q.id))warn(`${cat}: id 重複 ${q.id}`);ids.add(q.id);
    if(!["pick","ico","listen"].includes(q.t))warn(`${q.id}: t=${q.t}`);else t[q.t]++;
    if(![1,2,3].includes(q.lv))warn(`${q.id}: lv=${q.lv}`);else lv[q.lv]++;
    if(typeof q.a!=="string"||!q.a)warn(`${q.id}: a が無い`);
    if(!Array.isArray(q.d)||q.d.length<1||q.d.length>2)warn(`${q.id}: d の数 ${q.d&&q.d.length}`);
    else if(q.d.includes(q.a))warn(`${q.id}: 正解が はずれ に含まれる`);
    else if(new Set(q.d).size!==q.d.length)warn(`${q.id}: はずれ が重複`);
    if(q.t==="listen"&&!q.say)warn(`${q.id}: listen なのに say が無い`);
    if(q.t!=="listen"&&!q.q&&!q.sub)warn(`${q.id}: q も sub も無い`);
    for(const s of [q.q,q.a,...(q.d||[])])if(NEW_EMOJI.test(String(s).replace(/🪲/g,"")))warn(`${q.id}: 新しい絵文字 ${s}`); // 🪲 はカブーン本体で使っているので許可
    for(const s of [q.a,...(q.d||[])])if(Array.from(String(s)).length>12)warn(`${q.id}: 選択肢が長い「${s}」`);
    if(q.g===undefined)warn(`${q.id}: g が無い`);
  }
  for(let i=1;i<=15;i++){const id=`${cat}_a${String(i).padStart(2,"0")}`;if(!ids.has(id))warn(`${cat}: 既存問題 ${id} が無い`)}
  console.log(`${cat}: ${qs.length}問　lv1 ${lv[1]} / lv2 ${lv[2]} / lv3 ${lv[3]}　pick ${t.pick} / ico ${t.ico} / listen ${t.listen}`);
  if(qs.length!==30)warn(`${cat}: 30問ではない（${qs.length}）`);
}
console.log(bad?`\n${bad} 件の問題あり`:"\nOK");
process.exit(bad?1:0);
