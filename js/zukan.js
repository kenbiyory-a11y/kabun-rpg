// ---------- ずかん：そと で つかまえる いきもの（エリアごと 20匹が目標。✨ は レア。2026-11-11：くさむら 20匹、ほかは 5匹ずつ） ----------
// 追記専用。id は変えない・消さない（セーブ S.dex に id が残る）。外したいときは hidden:true
// img:true → img/zukan/<id>.jpg（しゃしん）がある。cut:true → img/zukan/<id>_cut.png（背景を抜いた絵。まっくろにして かげ に使う）がある。
// 無いものは ico（絵文字）で出る。写真の出典は img/zukan/CREDITS.md。say の「みつけた」は 画面で「つかまえた」に読みかえる
// n・fact・say は ひらがな・カタカナ だけ（4歳が読める／読み上げに漢字を渡さない）。fact は 20文字以内
// ぬし と重なる生き物（かえる・ふくろう・さめ・くわがた）は入れない
const ZUKAN=[
 // くさむら
 {id:"grass_batta",area:"grass",ico:"🦗",img:true,cut:true,n:"ばった",fact:"うしろあしで ぴょーんと とぶ",say:"ばったを みつけた！ うしろあしで ぴょーんと とぶよ"},
 {id:"grass_tentoumushi",area:"grass",ico:"🐞",img:true,n:"てんとうむし",fact:"あかい せなかに くろい てんてん",say:"てんとうむしを みつけた！ あかい せなかに くろい てんてんが あるよ"},
 {id:"grass_chouchou",area:"grass",ico:"🦋",img:true,cut:true,n:"ちょうちょ",fact:"ひらひら とんで はなの みつを すう",say:"ちょうちょを みつけた！ ひらひら とんで はなの みつを すうよ"},
 {id:"grass_katatsumuri",area:"grass",ico:"🐌",img:true,cut:true,n:"かたつむり",fact:"あめの ひに でてくる",say:"かたつむりを みつけた！ あめの ひに のそのそ でてくるよ"},
 {id:"grass_mitsubachi",area:"grass",ico:"🐝",img:true,cut:true,n:"みつばち",rare:true,fact:"はなの みつで はちみつを つくる",say:"みつばちを みつけた！ はなの みつで あまい はちみつを つくるよ"},
 {id:"grass_shouryoubatta",area:"grass",ico:"🦗",img:true,cut:true,n:"しょうりょうばった",fact:"あたまが とがった ながい ばった",say:"しょうりょうばったを みつけた！ あたまが とがった ほそながい ばっただよ"},
 {id:"grass_koorogi",area:"grass",ico:"🦗",img:true,cut:true,n:"こおろぎ",fact:"あきの よるに コロコロ なく",say:"こおろぎを みつけた！ あきの よるに コロコロと きれいな こえで なくよ"},
 {id:"grass_kirigirisu",area:"grass",ico:"🦗",img:true,cut:true,n:"きりぎりす",fact:"なつに ギーッチョンと なく",say:"きりぎりすを みつけた！ なつの くさむらで ギーッチョンと なくよ"},
 {id:"grass_suzumushi",area:"grass",ico:"🦗",img:true,cut:true,n:"すずむし",fact:"はねを こすって リーンと なく",say:"すずむしを みつけた！ はねを こすって リーンリーンと すずの ような こえで なくよ"},
 {id:"grass_kamakiri",area:"grass",ico:"🦗",img:true,cut:true,n:"かまきり",fact:"かまの ような まえあしで つかまえる",say:"かまきりを みつけた！ かまの ような まえあしで えものを つかまえるよ"},
 {id:"grass_koganemushi",area:"grass",ico:"🐞",img:true,cut:true,n:"こがねむし",fact:"みどりに ぴかぴか ひかる からだ",say:"こがねむしを みつけた！ みどりいろに ぴかぴか ひかる からだだよ"},
 {id:"grass_kamemushi",area:"grass",ico:"🐞",img:true,cut:true,n:"かめむし",fact:"さわると くさい においを だす",say:"かめむしを みつけた！ びっくりすると くさい においを だすよ"},
 {id:"grass_hotaru",area:"grass",ico:"🐞",img:true,cut:true,n:"ほたる",rare:true,fact:"よるに おしりが ぴかぴか ひかる",say:"ほたるを みつけた！ よるに なると おしりが ぴかぴか ひかるよ"},
 {id:"grass_ageha",area:"grass",ico:"🦋",img:true,cut:true,n:"あげはちょう",fact:"きいろと くろの おおきな はね",say:"あげはちょうを みつけた！ きいろと くろの もようの おおきな はねだよ"},
 {id:"grass_tonbo",area:"grass",ico:"🦋",img:true,cut:true,n:"とんぼ",fact:"おおきな めで ぐるっと みまわす",say:"とんぼを みつけた！ おおきな めで まわりを ぐるっと みまわせるよ"},
 {id:"grass_dangomushi",area:"grass",ico:"🐛",img:true,cut:true,n:"だんごむし",fact:"さわると くるんと まるくなる",say:"だんごむしを みつけた！ さわると くるんと まるく なるよ"},
 {id:"grass_kumo",area:"grass",ico:"🕷️",img:true,n:"くも",fact:"おしりから いとを だして すを つくる",say:"くもを みつけた！ おしりから いとを だして すを つくるよ"},
 {id:"grass_minomushi",area:"grass",ico:"🐛",img:true,cut:true,n:"みのむし",fact:"はっぱや えだで ふくろを つくる",say:"みのむしを みつけた！ はっぱや えだで ふくろを つくって なかに かくれるよ"},
 {id:"grass_kanahebi",area:"grass",ico:"🦎",img:true,cut:true,n:"かなへび",fact:"しっぽが ながい ちいさな とかげ",say:"かなへびを みつけた！ しっぽが ながい ちいさな とかげだよ"},
 {id:"grass_tamamushi",area:"grass",ico:"🐞",img:true,cut:true,n:"たまむし",rare:true,fact:"にじいろに ひかる きれいな むし",say:"たまむしを みつけた！ にじいろに ひかる とても きれいな むしだよ"},
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
