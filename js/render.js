// ---------- 描画ぶひん ----------
let typer=null,typeNode=null;
function typeText(node,text,done){
  if(typer)clearInterval(typer);node.textContent="";typeNode=node;let i=0;
  if(matchMedia("(prefers-reduced-motion: reduce)").matches){node.textContent=text;done&&done();return}
  typer=setInterval(()=>{i++;node.textContent=text.slice(0,i);if(i>=text.length){clearInterval(typer);typer=null;done&&done()}},28);
  node.onclick=()=>{if(typer){clearInterval(typer);typer=null;node.textContent=text;done&&done()}};
}
const EMOJI_RE=/\p{Extended_Pictographic}/u;
function hasKana(s){return /[ぁ-んァ-ヶa-zA-Z0-9０-９]/.test(String(s))}
function badge(kind,k){return `<span class="bd ${kind}">${kind==="star"?"★":"🛡️"}${STAT_ICO[k]}</span>`}
function hud(cls,name,lv,hp,max,foe){
  const r=max?Math.max(0,hp/max):0;let b="";
  if(foe){if(foe.weak)b+=badge("star",foe.weak);if(foe.guard)b+=badge("shield",foe.guard)}
  return el("div","hud "+cls,`<div class="nm"><span>${esc(name)}</span><span class="lv">${lv}</span></div><div class="hp"><i class="${hpClass(r)}" style="width:${r*100}%"></i></div><div class="num">${Math.max(0,hp)} / ${max}</div>${b?`<div class="bds">${b}</div>`:""}`);
}
function statRows(){
  const mx=Math.max(40,...STATS.map(k=>S[k]))*1.1;
  return `<div class="grow">${STATS.map(k=>`<div class="row"><span>${STAT_ICO[k]} ${STAT_NAME[k]}</span><div class="bar"><i style="width:${Math.min(100,S[k]/mx*100)}%;background:var(--c-${k})"></i></div><span class="n">${S[k]}</span><small class="pw" title="${esc(moveOf(k).n)}">⚔️${power(k)}</small></div>`).join("")}<div class="note">⚔️ は わざの いりょく（きほん ＋ ステータス）</div></div>`;
}
function levelBar(){const into=statSum()%LV_DIV;return `<div class="lvbar"><b>Lv${level()}</b><div class="bar"><i style="width:${into/LV_DIV*100}%"></i></div><small>つぎまで あと ${LV_DIV-into}</small></div>`}
function board(){
  const m=CATS.map(c=>{const n=S.daily.done[c]||0;const sc=S.daily.score[c];return `<span class="slot${n?" on":""}">${CAT[c].ico}${n?(sc===0?"💪":"✅"):"⚪"}</span>`}).join("");
  return `<div class="board"><small>きょうの 5つ</small>${m}<span class="sep">｜</span><span class="slot${S.daily.diary?" on":""}">📝${S.daily.diary?"✅":"⚪"}</span></div>`;
}
function fieldBattle(showFoe){
  const f=$("field");f.innerHTML="";const c=CHAPTERS[Math.min(S.ch,CHAPTERS.length-1)];
  f.className="field "+(S.ch>=CHAPTERS.length?"day":c.bg);
  const me=el("div","sprite me",STAGES[stageIdx()].ico);me.id="spMe";f.append(me);
  f.append(hud("me","カブーン","Lv"+level(),S.hp,maxHp()));
  if(showFoe&&S.foe){const foe=el("div","sprite foe",S.foe.ico);foe.id="spFoe";f.append(foe);f.append(hud("foe",S.foe.name,"",S.foe.hp,S.foe.max,S.foe))}
}
function fieldGrowth(idx,evolving,bg){
  const f=$("field");f.innerHTML="";f.className="field "+(bg||"day");
  f.append(el("div","glow"));
  const sp=el("div","sprite center"+(evolving?" evolve":""),STAGES[idx].ico);sp.id="spMe";sp.style.fontSize=Math.min(6,4.2+level()*0.08)+"rem";f.append(sp);
  const path=el("div","path");
  STAGES.forEach((st,i)=>{if(i)path.append(el("i","","→"));path.append(el("span",i<idx?"done":i===idx?"now":"",st.ico))});
  f.append(path);
}
function filebtn(html,accept,multiple,onFiles){const lab=el("label","filebtn",html);const fi=el("input");fi.type="file";fi.accept=accept;if(multiple)fi.multiple=true;
  fi.onchange=e=>{const fs=Array.from(e.target.files||[]);if(fs.length)onFiles(fs);e.target.value=""};lab.append(fi);return lab}
