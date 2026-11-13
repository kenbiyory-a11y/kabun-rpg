// ---------- よみあげ（端末内蔵の音声合成。通信なし） ----------
// 日本語の音声が無い端末では何も鳴らさず、🔊 も出さない。ブラウザの制限で、最初のタップより前は話せない（say() が false を返すので、呼び元は「読んだ」扱いにしない）。
const VOICE={list:[],ja:false,en:false};
function loadVoices(){try{VOICE.list=(window.speechSynthesis&&speechSynthesis.getVoices())||[]}catch(e){VOICE.list=[]}
  const langs=VOICE.list.map(v=>String(v.lang||"").replace("_","-").toLowerCase());
  VOICE.ja=langs.some(l=>l.startsWith("ja"));VOICE.en=langs.some(l=>l.startsWith("en"))}
if("speechSynthesis" in window){loadVoices();try{speechSynthesis.onvoiceschanged=()=>{const had=VOICE.ja;loadVoices();if(!had&&VOICE.ja&&typeof render==="function"&&S&&S.sub==="menu")render()}}catch(e){}}
function voiceOK(){return !!(S&&S.voice&&("speechSynthesis" in window)&&VOICE.ja)}
function canSpeak(){try{if(navigator.userActivation)return navigator.userActivation.hasBeenActive}catch(e){}return !!UI.active}
// 声の選択（日本語だけ）。端末によって入っている声が違うので、セーブではなく端末の localStorage に入れる
const VOICE_KEY="kabun-voice-ja";
function voiceGet(){try{return localStorage.getItem(VOICE_KEY)||""}catch(e){return ""}}
function voiceSet(name){try{if(name)localStorage.setItem(VOICE_KEY,name);else localStorage.removeItem(VOICE_KEY)}catch(e){}}
function voicesOf(lang){return VOICE.list.filter(v=>String(v.lang||"").replace("_","-").toLowerCase().startsWith(lang))}
function pickVoice(lang){const c=voicesOf(lang);
  if(lang==="ja"){const want=voiceGet();const hit=want&&c.find(v=>v.name===want);if(hit)return hit}
  // えらんでいなければ 自然な声を 先に（Natural / Premium / Enhanced / 拡張 → Google → そのほか）。同じなら 端末内蔵
  let best=null,bs=-1;for(const v of c){const s=voiceRank(v)*2+(v.localService?1:0);if(s>bs){bs=s;best=v}}
  return best}
function voiceRank(v){const n=String(v&&v.name||"");
  if(/natural|neural|premium|プレミアム/i.test(n))return 3;if(/enhanced|拡張|siri/i.test(n))return 2;if(/google/i.test(n))return 1;return 0}
// 読み上げ用に 分かち書きの 空白を 詰める（空白ごとに 間が 入って ぶつ切りに 聞こえるため）。英数字どうしの 空白（"3 + 4"、"New York"）は のこす
function speechText(t){return String(t).replace(/[ \u3000]+/g," ").replace(/ (?=[^\x00-\x7F])/g,"").replace(/([^\x00-\x7F]) /g,"$1").trim()}
// 表示用の短い名前（"Microsoft Nanami Online (Natural)" → "Nanami (Natural)"）
function voiceLabel(v){return String(v.name||"").replace(/^Microsoft\s+/,"").replace(/\s+Online/,"").replace(/\s+-\s+Japanese.*$/,"").trim()||"(なまえなし)"}
// parts：文字列（日本語）か [[文, "ja"|"en"], …]。話し始められたら true
function say(parts){
  if(!voiceOK()||!canSpeak())return false;const segs=typeof parts==="string"?[[parts,"ja"]]:(Array.isArray(parts)?parts:[]);
  try{speechSynthesis.cancel()}catch(e){return false}
  const us=[];
  for(const [text,lang] of segs){if(!text)continue;const l=lang==="en"?"en":"ja";
    const v=pickVoice(l)||pickVoice("ja");if(!v)continue; // 英語音声が無ければ日本語の声で読む（カタカナ読みでも聞こえないよりよい）
    const u=new SpeechSynthesisUtterance(l==="ja"?speechText(text):String(text));u.voice=v;u.lang=v.lang||(l==="en"?"en-US":"ja-JP");u.rate=l==="en"?0.9:0.95;u.pitch=1;us.push(u)}
  if(!us.length)return false;
  // 読み上げ中は BGM を小さくする（最初の発話で下げ、最後の発話で戻す）
  us[0].onstart=()=>{try{duck(true)}catch(e){}};const last=us[us.length-1];last.onend=last.onerror=()=>{try{duck(false)}catch(e){}};
  let ok=false;for(const u of us){try{speechSynthesis.speak(u);ok=true}catch(e){}}
  return ok;
}
function sayStop(){try{if("speechSynthesis" in window)speechSynthesis.cancel()}catch(e){}try{duck(false)}catch(e){}}
document.addEventListener("visibilitychange",()=>{if(document.hidden)sayStop()});
// 問題を読む：say があればそれ、無ければ sub か q。文字の選択肢は番号付きで続けて読む（数字の選択肢は読まない）
function sayQ(it){
  const segs=[];
  if(it.chal)segs.push(["ちょっと むずかしいよ。","ja"]);
  if(it.say)segs.push(...(typeof it.say==="string"?[[it.say,"ja"]]:it.say));
  else if(it.sub)segs.push([it.sub,"ja"]);else if(it.t!=="ico"&&!isPic(it.q))segs.push([it.q,"ja"]);
  if(it.t==="pick"&&!it.opts.some(o=>isPic(o))){
    const numbered=numberedOpts(it);const nums=it.opts.every(o=>/^\d/.test(o));
    if(!nums)it.opts.forEach((o,i)=>{if(numbered)segs.push([`${i+1}ばん、`,"ja"]);segs.push([o,it.ol==="en"?"en":"ja"])})}
  return say(segs);
}
function sayAns(it,after){const segs=after?[["そう、","ja"]]:[["せいかい！","ja"]];if(!isPic(it.a))segs.push([it.a,it.ol==="en"?"en":"ja"]);return say(segs)}
