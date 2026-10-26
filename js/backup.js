// ---------- バックアップの 書き出し・読み込み（json = 記録だけ / zip = ぜんぶ） ----------
const DLP=(window.claude&&typeof window.claude.use==="function")?window.claude.use("downloads").catch(()=>null):Promise.resolve(null);
async function deliver(fname,data,size){
  const dl=await DLP;
  if(dl){await dl.save({filename:fname,data});return `保存しました（${fname}、${size}）`}
  if(!window.claude){const a=document.createElement("a");a.href=URL.createObjectURL(data instanceof Blob?data:new Blob([data]));a.download=fname;document.body.append(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},1500);return `保存しました（${fname}、${size}）`}
  return null}
function dlErrMsg(e){const c=e&&e.code;if(c==="declined")return "保存をやめました。";if(c==="too_large")return "大きすぎて保存できません。";return null}
async function exportJson(){
  UI.busy=true;UI.busyText="つくっています…";S.msg=null;render();
  const text=JSON.stringify({app:"kabun",ver:3,exported:new Date().toISOString(),save:S});const fname=`kabun-save-${ymd()}.json`;
  try{const r=await deliver(fname,text,mb(new Blob([text]).size));if(r)S.msg=r;else{UI.exportText=text;S.sub="export"}}
  catch(e){S.msg=dlErrMsg(e);if(!S.msg){UI.exportText=text;S.sub="export"}}
  UI.busy=false;save();render()}
const extOf=m=>({"video/mp4":"mp4","video/quicktime":"mov","video/webm":"webm","audio/mpeg":"mp3","audio/mp4":"m4a","audio/x-m4a":"m4a","audio/wav":"wav","audio/x-wav":"wav","audio/ogg":"ogg","audio/aac":"aac"}[m]||"bin");
async function exportZip(){
  if(typeof JSZip==="undefined"){S.msg="zip機能を読み込めませんでした。通信できる状態で開き直してください。";render();return}
  UI.busy=true;UI.busyText="zipを つくっています…（動画が多いと時間がかかります）";S.msg=null;render();
  try{const zip=new JSZip();const idx={app:"kabun",ver:3,exported:new Date().toISOString(),save:S,photos:[],videos:[],audio:[]};
    for(const p of (await sAll("photos"))||[]){if(!p||!p.data)continue;const b64=p.data.split(",")[1];if(!b64)continue;const file=`photos/${p.id}.jpg`;zip.file(file,b64,{base64:true});idx.photos.push({id:p.id,w:p.w,h:p.h,ts:p.ts,file})}
    for(const m of (await sAll("vmeta"))||[]){const v=await sGet("videos",m.id);if(!v||!v.blob)continue;const file=`videos/${m.id}.${extOf(m.mime)}`;zip.file(file,v.blob);idx.videos.push({id:m.id,mime:m.mime,size:m.size,dur:m.dur,poster:m.poster,ts:m.ts,file})}
    for(const a of (await sAll("audio"))||[]){if(!a||!a.blob)continue;const file=`audio/${a.id}.${extOf(a.mime)}`;zip.file(file,a.blob);idx.audio.push({id:a.id,name:a.name,mime:a.mime,size:a.size,file})}
    zip.file("save.json",JSON.stringify(idx));
    const blob=await zip.generateAsync({type:"blob",compression:"STORE"});const fname=`kabun-backup-${ymd()}.zip`;
    const r=await deliver(fname,blob,mb(blob.size));S.msg=r||"この画面ではzipの保存ができません。";}
  catch(e){S.msg=dlErrMsg(e)||"zipを作れませんでした。"}
  UI.busy=false;save();render()}
function importJsonText(text){let o=null;try{o=JSON.parse(String(text).trim())}catch(e){}
  if(!(o&&o.app==="kabun"&&valid(o.save))){S.msg="読み込めませんでした。カブーンのセーブデータではないようです。";render();return}
  UI.pendingImport={idx:o,zip:null};S.sub="import";render()}
async function importFile(file){
  if(/\.zip$/i.test(file.name)||file.type==="application/zip"||file.type==="application/x-zip-compressed"){
    if(typeof JSZip==="undefined"){S.msg="zip機能を読み込めませんでした。通信できる状態で開き直してください。";render();return}
    UI.busy=true;UI.busyText="zipを ひらいています…";render();
    try{const zip=await JSZip.loadAsync(file);const f=zip.file("save.json");if(!f)throw new Error("nosave");const idx=JSON.parse(await f.async("text"));if(!(idx.app==="kabun"&&valid(idx.save)))throw new Error("bad");UI.pendingImport={idx,zip};S.sub="import"}
    catch(e){S.msg="読み込めませんでした。カブーンのバックアップ（zip）ではないようです。"}
    UI.busy=false;render();return}
  try{importJsonText(await file.text())}catch(e){S.msg="ファイルを読めませんでした。";render()}}
