// Node 用の簡易ハーネス：ブラウザ依存をスタブして、ゲームロジックのファイルと tests.js を同じコンテキストで実行する
const fs=require("fs"),path=require("path"),vm=require("vm");
const ROOT=process.argv[2];
const store={};
const ctx={console,Date,Math,JSON,Object,Array,String,Number,Boolean,Set,Map,Promise,RegExp,Error,process,
  localStorage:{getItem:k=>store[k]??null,setItem:(k,v)=>{store[k]=String(v)},removeItem:k=>{delete store[k]}},__store:store,
  document:{addEventListener(){},getElementById(){return null},querySelectorAll(){return []}},
  navigator:{},matchMedia:()=>({matches:true}),setTimeout,clearTimeout,setInterval,clearInterval,
  Audio:function(){},URL:{createObjectURL(){return ""},revokeObjectURL(){}}};
ctx.window=ctx;ctx.globalThis=ctx;
vm.createContext(ctx);
function loadFile(rel){const p=path.join(ROOT,rel);if(!fs.existsSync(p)){console.log("  (skip, missing)",rel);return false}vm.runInContext(fs.readFileSync(p,"utf8"),ctx,{filename:rel});return true}
["js/data.js","js/quiz.js","js/quiz/num.js","js/quiz/eng.js","js/quiz/flag.js","js/quiz/animal.js","js/quiz/pref.js","js/quiz/trip.js","js/state.js","js/voice.js"].forEach(loadFile);
vm.runInContext(fs.readFileSync(path.join(__dirname,"tests.js"),"utf8"),ctx,{filename:"tests.js"});
