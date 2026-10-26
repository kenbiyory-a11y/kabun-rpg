// ⚙️ おうちのひと むけ：暗証番号の奥に、せいせき・1日のかず・おと・かぞくの なまえ・バックアップ・開発用
// 暗証番号は S の外（localStorage "kabun-pin"）。バックアップ・読み込み・全消去に巻き込まない
const PIN_KEY="kabun-pin", PIN_RESET_KEY="kabun-pin-reset", PIN_RESET_MS=24*60*60*1000;
function pinGet(){try{return localStorage.getItem(PIN_KEY)||""}catch(e){return ""}}
function pinSet(v){try{if(v)localStorage.setItem(PIN_KEY,v);else localStorage.removeItem(PIN_KEY)}catch(e){}}
function pinResetAt(){try{const v=parseInt(localStorage.getItem(PIN_RESET_KEY)||"0",10);return v>0?v:0}catch(e){return 0}}
function pinResetSet(ts){try{if(ts)localStorage.setItem(PIN_RESET_KEY,String(ts));else localStorage.removeItem(PIN_RESET_KEY)}catch(e){}}
// 「ばんごうを わすれた」から24時間たっていたら、番号を消す（子どもがすぐに突破できず、親は端末だけで復旧できる）
function pinResetCheck(){const at=pinResetAt();if(at&&Date.now()>=at){pinSet("");pinResetSet(0);return true}return false}
function unlocked(){return !pinGet()||Date.now()<(UI.unlockUntil||0)}
function fmtTime(ts){const d=new Date(ts);return `${d.getMonth()+1}/${d.getDate()} ${d.getHours()}:${String(d.getMinutes()).padStart(2,"0")}`}
function keypad(menu,onDigit,onDel,onBack){menu.className="menu keypad";
  ["1","2","3","4","5","6","7","8","9"].forEach(d=>{const b=el("button","",d);b.onclick=()=>onDigit(d);menu.append(b)});
  const del=el("button","","けす");del.onclick=onDel;const z=el("button","","0");z.onclick=()=>onDigit("0");const back=el("button","","もどる");back.onclick=onBack;menu.append(del,z,back)}
