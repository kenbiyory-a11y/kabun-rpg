// ---------- ステータス・技・相性・章 ----------
// 仕様は KABUN_HANDOFF.md「設計書」。数値は定数に寄せ、実データを見て調整する。
const STATS=["str","wise","world","heart"];
const STAT_OF={num:"str",eng:"wise",flag:"world",animal:"heart"};
const STAT_NAME={str:"ちから",wise:"ちえ",world:"はやさ",heart:"こころ"};
const STAT_ICO={str:"💪",wise:"💡",world:"💨",heart:"💗"};
const STAT_WAY={str:"つの",wise:"ひかり",world:"かぜ",heart:"こえ"};
const CAT={num:{n:"すうじ",ico:"🔢"},eng:{n:"えいご",ico:"🔤"},flag:{n:"こっき",ico:"🚩"},animal:{n:"いきもの",ico:"🐾"}};
const CATS=Object.keys(CAT);

// とっくん：1セッション5問。正解数 → 上昇（満点は「5 ＋ おまけ 2」）
const SESSION_N=5, GAIN_TABLE=[0,1,2,3,4,7], DIARY_GAIN=1;
// レベル：4ステータスの合計 ÷ 8（固定。レベルごとに増やさない。上限なし）
const LV_DIV=8;
// むしとりあみ：セッション完了 +1、満点 +2、きょうの5つ で +1、上限 9
const NET_MAX=9;
// 選択肢を押せるようになるまでの待ち（衝動タップ対策、ms）
const OPT_LOCK_MS=800;

// 固定技（たまご・ようちゅう・さなぎ）：段階ごとに4技、威力＝base＋ステータス
const STAGE_MOVES=[
 {base:6, str:"ごろごろ",        wise:"ぴかっ",          world:"ゆらゆら",      heart:"ぬくぬく"},
 {base:10,str:"ずんずんタックル",wise:"ぴかぴかサーチ",  world:"おちばシャワー",heart:"もぐもぐソング"},
 {base:14,str:"からやぶり",      wise:"しずかなひらめき",world:"ゆめのかぜ",    heart:"ねむりのうた"}
];
// せいちゅう以降：そのステータスの値で習得。king:true はキング限定
const MOVES={
 str:  [{at:0,n:"つのアタック",base:16},  {at:30,n:"かぶとタックル",base:22},{at:70,n:"ひゃくれつつの",base:30},{at:120,n:"おうさまのつの",base:40,king:true}],
 wise: [{at:0,n:"ひらめきパンチ",base:16},{at:30,n:"ひらめきビーム",base:22},{at:70,n:"だいはっけん",base:30},  {at:120,n:"おうさまのひかり",base:40,king:true}],
 world:[{at:0,n:"はばたき",base:16},      {at:30,n:"せかいのかぜ",base:22},  {at:70,n:"ちきゅうスピン",base:30},{at:120,n:"おうさまのかぜ",base:40,king:true}],
 heart:[{at:0,n:"やさしいこえ",base:16},  {at:30,n:"なかまのちから",base:22},{at:70,n:"もりのうた",base:30},    {at:120,n:"おうさまのうた",base:40,king:true}]
};
function moveAt(k,stage,val){if(stage<3){const m=STAGE_MOVES[stage];return {n:m[k],base:m.base}}
  let m=MOVES[k][0];for(const x of MOVES[k]){if(x.king&&stage<4)continue;if(val>=x.at)m=x}return m}
function moveOf(k){return moveAt(k,stageIdx(),S[k])}
function power(k){return moveOf(k).base+S[k]}
// つぎに覚える技までの残り（せいちゅう以降だけ）
function nextMoveInfo(k){if(stageIdx()<3)return null;const st=stageIdx();const x=MOVES[k].find(x=>S[k]<x.at&&(!x.king||st>=4));return x?{n:x.n,left:x.at-S[k]}:null}

// 相性（マークあわせ）：★＝にがて ×1.5、🛡️＝まもり ×0.5、それ以外 ×1（不利なし）
const BATSUGUN=1.5, WEAK_MULT=1, GUARD_MULT=0.5;
function multOf(k,foe){if(foe.weak===k)return BATSUGUN;if(foe.guard===k)return GUARD_MULT;return WEAK_MULT}

// 国旗：絵文字は Windows で文字になるので、img/flags/*.svg（flag-icons、MIT）を同梱して差し替える。ここにある国コードだけ画像になる
const FLAG_CODES=new Set("jp us fr br it ca kr gb au de in cn es eg mx nl bd pw th vn tr ru se no gr ch ar cl za ke id ph nz".split(" "));

// 進化段階
const STAGES=[{ico:"🥚",name:"たまご"},{ico:"🐛",name:"ようちゅう"},{ico:"🫘",name:"さなぎ"},{ico:"🪲",name:"せいちゅう"},{ico:"👑",name:"キング カブーン"}];
const STAGE_CHEER=["ぷるぷる！","もぐもぐ！","ぴくっ！","やったー！","さすが おうさま！"];

