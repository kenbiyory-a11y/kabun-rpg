// ---------- 状態（localStorage） ----------
const SAVE_KEY="kabun5", OLD_KEYS=["kabun4"];
const PREV_KEY="kabun5-prev";     // 全消去・読み込みの直前の退避（↩️ で戻せる）
const BROKEN_KEY="kabun5-broken"; // 読めなかったセーブの退避（⚙️ から書き出せる）
// 絵文字（国旗の地域表示記号を含む）の判定。render.js / voice.js で共用
const EMOJI_RE=/[\p{Extended_Pictographic}\u{1F1E6}-\u{1F1FF}]/u;
const H=()=>({n:0,best:0,miss:{},last:[]});
const FRESH=()=>({name:"",kids:[],intro:0,ch:0,str:0,wise:0,world:0,heart:0,view:"growth",sub:"menu",line:0,hp:50,foe:null,sess:null,
  daily:{d:"",done:{},score:{},diary:false,bonus:false,bonusNet:false},cap:1,
  lv:{num:1,eng:1,flag:1,animal:1},rev:{num:[],eng:[],flag:[],animal:[]},hist:{num:H(),eng:H(),flag:H(),animal:H()},
  used:{},items:{net:0},dex:{},flags:{},custom:[],chips:null,voice:true,se:true,
  msg:null,diary:[],emo:"🌟",chip:null,memories:[],memo:"📸",part:"daily",pidx:-1,bgm:"gen1",bgmOn:true});
function valid(o){return !!(o&&typeof o==="object"&&typeof o.ch==="number"&&typeof o.view==="string"&&STATS.every(k=>typeof o[k]==="number"&&isFinite(o[k]))&&typeof o.name==="string"&&Array.isArray(o.diary))}
function migrate(){
  const fresh=FRESH();
  for(const k of STATS)S[k]=Math.max(0,Math.floor(Number(S[k])||0));
  if(typeof S.ch!=="number"||!isFinite(S.ch))S.ch=0;S.ch=Math.max(0,Math.floor(S.ch));
  for(const key of ["daily","lv","rev","hist","used","items","dex","flags"])if(!S[key]||typeof S[key]!=="object"||Array.isArray(S[key]))S[key]=fresh[key];
  if(!S.daily.done||typeof S.daily.done!=="object")S.daily.done={};if(!S.daily.score||typeof S.daily.score!=="object")S.daily.score={};
  for(const c of CATS){
    if(typeof S.lv[c]!=="number")S.lv[c]=1;if(!Array.isArray(S.rev[c]))S.rev[c]=[];
    if(!S.hist[c]||typeof S.hist[c]!=="object")S.hist[c]=H();else{const h=S.hist[c];h.n=h.n||0;h.best=h.best||0;if(!h.miss||typeof h.miss!=="object")h.miss={};if(!Array.isArray(h.last))h.last=[]}
    // 旧セーブ：出題済みが配列の添字だったので id に変換する
    S.used[c]=Array.isArray(S.used[c])?S.used[c].map(x=>typeof x==="number"?legacyId(c,x):x).filter(x=>typeof x==="string"):[];
  }
  if(!Array.isArray(S.custom))S.custom=[];if(typeof S.items.net!=="number")S.items.net=0;
  if(typeof S.intro!=="number")S.intro=0;
  if(!Array.isArray(S.kids))S.kids=[];S.kids=S.kids.filter(x=>typeof x==="string"&&x.trim()).map(x=>x.trim()).slice(0,KIDS_MAX);
  // 旧セーブ（flags.intro が無い）を初めて読むとき：すでに遊んでいる人には はじまりの おはなし を出さず、いまの なまえ を かぞく に入れる（一度きり）
  if(S.flags.intro===undefined){S.flags.intro=!!S.name;if(S.name&&!S.kids.includes(S.name)&&S.kids.length<KIDS_MAX)S.kids.push(S.name)}
  if(typeof S.voice!=="boolean")S.voice=true;if(typeof S.se!=="boolean")S.se=true;if(typeof S.cap!=="number")S.cap=1;
  if(typeof S.chip!=="string")S.chip=null;
  // おもいで（シアター）は v2 では UI から外したが、データは残す
  if(!Array.isArray(S.memories))S.memories=[];for(const d of S.memories)if(!Array.isArray(d.media))d.media=[];
  S.diary=S.diary.filter(d=>{if(d.p){d.media=[{id:d.p,type:"photo"},...(d.media||[])];delete d.p}if(Array.isArray(d.media)&&d.media.length){S.memories.push({date:d.date,e:d.e,t:d.t,media:d.media});return false}delete d.media;return true});
  if(typeof S.memo!=="string")S.memo="📸";if(typeof S.bgm!=="string")S.bgm="gen1";if(typeof S.bgmOn!=="boolean")S.bgmOn=true;S.part="daily";
  // 旧：1問ごとのクイズ状態は捨てる。戦っていた かべ のHPは S.foe に引き継ぐ
  delete S.quiz;delete S.ans;
  if(S.ch>CHAPTERS.length)S.ch=CHAPTERS.length;
  if(typeof S.foehp==="number"&&S.ch<CHAPTERS.length&&S.foehp>0){S.foe=mkFoe(S.ch);S.foe.hp=Math.min(S.foe.max,S.foehp)}delete S.foehp;
  if(S.foe&&(typeof S.foe!=="object"||S.foe.ch!==S.ch||typeof S.foe.hp!=="number"))S.foe=null;
  if(S.foe){const base=mkFoe(S.ch);for(const key of Object.keys(base))if(S.foe[key]===undefined)S.foe[key]=base[key]}
  if(!["growth","battle","diary","settings"].includes(S.view))S.view="growth";
  if(S.view==="diary"&&S.sub==="dentry"&&!S.diary[S.pidx])S.sub="menu";
  if(!["menu","dentry","backup","stats","cap","sound","pin","dev","paste","kids"].includes(S.sub))S.sub="menu";
  if(S.sess&&(typeof S.sess!=="object"||!CATS.includes(S.sess.cat)||!Array.isArray(S.sess.items)||!Array.isArray(S.sess.res)||typeof S.sess.i!=="number"||S.sess.i<0||S.sess.i>S.sess.items.length||(S.sess.d!==ymd()&&!S.sess.result)))S.sess=null;
  if(typeof S.hp!=="number"||S.hp<=0||S.hp>maxHp())S.hp=maxHp();
  S.line=0;S.msg=null;
}
let S=FRESH();
const UI={busy:false,busyText:"",exportText:null,pendingImport:null,confirm:false,draft:"",quota:"",lockUntil:0,pinBuf:"",pinNew:"",unlockUntil:0,pinFail:0,pinLockUntil:0,saveErr:false,replay:false,introSaid:false,sayPrefix:null,active:false,loadWarn:false,tapFn:null,doneSaid:"",pcheckUntil:0,pnext:null};
// kabun5 → kabun4 の順に読む。kabun5 があるのに読めないときは BROKEN_KEY に退避してから古い方を読む（上書きで失わないように）
function load(){for(const key of [SAVE_KEY,...OLD_KEYS]){let v=null;try{v=localStorage.getItem(key)}catch(e){}if(!v)continue;
    try{const o=JSON.parse(v);if(valid(o)){S=Object.assign(FRESH(),o);return key}}catch(e){}
    if(key===SAVE_KEY){UI.loadWarn=true;try{if(!localStorage.getItem(BROKEN_KEY))localStorage.setItem(BROKEN_KEY,v)}catch(e){}}}
  return null}