function pinDots(){return `<div class="pin">${"●".repeat(UI.pinBuf.length)}${"○".repeat(Math.max(0,4-UI.pinBuf.length))}</div>`}
function pinScreen(msg,menu){
  if(pinResetCheck()){S.msg="ばんごうを けしました（24じかん たちました）";return render()}
  const locked=Date.now()<(UI.pinLockUntil||0);const resetAt=pinResetAt();
  msg.innerHTML=`<b>🔒 おうちのひとの ばんごう</b>${pinDots()}${locked?'<div class="note">すこし まってね</div>':(S.msg?`<div class="note">${esc(S.msg)}</div>`:"")}${resetAt?`<div class="note">⏳ ${fmtTime(resetAt)} に ばんごうが きえます（⚙️ に はいれたら とりけせます）</div>`:""}`;
  if(locked)setTimeout(()=>{if(S.view==="settings"&&!unlocked())render()},Math.max(50,UI.pinLockUntil-Date.now()));
  keypad(menu,d=>{if(Date.now()<(UI.pinLockUntil||0)){render();return}if(UI.pinBuf.length>=4)return;UI.pinBuf+=d;
      if(UI.pinBuf.length===4){if(UI.pinBuf===pinGet()){UI.unlockUntil=Date.now()+10*60*1000;UI.pinFail=0;UI.pinBuf="";S.msg=null;sfx("ok")}else{UI.pinFail++;UI.pinBuf="";S.msg="ちがうみたい";if(UI.pinFail>=5){UI.pinFail=0;UI.pinLockUntil=Date.now()+60*1000}}}
      render()},
    ()=>{UI.pinBuf=UI.pinBuf.slice(0,-1);render()},
    ()=>{UI.pinBuf="";S.msg=null;S.view="growth";S.sub="menu";save();render()});
  if(!resetAt){const f=el("button","","ばんごうを わすれた<small>24時間後に番号が消えます。データは消えません。それまでに ⚙️ に入れたら取り消せます</small>");f.style.gridColumn="1/-1";
    f.onclick=()=>{pinResetSet(Date.now()+PIN_RESET_MS);S.msg=null;render()};menu.append(f)}
}
// 暗証番号が無いときの、全消去・読み込みの前の かくにん（4歳には解けない計算）
function parentCheck(msg,menu,next){
  msg.append(el("div","note","おうちのひとの かくにんです。こたえを いれてください：7 × 8 ＝ ？"));
  const inp=el("input");inp.type="number";inp.id="pcheck";inp.placeholder="こたえ";
  const b=el("button","wide","すすむ");b.onclick=()=>{if(inp.value.trim()==="56"){UI.pcheckUntil=Date.now()+5*60*1000;S.sub=next;save();render()}else{inp.value="";inp.focus()}};
  const x=el("button","wide","やめる");x.onclick=()=>{S.sub="backup";save();render()};
  inp.addEventListener("keydown",e=>{if(e.key==="Enter")b.click()});menu.append(inp,b,x);
}
function guarded(next){if(pinGet()||Date.now()<(UI.pcheckUntil||0)){S.sub=next}else{UI.pnext=next;S.sub="pcheck"}save();render()}
function hasKey(k){try{return !!localStorage.getItem(k)}catch(e){return false}}
function renderSettings(msg,menu){
  fieldGrowth(stageIdx(),false);
  if(!unlocked())return pinScreen(msg,menu);
  if(S.sub==="export"&&!UI.exportText)S.sub="menu";
  if(S.sub==="import"&&!UI.pendingImport)S.sub="menu";
  const resetAt=pinResetAt();
  msg.innerHTML=`<b>⚙️ おうちのひと むけ</b><br><span class="note">ひびの記録 ${S.diary.length}こ ／ Lv${level()}・${STAGES[stageIdx()].name}・だい${Math.min(S.ch+1,CHAPTERS.length)}わ ／ 写真 ${PH.size}枚・動画 ${VM.size}本（おもいでシアターはおやすみ中。データは残っています）${UI.quota?"<br>"+UI.quota:""}${pinGet()?"":"<br>🔓 暗証番号が未設定です。子どもがこの画面を開けます（全消去と読み込みの前には計算の確認が入ります）"}${UI.saveErr?"<br>⚠️ 保存に失敗しています（容量不足の可能性）。バックアップを取ってください":""}${UI.loadWarn?"<br>⚠️ 前回のセーブが読めなかったので、ひとつ前のデータで起動しました。壊れたデータは バックアップ → 「こわれたセーブを書き出す」で取り出せます":""}</span>`;
  if(S.msg)msg.append(el("div","note2",esc(S.msg)));
  menu.className="menu one";
  if(UI.busy){msg.append(el("div","","⏳ "+UI.busyText));return}
  const back=()=>{const x=el("button","wide","もどる");x.style.gridColumn="1/-1";x.onclick=()=>{S.sub="menu";S.msg=null;UI.pinBuf="";UI.pinNew="";save();render()};menu.append(x)};
  if(S.sub==="menu"){
    const items=[
      ["📊 せいせき","分野ごとの回数・にがてな問題・つぎの技","stats"],
      ["⏱ 1日の かず",`いま：分野ごと ${S.cap===0?"せいげんなし":S.cap+"かい"}${S.daily.bonus?"（きょうは もう1かい あり）":""}`,"cap"],
      ["🔊 おと",`よみあげ ${S.voice?"オン":"オフ"} ／ こうかおん ${S.se?"オン":"オフ"} ／ BGM ${S.bgmOn?"オン":"オフ"}`,"sound"],
      ["👨‍👩‍👧‍👦 かぞくの なまえ",`${S.kids.length?S.kids.join("・"):"（未登録）"}　いま あそんでいるのは ${S.name||"—"}`,"kids"],
      ["🔒 あんしょうばんごう",pinGet()?(resetAt?`設定ずみ。${fmtTime(resetAt)} に消える予約あり`:"設定ずみ（変更・解除）"):"未設定","pin"],
      ["💾 バックアップ","セーブデータの保存・読み込み・全消去・ひとつ前に戻す","backup"],
      ["🔧 かいはつ","ためしに進める・きょうの分を戻す","dev"]];
    for(const [t,s,sub] of items){const b=el("button","",`${t}<small>${esc(s)}</small>`);b.onclick=()=>{S.sub=sub;S.msg=null;save();render()};menu.append(b)}
    const story=el("button","",`📖 はじまりの おはなし<small>最初に流れるおはなしを読み返す</small>`);story.onclick=()=>{UI.replay=true;S.intro=0;UI.introSaid=false;S.view="growth";S.sub="menu";save();render()};menu.append(story);
    return;
  }
  if(S.sub==="stats"){
    const rows=CATS.map(c=>{const h=S.hist[c];
      const miss=Object.entries(h.miss).sort((a,b)=>b[1]-a[1]).slice(0,3).map(([id,n])=>{const q=qById(c,id);return `${q?rich(qLabel(q)):esc(id)} ×${n}`}).join("、");
      return `<div class="srow"><b>${CAT[c].ico} ${CAT[c].n}</b>　もんだいレベル${S.lv[c]}　${h.n}かい　さいこう ${h.best}/5　さいきん ${h.last.length?h.last.join(" "):"—"}<br><span class="note">ふくしゅうばこ ${S.rev[c].length}もん　もんだい ${poolOf(c).length}もん${miss?"　にがて："+miss:""}</span></div>`}).join("");
    const nxt=STATS.map(k=>{const n=nextMoveInfo(k);return n?`${STAT_ICO[k]}「${esc(n.n)}」まで あと ${n.left}`:null}).filter(Boolean).join("　");
    msg.append(el("div","stats",rows+`<div class="note">${nxt?"つぎの わざ："+nxt:(stageIdx()<3?"せいちゅうに なると わざを おぼえていく":"わざは ぜんぶ おぼえた")}</div><div class="note">もんだいレベル は分野ごとの出題レベル（1〜3）。2回続けて4問以上で上がり、1問以下が2回続くと下がります。</div>`));
    const lvRow=el("div","menu");lvRow.style.gridTemplateColumns="repeat(4,1fr)";
    CATS.forEach(c=>{const b=el("button","",`${CAT[c].ico} Lv${S.lv[c]}<small>タップで 1→2→3→1</small>`);b.onclick=()=>{S.lv[c]=S.lv[c]%3+1;S.hist[c].last=[];save();render()};lvRow.append(b)});
    menu.append(lvRow);back();return;
  }
  if(S.sub==="kids"){
    msg.append(el("div","note",`はじまりの おはなし で えらぶ なまえ です（${KIDS_MAX}人まで、8文字まで）。なまえは この端末とバックアップにだけ保存され、インターネットや GitHub には送られません。きろくと カブーンは きょうだいで いっしょです。`));
    S.kids.forEach((n,i)=>{const row=el("div","menu");row.style.gridTemplateColumns="1fr auto";
      const cur=el("button",S.name===n?"sel":"",`${S.name===n?"✅ ":""}${esc(n)}<small>${S.name===n?"いま あそんでいる":"この なまえで あそぶ"}</small>`);cur.onclick=()=>{S.name=n;save();render()};
      const del=el("button","wide danger","🗑️");del.setAttribute("aria-label","けす");del.onclick=()=>{S.kids.splice(i,1);if(S.name===n)S.name=S.kids[0]||"";save();render()};
      row.append(cur,del);menu.append(row)});
    if(S.kids.length<KIDS_MAX){const inp=el("input");inp.id="kidInput";inp.placeholder="なまえ（ひらがな）";inp.maxLength=8;
      const add=el("button","wide","＋ とうろく");add.onclick=()=>{const n=inp.value.trim();if(!n){inp.focus();return}if(!S.kids.includes(n))S.kids.push(n);save();render()};
      inp.addEventListener("keydown",e=>{if(e.key==="Enter")add.click()});menu.append(inp,add)}
    back();return;
  }
  if(S.sub==="cap"){
    msg.append(el("div","note","分野ごとに1日に何回とっくんできるか。標準は1回。増やすと成長が速くなり、技や進化の時期が早まります。"));
    [[1,"1かい（標準）"],[2,"2かい"],[0,"せいげんなし"]].forEach(([v,t])=>{const b=el("button",S.cap===v?"sel":"",`${S.cap===v?"✅ ":""}${t}`);b.onclick=()=>{S.cap=v;save();render()};menu.append(b)});
    const bonus=el("button",S.daily.bonus?"sel":"",`${S.daily.bonus?"✅ ":""}きょうだけ もう1かい<small>全分野をもう1回だけ解放します（今日だけ）</small>`);bonus.onclick=()=>{S.daily.bonus=!S.daily.bonus;save();render()};menu.append(bonus);
    back();return;
  }
  if(S.sub==="sound"){
    msg.append(el("div","note",`よみあげは端末内蔵の音声を使います（通信なし）。この端末の日本語音声：${VOICE.ja?"あり":"なし"}／英語音声：${VOICE.en?"あり":"なし（英語は日本語の声で読みます）"}。iPhone は消音スイッチがオンだと鳴りません。よみあげをオフにすると「きくだけ」の問題は文字で出ます。`));
    const v=el("button","",`${S.voice?"✅":"⬜"} よみあげ<small>問題文・選択肢・結果を読み上げる</small>`);v.onclick=()=>{S.voice=!S.voice;if(!S.voice)sayStop();save();render()};
    const t=el("button","",`${S.se?"✅":"⬜"} こうかおん<small>正解音・ばつぐん音など</small>`);t.onclick=()=>{S.se=!S.se;save();if(S.se)sfx("ok");render()};
    const b=el("button","",`${S.bgmOn?"✅":"⬜"} BGM<small>ゲームボーイふうの オリジナル曲（へや／バトル／かち）。読み上げ中は小さくなる</small>`);b.onclick=()=>{S.bgmOn=!S.bgmOn;save();if(!S.bgmOn)bgmStop();render()};
    const test=el("button","wide","🔊 ためしに よむ");test.disabled=!voiceOK();test.onclick=()=>say([["こんにちは、カブーンです","ja"],["Hello","en"]]);
    menu.append(v,t,b,test);back();return;
  }
  if(S.sub==="pin"){
    const cur=pinGet();
    msg.append(el("div","note",cur?"新しい番号を4桁入れると変わります。「ばんごうを けす」で解除できます。":"4桁の番号を決めてください。⚙️ を開くときに必要になります。銀行などで使う番号は避けてください。忘れたときは ロック画面の「ばんごうを わすれた」で24時間後に消えます（データは消えません）。"));
    msg.append(el("div","",pinDots()));
    if(UI.pinNew)msg.append(el("div","note","もういちど おなじ ばんごうを いれてください"));
    keypad(menu,d=>{if(UI.pinBuf.length>=4)return;UI.pinBuf+=d;
        if(UI.pinBuf.length===4){if(!UI.pinNew){UI.pinNew=UI.pinBuf;UI.pinBuf=""}else{if(UI.pinNew===UI.pinBuf){pinSet(UI.pinBuf);pinResetSet(0);UI.unlockUntil=Date.now()+10*60*1000;S.msg="ばんごうを せっていしました";S.sub="menu";sfx("ok")}else S.msg="2回の番号がちがいます。もういちど";UI.pinNew="";UI.pinBuf=""}}
        save();render()},
      ()=>{UI.pinBuf=UI.pinBuf.slice(0,-1);render()},
      ()=>{UI.pinBuf="";UI.pinNew="";S.sub="menu";save();render()});
    if(resetAt){const c=el("button","wide",`⏳ ${fmtTime(resetAt)} の「ばんごうを けす」予約を とりけす`);c.style.gridColumn="1/-1";c.onclick=()=>{pinResetSet(0);S.msg="予約を とりけしました";render()};menu.append(c)}
    if(cur){const rm=el("button","wide danger","ばんごうを けす（ロック解除）");rm.style.gridColumn="1/-1";rm.onclick=()=>{pinSet("");pinResetSet(0);UI.pinBuf="";UI.pinNew="";S.msg="ばんごうを けしました";S.sub="menu";save();render()};menu.append(rm)}
    return;
  }
  if(S.sub==="dev"){
    msg.append(el("div","note","ためすためのボタンです。ステータスや章が実際に変わります。"));
    const mk=(t,fn)=>{const b=el("button","wide",t);b.onclick=()=>{fn();save();render()};menu.append(b)};
    mk("🔁 きょうの とっくんを もどす",()=>{S.daily={d:ymd(),done:{},score:{},diary:false,bonus:false,bonusNet:false};S.sess=null;S.msg="きょうの分を もどしました"});
    mk("⬆️ ぜんぶの ちから +10",()=>{const b=snapshot();STATS.forEach(k=>S[k]+=10);S.msg=["+10 しました",...gainNotes(b)].join("\n")});
    mk("🪲 レベル 20 ぶんに する",()=>{const b=snapshot();STATS.forEach(k=>S[k]=Math.max(S[k],38));S.msg=["レベル 20 ぶんに しました（かべ は順に倒す必要があります）",...gainNotes(b)].join("\n")});
    mk("👑 レベル 50 ぶんに する",()=>{const b=snapshot();STATS.forEach(k=>S[k]=Math.max(S[k],98));S.msg=["レベル 50 ぶんに しました",...gainNotes(b)].join("\n")});
    mk("💥 いまの かべを HP 1 にする",()=>{if(chapterReady()){if(!S.foe||S.foe.ch!==S.ch)S.foe=mkFoe(S.ch);S.foe.hp=1;S.msg="かべの HP を 1 にしました"}else S.msg="いまは かべが いません"});
    mk("🥅 あみ +5",()=>{S.items.net=Math.min(NET_MAX,S.items.net+5);S.msg=`あみ ${S.items.net}`});
    back();return;
  }
  if(S.sub==="pcheck"){parentCheck(msg,menu,UI.pnext||"backup");return}
  if(S.sub==="backup"){
    const b1=el("button","","📥 セーブデータを保存（記録だけ・小さい）<small>名前・ステータス・記録の文字。写真や動画は入りません</small>");b1.onclick=()=>exportJson();
    const b2=el("button","","📦 ぜんぶバックアップ（zip）<small>写真・動画・音楽もまとめて1つのzipに。機種変更のときに</small>");b2.onclick=()=>exportZip();
    const b3=el("button","","📂 読み込む（json または zip）<small>保存したファイルを選びます。いまのデータは「ひとつ前」として退避されます</small>");b3.onclick=()=>guarded("importpick");
    const b4=el("button","","✏️ テキストを貼りつけて読み込む");b4.onclick=()=>guarded("paste");
    menu.append(b1,b2,b3,b4);
    if(hasKey(PREV_KEY)){const p=el("button","","↩️ ひとつ前の セーブに もどす<small>全消去・読み込みの直前の状態に戻します（写真・動画は戻りません）</small>");p.onclick=()=>guarded("restoreprev");menu.append(p)}
    if(hasKey(BROKEN_KEY)){const bk=el("button","","🧩 こわれたセーブを書き出す<small>読めなかったセーブデータをファイルにして保存します（直せるかもしれません）</small>");bk.onclick=()=>exportBroken();menu.append(bk)}
    const b5=el("button","danger","🗑️ はじめから（ぜんぶ消す）");b5.onclick=()=>guarded("reset");
    menu.append(b5);back();return;
  }
  if(S.sub==="importpick"){
    msg.append(el("div","note","保存したファイル（json か zip）を選んでください。"));
    const lab=filebtn("📂 ファイルを選ぶ",".json,.zip,application/json,application/zip,text/plain",false,fs=>importFile(fs[0]));
    const x=el("button","wide","やめる");x.onclick=()=>{S.sub="backup";save();render()};
    menu.append(lab,x);return;
  }
  if(S.sub==="restoreprev"){
    msg.append(el("div","","↩️ 全消去・読み込みの直前のセーブに戻します。いまのデータは消えます（戻す前のデータは「ひとつ前」として入れかわります）。"));
    const b=el("button","wide","↩️ もどす");b.onclick=()=>restorePrev();
    const x=el("button","wide","やめる");x.onclick=()=>{S.sub="backup";save();render()};
    menu.append(b,x);return;
  }
  if(S.sub==="export"){
    msg.append(el("div","note","この画面ではファイル保存ができないので、下のテキストをコピーして、メモアプリなどに貼りつけて保存してください。"));
    const ta=el("textarea");ta.id="exportText";ta.readOnly=true;ta.value=UI.exportText;
    const c=el("button","wide","📋 テキストをコピー");c.onclick=()=>{navigator.clipboard.writeText(UI.exportText).then(()=>{c.textContent="✅ コピーしました"}).catch(()=>{ta.focus();ta.select();c.textContent="テキストを選んでコピーしてください"})};
    const x=el("button","wide","とじる");x.onclick=()=>{UI.exportText=null;S.sub="backup";save();render()};
    menu.append(ta,c,x);return;
  }
  if(S.sub==="paste"){
    const ta=el("textarea");ta.id="pasteText";ta.placeholder="ここに セーブデータの テキストを 貼りつける";
    const b=el("button","wide","読み込む");b.onclick=()=>importJsonText(ta.value);
    const x=el("button","wide","やめる");x.onclick=()=>{S.sub="backup";save();render()};
    menu.append(ta,b,x);return;
  }
  if(S.sub==="import"){
    const {idx,zip}=UI.pendingImport;const sv=idx.save;
    const media=zip?`写真 ${(idx.photos||[]).length}枚・動画 ${(idx.videos||[]).length}本・音楽 ${(idx.audio||[]).length}曲（この端末のものと入れかわります）`:(Array.isArray(idx.photos)&&idx.photos.length?`写真 ${idx.photos.length}枚（入れかわります）`:"なし（この端末の写真・動画はそのまま残ります）");
    msg.append(el("div","",`<b>読み込む内容</b><br><span class="note">名前：${esc(sv.name||"（なし）")}／ひびの記録 ${sv.diary.length}こ／おもいで ${(sv.memories||[]).length}こ／${media}／保存日 ${esc(String(idx.exported||"").slice(0,10))}</span><br>⚠️ いまのデータは「ひとつ前」として退避され、このデータに置きかわります。`));
    const b=el("button","wide","✅ 読み込む");b.onclick=()=>applyImport();
    const x=el("button","wide","やめる");x.onclick=()=>{UI.pendingImport=null;S.sub="backup";save();render()};
    menu.append(b,x);return;
  }
  if(S.sub==="reset"){
    msg.append(el("div","","⚠️ 名前・ステータス・記録・写真・動画・音楽が ぜんぶ消えます。記録の文字だけは「ひとつ前」として退避され、バックアップ画面から戻せます。暗証番号は残ります。"));
    const b=el("button","wide danger","🗑️ ぜんぶ消して はじめから");b.onclick=()=>resetAll();
    const x=el("button","wide","やめる");x.onclick=()=>{S.sub="backup";save();render()};
    menu.append(b,x);return;
  }
  S.sub="menu";render();
}
function updateQuota(){try{if(navigator.storage&&navigator.storage.estimate)navigator.storage.estimate().then(e=>{if(e&&e.quota){UI.quota=`この端末でアプリが使える容量の目安：${mb(e.usage||0)} / ${(e.quota/1073741824).toFixed(1)} GB`;if(S.view==="settings"&&!UI.busy&&unlocked())render()}}).catch(()=>{})}catch(e){}}
