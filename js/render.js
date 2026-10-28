// ---------- 描画ぶひん ----------
let typer=null,typeNode=null,typeFull="",typeDoneCb=null;
function typeText(node,text,done){
  if(typer)clearInterval(typer);node.textContent="";typeNode=node;typeFull=text;typeDoneCb=done||null;let i=0;
  if(matchMedia("(prefers-reduced-motion: reduce)").matches){node.textContent=text;done&&done();return}
  typer=setInterval(()=>{i++;node.textContent=text.slice(0,i);if(i>=text.length){clearInterval(typer);typer=null;done&&done()}},28);
}
// 文を全部出す（タイプ中なら true）
function typeFinish(){if(!typer)return false;clearInterval(typer);typer=null;if(typeNode)typeNode.textContent=typeFull;typeDoneCb&&typeDoneCb();return true}
// msgbox のどこを押しても「文を全部出す → つぎへ」になる（ボタンや入力欄の上は除く）。app.js と dev/smoke.html が #msgbox に付ける
function msgboxTap(e){if(e.target&&e.target.closest&&e.target.closest("button,input,label,a,textarea"))return;if(typeFinish())return;if(UI.tapFn){const fn=UI.tapFn;fn()}}
function hasKana(s){return /[ぁ-んァ-ヶa-zA-Z0-9０-９]/.test(stripPic(s))} // 画像トークンの中の英字は数えない
function sayText(it){return typeof it.say==="string"?it.say:(Array.isArray(it.say)?it.say.map(p=>p[0]).join(""):(it.sub||it.q||""))}
function spkBtn(parts,cls){const b=el("button",cls||"spk","🔊");b.setAttribute("aria-label","もういちど きく");b.onclick=()=>say(parts);return b}
function badge(kind,k){return `<span class="bd ${kind}">${kind==="star"?"★":"🛡️"}${STAT_ICO[k]}</span>`}
function hud(cls,name,lv,hp,max,foe){
  const r=max?Math.max(0,hp/max):0;let b="";
  if(foe){if(foe.weak)b+=badge("star",foe.weak);if(foe.guard)b+=badge("shield",foe.guard)}
  return el("div","hud "+cls,`<div class="nm"><span>${esc(name)}</span><span class="lv">${lv}</span></div><div class="hp"><i class="${hpClass(r)}" style="width:${r*100}%"></i></div><div class="num">${Math.max(0,hp)} / ${max}</div>${b?`<div class="bds">${b}</div>`:""}`);
}
function statRows(){
  const mx=Math.max(40,...STATS.map(k=>S[k]))*1.1;
  return `<div class="grow">${STATS.map(k=>`<div class="row"><span>${STAT_ICO[k]} ${STAT_NAME[k]}</span><div class="bar"><i style="width:${Math.min(100,S[k]/mx*100)}%;background:var(--c-${k})"></i></div><span class="n">${S[k]}</span><small class="pw" title="${esc(moveOf(k).n)}">⚔️${power(k)}</small></div>`).join("")}</div>`;
}
function levelBar(){const into=statSum()%LV_DIV;return `<div class="lvbar"><b>Lv${level()}</b><div class="bar"><i style="width:${into/LV_DIV*100}%"></i></div><small>つぎまで あと ${LV_DIV-into}</small></div>`}
function board(){
  const m=CATS.map(c=>{const n=S.daily.done[c]||0;const sc=S.daily.score[c];return `<span class="slot${n?" on":""}">${CAT[c].ico}${n?(sc===0?"💪":"✅"):"⚪"}</span>`}).join("");
  return `<div class="board"><small>きょうの 5つ</small>${m}<span class="sep">｜</span><span class="slot${S.daily.diary?" on":""}">📝${S.daily.diary?"✅":"⚪"}</span></div>`;
}
function kabunHtml(idx){const st=STAGES[idx];return spriteHtml(st.id,st.ico)}
function fieldBattle(showFoe){
  const f=$("field");f.innerHTML="";f.onclick=null;delete f.dataset.map;const c=CHAPTERS[Math.min(S.ch,CHAPTERS.length-1)];
  const inRoom=S.ch<CHAPTERS.length&&c.place==="へや"; // 第1〜6話は虫かごの中で起きる
  f.className="field "+(S.ch>=CHAPTERS.length?"day":inRoom?"cage "+c.bg:c.bg);
  if(inRoom)cageDeco(f);
  const me=el("div","sprite me",kabunHtml(stageIdx()));me.id="spMe";f.append(me);
  f.append(hud("me","カブーン","Lv"+level(),S.hp,maxHp()));
  if(showFoe&&S.foe){const foe=el("div","sprite foe",spriteHtml(S.foe.id,S.foe.ico));foe.id="spFoe";f.append(foe);f.append(hud("foe",S.foe.name,"",S.foe.hp,S.foe.max,S.foe))}
}
// 虫かごの飾り（きのえだ・はっぱ・ゼリー）
function cageDeco(f){f.append(el("span","deco log","🪵"),el("span","deco leaf","🍃"),el("span","deco jelly","🍮"))}
function fieldGrowth(idx,evolving,bg){
  const f=$("field");f.innerHTML="";f.onclick=null;delete f.dataset.map;const cage=!bg&&idx<3; // たまご・ようちゅう・さなぎ は虫かごの中。せいちゅう からは そと
  f.className="field "+(bg||(cage?"cage":"day"));
  f.append(el("div","glow"));if(cage)cageDeco(f);
  const sp=el("div","sprite center"+(evolving?" evolve":""),kabunHtml(idx));sp.id="spMe";sp.style.fontSize=Math.min(6,4.2+level()*0.08)+"rem";f.append(sp);
  const path=el("div","path");
  STAGES.forEach((st,i)=>{if(i)path.append(el("i","","→"));path.append(el("span",i<idx?"done":i===idx?"now":"",st.ico))});
  f.append(path);
}
function filebtn(html,accept,multiple,onFiles){const lab=el("label","filebtn",html);const fi=el("input");fi.type="file";fi.accept=accept;if(multiple)fi.multiple=true;
  fi.onchange=e=>{const fs=Array.from(e.target.files||[]);if(fs.length)onFiles(fs);e.target.value=""};lab.append(fi);return lab}
