// ---------- おもいでシアター ----------
const T={q:[],i:-1,timer:null,on:false,slot:0,soundOK:false,vurl:null};
const $=id=>document.getElementById(id);
function isMedia(x){return x.k==="photo"||x.k==="video"}
function buildQueue(entries,startIdx){const q=[];const single=entries.length===1;
  entries.forEach(d=>{if(!(single&&startIdx>0))q.push({k:"card",d});(d.media||[]).forEach((m,mi)=>{if(single&&mi<startIdx)return;q.push({k:m.type,id:m.id,d})})});
  q.push({k:"end"});return q}
function openTheater(entries,startIdx=0){
  T.q=buildQueue(entries,startIdx);T.i=-1;T.on=true;T.soundOK=false;
  $("theater").hidden=false;$("tSound").hidden=true;$("tBgm").textContent=S.bgmOn?"♪ BGM オン":"♪ BGM オフ";
  startBgm();next()}
function closeTheater(){T.on=false;clearTimeout(T.timer);stopVideo();stopBgm();$("theater").hidden=true;
  $("slA").className="slide";$("slB").className="slide";$("slBg").className="bgblur";$("tCard").className="tcard";$("tCap").className="tcap";$("slA").removeAttribute("src");$("slB").removeAttribute("src")}
function stopVideo(){const v=$("slV");v.onended=null;try{v.pause()}catch(e){}v.removeAttribute("src");try{v.load()}catch(e){}v.className="slide";if(T.vurl){URL.revokeObjectURL(T.vurl);T.vurl=null}duck(false)}
function showCount(){const n=T.q.filter(isMedia).length,done=T.q.slice(0,T.i+1).filter(isMedia).length;$("tCount").textContent=n?`${done} / ${n}`:""}
function next(){if(!T.on)return;clearTimeout(T.timer);T.i++;const it=T.q[T.i];if(!it){closeTheater();return}showCount();
  const card=$("tCard"),cap=$("tCap"),A=$("slA"),B=$("slB"),V=$("slV"),bg=$("slBg");stopVideo();
  if(it.k==="card"||it.k==="end"){A.className="slide";B.className="slide";bg.className="bgblur";cap.className="tcap";
    if(it.k==="card"){card.innerHTML=`<div><div class="em">${it.d.e}</div><div class="dt">${esc(it.d.date)}</div><div class="tx">${esc(it.d.t)}</div></div>`;card.className="tcard on";T.timer=setTimeout(next,CARD_MS)}
    else{card.innerHTML=`<div><div class="em">🎬</div><div class="tx">おしまい</div><div class="tbtns"><button id="tAgain">もういちど</button><button id="tDone">とじる</button></div></div>`;card.className="tcard on";
      $("tAgain").onclick=e=>{e.stopPropagation();T.i=-1;startBgm();next()};$("tDone").onclick=e=>{e.stopPropagation();closeTheater()};setBgmLevel(0.0001);setTimeout(()=>{if(T.on&&T.q[T.i]&&T.q[T.i].k==="end")stopBgm()},1500)}
    return}
  card.className="tcard";cap.innerHTML=`${it.d.e} <span class="d2">${esc(it.d.date)}</span>　${esc(it.d.t)}`;cap.className="tcap on";
  if(it.k==="photo"){const src=PH.get(it.id);if(!src){T.timer=setTimeout(next,10);return}
    const show=T.slot?B:A,hide=T.slot?A:B;T.slot^=1;
    show.src=src;bg.src=src;bg.className="bgblur on";show.style.transformOrigin=`${30+Math.random()*40}% ${30+Math.random()*40}%`;
    show.className="slide";void show.offsetWidth;show.className="slide on kb";hide.className="slide";
    T.timer=setTimeout(next,PHOTO_MS);return}
  A.className="slide";B.className="slide";bg.className="bgblur";
  sGet("videos",it.id).then(rec=>{if(!T.on||T.q[T.i]!==it)return;if(!rec||!rec.blob){next();return}
    T.vurl=URL.createObjectURL(rec.blob);V.src=T.vurl;V.className="slide on";V.muted=false;V.onended=()=>next();
    const meta=VM.get(it.id);T.timer=setTimeout(next,(((meta&&meta.dur)||VIDEO_MAX_SEC)+3)*1000);duck(true);
    V.play().then(()=>{T.soundOK=true;$("tSound").hidden=true}).catch(()=>{V.muted=true;V.play().catch(()=>{});if(!T.soundOK)$("tSound").hidden=false})
  }).catch(()=>next())}
$("tClose").onclick=closeTheater;
$("stage").onclick=()=>{const it=T.q[T.i];if(it&&it.k!=="end")next()};
$("tSound").onclick=e=>{e.stopPropagation();const V=$("slV");V.muted=false;T.soundOK=true;$("tSound").hidden=true;V.play().catch(()=>{})};
$("tBgm").onclick=e=>{e.stopPropagation();S.bgmOn=!S.bgmOn;save();$("tBgm").textContent=S.bgmOn?"♪ BGM オン":"♪ BGM オフ";if(S.bgmOn)startBgm();else stopBgm()};
document.addEventListener("keydown",e=>{if(!T.on)return;if(e.key==="Escape")closeTheater();else if(e.key==="ArrowRight"||e.key===" "){e.preventDefault();$("stage").click()}});
document.addEventListener("visibilitychange",()=>{if(document.hidden&&T.on)closeTheater()});

