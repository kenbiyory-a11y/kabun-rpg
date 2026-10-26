// ---------- キャラの絵（img/chars/<id>.png）。無ければ絵文字のまま ----------
// 起動時に CHARS の id ぶんだけ画像を読みに行き、あったものだけ <img> で出す。ファイルを置くだけで差し替わる。
// 画像は背景が透明の正方形 PNG（256〜512px）。sw.js の SHELL には入れず、一度表示したときにキャッシュされる。
const CHAR_OK={};
function spriteHtml(id,fallback){const emoji=fallback!=null?fallback:(CHARS[id]||"");return id&&CHAR_OK[id]?`<img class="spimg" src="./img/chars/${id}.png" alt="">`:emoji}
function preloadChars(){
  const ids=Object.keys(CHARS);let pending=ids.length,found=0;
  if(!pending)return;
  const done=()=>{if(--pending===0&&found&&typeof render==="function"&&S&&S.sub==="menu")render()};
  for(const id of ids){const im=new Image();im.onload=()=>{CHAR_OK[id]=true;found++;done()};im.onerror=()=>{CHAR_OK[id]=false;done()};im.src=`./img/chars/${id}.png`}
}
