// ---------- ずかん：そと で みつかる いきもの（エリアごと5匹、✨ は レア） ----------
// 追記専用。id は変えない・消さない（セーブ S.dex に id が残る）。外したいときは hidden:true
// n・fact・say は ひらがな・カタカナ だけ（4歳が読める／読み上げに漢字を渡さない）。fact は 20文字以内
// ぬし と重なる生き物（かえる・ふくろう・さめ・くわがた）は入れない
const ZUKAN=[
 // くさむら
 {id:"grass_batta",area:"grass",ico:"🦗",n:"ばった",fact:"うしろあしで ぴょーんと とぶ",say:"ばったを みつけた！ うしろあしで ぴょーんと とぶよ"},
 {id:"grass_tentoumushi",area:"grass",ico:"🐞",n:"てんとうむし",fact:"あかい せなかに くろい てんてん",say:"てんとうむしを みつけた！ あかい せなかに くろい てんてんが あるよ"},
 {id:"grass_chouchou",area:"grass",ico:"🦋",n:"ちょうちょ",fact:"ひらひら とんで はなの みつを すう",say:"ちょうちょを みつけた！ ひらひら とんで はなの みつを すうよ"},
 {id:"grass_katatsumuri",area:"grass",ico:"🐌",n:"かたつむり",fact:"あめの ひに でてくる",say:"かたつむりを みつけた！ あめの ひに のそのそ でてくるよ"},
 {id:"grass_mitsubachi",area:"grass",ico:"🐝",n:"みつばち",rare:true,fact:"はなの みつで はちみつを つくる",say:"みつばちを みつけた！ はなの みつで あまい はちみつを つくるよ"},
 // かわ
 {id:"river_sakana",area:"river",ico:"🐟",n:"さかな",fact:"みずの なかで えらで いきを する",say:"さかなを みつけた！ みずの なかで えらを つかって いきを しているよ"},
 {id:"river_kamo",area:"river",ico:"🦆",n:"かも",fact:"あしに みずかきが ある",say:"かもを みつけた！ あしに みずかきが あって ぷかぷか およぐよ"},
 {id:"river_kawauso",area:"river",ico:"🦦",n:"かわうそ",fact:"みずの なかを すいすい およぐ",say:"かわうそを みつけた！ みずの なかを すいすい およぐよ"},
 {id:"river_kame",area:"river",ico:"🐢",n:"かめ",fact:"こうらの なかに あたまを かくす",say:"かめを みつけた！ びっくりすると こうらの なかに あたまを かくすよ"},
 {id:"river_hakuchou",area:"river",ico:"🦢",n:"はくちょう",rare:true,fact:"しろくて くびが ながい とり",say:"はくちょうを みつけた！ まっしろで くびが ながい きれいな とりだよ"},
 // よるの そら
 {id:"sky_koumori",area:"sky",ico:"🦇",n:"こうもり",fact:"よるに とぶ。さかさまに ぶらさがる",say:"こうもりを みつけた！ よるに とんで、やすむときは さかさまに ぶらさがるよ"},
 {id:"sky_kotori",area:"sky",ico:"🐦",n:"ことり",fact:"よるは きの えだで ねむる",say:"ことりを みつけた！ よるは きの えだに とまって ねむるよ"},
 {id:"sky_washi",area:"sky",ico:"🦅",n:"わし",fact:"めが よくて とおくまで みえる",say:"わしを みつけた！ めが とても よくて とおくの ものまで みえるよ"},
 {id:"sky_hoshinoko",area:"sky",ico:"🌟",n:"ほしの こ",fact:"よぞらで きらきら ひかる",say:"ほしの こを みつけた！ よぞらで きらきら ひかって いるよ"},
 {id:"sky_nagareboshi",area:"sky",ico:"🌠",n:"ながれぼし",rare:true,fact:"よぞらを すーっと とおって きえる",say:"ながれぼしを みつけた！ よぞらを すーっと とおって すぐに きえちゃうよ"},
 // うみ
 {id:"sea_iruka",area:"sea",ico:"🐬",n:"いるか",fact:"あたまの あなで いきを する",say:"いるかを みつけた！ あたまの あなから ぷしゅっと いきを するよ"},
 {id:"sea_tako",area:"sea",ico:"🐙",n:"たこ",fact:"あしが はっぽん。すみを はく",say:"たこを みつけた！ あしが はっぽん あって、にげるときは すみを はくよ"},
 {id:"sea_kani",area:"sea",ico:"🦀",n:"かに",fact:"はさみが あって よこに あるく",say:"かにを みつけた！ おおきな はさみが あって よこに あるくよ"},
 {id:"sea_kai",area:"sea",ico:"🐚",n:"かい",fact:"かたい からの なかに はいって いる",say:"かいを みつけた！ かたい からの なかに やわらかい からだが はいって いるよ"},
 {id:"sea_kujira",area:"sea",ico:"🐋",n:"くじら",rare:true,fact:"せかいで いちばん おおきい いきもの",say:"くじらを みつけた！ せかいで いちばん おおきい いきものだよ"},
 // もり
 {id:"forest_imomushi",area:"forest",ico:"🐛",n:"いもむし",fact:"はっぱを たべて ちょうちょに なる",say:"いもむしを みつけた！ はっぱを もりもり たべて ちょうちょに なるよ"},
 {id:"forest_kinoko",area:"forest",ico:"🍄",n:"きのこ",fact:"あめの あとに にょきにょき はえる",say:"きのこを みつけた！ あめの あとに にょきにょき はえてくるよ"},
 {id:"forest_kitsune",area:"forest",ico:"🦊",n:"きつね",fact:"ふさふさの ながい しっぽ",say:"きつねを みつけた！ ふさふさの ながい しっぽが あるよ"},
 {id:"forest_risu",area:"forest",ico:"🐿️",n:"りす",fact:"どんぐりを つちに うめて かくす",say:"りすを みつけた！ どんぐりを つちに うめて かくして おくよ"},
 {id:"forest_shika",area:"forest",ico:"🦌",n:"しか",rare:true,fact:"おすには りっぱな つのが ある",say:"しかを みつけた！ おすの しかには りっぱな つのが あるよ"},
];
