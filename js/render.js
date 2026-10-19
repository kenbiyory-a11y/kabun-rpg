// ---------- 描画ぶひん ----------
let typer=null;
function typeText(node,text,done){
  if(typer)clearInterval(typer);node.textContent="";let i=0;
  if(matchMedia("(prefers-reduced-motion: reduce)").matches){node.textContent=text;done&&done();return}
  typer=setInterval(()=>{i++;node.textContent=text.slice(0,i);if(i>=text.length){clearInterval(typer);typer=null;done&&done()}},28);
  node.onclick=()=>{if(typer){clearInterval(typer);typer=null;node.textContent=text;done&&done()}};
}
function hud(cls,name,lv,hp,max){
  const r=Math.max(0,hp/max);
  return el("div","hud "+cls,`<div class="nm"><span>${name}</span><span class="lv">Lv${lv}</span></div><div class="hp"><i class="${hpClass(r)}" style="width:${r*100}%"></i></div><div class="num">${Math.max(0,hp)} / ${max}</div>`);
}
function statRows(){
  const col={str:"var(--c-str)",wise:"var(--c-wise)",world:"var(--c-world)",heart:"var(--c-heart)"};const MAX=40;
  return `<div class="grow">${STATS.map(k=>`<div class="row"><span>${STAT_NAME[k]}</span><div class="bar"><i style="width:${Math.min(100,S[k]/MAX*100)}%;background:${col[k]}"></i></div><span class="n">${S[k]}</span></div>`).join("")}</div>`;
}
function fieldBattle(showFoe){
  const f=$("field");f.innerHTML="";
  const c=CHAPTERS[Math.min(S.ch,CHAPTERS.length-1)];
  f.className="field "+(S.ch>=CHAPTERS.length?"day":c.bg);
  const me=el("div","sprite me",STAGES[stageIdx()].ico);me.id="spMe";f.append(me);
  f.append(hud("me","カブーン",level(),S.hp,MAXHP));
  if(showFoe&&S.ch<CHAPTERS.length){const foe=el("div","sprite foe",c.foe.ico);foe.id="spFoe";f.append(foe);f.append(hud("foe",c.foe.name,S.ch+1,S.foehp??c.foe.hp,c.foe.hp))}
}
function fieldGrowth(idx,evolving,bg){
  const f=$("field");f.innerHTML="";f.className="field "+(bg||"day");
  f.append(el("div","glow"));
  const sp=el("div","sprite center"+(evolving?" evolve":""),STAGES[idx].ico);sp.id="spMe";f.append(sp);
  const path=el("div","path");
  STAGES.forEach((st,i)=>{if(i)path.append(el("i","","→"));path.append(el("span",i<idx?"done":i===idx?"now":"",st.ico))});
  f.append(path);
}
function nextEvolveInfo(){
  for(let i=S.ch;i<CHAPTERS.length;i++)if(CHAPTERS[i].evolve!=null)return `あと ${i-S.ch+1} つの かべで「${STAGES[CHAPTERS[i].evolve].name}」に！`;
  return "もう さいこうの すがた！";
}
function filebtn(html,accept,multiple,onFiles){const lab=el("label","filebtn",html);const fi=el("input");fi.type="file";fi.accept=accept;if(multiple)fi.multiple=true;
  fi.onchange=e=>{const fs=Array.from(e.target.files||[]);if(fs.length)onFiles(fs);e.target.value=""};lab.append(fi);return lab}
function renderNav(){
  document.querySelectorAll(".nav .nb").forEach(b=>{b.classList.toggle("on",b.dataset.tab===S.view);b.disabled=!S.name&&b.dataset.tab!=="settings";
    b.onclick=()=>{if(S.view===b.dataset.tab)return;S.view=b.dataset.tab;S.sub="menu";S.quiz=null;S.ans=null;S.msg=null;S.line=0;UI.confirm=false;UI.pendingImport=null;UI.exportText=null;stopBgm();save();render()}});
}