function renderNav(){
  const ready=!!chapterReady();
  document.querySelectorAll(".nav .nb").forEach(b=>{const t=b.dataset.tab;b.classList.toggle("on",t===S.view);b.disabled=!S.name&&t!=="settings";
    if(t==="battle")b.innerHTML=`⚔️ バトル${ready&&S.view!=="battle"?' <span class="bang">！</span>':""}`;
    b.onclick=()=>{if(S.view===t)return;S.view=t;S.sub="menu";S.msg=null;S.line=0;UI.confirm=false;UI.pendingImport=null;UI.exportText=null;sayStop();save();render()}});
}

// ---------- がめん ----------
function render(){renderMain();try{bgmSync()}catch(e){}}
function renderMain(){
  dayRoll();renderNav();
  const box=$("msgbox");box.innerHTML="";
  const msg=el("p","msg");box.append(msg);
  const menu=el("div","menu");box.append(menu);
  const tapBtn=(label,fn)=>{menu.className="menu one";const b=el("button","tap",label);b.onclick=()=>{if(typer){typeNode&&typeNode.click();return}fn()};menu.append(b)};

  if(S.view==="settings")return renderSettings(msg,menu);
  if(!S.name){
    fieldGrowth(0,false);
    typeText(msg,"カブトムシの たまご「カブーン」を もらった！\nそだてる きみの なまえは？");
    menu.className="menu one";const inp=el("input");inp.id="nameInput";inp.placeholder="なまえを いれてね";inp.maxLength=10;
    const b=el("button","wide","ぼうけんを はじめる");b.onclick=()=>{const n=inp.value.trim();if(!n){inp.focus();return}S.name=n;sfx("gain");save();render()};
    inp.addEventListener("keydown",e=>{if(e.key==="Enter")b.click()});menu.append(inp,b);return;
  }
  if(S.view==="growth")return renderGrowth(msg,menu,tapBtn);
  if(S.view==="battle")return renderBattle(msg,menu,tapBtn);
  if(S.view==="diary")return renderDiary(msg,menu);
  S.view="growth";renderMain();
}