function save(){try{localStorage.setItem(SAVE_KEY,JSON.stringify(S));UI.saveErr=false}catch(e){UI.saveErr=true}}
// 全消去・読み込みの直前に、いまのセーブを「ひとつ前」として退避する
function stashPrev(){try{const v=localStorage.getItem(SAVE_KEY);if(v)localStorage.setItem(PREV_KEY,v)}catch(e){}}
// 日付が変わったら きょうの分 をリセット（端末のローカル日付）。採点ずみの結果画面は残す
function dayRoll(){const t=ymd();if(S.daily.d!==t){S.daily={d:t,done:{},score:{},diary:false,bonus:false,bonusNet:false};if(S.sess&&S.sess.d!==t&&!S.sess.result)S.sess=null;return true}return false}
const $=id=>document.getElementById(id);
function el(tag,cls,html){const e=document.createElement(tag);if(cls)e.className=cls;if(html!=null)e.innerHTML=html;return e}
function esc(s){return String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]))}
// esc に加えて、国旗の絵文字（地域表示記号2文字）を同梱 SVG の <img> に置き換える（画像が無い国はそのまま）
const FLAG_RE=/[\u{1F1E6}-\u{1F1FF}]{2}/gu;
function rich(s){return esc(s).replace(FLAG_RE,m=>{const code=Array.from(m).map(c=>String.fromCharCode(c.codePointAt(0)-0x1F1E6+97)).join("");return FLAG_CODES.has(code)?`<img class="flag" src="./img/flags/${code}.svg" alt="${code}">`:m})}
// 進化段階：倒した章の evolve から求める（S.ch は戻さないので不可逆）
function stageIdx(){let s=0;for(let i=0;i<S.ch&&i<CHAPTERS.length;i++)if(CHAPTERS[i].evolve!=null)s=CHAPTERS[i].evolve;return Math.min(s,STAGES.length-1)}
function statSum(){return STATS.reduce((a,k)=>a+S[k],0)}
function level(){return 1+Math.floor(statSum()/LV_DIV)}
function hpClass(r){return r<.25?"bad":r<.5?"mid":""}
function mb(n){return (n/1048576).toFixed(1)+" MB"}
function uid(p){return p+Date.now().toString(36)+Math.random().toString(36).slice(2,6)}
function ymd(d){d=d||new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`}
function addDays(iso,n){const [y,m,d]=String(iso).split("-").map(Number);return ymd(new Date(y,m-1,d+n))}
function parseDate(s){const [y,m,d]=String(s).split("/").map(Number);return new Date(y||2000,(m||1)-1,d||1).getTime()}
function todayJ(){const d=new Date();return `${d.getFullYear()}/${d.getMonth()+1}/${d.getDate()}`}
function isoToJ(iso){const [y,m,d]=String(iso).split("-").map(Number);return y&&m&&d?`${y}/${m}/${d}`:todayJ()}