// 章（かべ）：lv に達すると現れる。倒すと章が進み、evolve があれば進化。全敵の HP は PACE で一括調整
// HP の目安：★連打で 4〜5ターン、ふつう連打で 7〜8ターン（第1話は 4ターン、第2話の小イベントは 3ターン）
const PACE=1.0;
const CHAPTERS=[
 {lv:5, bg:"cave", place:"へや",             title:"だい1わ　からを やぶれ",                    foe:{ico:"🪨",name:"たまごのから",hp:70, dmg:5, weak:"str"},              why:"からは つので つつけば われる",                      win:"バリッ！ からが われた！",evolve:1},
 {lv:8, bg:"cave", place:"へや",             title:"だい2わ　コバエを おいはらえ",              foe:{ico:"🪰",alt:"🦟",name:"コバエ",hp:80,dmg:5,weak:"world"},        why:"かるい むしは かぜで ふきとばせる",                  win:"コバエは とんでいった！ かごが きれいに なった！"},
 {lv:12,bg:"cave", place:"へや",             title:"だい3わ　つちを ほって さなぎの へやを つくれ",foe:{ico:"🧱",name:"かたいつち",hp:220,dmg:7,weak:"wise"},             why:"かたい つちは ぴかっと てらして やわらかい ところを さがす",win:"ほれた！ りっぱな へやで さなぎに なった！",evolve:2},
 {lv:15,bg:"snow", place:"へや",             title:"だい4わ　さむい ふゆを こえろ",              foe:{ico:"❄️",name:"こおりのかぜ",hp:290,dmg:8,weak:"heart"},           why:"さむい かぜも なかまと いれば へっちゃら",            win:"はるが きた！ さなぎは がんばった！"},
 {lv:18,bg:"cave", place:"へや",             title:"だい5わ　さなぎの へやを まもれ",            foe:{ico:"🌀",name:"くずれるつち",hp:330,dmg:9,weak:"world",guard:"str"},why:"くずれる つちは かぜで ぱたぱた はらう",              win:"へやは ぶじ！ もうすこしで そとだ！"},
 {lv:20,bg:"cave", place:"へや",             title:"だい6わ　さなぎから はいだせ",              foe:{ico:"🥥",name:"さなぎのかわ",hp:360,dmg:10,weak:"str"},            why:"かわは つので やぶる",                                win:"バリバリッ！ つのが でてきた！ カブーンだ！",evolve:3},
 {lv:30,bg:"day",  place:"くさむら の おく", title:"だい7わ　ガキーンと しょうぶ",              foe:{ico:"🦗",name:"ガキーン",hp:560,dmg:12,weak:"wise",guard:"str"},   why:"ガキーンは ぴかっと ひかると めが くらむ",            win:"ガキーン「つよいな……じゅえきを わけてやる」"},
 {lv:40,bg:"night",place:"もり の おく",     title:"だい8わ　よるの もりを こえて",              foe:{ico:"🦉",name:"ホウリン",hp:750,dmg:14,weak:"heart",guard:"world"},why:"ふくろうは やさしい こえで ねむくなる",                win:"ホウリンは おどろいて とんでいった！"},
 {lv:50,bg:"day",  place:"やま の ちょうじょう",title:"さいしゅうわ　もりの おうさまへ",         foe:{ico:"🐉",name:"ちょうろう クガーン",hp:900,dmg:15,weak:"wise",guard:"str",shift:true},why:"★は ばつぐんの あとで となりに うごく",win:"クガーン「みごとじゃ…… この おうかんを さずけよう」",evolve:4}
];
function maxHp(){return Math.min(120,50+2*level())}
function mkFoe(i){const c=CHAPTERS[i];const hp=Math.round(c.foe.hp*PACE);
  return {ch:i,ico:c.foe.ico,alt:c.foe.alt||null,name:c.foe.name,hp,max:hp,dmg:c.foe.dmg,weak:c.foe.weak||null,guard:c.foe.guard||null,shift:!!c.foe.shift,src:"story",whySaid:false}}
// いま挑める章（レベル条件を満たしている）。無ければ null
function chapterReady(){const c=CHAPTERS[S.ch];return c&&level()>=c.lv?c:null}

// ひびの きろく
const DIARY_EMO=["🌟","🚲","🏊","✏️","🍚","🦷","🎹","⚽","🎉","🌱"];
const DIARY_CHIPS=["ひとりで できた","おてつだい した","さいごまで がんばった","ともだちと なかよく","おおきな こえで あいさつ","やさいを たべた","はやく ねた","かたづけ した","はじめて ちょうせん","なかなおり した","やくそくを まもった","ほかの こと"];
const KABUN_SAY={"ひとりで できた":"カブーンも ひとりで できるように なりたいな！","おてつだい した":"カブーンも おてつだい したいな！","さいごまで がんばった":"さいごまで やるの、かっこいい！","ともだちと なかよく":"なかよしは さいこうだね！","おおきな こえで あいさつ":"カブーンにも きこえたよ！","やさいを たべた":"カブーンも おちばを もりもり たべる！","はやく ねた":"ねると おおきく なるんだって！","かたづけ した":"かごも ぴかぴかに しなくちゃ！","はじめて ちょうせん":"はじめては どきどき するよね！","なかなおり した":"なかなおり できて よかった！","やくそくを まもった":"やくそくを まもるの、すごい！","ほかの こと":"すごいね！ カブーンも うれしい！"};

// メディア（media.js / backup.js が使う。おもいでシアターは v2 では UI から外したが、データは残す）
const VIDEO_MAX_MB=60, VIDEO_MAX_SEC=60, AUDIO_MAX_MB=15, MEDIA_MAX=20, PHOTO_MS=3800, CARD_MS=2400, BGM_VOL=0.55;