// 📈 せいちょう（へや）：きょうの 5つ・レベル・とっくん
function renderGrowth(msg,menu,tapBtn){
  const idx=stageIdx();
  if(S.sess&&S.sess.result)S.sub="result"; // 採点ずみのセッションは、どこから戻っても結果画面
  if(S.sub==="quiz"&&!S.sess)S.sub="menu";
  if(S.sub==="result"&&!(S.sess&&S.sess.result))S.sub="menu";
  if(S.sub==="quiz")return quizScreen(msg,menu,idx,tapBtn);
  if(S.sub==="result")return resultScreen(msg,menu,idx);
  fieldGrowth(idx,false);
  msg.innerHTML=`<div class="gh"><span><b>${esc(S.name)}の カブーン</b>　${STAGES[idx].name}</span><small>🥅 あみ ${S.items.net}</small></div>${levelBar()}${board()}${statRows()}`;
  if(S.msg)msg.append(el("div","note2",esc(S.msg)));
  if(UI.saveErr)msg.append(el("div","note","⚠️ ほぞんが できませんでした。おうちのひとに つたえてね"));
  const allDone=!S.sess&&CATS.every(c=>!canTrain(c));
  if(allDone){
    msg.append(el("div","note","💤 きょうの とっくんは ぜんぶ おわり！ カブーンは おやすみちゅう。また あしたね"));
    menu.className="menu";
    const b1=el("button","wide","⚔️ バトルへ");b1.onclick=()=>{S.view="battle";S.sub="menu";save();render()};
    const b2=el("button","wide","📖 ものがたりへ");b2.onclick=()=>{S.view="diary";S.sub="menu";save();render()};
    menu.append(b1,b2);return;
  }
  msg.append(el("div","note",S.sess?"とっくんの つづきを やろう":"とっくんを えらんで 5もんに こたえよう"));
  menu.className="menu";
  for(const cat of CATS){const k=STAT_OF[cat];let b;
    if(S.sess&&S.sess.cat===cat){b=el("button","",`${CAT[cat].ico} ${CAT[cat].n}の つづきから<small>${S.sess.i+1}もんめ から</small>`);b.onclick=()=>{S.sub="quiz";S.msg=null;UI.lockUntil=Date.now()+OPT_LOCK_MS;sfx("tap");save();render()}}
    else if(S.sess){b=el("button","",`${CAT[cat].ico} ${CAT[cat].n}の とっくん<small>さきに ${CAT[S.sess.cat].n}を おわらせよう</small>`);b.disabled=true}
    else if(!canTrain(cat)){b=el("button","",`${CAT[cat].ico} ${CAT[cat].n}　🌙 おやすみちゅう<small>きょうは ${S.daily.score[cat]??0}もん せいかい。また あしたね</small>`);b.disabled=true}
    else{b=el("button","",`${CAT[cat].ico} ${CAT[cat].n}の とっくん<small>${STAT_ICO[k]} ${STAT_NAME[k]}が あがる　レベル${S.lv[cat]}</small>`);
      b.onclick=()=>{const s=buildSession(cat);if(!s.items.length){S.msg="もんだいが まだ ないみたい";render();return}S.sess=s;S.sub="quiz";S.msg=null;UI.lockUntil=Date.now()+OPT_LOCK_MS;sfx("tap");save();render()}}
    menu.append(b)}
}
function quizScreen(msg,menu,idx,tapBtn){
  const s=S.sess;const it=s.items[s.i];if(!it){S.sub="menu";return render()}
  fieldGrowth(idx,false);
  const dots=`<div class="dots">${s.items.map((_,i)=>`<span class="${i===s.i&&!s.phase?"now":""}">${i<s.res.length?(s.res[i]?"🌸":"⚪"):"⚪"}</span>`).join("")}<small>${s.i+1}もんめ</small></div>`;
  if(s.phase==="after"){
    msg.innerHTML=dots;const p=el("span","tx","");msg.append(p);
    typeText(p,s.msg||"",()=>{msg.append(el("span","cur","▼"))});
    tapBtn("▶ つぎへ",()=>advanceQ());return;
  }
  const tags=(it.chal?'<span class="chal">✨ ちょうせん</span> ':"")+(it.rev?'<span class="chal">🔁 まえに みた もんだい</span>':"");
  let qhtml;
  if(it.t==="listen")qhtml=`<span class="big">🔊</span><span class="ctr">${esc(it.sub||"よく きいて こたえてね")}</span>`;
  else if(it.t==="ico")qhtml=`<span class="qtext">${rich(it.q)}</span>${it.sub?`<span class="ctr note">${esc(it.sub)}</span>`:""}`;
  else{const emojiQ=!hasKana(it.q);qhtml=(emojiQ||it.sub)?`<span class="big">${rich(it.q)}</span><span class="ctr">${esc(it.sub||(s.cat==="flag"?"この こっきは どこの くに？":""))}</span>`:`<span class="qtext">${rich(it.q)}</span>`}
  if(s.pending)qhtml+='<div class="note2">こたえは これだよ。おしてみて！</div>';
  msg.innerHTML=dots+tags+qhtml;
  if(voiceOK()){const sp=el("button","spk","🔊");sp.setAttribute("aria-label","もういちど きく");sp.onclick=()=>sayQ(it);msg.append(sp)}
  if(!s.said){s.said=true;sayQ(it)}
  const iconOpts=it.t==="ico"||it.t==="listen"||it.opts.every(o=>EMOJI_RE.test(o)&&!hasKana(o));
  menu.className="menu "+(iconOpts?"ico3":(it.opts.length===2?"":"one"));
  const locked=!s.pending&&Date.now()<(UI.lockUntil||0);
  it.opts.forEach((o,i)=>{const b=el("button","opt"+(iconOpts?" ico":""),(iconOpts?"":`<span class="no">${i+1}</span>`)+rich(o));
    if(s.pending){if(o===it.a)b.classList.add("right");else{b.classList.add("dim");b.disabled=true}}
    else if(locked)b.disabled=true;
    b.onclick=()=>answerQ(o);menu.append(b)});
  if(locked)setTimeout(()=>{if(S.sess===s&&S.sub==="quiz"&&!s.phase&&!s.pending)document.querySelectorAll("button.opt").forEach(x=>{x.disabled=false;x.classList.add("live")})},Math.max(0,UI.lockUntil-Date.now()));
}
function answerQ(o){const s=S.sess;const it=s.items[s.i];
  if(s.pending){if(o!==it.a)return;s.res.push(false);s.pending=false;s.phase="after";s.msg=`そう、「${it.a}」！`;sfx("tap");sayAns(it,true);save();render();return}
  if(o===it.a){s.res.push(true);s.phase="after";s.msg=`せいかい！ ${STAGE_CHEER[stageIdx()]}`;sfx("ok");sayAns(it,false);save();render();const sp=$("spMe");sp&&sp.classList.add("attack")}
  else{s.pending=true;sfx("ng");say("こたえは これだよ");save();render()}
}
function advanceQ(){const s=S.sess;s.phase=null;s.msg=null;s.said=false;s.i++;
  if(s.i>=s.items.length){const r=finishSession();S.sub="result";sfx(r.ok===5?"evolve":r.ok>0?"gain":"ok")}
  else UI.lockUntil=Date.now()+OPT_LOCK_MS;
  save();render()}
