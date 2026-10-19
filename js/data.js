// ---------- とっくん（クイズ）で あがる ちから と、おぼえる わざ ----------
const STATS=["str","wise","world","heart"];
const STAT_OF={num:"str",eng:"wise",flag:"world",animal:"heart"};
const STAT_NAME={str:"ちから",wise:"ちえ",world:"ひろさ",heart:"こころ"};
const CAT={num:{n:"すうじ",ico:"🔢"},eng:{n:"えいご",ico:"🔤"},flag:{n:"こっき",ico:"🚩"},animal:{n:"いきもの",ico:"🐾"}};
const MOVES={
 str:[{at:0,n:"つのアタック",base:8},{at:10,n:"かぶとタックル",base:14},{at:24,n:"ひゃくれつつの",base:22}],
 wise:[{at:0,n:"かんがえパンチ",base:8},{at:10,n:"ひらめきビーム",base:14},{at:24,n:"だいはっけん",base:22}],
 world:[{at:0,n:"はばたき",base:8},{at:10,n:"せかいのかぜ",base:14},{at:24,n:"ちきゅうスピン",base:22}],
 heart:[{at:0,n:"やさしいこえ",base:8},{at:10,n:"なかまのちから",base:14},{at:24,n:"もりのうた",base:22}]
};
function moveOf(k){let m=MOVES[k][0];for(const x of MOVES[k])if(S[k]>=x.at)m=x;return m}
function power(k){return moveOf(k).base+S[k]}


// ---------- バトル：かべ（しょう） ----------
const STAGES=[{ico:"🥚",name:"たまご"},{ico:"🐛",name:"ようちゅう"},{ico:"🫘",name:"さなぎ"},{ico:"🪲",name:"せいちゅう"},{ico:"👑",name:"キング カブーン"}];
const CHAPTERS=[
 {bg:"cave",title:"だい1わ　からを やぶれ",foe:{ico:"🪨",name:"たまごのから",hp:30,dmg:5},win:"バリッ！からが われた！",evolve:1},
 {bg:"cave",title:"だい2わ　つちを ほりすすめ",foe:{ico:"🧱",name:"かたいつち",hp:50,dmg:6},win:"ほれた！おちばを もりもり たべた！"},
 {bg:"snow",title:"だい3わ　さむい ふゆを こえろ",foe:{ico:"❄️",name:"こおりのかぜ",hp:60,dmg:7},win:"はるが きた！カブーンは がんばった！"},
 {bg:"cave",title:"だい4わ　さなぎの へやを つくれ",foe:{ico:"🌀",name:"くずれるつち",hp:70,dmg:8},win:"りっぱな へやが できた！",evolve:2},
 {bg:"cave",title:"だい5わ　さなぎから はいだせ",foe:{ico:"🥥",name:"さなぎのかわ",hp:90,dmg:9},win:"バリバリッ！つのが でてきた！",evolve:3},
 {bg:"day",title:"だい6わ　ガキーンと しょうぶ",foe:{ico:"🦗",name:"ガキーン",hp:120,dmg:10},win:"ガキーン「つよいな……じゅえきを わけてやる」"},
 {bg:"night",title:"だい7わ　よるの もりを こえて",foe:{ico:"🦉",name:"ホウリン",hp:140,dmg:11},win:"ホウリンは おどろいて とんでいった！"},
 {bg:"day",title:"さいしゅうわ　もりの おうさまへ",foe:{ico:"🐉",name:"ちょうろう クガーン",hp:200,dmg:12},win:"クガーン「みごとじゃ……」",evolve:4}
];
const GAIN=2, MAXHP=50, DIARY_EMO=["🌟","🚲","🏊","✏️","🍚","🦷","🎹","⚽","🎉","🌱"];
const VIDEO_MAX_MB=60, VIDEO_MAX_SEC=60, AUDIO_MAX_MB=15, MEDIA_MAX=20, PHOTO_MS=3800, CARD_MS=2400, BGM_VOL=0.55;
