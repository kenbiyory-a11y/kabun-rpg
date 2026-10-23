// ---------- クイズ：問題の器と、5問セッションの組み立て・採点 ----------
// 問題データは js/quiz/*.js が QUIZ[cat].push(...) で足す。1問の形：
// {id, t:"pick"|"ico"|"listen", q, a, d:[はずれ…], sub, lv:1-3, g, say(文字列 か [[文,言語],…]), ol:"en"}
const QUIZ={num:[],eng:[],flag:[],animal:[]};
// 旧セーブ（kabun4）の S.used は配列の添字だった。既存15問は各ファイルの先頭に a01〜a15 の id で並ぶ
function legacyId(cat,i){return `${cat}_a${String(i+1).padStart(2,"0")}`}

// すうじ の生成問題（かぞえる 1〜10／あわせて／のこり）。id に数を埋めるので、同じ数は「出題済み」扱いになる
const GEN_EMO=["🍎","🍓","🍬","🍪","⭐","🎈","🐟","🌸","🍙","🐥"];
function genNum(){
  const out=[];const pick=()=>GEN_EMO[Math.floor(Math.random()*GEN_EMO.length)];
  for(let n=1;n<=10;n++){const e=pick();out.push({id:`num_cnt_${n}`,t:"pick",q:e.repeat(n),a:String(n),d:n===1?["2","3"]:[String(n-1),String(n+1)],sub:"いくつ あるかな？",lv:n<=5?1:2,g:"かぞえる",say:"いくつ あるかな？"})}
  for(let a=1;a<=4;a++)for(let b=1;b<=a;b++){const s=a+b;const e=pick();out.push({id:`num_add_${a}_${b}`,t:"pick",q:`${e.repeat(a)} ＋ ${e.repeat(b)}`,a:String(s),d:[String(s-1),String(s+1)],sub:"あわせると いくつ？",lv:s<=5?2:3,g:"あわせて",say:"あわせると いくつ？"})}
  for(let a=2;a<=6;a++)for(let b=1;b<a;b++){const r=a-b;const e=pick();out.push({id:`num_sub_${a}_${b}`,t:"pick",q:`${e.repeat(a)} から ${e.repeat(b)} たべた`,a:String(r),d:r===1?["2","3"]:[String(r-1),String(r+1)],sub:"のこりは いくつ？",lv:a<=4?2:3,g:"のこり",say:"のこりは いくつ？"})}
  return out;
}
// 出題できる問題（音声の無い端末では listen を外す）
function poolOf(cat){let p=(QUIZ[cat]||[]).slice();if(cat==="num")p=p.concat(genNum());if(!voiceOK())p=p.filter(q=>q.t!=="listen");return p}
function qById(cat,id){return poolOf(cat).find(q=>q.id===id)||null}
function qLabel(q){return q.t==="listen"?(q.sub||"（よみあげ）"):(q.q&&q.sub?`${q.q} ${q.sub}`:(q.q||q.sub||q.id))}

function shuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}

// 5問の構成：現レベル／復習枠（期限が来た復習箱）／ちょうせん（1つ上）／現レベル／現レベルの易しいもの
function buildSession(cat){
  const pool=poolOf(cat);const lv=Math.min(3,Math.max(1,(S.lv&&S.lv[cat])||1));
  const usedArr=(S.used[cat]=Array.isArray(S.used[cat])?S.used[cat]:[]);let used=new Set(usedArr);
  if(pool.length&&pool.every(q=>used.has(q.id))){usedArr.length=0;used=new Set()}
  const taken=new Set();const gcount={};
  const take=(wantLv,allowUsed)=>{
    const lvs=[wantLv,wantLv-1,wantLv+1,wantLv-2,wantLv+2].filter(l=>l>=1&&l<=3);
    for(const l of lvs){
      let c=pool.filter(q=>q.lv===l&&!taken.has(q.id)&&(allowUsed||!used.has(q.id))&&(gcount[q.g]||0)<2);
      if(!c.length)c=pool.filter(q=>q.lv===l&&!taken.has(q.id)&&(allowUsed||!used.has(q.id)));
      if(c.length){const q=c[Math.floor(Math.random()*c.length)];taken.add(q.id);gcount[q.g]=(gcount[q.g]||0)+1;return q}
    }
    return allowUsed?null:take(wantLv,true);
  };
  const today=ymd();const rev=(S.rev&&Array.isArray(S.rev[cat]))?S.rev[cat]:[];
  let review=null;
  for(const r of rev.filter(r=>r.due<=today).sort((a,b)=>a.due<b.due?-1:a.due>b.due?1:0)){const q=pool.find(x=>x.id===r.id);if(q){review=q;taken.add(q.id);break}}
  const q1=take(lv),q2=review||take(lv),q3=take(Math.min(3,lv+1)),q4=take(lv),q5=take(lv);
  const qs=[q1,q2,q3,q4,q5].filter(Boolean);
  while(qs.length<SESSION_N){const q=take(lv,true);if(!q)break;qs.push(q)}
  // 最後は易しく：まちがえた回数が少ないほうを後ろへ
  const miss=(S.hist&&S.hist[cat]&&S.hist[cat].miss)||{};
  if(qs.length>=5&&(miss[qs[3].id]||0)<(miss[qs[4].id]||0)){const t=qs[3];qs[3]=qs[4];qs[4]=t}
  const items=qs.map(q=>({id:q.id,t:q.t,q:q.q||"",a:q.a,d:q.d,sub:q.sub||null,lv:q.lv,g:q.g||"",say:q.say||null,ol:q.ol||null,opts:shuffle([q.a,...q.d]),rev:!!(review&&q.id===review.id),chal:q===q3&&q.lv>lv}));
  for(const it of items)if(!used.has(it.id))usedArr.push(it.id);
  return {cat,d:today,i:0,items,res:[],pending:false,phase:null,msg:null,said:false,result:null};
}