function resultScreen(msg,menu,idx){const s=S.sess;const r=s.result;const k=r.k;
  fieldGrowth(idx,r.ok===5);
  const marks=s.res.map(x=>x?"🌸":"⚪").join("");
  let head;
  if(r.ok===5)head=`<span class="big">${marks}</span><div class="ctr big2">ぜんもん せいかい！ 🎁 おまけ 2</div><div class="ctr">${STAT_ICO[k]} ${STAT_NAME[k]}が ${r.gain} あがった！</div>`;
  else if(r.ok>0)head=`<span class="big">${marks}</span><div class="ctr big2">${r.ok}もん せいかい！${r.ok===4?" あと ひとつで ぜんもん！":""}</div><div class="ctr">${STAT_ICO[k]} ${STAT_NAME[k]}が ${r.gain} あがった！</div>`;
  else head=`<span class="big">💪</span><div class="ctr big2">がんばった！</div><div class="ctr">カブーンは ずっと みてたよ</div>`;
  msg.innerHTML=head+statRows();
  r.notes.forEach(n=>msg.append(el("div","note2",esc(n))));
  msg.append(el("div","note",`きょうの ${CAT[s.cat].n}の とっくんは おしまい。また あしたね`));
  if(!s.resultSaid){s.resultSaid=true;say(r.ok===5?"ぜんもん せいかい！":r.ok>0?`${r.ok}もん せいかい！`:"がんばった！")}
  menu.className="menu one";const b=el("button","wide","せいちょうがめんに もどる");b.onclick=()=>{S.sess=null;S.sub="menu";save();render()};menu.append(b);
}

