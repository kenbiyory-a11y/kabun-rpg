// ---------- 状態（localStorage） ----------
const FRESH=()=>({name:"",ch:0,str:0,wise:0,world:0,heart:0,view:"growth",sub:"menu",line:0,hp:MAXHP,foehp:null,quiz:null,ans:null,used:{},msg:null,diary:[],memories:[],emo:"🌟",memo:"📸",part:"daily",pidx:-1,bgm:"gen1",bgmOn:true});
function valid(o){return !!(o&&typeof o==="object"&&typeof o.ch==="number"&&typeof o.view==="string"&&typeof o.str==="number"&&typeof o.name==="string"&&Array.isArray(o.diary))}
function migrate(){if(!Array.isArray(S.memories))S.memories=[];for(const d of S.memories)if(!Array.isArray(d.media))d.media=[];
  S.diary=S.diary.filter(d=>{if(d.p){d.media=[{id:d.p,type:"photo"},...(d.media||[])];delete d.p}if(Array.isArray(d.media)&&d.media.length){S.memories.push({date:d.date,e:d.e,t:d.t,media:d.media});return false}delete d.media;return true});
  if(typeof S.memo!=="string")S.memo="📸";if(S.part!=="memory")S.part="daily";if(typeof S.bgm!=="string")S.bgm="gen1";if(typeof S.bgmOn!=="boolean")S.bgmOn=true}
let S=FRESH();
const UI={busy:false,busyText:"",exportText:null,pendingImport:null,pending:[],confirm:false,draft:"",mdraft:"",date:"",quota:""};
function load(){try{const v=localStorage.getItem("kabun4");if(v){const o=JSON.parse(v);if(valid(o))S=Object.assign(FRESH(),o)}}catch(e){}}
function save(){try{localStorage.setItem("kabun4",JSON.stringify(S))}catch(e){}}
function el(tag,cls,html){const e=document.createElement(tag);if(cls)e.className=cls;if(html!=null)e.innerHTML=html;return e}
function esc(s){return String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]))}
function stageIdx(){let s=0;for(let i=0;i<S.ch&&i<CHAPTERS.length;i++)if(CHAPTERS[i].evolve!=null)s=CHAPTERS[i].evolve;return Math.min(s,STAGES.length-1)}
function level(){return 1+Math.floor(STATS.reduce((a,k)=>a+S[k],0)/8)}
function pickQuiz(cat){
  const used=S.used[cat]||[];let idx=QUIZ[cat].map((_,i)=>i).filter(i=>!used.includes(i));
  if(!idx.length){S.used[cat]=[];idx=QUIZ[cat].map((_,i)=>i)}
  const i=idx[Math.floor(Math.random()*idx.length)];(S.used[cat]=S.used[cat]||[]).push(i);
  const [q,opts,sub]=QUIZ[cat][i];return {cat,q,opts:opts.slice().sort(()=>Math.random()-.5),correct:opts[0],sub:sub||null};
}
function hpClass(r){return r<.25?"bad":r<.5?"mid":""}
function mb(n){return (n/1048576).toFixed(1)+" MB"}
function uid(p){return p+Date.now().toString(36)+Math.random().toString(36).slice(2,6)}
function ymd(){const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`}
function parseDate(s){const [y,m,d]=String(s).split("/").map(Number);return new Date(y||2000,(m||1)-1,d||1).getTime()}
function todayJ(){const d=new Date();return `${d.getFullYear()}/${d.getMonth()+1}/${d.getDate()}`}
function isoToJ(iso){const [y,m,d]=String(iso).split("-").map(Number);return y&&m&&d?`${y}/${m}/${d}`:todayJ()}