// 1日の上限：分野ごと S.cap 回（0 は制限なし）。S.daily.bonus で全分野 +1 回
function canTrain(cat){const cap=typeof S.cap==="number"?S.cap:1;if(cap===0)return true;return (S.daily.done[cat]||0)<cap+(S.daily.bonus?1:0)}
function boardComplete(){return CATS.every(c=>(S.daily.done[c]||0)>0)&&!!S.daily.diary}
// きょうの5つ がそろったら あみ +1（1日1回）
function checkBoard(){if(boardComplete()&&!S.daily.bonusNet){S.daily.bonusNet=true;S.items.net=Math.min(NET_MAX,(S.items.net||0)+1);return "🎉 きょうの 5つが ぜんぶ そろった！ むしとりあみを 1こ もらった！"}return null}
// 上昇の前後を比べて、レベルアップ・技の習得・かべ の出現を知らせる
function snapshot(){return {lv:level(),ch:chapterReady()?S.ch:-1,moves:STATS.map(k=>moveOf(k).n)}}
function gainNotes(before){const notes=[];
  if(level()>before.lv)notes.push(`⬆️ レベル ${level()} に なった！`);
  STATS.forEach((k,i)=>{const n=moveOf(k).n;if(n!==before.moves[i])notes.push(`✨ あたらしい わざ「${n}」を おぼえた！`)});
  const c=chapterReady();if(c&&before.ch!==S.ch)notes.push(`${c.foe.ico} ${c.foe.name}が あらわれた！ バトルで たたかおう`);
  return notes}

// セッションの採点。ステータスはここでだけ上げる
function finishSession(){
  const s=S.sess;if(!s||s.result)return s&&s.result;
  const cat=s.cat,k=STAT_OF[cat];const ok=s.res.filter(Boolean).length;const gain=GAIN_TABLE[Math.min(ok,GAIN_TABLE.length-1)];
  const before=snapshot();
  S[k]+=gain;
  const h=S.hist[cat];h.n++;h.best=Math.max(h.best||0,ok);h.last=(h.last||[]).concat(ok).slice(-10);
  const today=ymd(),tomorrow=addDays(today,1);const rev=S.rev[cat];
  s.items.forEach((it,i)=>{const right=!!s.res[i];const idx=rev.findIndex(r=>r.id===it.id);
    if(right){if(idx>=0){const r=rev[idx];if(r.box>=3)rev.splice(idx,1);else{r.box++;r.due=addDays(today,r.box===2?3:7)}}}
    else{h.miss[it.id]=(h.miss[it.id]||0)+1;if(idx>=0){rev[idx].box=1;rev[idx].due=tomorrow}else rev.push({id:it.id,box:1,due:tomorrow})}});
  while(rev.length>12)rev.shift();
  // 段階式難易度：2回連続 4問以上で昇格、2回連続 1問以下で降格（降格は知らせない）
  let lvNote=null;const last=h.last;
  if(last.length>=2&&last.slice(-2).every(x=>x>=4)&&S.lv[cat]<3){S.lv[cat]++;h.last=[];lvNote="🎓 つぎから すこし むずかしい もんだいも でるよ！"}
  else if(last.length>=2&&last.slice(-2).every(x=>x<=1)&&S.lv[cat]>1){S.lv[cat]--;h.last=[]}
  S.daily.done[cat]=(S.daily.done[cat]||0)+1;S.daily.score[cat]=ok;
  S.items.net=Math.min(NET_MAX,(S.items.net||0)+(ok===5?2:1));
  const notes=gainNotes(before);if(lvNote)notes.push(lvNote);const bn=checkBoard();if(bn)notes.push(bn);
  s.result={ok,gain,k,notes};return s.result;
}
