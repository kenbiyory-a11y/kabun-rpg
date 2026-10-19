// 📖 ものがたり：「ひびの きろく」（こどもが じぶんで かく）と「おもいでシアター」（しゃしん・どうが）
function mediaBadge(d){const p=d.media.filter(m=>m.type==="photo").length,v=d.media.length-p;return (p?`📷${p} `:"")+(v?`🎬${v}`:"")}
function thumbEl(m,cls){const w=el("div",cls);const src=thumbOf(m);if(src){const im=el("img");im.src=src;im.alt="";w.append(im)}
  if(m.type==="video")w.append(el("div","pl","▶"));else if(!src)w.append(el("div","pl","📷"));return w}
function partBar(menu){const bar=el("div","menu");
  const a=el("button",S.part!=="memory"?"wide sel":"wide","📝 ひびの きろく"),b=el("button",S.part==="memory"?"wide sel":"wide","🎬 おもいでシアター");
  a.onclick=()=>{S.part="daily";S.sub="menu";S.msg=null;UI.confirm=false;save();render()};b.onclick=()=>{S.part="memory";S.sub="menu";S.msg=null;UI.confirm=false;save();render()};
  bar.append(a,b);menu.append(bar)}
function byDateDesc(arr){return arr.map((d,i)=>i).sort((a,b)=>parseDate(arr[b].date)-parseDate(arr[a].date)||b-a)}
function renderDiary(msg,menu){
  if(S.part==="memory")return renderMemories(msg,menu);
  if(S.sub==="dentry")return renderDailyEntry(msg,menu);
  fieldGrowth(stageIdx(),false,"diary");
  const list=el("div","diary");
  if(!S.diary.length)list.append(el("div","empty","まだ きろくが ないよ。できるように なったことを かいてみよう！"));
  for(const i of byDateDesc(S.diary)){const d=S.diary[i];const row=el("div","has");row.append(el("span","ico",d.e));
    row.append(el("span","",`<span class="d">${esc(d.date)}</span>${esc(d.t)}`));
    row.onclick=()=>{S.pidx=i;S.sub="dentry";S.msg=null;UI.confirm=false;save();render()};list.append(row)}
  msg.innerHTML=`<b>${esc(S.name)}の ひびの きろく</b>　${S.diary.length}こ`;msg.append(list);
  if(S.msg)msg.append(el("div","",`<span style="font-size:.9rem">${S.msg}</span>`));
  menu.className="menu one";partBar(menu);
  msg.append(el("div","note","きょう できたことを かくと、カブーンの ぜんぶの ちからが +1"));
  const emo=el("div","emo");DIARY_EMO.forEach(e=>{const b=el("button",S.emo===e?"on":"",e);b.onclick=()=>{S.emo=e;save();render()};emo.append(b)});
  const inp=el("input");inp.id="diaryInput";inp.placeholder="れい：ひとりで じてんしゃに のれた！";inp.maxLength=40;inp.value=UI.draft;inp.oninput=()=>{UI.draft=inp.value};
  const add=el("button","wide","✏️ きろくする（ぜんぶの ちから +1）");
  add.onclick=()=>{const t=inp.value.trim();if(!t){inp.focus();return}
    S.diary.push({date:todayJ(),e:S.emo,t});STATS.forEach(k=>S[k]+=1);UI.draft="";
    S.msg=`🎉 ${esc(S.name)}が せいちょうしたから、カブーンも つよくなった！`;save();render()};
  inp.addEventListener("keydown",e=>{if(e.key==="Enter")add.click()});
  menu.append(emo,inp,add);
}
function renderDailyEntry(msg,menu){
  const d=S.diary[S.pidx];if(!d){S.sub="menu";return renderDiary(msg,menu)}
  fieldGrowth(stageIdx(),false,"diary");
  msg.innerHTML=`<span style="font-size:2rem">${d.e}</span><br><span class="d">${esc(d.date)}</span><br><span style="font-size:1.2rem">${esc(d.t)}</span>`;
  menu.className="menu";
  const x=el("button","wide","とじる");x.onclick=()=>{UI.confirm=false;S.sub="menu";save();render()};
  let del;
  if(!UI.confirm){del=el("button","wide","けす");del.onclick=()=>{UI.confirm=true;render()}}
  else{del=el("button","wide danger","ほんとうに けす");del.onclick=()=>{S.diary.splice(S.pidx,1);UI.confirm=false;S.sub="menu";S.msg="きろくを けしました";save();render()}}
  menu.append(x,del);
}
function renderMemories(msg,menu){
  if(S.sub==="entry")return renderEntry(msg,menu);
  fieldGrowth(stageIdx(),false,"diary");
  const list=el("div","diary");
  if(!S.memories.length)list.append(el("div","empty","まだ おもいでが ないよ。写真や動画を入れて、おもいでを つくろう！"));
  for(const i of byDateDesc(S.memories)){const d=S.memories[i];const has=d.media.length>0;
    const row=el("div","has");row.append(el("span","ico",d.e));
    if(has)row.append(thumbEl(d.media[0],"th"));
    row.append(el("span","",`<span class="d">${esc(d.date)}${has?`　<span class="cnt">${mediaBadge(d)}</span>`:""}</span>${esc(d.t)}`));
    row.onclick=()=>{S.pidx=i;S.sub="entry";S.msg=null;UI.confirm=false;save();render()};list.append(row)}
  const withMedia=S.memories.filter(d=>d.media.length);
  msg.innerHTML=`<b>おもいでシアター</b>　${S.memories.length}こ`;msg.append(list);
  if(S.msg)msg.append(el("div","",`<span style="font-size:.9rem">${S.msg}</span>`));
  menu.className="menu one";partBar(menu);
  if(UI.busy){menu.append(el("div","note","⏳ "+UI.busyText));return}
  if(withMedia.length){const all=el("button","wide","🎬 ぜんぶ シアターで みる");all.onclick=()=>openTheater(withMedia.slice().sort((a,b)=>parseDate(a.date)-parseDate(b.date)),0);menu.append(all)}
  msg.append(el("div","note","あたらしい おもいでを つくる（日付・ひとこと・写真や動画）"));
  const emo=el("div","emo");DIARY_EMO.forEach(e=>{const b=el("button",S.memo===e?"on":"",e);b.onclick=()=>{S.memo=e;save();render()};emo.append(b)});
  const row2=el("div","row2");const dt=el("input");dt.type="date";dt.id="memDate";dt.value=UI.date||ymd();dt.onchange=()=>{UI.date=dt.value};
  const inp=el("input");inp.id="memInput";inp.placeholder="れい：はじめての うんどうかい";inp.maxLength=40;inp.value=UI.mdraft;inp.oninput=()=>{UI.mdraft=inp.value};row2.append(dt,inp);
  const pend=el("div","pend");
  UI.pending.forEach((it,i)=>{const pm=el("div","pm");const src=it.type==="photo"?it.data:it.poster;if(src){const im=el("img");im.src=src;im.alt="";pm.append(im)}
    if(it.type==="video")pm.append(el("div","pl","▶"));const x=el("button","","✕");x.setAttribute("aria-label","やめる");x.onclick=()=>{UI.pending.splice(i,1);render()};pm.append(x);pend.append(pm)});
  const pick=DB_OK?filebtn(`📷 しゃしん・どうがを えらぶ<small>写真は小さくして、動画はそのまま この端末に保存（動画は ${VIDEO_MAX_SEC}秒・${VIDEO_MAX_MB}MBまで、1つの おもいでに ${MEDIA_MAX}こまで）</small>`,"image/*,video/*",true,async fs=>{
    if(UI.pending.length+fs.length>MEDIA_MAX){S.msg=`1つの おもいでに つけられるのは ${MEDIA_MAX}こまでです`;render();return}
    UI.busy=true;UI.busyText="写真・動画を よみこんでいます…";render();const {out,errs}=await ingestFiles(fs);UI.pending.push(...out);UI.busy=false;S.msg=errs.length?errs.join("\n"):null;render()}):el("div","note","⚠️ この端末では写真・動画を保存できません");
  const add=el("button","wide","🎞️ おもいでを つくる");
  add.onclick=async()=>{const t=inp.value.trim();if(!t){inp.focus();return}
    UI.busy=true;UI.busyText="ほぞんしています…";render();
    const {refs,warn}=await persistMedia(UI.pending);
    S.memories.push({date:isoToJ(dt.value||ymd()),e:S.memo,t,media:refs});UI.pending=[];UI.mdraft="";UI.date="";UI.busy=false;
    S.msg=`${warn}おもいでを つくりました${refs.length?"（"+refs.length+"こ）":"（あとから 写真や動画を たせます）"}`;save();render()};
  inp.addEventListener("keydown",e=>{if(e.key==="Enter")add.click()});
  menu.append(emo,row2,pend,pick,add);
}
function renderEntry(msg,menu){
  const d=S.memories[S.pidx];if(!d){S.sub="menu";return renderMemories(msg,menu)}
  const f=$("field");f.innerHTML="";f.className="field grid";
  if(!d.media.length)f.append(el("div","empty2","しゃしん・どうがは まだ ないよ"));
  d.media.forEach((m,i)=>{const t=thumbEl(m,"tm");t.onclick=()=>openTheater([d],i);f.append(t)});
  msg.innerHTML=`<span style="font-size:1.4rem">${d.e}</span> <span class="d">${esc(d.date)}　${mediaBadge(d)}</span><br>${esc(d.t)}`;
  if(S.msg)msg.append(el("div","",`<span style="font-size:.9rem">${S.msg}</span>`));
  menu.className="menu one";
  if(UI.busy){menu.append(el("div","note","⏳ "+UI.busyText));return}
  const play=el("button","wide","🎬 シアターで みる（BGMつき）");play.disabled=!d.media.length;play.onclick=()=>openTheater([d],0);
  const addm=DB_OK?filebtn("✚ しゃしん・どうがを たす","image/*,video/*",true,async fs=>{
    if(d.media.length+fs.length>MEDIA_MAX){S.msg=`1つの おもいでに つけられるのは ${MEDIA_MAX}こまでです`;render();return}
    UI.busy=true;UI.busyText="写真・動画を ほぞんしています…";render();const {out,errs}=await ingestFiles(fs);const {refs,warn}=await persistMedia(out);d.media.push(...refs);UI.busy=false;
    S.msg=[warn,...errs].filter(Boolean).join("\n")||`${refs.length}こ たしました`;save();render()}):null;
  const row=el("div","menu");
  const x=el("button","wide","とじる");x.onclick=()=>{UI.confirm=false;S.sub="menu";S.msg=null;save();render()};
  let del;
  if(!UI.confirm){del=el("button","wide","けす");del.onclick=()=>{UI.confirm=true;render()}}
  else{del=el("button","wide danger","ほんとうに けす");del.onclick=async()=>{const [it]=S.memories.splice(S.pidx,1);UI.busy=true;UI.busyText="けしています…";render();if(it)await deleteMedia(it.media);UI.busy=false;UI.confirm=false;S.sub="menu";S.msg="おもいでを けしました";save();render()}}
  row.append(x,del);
  menu.append(play);if(addm)menu.append(addm);menu.append(row);
}