// ⚔️ バトル：かべ（章）。レベルで現れ、倒すと章が進む。負けあり・損失なし
function renderBattle(msg,menu,tapBtn){
  if(S.ch>=CHAPTERS.length){fieldGrowth(4,false);typeText(msg,`👑 キング カブーン！\n${S.name}と カブーンは ぜんぶの かべを のりこえた！\nそとの せかいは じゅんびちゅう。もうすこし まっててね`);menu.className="menu one";return}
  const c=CHAPTERS[S.ch];
  if(S.sub==="menu"){
    fieldBattle(false);
    if(!chapterReady()){msg.innerHTML=`<span class="big">❔</span><div class="ctr big2">つぎの かべは レベル ${c.lv} で あらわれる</div><div class="ctr note">いまは レベル ${level()}。とっくんで レベルを あげよう</div>`;menu.className="menu one";return}
    const hurt=S.foe&&S.foe.ch===S.ch&&S.foe.hp<S.foe.max;
    msg.innerHTML=`<span class="big">${c.foe.ico}</span><div class="ctr big2">${esc(c.title)}</div><div class="ctr note">${esc(c.place)}${hurt?"　かべの きずは そのまま！":""}</div>`;
    menu.className="menu one";const b=el("button","wide",`▶ ${c.foe.name} に ちょうせん！`);
    b.onclick=()=>{if(!S.foe||S.foe.ch!==S.ch)S.foe=mkFoe(S.ch);S.hp=maxHp();S.msg=`${S.foe.name} が あらわれた！\n★の ボタンを おしてみよう`;S.sub="fight";S.line=0;sfx("tap");say(`${S.foe.name}が あらわれた！ ほしの ボタンを おしてみよう`);save();render()};
    menu.append(b);return;
  }
  if(!S.foe||S.foe.ch!==S.ch){S.sub="menu";return render()}
  if(S.sub==="fight"){
    fieldBattle(true);typeText(msg,S.msg||"カブーンは どうする？");
    menu.className="menu moves";
    for(const k of STATS){const m=moveOf(k);const w=S.foe.weak===k,g=S.foe.guard===k;
      const b=el("button","mv "+k+(w?" star":"")+(g?" shield":""),`<span class="mi">${STAT_ICO[k]}</span><span class="mn">${esc(m.n)}</span><small>いりょく ${power(k)}　<span class="eq">${m.base}＋${STAT_NAME[k]}${S[k]}</span></small>${w?'<span class="bd star">★</span>':""}${g?'<span class="bd shield">🛡️</span>':""}`);
      b.onclick=()=>attack(k);menu.append(b)}
    return;
  }
  if(S.sub==="turn"){
    fieldBattle(true);typeText(msg,S.msg,()=>{msg.append(el("span","cur","▼"))});
    tapBtn("▶ つぎへ",()=>{if(S.foe.hp<=0){S.line=0;S.sub="win"}else if(S.hp<=0){S.sub="lose"}else{S.msg=null;S.sub="fight"}save();render()});return;
  }
  if(S.sub==="lose"){
    fieldBattle(true);typeText(msg,`カブーンは めが まわった……。\nきょうは ここまで。でも ${S.foe.name}の きずは そのまま！\nまた ちょうせん しよう`,()=>{msg.append(el("span","cur","▼"))});
    tapBtn("▶ もどる",()=>{S.hp=maxHp();S.sub="menu";S.msg=null;save();render()});return;
  }
  if(S.sub==="win"){
    fieldBattle(false);const lines=[`${S.foe.name} を のりこえた！`,c.win];const last=S.line>=lines.length-1;
    typeText(msg,lines[Math.min(S.line,lines.length-1)],()=>{msg.append(el("span","cur","▼"))});
    tapBtn(last?(c.evolve!=null?"▶ ？？？":"▶ つぎへ"):"▶ つぎへ",()=>{if(!last)S.line++;else if(c.evolve!=null){S.line=0;S.sub="evolve"}else clearChapter();save();render()});return;
  }
  if(S.sub==="evolve"){
    const from=stageIdx(),to=c.evolve;
    if(S.line===0){fieldGrowth(from,true);sfx("evolve");typeText(msg,"おや……？ カブーンの ようすが……！",()=>{msg.append(el("span","cur","▼"))});tapBtn("▶ つぎへ",()=>{S.line=1;save();render()})}
    else{fieldGrowth(to,true);const mv=STATS.map(k=>`${STAT_ICO[k]} ${esc(moveAt(k,to,S[k]).n)}`).join("　");
      let extra="";if(to===3)extra='<div class="note2">🌳 そとへ でられるように なった！（そとは じゅんびちゅう）</div>';if(to===4)extra='<div class="note2">👑 おうかんには とき と うみ と そら を こえる ちからが ある……（とびらは じゅんびちゅう）</div>';
      msg.innerHTML=`🎉 おめでとう！<br>カブーンは「<b>${STAGES[to].name}</b>」に せいちょうした！<div class="note2">✨ あたらしい わざ 4つ！<br>${mv}</div>${extra}`;
      if(S.line===1){S.line=2;say(`カブーンは ${STAGES[to].name}に せいちょうした！`)}
      menu.className="menu one";const b=el("button","wide","▶ すすむ");b.onclick=()=>{clearChapter();save();render()};menu.append(b)}
    return;
  }
  S.sub="menu";render();
}
function clearChapter(){S.ch++;S.foe=null;S.line=0;S.sub="menu";S.hp=maxHp();S.msg=null}
function attack(k){const f=S.foe;const m=moveOf(k);const mult=multOf(k,f);const dmg=Math.max(1,Math.floor(power(k)*mult));
  f.hp=Math.max(0,f.hp-dmg);let t=`カブーンの ${m.n}！`;
  if(mult>1){t+=`\n★ ばつぐん！！ ${f.name}に ${dmg}の ダメージ！`;const c=CHAPTERS[f.ch];if(c&&c.why&&!f.whySaid&&!f.shift){f.whySaid=true;t+=`\n${c.why}`}}
  else if(mult<1)t+=`\n🛡️ まもられた！ ${f.name}に ${dmg}の ダメージ`;
  else t+=`\n${f.name}に ${dmg}の ダメージ！`;
  if(f.hp>0&&f.shift&&mult>1){const order=STATS.filter(s=>s!==f.guard);const i=order.indexOf(f.weak);f.weak=order[(i+1)%order.length];t+=`\n★が ${STAT_ICO[f.weak]}に うごいた！`}
  if(f.hp>0){S.hp=Math.max(0,S.hp-f.dmg);t+=`\n${f.name}の はんげき！ カブーンに ${f.dmg}の ダメージ！`}
  S.msg=t;S.sub="turn";sfx(mult>1?"batsu":mult<1?"guard":"hit");if(mult>1)say("ばつぐん！");save();render();
  const sp=$("spMe");sp&&sp.classList.add("attack");const fo=$("spFoe");const fl=$("field");
  setTimeout(()=>{fo&&fo.classList.add("hit");if(mult>1&&fl)fl.classList.add("flash")},200);
  if(f.hp>0)setTimeout(()=>{sp&&sp.classList.remove("attack");sp&&sp.classList.add("hit")},700);
}
