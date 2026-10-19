// ---------- メディア（この端末の IndexedDB に保存：写真は縮小、動画・音楽はそのまま） ----------
const PH=new Map(),VM=new Map(),AU=new Map();let DB_OK=true;
const STORES=["photos","videos","vmeta","audio"];
function idb(){return new Promise((res,rej)=>{let r;try{r=indexedDB.open("kabun-photos",2)}catch(e){return rej(e)}
  r.onupgradeneeded=()=>{const db=r.result;for(const s of STORES)if(!db.objectStoreNames.contains(s))db.createObjectStore(s,{keyPath:"id"})};
  r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error);r.onblocked=()=>rej(new Error("blocked"))})}
function ptx(store,mode,fn){return idb().then(db=>new Promise((res,rej)=>{const t=db.transaction(store,mode);const req=fn(t.objectStore(store));let out;if(req)req.onsuccess=()=>{out=req.result};
  t.oncomplete=()=>{db.close();res(out)};t.onerror=()=>{db.close();rej(t.error)};t.onabort=()=>{db.close();rej(t.error)}}))}
const sPut=(s,o)=>ptx(s,"readwrite",st=>st.put(o)),sDel=(s,id)=>ptx(s,"readwrite",st=>st.delete(id)),sGet=(s,id)=>ptx(s,"readonly",st=>st.get(id)),sAll=s=>ptx(s,"readonly",st=>st.getAll()),sClear=s=>ptx(s,"readwrite",st=>st.clear());
async function loadMedia(){try{
  const ph=await sAll("photos");PH.clear();for(const p of ph||[])if(p&&p.id&&p.data)PH.set(p.id,p.data);
  const vm=await sAll("vmeta");VM.clear();for(const m of vm||[])if(m&&m.id)VM.set(m.id,m);
  const au=await sAll("audio");for(const [,a] of AU)try{URL.revokeObjectURL(a.url)}catch(e){}AU.clear();for(const a of au||[])if(a&&a.id&&a.blob)AU.set(a.id,{name:a.name,size:a.size,mime:a.mime,url:URL.createObjectURL(a.blob)});
  DB_OK=true}catch(e){DB_OK=false}}
function shrinkImage(file,max=800,q=0.75){return new Promise((res,rej)=>{const url=URL.createObjectURL(file);const img=new Image();
  img.onload=()=>{URL.revokeObjectURL(url);const s=Math.min(1,max/Math.max(img.naturalWidth,img.naturalHeight));const w=Math.max(1,Math.round(img.naturalWidth*s)),h=Math.max(1,Math.round(img.naturalHeight*s));
    const c=document.createElement("canvas");c.width=w;c.height=h;c.getContext("2d").drawImage(img,0,0,w,h);res({data:c.toDataURL("image/jpeg",q),w,h})};
  img.onerror=()=>{URL.revokeObjectURL(url);rej(new Error("image"))};img.src=url})}
function videoMeta(file){return new Promise((res,rej)=>{const url=URL.createObjectURL(file);const v=document.createElement("video");v.preload="auto";v.muted=true;v.playsInline=true;let done=false;
  const fail=()=>{if(done)return;done=true;URL.revokeObjectURL(url);rej(new Error("video"))};v.onerror=fail;
  const finish=()=>{if(done)return;done=true;let poster=null;try{if(v.videoWidth){const s=Math.min(1,240/Math.max(v.videoWidth,v.videoHeight));const c=document.createElement("canvas");c.width=Math.max(1,Math.round(v.videoWidth*s));c.height=Math.max(1,Math.round(v.videoHeight*s));c.getContext("2d").drawImage(v,0,0,c.width,c.height);poster=c.toDataURL("image/jpeg",0.7)}}catch(e){}
    const dur=isFinite(v.duration)?v.duration:0;URL.revokeObjectURL(url);res({dur,poster})};
  v.onloadedmetadata=()=>{try{v.currentTime=Math.min(0.5,(v.duration||1)/2)}catch(e){}setTimeout(finish,3000)};
  v.onseeked=finish;v.src=url;setTimeout(fail,15000)})}
function photoBytes(){let n=0;for(const d of PH.values())n+=Math.round(d.length*0.75);return n}
function videoBytes(){let n=0;for(const m of VM.values())n+=m.size||0;return n}
async function ingestFiles(files){const out=[],errs=[];
  for(const f of files){
    if(f.type.startsWith("image/")){try{const p=await shrinkImage(f);out.push({type:"photo",data:p.data,w:p.w,h:p.h})}catch(e){errs.push(`${f.name}：読めませんでした`)}}
    else if(f.type.startsWith("video/")){
      if(f.size>VIDEO_MAX_MB*1048576){errs.push(`${f.name}：${VIDEO_MAX_MB}MBをこえています`);continue}
      try{const m=await videoMeta(f);if(m.dur>VIDEO_MAX_SEC+1){errs.push(`${f.name}：${VIDEO_MAX_SEC}秒より長い動画です`);continue}out.push({type:"video",blob:f,mime:f.type,size:f.size,dur:m.dur,poster:m.poster})}
      catch(e){errs.push(`${f.name}：この端末では再生できない動画です`)}}
    else errs.push(`${f.name}：写真か動画を選んでください`)}
  return {out,errs}}
async function persistMedia(items){const refs=[];let warn="";
  for(const it of items){const id=uid(it.type==="photo"?"p":"v");
    try{if(it.type==="photo"){await sPut("photos",{id,data:it.data,w:it.w,h:it.h,ts:Date.now()});PH.set(id,it.data)}
      else{await sPut("videos",{id,blob:it.blob});const meta={id,mime:it.mime,size:it.size,dur:it.dur,poster:it.poster,ts:Date.now()};await sPut("vmeta",meta);VM.set(id,meta)}
      refs.push({id,type:it.type})}
    catch(e){warn="一部の写真・動画を保存できませんでした（容量不足かもしれません）。"}}
  try{navigator.storage&&navigator.storage.persist&&navigator.storage.persist()}catch(e){}
  return {refs,warn}}
async function deleteMedia(refs){for(const m of refs||[]){try{if(m.type==="photo"){PH.delete(m.id);await sDel("photos",m.id)}else{VM.delete(m.id);await sDel("vmeta",m.id);await sDel("videos",m.id)}}catch(e){}}}
function thumbOf(m){return m.type==="photo"?PH.get(m.id):(VM.get(m.id)||{}).poster}