function renderNav(){
  const ready=!!chapterReady();
  document.querySelectorAll(".nav .nb").forEach(b=>{const t=b.dataset.tab;b.classList.toggle("on",t===S.view);b.disabled=!S.name&&!["settings","growth"].includes(t);
    if(t==="battle")b.innerHTML=`${stageIdx()>=3?"🌳 そと":"⚔️ バトル"}${ready&&S.view!=="battle"?' <span class="bang">！</span>':""}`;
    b.onclick=()=>{if(S.view===t&&!UI.replay)return;S.view=t;S.sub="menu";UI.walking=false;S.msg=null;S.line=0;UI.confirm=false;UI.pendingImport=null;UI.exportText=null;UI.replay=false;UI.introSaid=false;UI.sayPrefix=null;sayStop();save();render()}});
}

// ---------- がめん ----------
function render(){renderMain();try{bgmSync()}catch(e){}}
function renderMain(){
  if(typer){clearInterval(typer);typer=null;typeDoneCb=null} // 前の画面のタイプ演出が残っていると、次の画面の最初のタップを食ってしまう
  dayRoll();renderNav();UI.tapFn=null;
  const box=$("msgbox");box.innerHTML="";
  const msg=el("p","msg");box.append(msg);
  const menu=el("div","menu");box.append(menu);
  const tapBtn=(label,fn)=>{menu.className="menu one";UI.tapFn=fn;const b=el("button","tap",label);b.onclick=()=>{if(typeFinish())return;fn()};menu.append(b)};

  if(S.view==="settings")return renderSettings(msg,menu);
  if(UI.replay||!S.flags.intro)return renderIntro(msg,menu,tapBtn);
  if(!S.name)return nameSelect(msg,menu,"この たまごを そだてる きみの なまえは？");
  if(S.view==="growth")return renderGrowth(msg,menu,tapBtn);
  if(S.view==="battle")return renderBattle(msg,menu,tapBtn);
  if(S.view==="diary")return renderDiary(msg,menu);
  S.view="growth";renderMain();
}

