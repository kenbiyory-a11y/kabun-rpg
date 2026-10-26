// ---------- よみあげ（端末内蔵の音声合成。通信なし） ----------
// 日本語の音声が無い端末では何も鳴らさず、🔊 も出さない。iOS は最初の発話がタップ内であること（画面はすべてタップで進む）。
const VOICE={list:[],ja:false,en:false};
function loadVoices(){try{VOICE.list=(window.speechSynthesis&&speechSynthesis.getVoices())||[]}catch(e){VOICE.list=[]}
  const langs=VOICE.list.map(v=>String(v.lang||"").replace("_","-").toLowerCase());
  VOICE.ja=langs.some(l=>l.startsWith("ja"));VOICE.en=langs.some(l=>l.startsWith("en"))}
if("speechSynthesis" in window){loadVoices();try{speechSynthesis.onvoiceschanged=loadVoices}catch(e){}}
function voiceOK(){return !!(S&&S.voice&&("speechSynthesis" in window)&&VOICE.ja)}
function pickVoice(lang){const c=VOICE.list.filter(v=>String(v.lang||"").replace("_","-").toLowerCase().startsWith(lang));return c.find(v=>v.localService)||c[0]||null}
// parts：文字列（日本語）か [[文, "ja"|"en"], …]
function say(parts){
  if(!voiceOK())return;const segs=typeof parts==="string"?[[parts,"ja"]]:(Array.isArray(parts)?parts:[]);
  try{speechSynthesis.cancel()}catch(e){return}
  const us=[];
  for(const [text,lang] of segs){if(!text)continue;const l=lang==="en"?"en":"ja";if(l==="en"&&!VOICE.en)continue;
    const v=pickVoice(l);if(!v)continue;const u=new SpeechSynthesisUtterance(String(text));u.voice=v;u.lang=l==="en"?"en-US":"ja-JP";u.rate=l==="en"?0.85:0.95;u.pitch=1.1;us.push(u)}
  if(!us.length)return;
  // 読み上げ中は BGM を小さくする（最初の発話で下げ、最後の発話で戻す）
  us[0].onstart=()=>{try{duck(true)}catch(e){}};const last=us[us.length-1];last.onend=last.onerror=()=>{try{duck(false)}catch(e){}};
  for(const u of us){try{speechSynthesis.speak(u)}catch(e){}}
}
function sayStop(){try{if("speechSynthesis" in window)speechSynthesis.cancel()}catch(e){}try{duck(false)}catch(e){}}
document.addEventListener("visibilitychange",()=>{if(document.hidden)sayStop()});
// 問題を読む：say があればそれ、無ければ sub か q。文字の選択肢は番号付きで続けて読む
function sayQ(it){
  const segs=[];
  if(it.say)segs.push(...(typeof it.say==="string"?[[it.say,"ja"]]:it.say));
  else if(it.sub)segs.push([it.sub,"ja"]);else if(it.t!=="ico"&&!/\p{Extended_Pictographic}/u.test(it.q))segs.push([it.q,"ja"]);
  if(it.t==="pick"&&!it.opts.some(o=>/\p{Extended_Pictographic}/u.test(o))){it.opts.forEach((o,i)=>{segs.push([`${i+1}ばん、`,"ja"]);segs.push([o,it.ol==="en"?"en":"ja"])})}
  say(segs);
}
function sayAns(it,after){const segs=after?[["そう、","ja"]]:[["せいかい！","ja"]];if(!/\p{Extended_Pictographic}/u.test(it.a))segs.push([it.a,it.ol==="en"?"en":"ja"]);say(segs)}