// ---------- がめん ----------
function render(){
  renderNav();
  const box=$("msgbox");box.innerHTML="";
  const msg=el("p","msg");box.append(msg);
  const menu=el("div","menu");box.append(menu);
  const tapBtn=(label,fn)=>{menu.className="menu one";const b=el("button","tap",label);b.onclick=()=>{if(typer){msg.click();return}fn()};menu.append(b)};

  if(S.view==="settings")return renderSettings(msg,menu);
  if(!S.name){
    fieldGrowth(0,false);
    typeText(msg,"カブトムシの たまご「カブーン」を もらった！\nそだてる きみの なまえは？");
    menu.className="menu one";const inp=el("input");inp.id="nameInput";inp.placeholder="なまえを いれてね";inp.maxLength=10;
    const b=el("button","wide","ぼうけんを はじめる");b.onclick=()=>{const n=inp.value.trim();if(!n){inp.focus();return}S.name=n;save();render()};
    inp.addEventListener("keydown",e=>{if(e.key==="Enter")b.click()});menu.append(inp,b);return;
  }
  if(S.view==="growth")return renderGrowth(msg,menu,tapBtn);
  if(S.view==="battle")return renderBattle(msg,menu,tapBtn);
  if(S.view==="diary")return renderDiary(msg,menu);
  S.view="growth";render();
}

// 📈 せいちょう：クイズで きたえる・わざを おぼえる
function renderGrowth(msg,menu,tapBtn){
  const idx=stageIdx();
  if(S.sub==="quiz"&&!S.quiz)S.sub="menu";
  if(S.sub==="menu"){
    fieldGrowth(idx,false);
    msg.innerHTML=`<div class="gh"><span><b>カブーン</b>　Lv${level()}　${STAGES[idx].name}</span><small>${nextEvolveInfo()}</small></div>${statRows()}`;
    if(S.msg){msg.append(el("div","",`<span style="font-size:.9rem">${S.msg}</span>`))}
    msg.append(el("div","",`<span class="note">とっくんを えらんで クイズに こたえよう</span>`));
    for(const cat of Object.keys(CAT)){const k=STAT_OF[cat];
      const b=el("button","",`${CAT[cat].ico} ${CAT[cat].n}の とっくん<small>${STAT_NAME[k]} +${GAIN}　わざ：${moveOf(k).n}</small>`);
      b.onclick=()=>{S.quiz=pickQuiz(cat);S.ans=null;S.msg=null;S.sub="quiz";save();render()};menu.append(b)}
    return;
  }
  if(S.sub==="quiz"){
    fieldGrowth(idx,false);const q=S.quiz;const k=STAT_OF[q.cat];
    if(S.ans===null){
      const big=q.cat==="flag"||!!q.sub;
      msg.innerHTML=big?`<span class="big">${q.q}</span>${q.cat==="flag"?"この こっきは どこの くに？":q.sub}`:q.q;
      q.opts.forEach(o=>{const b=el("button","",o);b.onclick=()=>{
        S.ans=o;
        if(o===q.correct){const before=moveOf(k);S[k]+=GAIN;const after=moveOf(k);
          S.msg=`せいかい！${STAT_NAME[k]} が ${GAIN} あがった！（${S[k]}）`;
          if(after!==before)S.msg+=`\n✨ あたらしい わざ「${after.n}」を おぼえた！`;}
        else S.msg=`ざんねん！こたえは「${q.correct}」。\nつぎは きっと できる！`;
        save();render()};menu.append(b)});
      if(q.opts.length%2)menu.className="menu one";return;
    }
    typeText(msg,S.msg,()=>{msg.append(el("span","cur","▼"))});
    const again=el("button","",`${CAT[q.cat].ico} もういちど ${CAT[q.cat].n}`);again.onclick=()=>{S.quiz=pickQuiz(q.cat);S.ans=null;S.msg=null;save();render()};
    const back=el("button","wide","せいちょうがめんに もどる");back.onclick=()=>{S.quiz=null;S.ans=null;S.msg=null;S.sub="menu";save();render()};
    menu.className="menu";menu.append(again,back);return;
  }
}