// 📖 はじまりの おはなし：初回だけ（UI.replay で読み返し）。タップで1枚ずつ、途中で なまえ を えらぶ
function fieldScene(bg,ico,sc){const f=$("field");f.innerHTML="";f.onclick=null;delete f.dataset.map;f.className="field "+bg;f.append(el("div","glow"));
  if(sc&&sc.family){const row=el("div","famrow");const kids=Math.max(1,Math.min(KIDS_MAX,(S.kids||[]).length||2));
    const ids=["papa","mama",...Array.from({length:kids},(_,i)=>"kid"+(i+1))];
    ids.forEach(id=>row.append(el("div","sprite fam",spriteHtml(id))));f.append(row);return}
  const sp=el("div","sprite center",sc&&sc.char?spriteHtml(sc.char,ico):ico);sp.id="spMe";f.append(sp)}
// なまえ を えらぶ：⚙️ で登録した きょうだいの なまえ がボタンに並ぶ。まだ無ければ おうちのひとが入力する（入力した なまえ は登録される）
function nameSelect(msg,menu,text){
  fieldScene("diary","🏠");msg.innerHTML=`<span class="qtext">${esc(text)}</span>`;
  if(!UI.introSaid&&say(text))UI.introSaid=true;
  if(voiceOK())msg.append(spkBtn(text));
  menu.className="menu";
  const pick=n=>{S.name=n;if(!S.kids.includes(n)&&S.kids.length<KIDS_MAX)S.kids.push(n);S.intro=(S.intro||0)+1;UI.introSaid=false;UI.sayPrefix=`${n}、よろしくね！`;sfx("gain");save();render()};
  for(const n of S.kids){const b=el("button","wide big2",esc(n));b.onclick=()=>pick(n);menu.append(b)}
  if(S.kids.length<KIDS_MAX){
    const inp=el("input");inp.id="nameInput";inp.placeholder=S.kids.length?"ほかの なまえ":"なまえを いれてね";inp.maxLength=8;inp.style.gridColumn="1/-1";
    const b=el("button","wide",S.kids.length?"この なまえで はじめる":"ぼうけんを はじめる");b.style.gridColumn="1/-1";b.onclick=()=>{const n=inp.value.trim();if(!n){inp.focus();return}pick(n)};
    inp.addEventListener("keydown",e=>{if(e.key==="Enter")b.click()});menu.append(inp,b);
  }
  msg.append(el("div","note","きょうだいの なまえは ⚙️ の「かぞくの なまえ」で とうろく・へんこう できます（この端末にだけ保存）"));
}
function introDone(){S.flags.intro=true;S.intro=0;UI.replay=false;UI.introSaid=false;UI.sayPrefix=null;S.view="growth";S.sub="menu";sayStop();save();render()}
function renderIntro(msg,menu,tapBtn){
  const i=Math.min(Math.max(S.intro||0,0),INTRO.length-1);const sc=INTRO[i];
  if(sc.name){if(!UI.replay)return nameSelect(msg,menu,sc.t);S.intro=i+1;return renderMain()} // 読み返しのときだけ なまえ の場面を飛ばす
  fieldScene(sc.bg,sc.ico,sc);
  const text=sc.t.replace(/\{name\}/g,S.name||"きみ").replace(/\{family\}/g,familyLine());
  const parts=UI.sayPrefix?[[UI.sayPrefix,"ja"],[text,"ja"]]:text;
  typeText(msg,text,()=>{msg.append(el("span","cur","▼"))});
  if(!UI.introSaid&&say(parts)){UI.introSaid=true;UI.sayPrefix=null}
  const f=$("field");if(voiceOK())f.append(spkBtn(text,"spk fld"));
  const last=i>=INTRO.length-1;
  tapBtn(last?"▶ ぼうけんの はじまり！":"▶ つぎへ",()=>{
    if(!UI.introSaid&&voiceOK()&&say(parts)){UI.introSaid=true;UI.sayPrefix=null;return} // 起動直後で読めなかった1枚目は、最初のタップで読むだけ
    UI.introSaid=false;if(last)introDone();else{S.intro=i+1;save();render()}});
  const skip=el("button","skip","とばす");skip.onclick=()=>{UI.introSaid=false;UI.sayPrefix=null;sayStop();if(!S.name){S.intro=INTRO.findIndex(s=>s.name);save();render()}else introDone()};f.append(skip);
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
    const t="きょうの とっくんは ぜんぶ おわり！ カブーンは おやすみちゅう。また あしたね";
    msg.append(el("div","note","💤 "+t));if(UI.doneSaid!==S.daily.d&&say(t))UI.doneSaid=S.daily.d;
    menu.className="menu";
    const b1=el("button","wide","⚔️ バトルへ");b1.onclick=()=>{S.view="battle";S.sub="menu";save();render()};
    const b2=el("button","wide","📖 ものがたりへ");b2.onclick=()=>{S.view="diary";S.sub="menu";save();render()};
    menu.append(b1,b2);return;
  }
  msg.append(el("div","note",S.sess?"とっくんの つづきを やろう":"とっくんを えらんで 5もんに こたえよう"));
  menu.className="menu one";
  for(const cat of CATS){const k=STAT_OF[cat];let b;
    if(S.sess&&S.sess.cat===cat){b=el("button","",`${CAT[cat].ico} ${CAT[cat].n}の つづきから<small>${S.sess.i+1}もんめ から</small>`);b.onclick=()=>{S.sub="quiz";S.msg=null;S.sess.said=false;UI.lockUntil=Date.now()+OPT_LOCK_MS;sfx("tap");save();render()}}
    else if(S.sess){b=el("button","",`${CAT[cat].ico} ${CAT[cat].n}の とっくん<small>さきに ${CAT[S.sess.cat].n}を おわらせよう</small>`);b.disabled=true}
    else if(!canTrain(cat)){b=el("button","",`${CAT[cat].ico} ${CAT[cat].n}　🌙 おやすみちゅう<small>きょうは ${S.daily.score[cat]??0}もん せいかい。また あしたね</small>`);b.classList.add("rest");b.onclick=()=>{say(`${CAT[cat].n}は きょうは おしまい。また あしたね`);sfx("tap")}}
    else{b=el("button","",`${CAT[cat].ico} ${CAT[cat].n}の とっくん<small>${STAT_ICO[k]} ${STAT_NAME[k]}が あがる</small>`);
      b.onclick=()=>{const s=buildSession(cat);if(!s.items.length){S.msg="もんだいが まだ ないみたい";render();return}S.sess=s;S.sub="quiz";S.msg=null;UI.lockUntil=Date.now()+OPT_LOCK_MS;sfx("tap");save();render()}}
    menu.append(b)}
}
function quizScreen(msg,menu,idx,tapBtn){
  const s=S.sess;const it=s.items[s.i];if(!it){S.sub="menu";return renderMain()}
  fieldGrowth(idx,false);
  const dots=`<div class="dots">${s.items.map((_,i)=>`<span class="${i===s.i&&!s.phase?"now":""}">${i<s.res.length?(s.res[i]?"🌸":"⚪"):"⚪"}</span>`).join("")}<small>${s.i+1}もんめ</small></div>`;
  if(s.phase==="after"){
    msg.innerHTML=dots;msg.append(el("span","tx big2",rich(s.msg||"")),el("span","cur","▼"));
    tapBtn("▶ つぎへ",()=>advanceQ());return;
  }
  const tags=(it.chal?'<span class="chal">✨ ちょうせん</span> ':"")+(it.rev?'<span class="chal">🔁 まえに みた もんだい</span>':"");
  const canHear=voiceOK();
  let qhtml;
  if(it.t==="listen")qhtml=canHear?`<span class="big">🔊</span><span class="ctr">${esc(it.sub||"よく きいて こたえてね")}</span>`:`<span class="qtext">${esc(sayText(it))}</span><span class="ctr note">（よみあげが つかえないので もじで だしています）</span>`;
  else if(it.t==="ico")qhtml=`<span class="qtext">${rich(it.q)}</span>${it.sub?`<span class="ctr note">${esc(it.sub)}</span>`:""}`;
  else{const emojiQ=!hasKana(it.q);qhtml=(emojiQ||it.sub)?`<span class="big">${rich(it.q)}</span><span class="ctr">${esc(it.sub||(s.cat==="flag"?"この こっきは どこの くに？":""))}</span>`:`<span class="qtext">${rich(it.q)}</span>`}
  if(s.pending)qhtml+='<div class="note2">こたえは これだよ。おしてみて！</div>';
  msg.innerHTML=dots+tags+qhtml;
  if(canHear){const sb=spkBtn(null,"spk");sb.onclick=()=>sayQ(it);msg.append(sb)} // append() は何も返さないので、先にボタンを作ってから置く
  if(!s.said&&sayQ(it))s.said=true;
  const iconOpts=it.t==="ico"||it.t==="listen"||it.opts.every(o=>isPic(o)&&!hasKana(o));
  const numbered=!iconOpts&&numberedOpts(it);
  menu.className="menu "+(iconOpts?"ico3":(it.opts.length===2?"":"one"));
  const locked=!s.pending&&Date.now()<(UI.lockUntil||0);
  it.opts.forEach((o,i)=>{const b=el("button","opt"+(iconOpts?" ico":""),(numbered?`<span class="no">${i+1}</span>`:"")+rich(o));
    if(s.pending){if(o===it.a)b.classList.add("right");else{b.classList.add("dim");b.disabled=true}}
    else if(locked)b.disabled=true;
    b.onclick=()=>answerQ(o);menu.append(b)});
  if(locked)setTimeout(()=>{if(S.sess===s&&S.sub==="quiz"&&!s.phase&&!s.pending)document.querySelectorAll("button.opt").forEach(x=>{x.disabled=false;x.classList.add("live")})},Math.max(0,UI.lockUntil-Date.now()));
}
function answerQ(o){const s=S.sess;if(!s)return render();const it=s.items[s.i];if(!it)return render();
  const emojiAns=isPic(it.a)&&!hasKana(it.a);
  if(s.pending){if(o!==it.a)return;s.res.push(false);s.pending=false;s.phase="after";s.msg=emojiAns?"そう、これ！":`そう、「${it.a}」！`;sfx("tap");sayAns(it,true);save();render();return}
  if(o===it.a){s.res.push(true);s.phase="after";s.msg=`せいかい！ ${STAGE_CHEER[stageIdx()]}`;sfx("ok");sayAns(it,false);save();render();const sp=$("spMe");sp&&sp.classList.add("attack")}
  else{s.pending=true;sfx("ng");say("こたえは これだよ");save();render()}
}
function advanceQ(){const s=S.sess;if(!s)return render();s.phase=null;s.msg=null;s.said=false;s.i++;
  if(s.i>=s.items.length){const r=finishSession();S.sub="result";sfx(r.ok===5?"evolve":r.ok>0?"gain":"ok")}
  else UI.lockUntil=Date.now()+OPT_LOCK_MS;
  save();render()}
