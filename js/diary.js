// 📖 ものがたり：ひびの きろく（絵文字＋できたこと＋おうちのひとの ひとこと）。おもいでシアターは v2 では UI から外している（データは残る）
function byDateDesc(arr){return arr.map((d,i)=>i).sort((a,b)=>parseDate(arr[b].date)-parseDate(arr[a].date)||b-a)}
function renderDiary(msg,menu){
  if(S.sub==="dentry")return renderDailyEntry(msg,menu);
  fieldGrowth(stageIdx(),false,"diary");
  const list=el("div","diary");
  if(!S.diary.length)list.append(el("div","empty","まだ きろくが ないよ。できるように なったことを のこそう！"));
  for(const i of byDateDesc(S.diary)){const d=S.diary[i];const row=el("div","has");row.append(el("span","ico",d.e));
    row.append(el("span","",`<span class="d">${esc(d.date)}</span>${esc(d.t)}`));
    row.onclick=()=>{S.pidx=i;S.sub="dentry";S.msg=null;UI.confirm=false;save();render()};list.append(row)}
  msg.innerHTML=`<b>${esc(S.name)}の ひびの きろく</b>　${S.diary.length}こ`;msg.append(list);
  if(S.msg)msg.append(el("div","note2",esc(S.msg)));
  menu.className="menu one";
  msg.append(el("div","note",S.daily.diary?"きょうの ちからは もう もらったよ。きろくは なんこでも のこせるよ":"きょう できたことを のこすと、カブーンの ぜんぶの ちからが +1"));
  const emo=el("div","emo");DIARY_EMO.forEach(e=>{const b=el("button",S.emo===e?"on":"",e);b.onclick=()=>{S.emo=e;save();render()};emo.append(b)});
  const chips=el("div","chips");(Array.isArray(S.chips)&&S.chips.length?S.chips:DIARY_CHIPS).forEach(c=>{const b=el("button",S.chip===c?"on":"",esc(c));b.onclick=()=>{S.chip=S.chip===c?null:c;save();render()};chips.append(b)});
  const inp=el("input");inp.id="diaryInput";inp.placeholder="おうちのひとの ひとこと（なくても いいよ）";inp.maxLength=40;inp.value=UI.draft;inp.oninput=()=>{UI.draft=inp.value};
  const add=el("button","wide",S.daily.diary?"✏️ きろくする":"✏️ きろくする（ぜんぶの ちから +1）");
  add.onclick=()=>{const t=inp.value.trim();if(!S.chip&&!t){S.msg="できたことを えらぶか、ひとことを かいてね";render();return}
    const text=[S.chip,t].filter(Boolean).join("　");S.diary.push({date:todayJ(),e:S.emo,k:S.chip,t:text});
    let m=KABUN_SAY[S.chip]||"すごいね！ カブーンも うれしい！";
    if(!S.daily.diary){const before=snapshot();S.daily.diary=true;STATS.forEach(k=>S[k]+=DIARY_GAIN);m+="\n🎉 カブーンの ぜんぶの ちからが +1！";gainNotes(before).forEach(n=>m+="\n"+n);const bn=checkBoard();if(bn)m+="\n"+bn;sfx("gain")}else sfx("ok");
    say(KABUN_SAY[S.chip]||"すごいね！");
    S.msg=m;UI.draft="";S.chip=null;save();render()};
  inp.addEventListener("keydown",e=>{if(e.key==="Enter")add.click()});
  menu.append(emo,chips,inp,add);
}
function renderDailyEntry(msg,menu){
  const d=S.diary[S.pidx];if(!d){S.sub="menu";return renderDiary(msg,menu)}
  fieldGrowth(stageIdx(),false,"diary");
  msg.innerHTML=`<span style="font-size:2rem">${d.e}</span><br><span class="d">${esc(d.date)}</span><br><span style="font-size:1.2rem">${esc(d.t)}</span>`;
  menu.className="menu";
  if(voiceOK()){const sp=el("button","wide","🔊 きいてみる");sp.onclick=()=>say(d.t);menu.append(sp)}
  const x=el("button","wide","とじる");x.onclick=()=>{UI.confirm=false;S.sub="menu";save();render()};menu.append(x);
  if(unlocked()){let del;
    if(!UI.confirm){del=el("button","wide","けす（おうちのひと）");del.onclick=()=>{UI.confirm=true;render()}}
    else{del=el("button","wide danger","ほんとうに けす");del.onclick=()=>{S.diary.splice(S.pidx,1);UI.confirm=false;S.sub="menu";S.msg="きろくを けしました";save();render()}}
    menu.append(del)}
}
