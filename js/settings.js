// ⚙️ おうちのひと むけ：バックアップ・BGM
function renderSettings(msg,menu){
  fieldGrowth(stageIdx(),false);
  if(S.sub==="export"&&!UI.exportText)S.sub="menu";
  if(S.sub==="import"&&!UI.pendingImport)S.sub="menu";
  msg.innerHTML=`<b>⚙️ おうちのひと むけ</b><br><span class="note">ひびの記録 ${S.diary.length}こ ／ おもいで ${S.memories.length}こ ／ 写真 ${PH.size}枚（約 ${mb(photoBytes())}）／ 動画 ${VM.size}本（約 ${mb(videoBytes())}）／ 音楽 ${AU.size}曲${UI.quota?"<br>"+UI.quota:""}${DB_OK?"":"<br>⚠️ この端末では写真・動画を保存できません"}</span>`;
  if(S.msg)msg.append(el("div","",`<span style="font-size:.9rem">${S.msg}</span>`));
  menu.className="menu one";
  if(UI.busy){msg.append(el("div","","⏳ "+UI.busyText));return}
  if(S.sub==="menu"){
    const b1=el("button","","💾 バックアップ<small>セーブデータの保存・読み込み・全消去</small>");b1.onclick=()=>{S.sub="backup";save();render()};
    const b2=el("button","",`🎵 BGM<small>いま：${esc(bgmName(S.bgm))}</small>`);b2.onclick=()=>{S.sub="bgm";save();render()};
    menu.append(b1,b2);return;
  }
  if(S.sub==="backup"){
    const b1=el("button","","📥 セーブデータを保存（記録だけ・小さい）<small>名前・ステータス・記録の文字。写真や動画は入りません</small>");b1.onclick=()=>exportJson();
    const b2=el("button","","📦 ぜんぶバックアップ（zip）<small>写真・動画・音楽もまとめて1つのzipに。機種変更のときに</small>");b2.onclick=()=>exportZip();
    const lab=filebtn("📂 読み込む（json または zip）<small>保存したファイルを選びます</small>",".json,.zip,application/json,application/zip,text/plain",false,fs=>importFile(fs[0]));
    const b3=el("button","","✏️ テキストを貼りつけて読み込む");b3.onclick=()=>{S.sub="paste";save();render()};
    const b4=el("button","danger","🗑️ はじめから（ぜんぶ消す）");b4.onclick=()=>{S.sub="reset";save();render()};
    const x=el("button","wide","もどる");x.onclick=()=>{S.sub="menu";save();render()};
    menu.append(b1,b2,lab,b3,b4,x);return;
  }
  if(S.sub==="bgm"){
    msg.append(el("div","note","おもいでシアターで流れる曲です。▶ で7秒ためせます"));
    const opts=["gen1","gen2",...[...AU.keys()].map(id=>"a:"+id),"none"];
    for(const o of opts){const row=el("div","menu");row.style.gridTemplateColumns="1fr auto auto";
      const sel=el("button",S.bgm===o?"sel":"",`${S.bgm===o?"✅ ":""}${esc(bgmName(o))}${o.startsWith("a:")?`<small>${mb((AU.get(o.slice(2))||{}).size||0)}</small>`:""}`);sel.onclick=()=>{S.bgm=o;save();render()};row.append(sel);
      if(o!=="none"){const t=el("button","wide","▶");t.setAttribute("aria-label","ためす");t.onclick=()=>testBgm(o);row.append(t)}
      if(o.startsWith("a:")){const dl=el("button","wide danger","🗑️");dl.setAttribute("aria-label","消す");dl.onclick=async()=>{const id=o.slice(2);stopBgm();try{await sDel("audio",id)}catch(e){}const a=AU.get(id);if(a)try{URL.revokeObjectURL(a.url)}catch(e){}AU.delete(id);if(S.bgm===o)S.bgm="gen1";save();render()};row.append(dl)}
      menu.append(row)}
    const lab=filebtn(`＋ 音楽ファイルを追加<small>mp3 / m4a / wav など、${AUDIO_MAX_MB}MBまで。フリー音源やご自身の曲など、使ってよい音源だけ入れてください</small>`,"audio/*,.mp3,.m4a,.wav,.ogg,.aac",false,async fs=>{const f=fs[0];
      if(f.size>AUDIO_MAX_MB*1048576){S.msg=`${AUDIO_MAX_MB}MBをこえています`;render();return}
      UI.busy=true;UI.busyText="音楽を ほぞんしています…";render();const id=uid("a");
      try{await sPut("audio",{id,name:f.name.replace(/\.[^.]+$/,""),mime:f.type||"audio/mpeg",size:f.size,blob:f,ts:Date.now()});await loadMedia();S.bgm="a:"+id;S.msg="追加しました"}catch(e){S.msg="保存できませんでした"}
      UI.busy=false;save();render()});
    const x=el("button","wide","もどる");x.onclick=()=>{stopBgm();S.sub="menu";save();render()};
    menu.append(lab,x);return;
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
    msg.append(el("div","","⚠️ 名前・ステータス・記録・写真・動画・音楽が ぜんぶ消えます。先にバックアップを保存しておくと安心です。"));
    const b=el("button","wide danger","🗑️ ぜんぶ消して はじめから");b.onclick=()=>resetAll();
    const x=el("button","wide","やめる");x.onclick=()=>{S.sub="backup";save();render()};
    menu.append(b,x);return;
  }
  S.sub="menu";render();
}
function updateQuota(){try{if(navigator.storage&&navigator.storage.estimate)navigator.storage.estimate().then(e=>{if(e&&e.quota){UI.quota=`この端末でアプリが使える容量の目安：${mb(e.usage||0)} / ${(e.quota/1073741824).toFixed(1)} GB`;if(S.view==="settings"&&!UI.busy)render()}}).catch(()=>{})}catch(e){}}