// ⚔️ バトル：おぼえた わざで たたかう
function renderBattle(msg,menu,tapBtn){
  if(S.ch>=CHAPTERS.length){
    fieldGrowth(4,false);
    typeText(msg,`👑 キング カブーン たんじょう！\n${S.name}と カブーンは ぜんぶの かべを のりこえた！`);
    menu.className="menu one";const b=el("button","wide","バトルを はじめから");b.onclick=()=>{S.ch=0;S.hp=MAXHP;S.foehp=null;S.sub="menu";save();render()};menu.append(b);return;
  }
  const c=CHAPTERS[S.ch];
  if(S.sub==="menu"){
    fieldBattle(false);
    msg.innerHTML=`<span class="big">${c.foe.ico}</span><div style="text-align:center;font-size:1.2rem">${c.title}</div>`;
    menu.className="menu one";const b=el("button","wide",`▶ ${c.foe.name} に ちょうせん！`);
    b.onclick=()=>{S.foehp=c.foe.hp;S.hp=MAXHP;S.msg=`${c.foe.name} が あらわれた！`;S.sub="fight";save();render()};menu.append(b);return;
  }
  if(S.sub==="fight"){
    fieldBattle(true);
    typeText(msg,S.msg||"カブーンは どうする？");
    for(const k of STATS){const m=moveOf(k);
      const b=el("button","",`${m.n}<small>${STAT_NAME[k]}の わざ　いりょく ${power(k)}</small>`);
      b.onclick=()=>{
        const dmg=power(k);S.foehp=Math.max(0,S.foehp-dmg);
        let t=`カブーンの ${m.n}！\n${c.foe.name} に ${dmg} の ダメージ！`;
        if(S.foehp>0){S.hp=Math.max(0,S.hp-c.foe.dmg);t+=`\n${c.foe.name} の はんげき！カブーンに ${c.foe.dmg} の ダメージ！`}
        S.msg=t;S.sub="turn";save();render();
        const sp=$("spMe");sp&&sp.classList.add("attack");const fo=$("spFoe");fo&&setTimeout(()=>fo.classList.add("hit"),200);
        if(S.foehp>0)setTimeout(()=>{sp&&sp.classList.remove("attack");sp&&sp.classList.add("hit")},700);
      };menu.append(b)}
    return;
  }
  if(S.sub==="turn"){
    fieldBattle(true);
    typeText(msg,S.msg,()=>{msg.append(el("span","cur","▼"))});
    tapBtn("▶ つぎへ",()=>{
      if(S.foehp<=0){S.line=0;S.sub="win"}
      else if(S.hp<=0){S.hp=MAXHP;S.msg="カブーンは めが まわった……。\nでも たちあがった！もういちど！";S.sub="fight"}
      else{S.msg=null;S.sub="fight"}
      save();render()});
    return;
  }
  if(S.sub==="win"){
    fieldBattle(false);
    const lines=[`${c.foe.name} を のりこえた！`,c.win];const last=S.line>=lines.length-1;
    typeText(msg,lines[Math.min(S.line,lines.length-1)],()=>{msg.append(el("span","cur","▼"))});
    tapBtn(last?(c.evolve!=null?"▶ ？？？":"▶ つぎの かべへ"):"▶ つぎへ",()=>{
      if(!last){S.line++}else if(c.evolve!=null){S.line=0;S.sub="evolve"}else{S.ch++;S.line=0;S.foehp=null;S.sub="menu"}
      save();render()});
    return;
  }
  if(S.sub==="evolve"){
    const from=stageIdx(),to=c.evolve;
    if(S.line===0){fieldGrowth(from,true);typeText(msg,"おや……？ カブーンの ようすが……！",()=>{msg.append(el("span","cur","▼"))});tapBtn("▶ つぎへ",()=>{S.line=1;save();render()})}
    else{fieldGrowth(to,true);msg.innerHTML=`🎉 おめでとう！<br>カブーンは「<b>${STAGES[to].name}</b>」に せいちょうした！${statRows()}`;
      menu.className="menu one";const b=el("button","wide","▶ つぎの かべへ");b.onclick=()=>{S.ch++;S.line=0;S.foehp=null;S.sub="menu";save();render()};menu.append(b)}
    return;
  }
  S.sub="menu";render();
}