function resultScreen(msg,menu,idx){const s=S.sess;const r=s.result;const k=r.k;
  fieldGrowth(idx,r.ok===5);
  const marks=s.res.map(x=>x?"🌸":"⚪").join("");
  let head,line;
  if(r.ok===5){line="ぜんもん せいかい！";head=`<span class="big">${marks}</span><div class="ctr big2">ぜんもん せいかい！ 🎁 おまけ 2</div><div class="ctr">${STAT_ICO[k]} ${STAT_NAME[k]}が ${r.gain} あがった！</div>`}
  else if(r.ok>0){line=`${r.ok}もん せいかい！${r.ok===4?" あと ひとつで ぜんもん！":""}`;head=`<span class="big">${marks}</span><div class="ctr big2">${line}</div><div class="ctr">${STAT_ICO[k]} ${STAT_NAME[k]}が ${r.gain} あがった！</div>`}
  else{line="がんばった！ カブーンは ずっと みてたよ";head=`<span class="big">💪</span><div class="ctr big2">がんばった！</div><div class="ctr">カブーンは ずっと みてたよ</div>`}
  msg.innerHTML=head+statRows();
  r.notes.forEach(n=>msg.append(el("div","note2",esc(n))));
  const again=canTrain(s.cat);const tail=again?`${CAT[s.cat].n}の とっくん、もう1かい できるよ`:`きょうの ${CAT[s.cat].n}の とっくんは おしまい。また あしたね`;
  msg.append(el("div","note",tail));
  const parts=[[line,"ja"],...r.notes.map(n=>[n.replace(/^[^ぁ-んァ-ヶ一-龥a-zA-Z0-9]+/,""),"ja"]),[tail,"ja"]];
  if(voiceOK())msg.append(spkBtn(parts));
  if(!s.resultSaid&&say(parts))s.resultSaid=true;
  menu.className="menu one";const b=el("button","wide","せいちょうがめんに もどる");b.onclick=()=>{S.sess=null;S.sub="menu";save();render()};menu.append(b);
}

