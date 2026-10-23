// ---------- えいご の もんだい ----------
// サブジャンル（g）：たべもの / どうぶつ / いろ / かず / からだ / あいさつ / どうさ / のりもの / てんき / かぞく / ばしょ / もの / しぜん / ひと
// a01〜a15 は もとの quiz.js の 15問（順番そのまま）。b01〜 が 追加分。
// lv1 は ico（「banana は どれ？」→ 🍌🍎🍇）、lv2 は 絵→英単語 と listen、lv3 は 場面。
// 英単語の選択肢には ol:"en"（読み上げを英語音声にする）。say で言語を混ぜるときは [["banana","en"],["は どれ？","ja"]]。
QUIZ.eng.push(
 {id:"eng_a01",t:"pick",q:"「りんご」は えいごで？",a:"apple",d:["orange","grape"],lv:1,g:"たべもの",say:"りんごは えいごで なんていう？",ol:"en"},
 {id:"eng_a02",t:"pick",q:"「いぬ」は えいごで？",a:"dog",d:["cat","bird"],lv:1,g:"どうぶつ",say:"いぬは えいごで なんていう？",ol:"en"},
 {id:"eng_a03",t:"pick",q:"「あか」は えいごで？",a:"red",d:["blue","green"],lv:1,g:"いろ",say:"あかは えいごで なんていう？",ol:"en"},
 {id:"eng_a04",t:"pick",q:"「ねこ」は えいごで？",a:"cat",d:["dog","fish"],lv:1,g:"どうぶつ",say:"ねこは えいごで なんていう？",ol:"en"},
 {id:"eng_a05",t:"pick",q:"「みず」は えいごで？",a:"water",d:["milk","juice"],lv:2,g:"たべもの",say:"みずは えいごで なんていう？",ol:"en"},
 {id:"eng_a06",t:"pick",q:"「ありがとう」は えいごで？",a:"Thank you",d:["Hello","Sorry"],lv:1,g:"あいさつ",say:"ありがとうは えいごで なんていう？",ol:"en"},
 {id:"eng_a07",t:"pick",q:"「3（さん）」は えいごで？",a:"three",d:["two","four"],lv:2,g:"かず",say:"さんは えいごで なんていう？",ol:"en"},
 {id:"eng_a08",t:"pick",q:"「おはよう」は えいごで？",a:"Good morning",d:["Good night","Goodbye"],lv:2,g:"あいさつ",say:"おはようは えいごで なんていう？",ol:"en"},
 {id:"eng_a09",t:"pick",q:"「がっこう」は えいごで？",a:"school",d:["house","park"],lv:2,g:"ばしょ",say:"がっこうは えいごで なんていう？",ol:"en"},
 {id:"eng_a10",t:"pick",q:"「カブトムシ」は えいごで？",a:"beetle",d:["butterfly","bee"],lv:3,g:"どうぶつ",say:"カブトムシは えいごで なんていう？",ol:"en"},
 {id:"eng_a11",t:"pick",q:"「あお」は えいごで？",a:"blue",d:["yellow","black"],lv:1,g:"いろ",say:"あおは えいごで なんていう？",ol:"en"},
 {id:"eng_a12",t:"pick",q:"「ほん」は えいごで？",a:"book",d:["desk","pen"],lv:2,g:"もの",say:"ほんは えいごで なんていう？",ol:"en"},
 {id:"eng_a13",t:"pick",q:"「10（じゅう）」は えいごで？",a:"ten",d:["eight","nine"],lv:3,g:"かず",say:"じゅうは えいごで なんていう？",ol:"en"},
 {id:"eng_a14",t:"pick",q:"「はな（花）」は えいごで？",a:"flower",d:["tree","leaf"],lv:2,g:"しぜん",say:"さく おはなは えいごで なんていう？",ol:"en"},
 {id:"eng_a15",t:"pick",q:"「ともだち」は えいごで？",a:"friend",d:["family","teacher"],lv:3,g:"ひと",say:"ともだちは えいごで なんていう？",ol:"en"},
 // ---- ここから 追加（b01〜）----
 {id:"eng_b01",t:"ico",q:"banana は どれ？",a:"🍌",d:["🍎","🍇"],lv:1,g:"たべもの",say:[["banana","en"],["は どれ？","ja"]]},
 {id:"eng_b02",t:"ico",q:"cat は どれ？",a:"🐱",d:["🐶"],lv:1,g:"どうぶつ",say:[["cat","en"],["は どれ？","ja"]]},
 {id:"eng_b03",t:"ico",q:"yellow は どれ？",a:"💛",d:["❤️","💙"],lv:1,g:"いろ",say:[["yellow","en"],["は どれ？","ja"]]},
 {id:"eng_b04",t:"ico",q:"two は どれ？",a:"🍎🍎",d:["🍎"],lv:1,g:"かず",say:[["two","en"],["は どれ？","ja"]]},
 {id:"eng_b05",t:"ico",q:"nose は どれ？",a:"👃",d:["👂","✋"],lv:1,g:"からだ",say:[["nose","en"],["は どれ？","ja"]]},
 {id:"eng_b06",t:"ico",q:"car は どれ？",a:"🚗",d:["✈️"],lv:1,g:"のりもの",say:[["car","en"],["は どれ？","ja"]]},
 {id:"eng_b07",t:"pick",q:"🍊",a:"orange",d:["apple","banana"],sub:"えいごで なんていう？",lv:2,g:"たべもの",say:"みかんは えいごで なんていう？",ol:"en"},
 {id:"eng_b08",t:"pick",q:"🐟",a:"fish",d:["bird","dog"],sub:"えいごで なんていう？",lv:2,g:"どうぶつ",say:"さかなは えいごで なんていう？",ol:"en"},
 {id:"eng_b09",t:"listen",q:"",a:"✋",d:["👃","👂"],lv:2,g:"からだ",say:[["hand","en"],["は どれ？","ja"]]},
 {id:"eng_b10",t:"listen",q:"",a:"☀️",d:["☔","⛄"],lv:2,g:"てんき",say:[["sun","en"],["は どれ？","ja"]]},
 {id:"eng_b11",t:"pick",q:"💚",a:"green",d:["red","blue"],sub:"この いろは えいごで？",lv:2,g:"いろ",say:"みどりは えいごで なんていう？",ol:"en"},
 {id:"eng_b12",t:"pick",q:"🐶🐶🐶🐶🐶",a:"five",d:["four","six"],sub:"いぬは なんびき？ えいごで こたえてね",lv:2,g:"かず",say:"いぬは なんびき？ えいごで こたえてね",ol:"en"},
 {id:"eng_b13",t:"pick",q:"ねる まえの あいさつは？",a:"Good night",d:["Good morning","Thank you"],lv:3,g:"あいさつ",say:"ねる まえの あいさつは？",ol:"en"},
 {id:"eng_b14",t:"pick",q:"🏃",a:"run",d:["jump","sleep"],sub:"はしるは えいごで？",lv:3,g:"どうさ",say:"はしるは えいごで なんていう？",ol:"en"},
 {id:"eng_b15",t:"pick",q:"👨",a:"father",d:["mother","baby"],sub:"おとうさんは えいごで？",lv:3,g:"かぞく",say:"おとうさんは えいごで なんていう？",ol:"en"}
);
