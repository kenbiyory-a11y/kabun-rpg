// ⚙️ おうちのひと むけ：暗証番号の奥に、せいせき・1日のかず・おと・バックアップ・開発用
// 暗証番号は S の外（localStorage "kabun-pin"）。バックアップ・読み込み・全消去に巻き込まない
function pinGet(){try{return localStorage.getItem("kabun-pin")||""}catch(e){return ""}}
function pinSet(v){try{if(v)localStorage.setItem("kabun-pin",v);else localStorage.removeItem("kabun-pin")}catch(e){}}
function unlocked(){return !pinGet()||Date.now()<(UI.unlockUntil||0)}
function keypad(menu,onDigit,onDel,onBack){menu.className="menu keypad";
  ["1","2","3","4","5","6","7","8","9"].forEach(d=>{const b=el("button","",d);b.onclick=()=>onDigit(d);menu.append(b)});
  const del=el("button","","けす");del.onclick=onDel;const z=el("button","","0");z.onclick=()=>onDigit("0");const back=el("button","","もどる");back.onclick=onBack;menu.append(del,z,back)}
function pinDots(){return `<div class="pin">${"●".repeat(UI.pinBuf.length)}${"○".repeat(Math.max(0,4-UI.pinBuf.length))}</div>`}
function pinScreen(msg,menu){
  const locked=Date.now()<(UI.pinLockUntil||0);
  msg.innerHTML=`<b>🔒 おうちのひとの ばんごう</b>${pinDots()}${locked?'<div class="note">すこし まってね</div>':(S.msg?`<div class="note">${esc(S.msg)}</div>`:"")}`;
  keypad(menu,d=>{if(locked||UI.pinBuf.length>=4)return;UI.pinBuf+=d;
      if(UI.pinBuf.length===4){if(UI.pinBuf===pinGet()){UI.unlockUntil=Date.now()+10*60*1000;UI.pinFail=0;UI.pinBuf="";S.msg=null;sfx("ok")}else{UI.pinFail++;UI.pinBuf="";S.msg="ちがうみたい";if(UI.pinFail>=5){UI.pinFail=0;UI.pinLockUntil=Date.now()+60*1000}}}
      render()},
    ()=>{UI.pinBuf=UI.pinBuf.slice(0,-1);render()},
    ()=>{UI.pinBuf="";S.msg=null;S.view="growth";S.sub="menu";save();render()});
}
function renderSettings(msg,menu){
  fieldGrowth(stageIdx(),false);
  if(!unlocked())return pinScreen(msg,menu);
  if(S.sub==="export"&&!UI.exportText)S.sub="menu";
  if(S.sub==="import"&&!UI.pendingImport)S.sub="menu";
  msg.innerHTML=`<b>⚙️ おうちのひと むけ</b><br><span class="note">ひびの記録 ${S.diary.length}こ ／ Lv${level()}・${STAGES[stageIdx()].name}・だい${Math.min(S.ch+1,CHAPTERS.length)}わ ／ 写真 ${PH.size}枚・動画 ${VM.size}本（おもいでシアターはおやすみ中。データは残っています）${UI.quota?"<br>"+UI.quota:""}${pinGet()?"":"<br>🔓 暗証番号が未設定です。子どもがこの画面を開けます"}</span>`;
  if(S.msg)msg.append(el("div","note2",esc(S.msg)));
  menu.className="menu one";
  if(UI.busy){msg.append(el("div","","⏳ "+UI.busyText));return}
  const back=()=>{const x=el("button","wide","もどる");x.style.gridColumn="1/-1";x.onclick=()=>{S.sub="menu";S.msg=null;UI.pinBuf="";UI.pinNew="";save();render()};menu.append(x)};
  if(S.sub==="menu"){
    const items=[
      ["📊 せいせき","分野ごとの回数・にがてな問題・つぎの技","stats"],
      ["⏱ 1日の かず",`いま：分野ごと ${S.cap===0?"せいげんなし":S.cap+"かい"}${S.daily.bonus?"（きょうは もう1かい あり）":""}`,"cap"],
      ["🔊 おと",`よみあげ ${S.voice?"オン":"オフ"} ／ こうかおん ${S.se?"オン":"オフ"} ／ BGM ${S.bgmOn?"オン":"オフ"}`,"sound"],
      ["🔒 あんしょうばんごう",pinGet()?"設定ずみ（変更・解除）":"未設定","pin"],
      ["💾 バックアップ","セーブデータの保存・読み込み・全消去","backup"],
      ["🔧 かいはつ","ためしに進める・きょうの分を戻す","dev"]];
    for(const [t,s,sub] of items){const b=el("button","",`${t}<small>${esc(s)}</small>`);b.onclick=()=>{S.sub=sub;S.msg=null;save();render()};menu.append(b)}
    return;
  }
  if(S.sub==="stats"){
    const rows=CATS.map(c=>{const h=S.hist[c];
      const miss=Object.entries(h.miss).sort((a,b)=>b[1]-a[1]).slice(0,3).map(([id,n])=>{const q=qById(c,id);return `${q?esc(qLabel(q)):esc(id)} ×${n}`}).join("、");
      return `<div class="srow"><b>${CAT[c].ico} ${CAT[c].n}</b>　レベル${S.lv[c]}　${h.n}かい　さいこう ${h.best}/5　さいきん ${h.last.length?h.last.join(" "):"—"}<br><span class="note">ふくしゅうばこ ${S.rev[c].length}もん${miss?"　にがて："+miss:""}</span></div>`}).join("");
    const nxt=STATS.map(k=>{const n=nextMoveInfo(k);return n?`${STAT_ICO[k]}「${esc(n.n)}」まで あと ${n.left}`:null}).filter(Boolean).join("　");
    msg.append(el("div","stats",rows+`<div class="note">${nxt?"つぎの わざ："+nxt:(stageIdx()<3?"せいちゅうに なると わざを おぼえていく":"わざは ぜんぶ おぼえた")}</div>`));
    back();return;
  }
  if(S.sub==="cap"){
    msg.append(el("div","note","分野ごとに1日に何回とっくんできるか。標準は1回。増やすと成長が速くなり、技や進化の時期が早まります。"));
    [[1,"1かい（標準）"],[2,"2かい"],[0,"せいげんなし"]].forEach(([v,t])=>{const b=el("button",S.cap===v?"sel":"",`${S.cap===v?"✅ ":""}${t}`);b.onclick=()=>{S.cap=v;save();render()};menu.append(b)});
    const bonus=el("button",S.daily.bonus?"sel":"",`${S.daily.bonus?"✅ ":""}きょうだけ もう1かい<small>全分野をもう1回だけ解放します（今日だけ）</small>`);bonus.onclick=()=>{S.daily.bonus=!S.daily.bonus;save();render()};menu.append(bonus);
    back();return;
  }
  if(S.sub==="sound"){
    msg.append(el("div","note",`よみあげは端末内蔵の音声を使います（通信なし）。この端末の日本語音声：${VOICE.ja?"あり":"なし"}／英語音声：${VOICE.en?"あり":"なし"}。iPhone は消音スイッチがオンだと鳴りません。`));
    const v=el("button","",`${S.voice?"✅":"⬜"} よみあげ<small>問題文・選択肢・結果を読み上げる</small>`);v.onclick=()=>{S.voice=!S.voice;if(!S.voice)sayStop();save();render()};
    const t=el("button","",`${S.se?"✅":"⬜"} こうかおん<small>正解音・ばつぐん音など</small>`);t.onclick=()=>{S.se=!S.se;save();if(S.se)sfx("ok");render()};
    const test=el("button","wide","🔊 ためしに よむ");test.disabled=!voiceOK();test.onclick=()=>say([["こんにちは、カブーンです","ja"],["Hello","en"]]);
    const b=el("button","",`${S.bgmOn?"✅":"⬜"} BGM<small>ゲームボーイふうの オリジナル曲（へや／バトル／かち）。読み上げ中は小さくなる</small>`);b.onclick=()=>{S.bgmOn=!S.bgmOn;save();if(!S.bgmOn)bgmStop();render()};
    menu.append(v,t,b,test);back();return;
  }
  if(S.sub==="pin"){
    const cur=pinGet();
    msg.append(el("div","note",cur?"新しい番号を4桁入れると変わります。「ばんごうを けす」で解除できます。":"4桁の番号を決めてください。⚙️ を開くときに必要になります。銀行などで使う番号は避けてください。忘れたときは README の手順で消せます。"));
    msg.append(el("div","",pinDots()));
    if(UI.pinNew)msg.append(el("div","note","もういちど おなじ ばんごうを いれてください"));
    keypad(menu,d=>{if(UI.pinBuf.length>=4)return;UI.pinBuf+=d;
        if(UI.pinBuf.length===4){if(!UI.pinNew){UI.pinNew=UI.pinBuf;UI.pinBuf=""}else{if(UI.pinNew===UI.pinBuf){pinSet(UI.pinBuf);UI.unlockUntil=Date.now()+10*60*1000;S.msg="ばんごうを せっていしました";S.sub="menu";sfx("ok")}else S.msg="2回の番号がちがいます。もういちど";UI.pinNew="";UI.pinBuf=""}}
        save();render()},
      ()=>{UI.pinBuf=UI.pinBuf.slice(0,-1);render()},
      ()=>{UI.pinBuf="";UI.pinNew="";S.sub="menu";save();render()});
    if(cur){const rm=el("button","wide danger","ばんごうを けす（ロック解除）");rm.style.gridColumn="1/-1";rm.onclick=()=>{pinSet("");UI.pinBuf="";UI.pinNew="";S.msg="ばんごうを けしました";S.sub="menu";save();render()};menu.append(rm)}
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
  if(S.sub==="backup"){
    const b1=el("button","","📥 セーブデータを保存（記録だけ・小さい）<small>名前・ステータス・記録の文字。写真や動画は入りません</small>");b1.onclick=()=>exportJson();
    const b2=el("button","","📦 ぜんぶバックアップ（zip）<small>写真・動画・音楽もまとめて1つのzipに。機種変更のときに</small>");b2.onclick=()=>exportZip();
    const lab=filebtn("📂 読み込む（json または zip）<small>保存したファイルを選びます</small>",".json,.zip,application/json,application/zip,text/plain",false,fs=>importFile(fs[0]));
    const b3=el("button","","✏️ テキストを貼りつけて読み込む");b3.onclick=()=>{S.sub="paste";save();render()};
    const b4=el("button","danger","🗑️ はじめから（ぜんぶ消す）");b4.onclick=()=>{S.sub="reset";save();render()};
    menu.append(b1,b2,lab,b3,b4);back();return;
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
    msg.append(el("div","",`<b>読み込む内容</b><br><span class="note">名前：${esc(sv.name||"（なし）")}／ひびの記録 ${sv.diary.length}こ／おもいで ${(sv.memories||[]).length}こ／${media}／保存日 ${esc(String(idx.exported||"").slice(0,10))}</span><br>⚠️ いまのデータは消えて、このデータに置きかわります。`));
    const b=el("button","wide","✅ 読み込む");b.onclick=()=>applyImport();
    const x=el("button","wide","やめる");x.onclick=()=>{UI.pendingImport=null;S.sub="backup";save();render()};
    menu.append(b,x);return;
  }
  if(S.sub==="reset"){
    msg.append(el("div","","⚠️ 名前・ステータス・記録・写真・動画・音楽が ぜんぶ消えます。先にバックアップを保存しておくと安心です。暗証番号は残ります。"));
    const b=el("button","wide danger","🗑️ ぜんぶ消して はじめから");b.onclick=()=>resetAll();
    const x=el("button","wide","やめる");x.onclick=()=>{S.sub="backup";save();render()};
    menu.append(b,x);return;
  }
  S.sub="menu";render();
}
function updateQuota(){try{if(navigator.storage&&navigator.storage.estimate)navigator.storage.estimate().then(e=>{if(e&&e.quota){UI.quota=`この端末でアプリが使える容量の目安：${mb(e.usage||0)} / ${(e.quota/1073741824).toFixed(1)} GB`;if(S.view==="settings"&&!UI.busy&&unlocked())render()}}).catch(()=>{})}catch(e){}}