// ⚔️ バトル：かべ（章）。レベルで現れ、倒すと章が進む。負けあり・損失なし
function renderBattle(msg,menu,tapBtn){
  const c=CHAPTERS[S.ch];
  // 倒したあとに画面を離れても、勝ちの場面から再開する（章の確定を取りこぼさない）
  if(S.foe&&S.foe.ch===S.ch&&S.foe.hp<=0&&!["turn","win","evolve"].includes(S.sub)){S.sub="win";S.line=0}
  // せいちゅう以降：戦っていないときは そと（outside.js）。ぬし は そとの 🪧 から始まる
  const fighting=S.foe&&S.foe.ch===S.ch&&["fight","turn","lose","win","evolve"].includes(S.sub);
  if(stageIdx()>=3&&!fighting)return renderOut(msg,menu,tapBtn);
  if(S.sub==="menu"){
    if(S.hp<=0)S.hp=maxHp();
    fieldBattle(false);
    if(!chapterReady()){msg.innerHTML=`<span class="big">❔</span><div class="ctr big2">つぎの かべは レベル ${c.lv} で あらわれる</div><div class="ctr note">いまは レベル ${level()}。とっくんで レベルを あげよう</div>`;menu.className="menu one";return}
    const hurt=S.foe&&S.foe.ch===S.ch&&S.foe.hp<S.foe.max;
    msg.innerHTML=`<span class="big">${c.foe.ico}</span><div class="ctr big2">${esc(c.title)}</div><div class="ctr note">${esc(c.place)}${hurt?"　かべの きずは そのまま！":""}</div>`;
    menu.className="menu one";const b=el("button","wide",`▶ ${c.foe.name} に ちょうせん！`);
    b.onclick=startFight;
    menu.append(b);return;
  }
  if(!S.foe||S.foe.ch!==S.ch){S.sub="menu";return renderMain()}
  if(S.sub==="fight"){
    fieldBattle(true);typeText(msg,S.msg||"カブーンは どうする？");
    menu.className="menu moves";
    for(const k of STATS){const m=moveOf(k);const w=S.foe.weak===k,g=S.foe.guard===k;
      const b=el("button","mv "+k+(w?" star":"")+(g?" shield":""),`<span class="mi">${STAT_ICO[k]}</span><span class="mn">${esc(m.n)}</span><small>いりょく ${power(k)}</small>${w?'<span class="bd star">★</span>':""}${g?'<span class="bd shield">🛡️</span>':""}`);
      b.onclick=()=>attack(k);menu.append(b)}
    return;
  }
  if(S.sub==="turn"){
    fieldBattle(true);typeText(msg,S.msg,()=>{msg.append(el("span","cur","▼"))});
    tapBtn("▶ つぎへ",()=>{if(S.foe.hp<=0){S.line=0;S.sub="win"}else if(S.hp<=0){S.sub="lose"}else{S.msg=null;S.sub="fight"}save();render()});return;
  }
  if(S.sub==="lose"){
    fieldBattle(true);const t=`カブーンは めが まわった……。\nきょうは ここまで。でも ${S.foe.name}の きずは そのまま！\nまた ちょうせん しよう`;
    typeText(msg,t,()=>{msg.append(el("span","cur","▼"))});say(t.replace(/\n/g," "));
    tapBtn("▶ もどる",()=>{S.hp=maxHp();S.sub="menu";S.msg=null;save();render()});return;
  }
  if(S.sub==="win"){
    fieldBattle(false);const lines=[`${S.foe.name} を のりこえた！`,c.win];const last=S.line>=lines.length-1;const line=lines[Math.min(S.line,lines.length-1)];
    typeText(msg,line,()=>{msg.append(el("span","cur","▼"))});say(line);
    tapBtn(last?(c.evolve!=null?"▶ ？？？":"▶ つぎへ"):"▶ つぎへ",()=>{if(!last)S.line++;else if(c.evolve!=null){S.line=0;S.sub="evolve"}else clearChapter();save();render()});return;
  }
  if(S.sub==="evolve"){
    const from=stageIdx(),to=c.evolve;
    if(S.line===0){fieldGrowth(from,true);sfx("evolve");const t="おや……？ カブーンの ようすが……！";typeText(msg,t,()=>{msg.append(el("span","cur","▼"))});say(t);tapBtn("▶ つぎへ",()=>{S.line=1;save();render()})}
    else{fieldGrowth(to,true);const mv=STATS.map(k=>`${STAT_ICO[k]} ${esc(moveAt(k,to,S[k]).n)}`).join("　");
      let extra="";if(to===3)extra='<div class="note2">🌳 そとへ でられるように なった！ 「そと」の タブで くさむらを たんけんしよう</div>';if(to===4)extra='<div class="note2">👑 おうかんには とき と うみ と そら を こえる ちからが ある……（とびらは じゅんびちゅう）</div>';
      msg.innerHTML=`🎉 おめでとう！<br>カブーンは「<b>${STAGES[to].name}</b>」に せいちょうした！<div class="note2">✨ あたらしい わざ 4つ！<br>${mv}</div>${extra}`;
      if(S.line===1){S.line=2;say(`おめでとう！ カブーンは ${STAGES[to].name}に せいちょうした！ あたらしい わざが 4つ！`)}
      menu.className="menu one";const b=el("button","wide","▶ すすむ");b.onclick=()=>{clearChapter();save();render()};menu.append(b)}
    return;
  }
  S.sub="menu";renderMain();
}
function clearChapter(){S.ch++;S.foe=null;S.line=0;S.sub="menu";S.hp=maxHp();S.msg=null}
// いまの章の ぬし と戦い始める（へや の「ちょうせん」ボタンと、そと の 🪧 から）
function startFight(){if(!chapterReady())return render();if(!S.foe||S.foe.ch!==S.ch)S.foe=mkFoe(S.ch);S.hp=maxHp();S.msg=`${S.foe.name} が あらわれた！\n★の ボタンを おしてみよう`;S.sub="fight";S.line=0;sfx("tap");say(`${S.foe.name}が あらわれた！ ほしの ボタンを おしてみよう`);save();render()}
function attack(k){const f=S.foe;if(!f)return render();const m=moveOf(k);const mult=multOf(k,f);const dmg=Math.max(1,Math.floor(power(k)*mult));
  f.hp=Math.max(0,f.hp-dmg);let t=`カブーンの ${m.n}！`;
  if(mult>1){t+=`\n★ ばつぐん！！ ${f.name}に ${dmg}の ダメージ！`;const c=CHAPTERS[f.ch];if(c&&c.why&&!f.whySaid&&!f.shift){f.whySaid=true;t+=`\n${c.why}`}}
  else if(mult<1)t+=`\n🛡️ まもられた！ ${f.name}に ${dmg}の ダメージ`;
  else t+=`\n${f.name}に ${dmg}の ダメージ！`;
  if(f.hp>0&&f.shift&&mult>1){const order=STATS.filter(s=>s!==f.guard);const i=order.indexOf(f.weak);f.weak=order[(i+1)%order.length];t+=`\n★が ${STAT_ICO[f.weak]}に うごいた！`}
  if(f.hp>0){S.hp=Math.max(0,S.hp-f.dmg);t+=`\n${f.name}の はんげき！ カブーンに ${f.dmg}の ダメージ！`}
  S.msg=t;S.sub="turn";if(mult>1)say("ばつぐん！");else if(mult<1)say("まもられた！");save();render();
  playFx(k,m.n,mult,f.hp>0);
}
// わざの演出：技名の札 → カブーンが突っ込む → ステータスごとの効果（💪 ぶつかる／💡 ひかりの線／💨 はっぱと かぜ／💗 おんぷ）→ 相手がゆれる → 反撃
function playFx(k,name,mult,foeAlive){
  const f=$("field"),me=$("spMe"),fo=$("spFoe");if(!f||!me||!fo)return;
  const r=f.getBoundingClientRect(),a=me.getBoundingClientRect(),b=fo.getBoundingClientRect();
  const x1=a.left-r.left+a.width/2,y1=a.top-r.top+a.height/2,x2=b.left-r.left+b.width/2,y2=b.top-r.top+b.height/2;
  const spawn=(cls,txt,x,y,ms,dx,dy)=>{const e=el("div","fx "+cls,txt);e.style.left=x+"px";e.style.top=y+"px";if(dx!=null){e.style.setProperty("--dx",dx+"px");e.style.setProperty("--dy",dy+"px")}f.append(e);setTimeout(()=>e.remove(),ms);return e};
  const after=(ms,fn)=>setTimeout(fn,ms);
  const banner=spawn("name",esc(name),0,0,900);banner.style.left="50%";banner.style.top="14px";
  me.classList.add("attack");
  const hitFx=()=>{fo.classList.add("hit");sfx(mult>1?"batsu":mult<1?"guard":"hit");if(mult>1){f.classList.add("flash");spawn("burst","💥",x2,y2,500)}if(mult<1)spawn("shield","🛡️",x2,y2-10,600)};
  if(k==="str"){after(220,()=>{spawn("burst","💥",x2,y2,500);f.classList.add("quake");hitFx()});after(650,()=>f.classList.remove("quake"))}
  else if(k==="wise"){const dx=x2-x1,dy=y2-y1;const beam=spawn("beam","",x1,y1,450);beam.style.width=Math.hypot(dx,dy)+"px";beam.style.transform=`translateY(-50%) rotate(${Math.atan2(dy,dx)}rad)`;
    after(220,()=>{spawn("sparkle","✨",x2,y2,600);spawn("sparkle d2","✨",x2+22,y2-18,700);spawn("sparkle d2","✨",x2-18,y2+14,700);hitFx()})}
  else if(k==="world"){for(let i=0;i<5;i++)after(i*70,()=>spawn("leaf",i%2?"🍃":"💨",x1,y1,700,x2-x1,y2-y1-18*i));after(420,hitFx)}
  else{for(let i=0;i<4;i++)after(i*90,()=>spawn("noteup",i%2?"💗":"🎵",x1+i*10,y1,800,x2-x1,y2-y1-30));after(480,hitFx)}
  if(foeAlive)after(950,()=>{fo.classList.add("lunge");after(180,()=>{me.classList.remove("attack");me.classList.add("hit");spawn("burst small","💢",x1+10,y1-16,450);sfx("hit")})});
}