async function applyImport(){const pi=UI.pendingImport;UI.pendingImport=null;if(!pi)return;const {idx,zip}=pi;
  UI.busy=true;UI.busyText="読み込んでいます…";render();let pmsg="";
  // 先にセーブ本体を組み立てる。壊れていたら端末のデータには触らずにやめる
  let next;try{next=Object.assign(FRESH(),idx.save);const keep=S;S=next;migrate();dayRoll();next=S;S=keep}
  catch(e){UI.busy=false;S.msg="読み込めませんでした（セーブデータの形がちがいます）。端末のデータはそのままです。";S.sub="backup";render();return}
  try{
    if(zip){
      // zip の中身を全部読めてから入れかえる（途中で失敗して両方失わないように）
      const photos=[],videos=[],audio=[];
      for(const p of idx.photos||[]){const f=zip.file(p.file);if(!f)continue;photos.push({id:p.id,data:"data:image/jpeg;base64,"+await f.async("base64"),w:p.w,h:p.h,ts:p.ts})}
      for(const v of idx.videos||[]){const f=zip.file(v.file);if(!f)continue;videos.push({id:v.id,blob:await f.async("blob"),meta:{id:v.id,mime:v.mime,size:v.size,dur:v.dur,poster:v.poster,ts:v.ts}})}
      for(const a of idx.audio||[]){const f=zip.file(a.file);if(!f)continue;audio.push({id:a.id,name:a.name,mime:a.mime,size:a.size,blob:await f.async("blob"),ts:Date.now()})}
      for(const s of STORES)await sClear(s);let np=0,nv=0,na=0,bad=0;
      for(const p of photos){try{await sPut("photos",p);np++}catch(e){bad++}}
      for(const v of videos){try{await sPut("videos",{id:v.id,blob:v.blob});await sPut("vmeta",v.meta);nv++}catch(e){bad++}}
      for(const a of audio){try{await sPut("audio",a);na++}catch(e){bad++}}
      pmsg=`、写真 ${np}枚、動画 ${nv}本、音楽 ${na}曲${bad?`（${bad}こ 保存できませんでした）`:""}`}
    else if(Array.isArray(idx.photos)&&idx.photos.length&&idx.photos[0].data){await sClear("photos");for(const p of idx.photos)if(p&&p.id&&p.data)await sPut("photos",p);pmsg=`、写真 ${idx.photos.length}枚`}
  }catch(e){pmsg="（写真・動画の一部を保存できませんでした）"}
  try{await loadMedia()}catch(e){}
  stashPrev();S=next;S.view="settings";S.sub="menu";UI.draft="";
  if(S.bgm.startsWith("a:")&&!AU.has(S.bgm.slice(2)))S.bgm="gen1";
  S.msg=`読み込みました（ひびの記録 ${S.diary.length}こ、おもいで ${S.memories.length}こ${pmsg}）。もとに戻すときは「ひとつ前の セーブに もどす」`;UI.busy=false;save();render()}
async function resetAll(){UI.busy=true;UI.busyText="消しています…";render();stashPrev();for(const s of STORES){try{await sClear(s)}catch(e){}}PH.clear();VM.clear();AU.clear();S=FRESH();UI.draft="";UI.busy=false;UI.replay=false;UI.introSaid=false;
  for(const key of [SAVE_KEY,...OLD_KEYS]){try{localStorage.removeItem(key)}catch(e){}}dayRoll();S.view="growth";S.sub="menu";render()}
// ↩️ 全消去・読み込みの直前のセーブに戻す（写真・動画は戻らない）
function restorePrev(){let v=null;try{v=localStorage.getItem(PREV_KEY)}catch(e){}
  if(!v){S.msg="ひとつ前のセーブがありません";S.sub="backup";render();return}
  let o=null;try{o=JSON.parse(v)}catch(e){}
  if(!valid(o)){S.msg="ひとつ前のセーブが読めませんでした";S.sub="backup";render();return}
  stashPrev();S=Object.assign(FRESH(),o);migrate();dayRoll();S.view="settings";S.sub="menu";UI.replay=false;
  if(S.bgm.startsWith("a:")&&!AU.has(S.bgm.slice(2)))S.bgm="gen1";
  S.msg=`ひとつ前のセーブに戻しました（ひびの記録 ${S.diary.length}こ）`;save();render()}
// 🧩 読めなかったセーブをそのまま書き出す
async function exportBroken(){let v=null;try{v=localStorage.getItem(BROKEN_KEY)}catch(e){}
  if(!v){S.msg="こわれたセーブはありません";render();return}
  UI.busy=true;UI.busyText="つくっています…";S.msg=null;render();const fname=`kabun-broken-${ymd()}.json`;
  try{const r=await deliver(fname,v,mb(new Blob([v]).size));if(r)S.msg=r;else{UI.exportText=v;S.sub="export"}}
  catch(e){S.msg=dlErrMsg(e);if(!S.msg){UI.exportText=v;S.sub="export"}}
  UI.busy=false;render()}

