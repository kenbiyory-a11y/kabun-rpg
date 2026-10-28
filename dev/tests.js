let fails=0;const ok=(cond,msg)=>{if(!cond){fails++;console.log("  FAIL:",msg)}else console.log("  ok:",msg)};

console.log("== 1. 新規セーブ ==");
S=FRESH();migrate();dayRoll();
ok(S.flags.intro!==true&&INTRO.length===7&&INTRO.filter(s=>s.name).length===1&&S.kids.length===0,"新規は はじまりの おはなし（7枚、なまえ の場面1つ、なまえ は未登録）");
ok(familyLine()==="パパと ママと こどもたち","なまえ が無いときの かぞくの文");
S.kids=["はると","あおい"];ok(familyLine()==="パパと ママと はるとと あおい","2人のときの かぞくの文: "+familyLine());S.kids=[];
ok(level()===1&&stageIdx()===0&&maxHp()===52,"Lv1 たまご maxHp52");
ok(chapterReady()===null,"Lv1 では かべ なし");
ok(moveOf("str").n==="ごろごろ"&&power("str")===6,"たまご の固定技 ごろごろ 威力6");

console.log("== 2. 旧セーブ（kabun4）の移行 ==");
__store["kabun4"]=JSON.stringify({name:"はると",ch:1,str:12,wise:4,world:2,heart:6,view:"growth",sub:"quiz",line:0,hp:50,foehp:null,quiz:{cat:"num"},ans:null,used:{num:[0,3,14],eng:[1]},msg:null,diary:[{date:"2026/10/10",e:"🌟",t:"できた"}],memories:[],emo:"🌟",memo:"📸",part:"daily",bgm:"gen1",bgmOn:true});
S=FRESH();const key=load();migrate();dayRoll();
ok(key==="kabun4","kabun4 から読めた");
ok(S.name==="はると"&&S.ch===1&&stageIdx()===1,"名前・章・段階（ようちゅう）を引き継ぐ");
ok(JSON.stringify(S.used.num)===JSON.stringify(["num_a01","num_a04","num_a15"]),"used の添字→id 変換: "+JSON.stringify(S.used.num));
ok(S.quiz===undefined&&S.sub==="menu"&&S.foe===null,"旧 quiz 状態を捨てて menu に");
ok(S.lv.num===1&&Array.isArray(S.rev.num)&&S.hist.num.n===0,"v5 のフィールドが補われる");
ok(S.flags.intro===true,"すでに遊んでいる人には はじまりの おはなし を出さない");
ok(S.kids.length===1&&S.kids[0]==="はると","いまの なまえ が かぞくの なまえ に入る");
save();ok(!!__store["kabun5"]&&!!__store["kabun4"],"kabun5 に保存し kabun4 は残る");

console.log("== 3. セッション ==");
VOICE.ja=false; // listen を除外
const sess=buildSession("num");
ok(sess.items.length===5,"5問組める（num、生成問題込み）: lv="+sess.items.map(i=>i.lv).join(","));
ok(new Set(sess.items.map(i=>i.id)).size===5,"id が重複しない");
ok(sess.items.every(i=>i.opts.includes(i.a)&&i.opts.length>=2),"選択肢に正解が含まれる");
for(const cat of ["eng","flag","animal"]){const s2=buildSession(cat);console.log("   ",cat,"items:",s2.items.length,"ids:",s2.items.map(i=>i.id).join(" "))}
S.sess=sess;sess.res=[true,true,false,true,true];
const sBefore=S.str;const r=finishSession();
ok(r.ok===4&&r.gain===4&&S.str===sBefore+4,"4/5 → ちから +4: "+JSON.stringify({ok:r.ok,gain:r.gain}));
ok(S.daily.done.num===1&&S.daily.score.num===4,"きょうの分に記録");
ok(S.rev.num.length===1&&S.rev.num[0].id===sess.items[2].id&&S.rev.num[0].box===1,"間違いが復習箱へ: "+JSON.stringify(S.rev.num));
ok(S.items.net===1,"あみ +1");
ok(!canTrain("num")&&canTrain("eng"),"num は きょう おしまい、eng は できる");
S.sess=buildSession("eng");if(S.sess.items.length===5){S.sess.res=[true,true,true,true,true];const r2=finishSession();ok(r2.ok===5&&r2.gain===7&&S.items.net===3,"5/5 → +7、あみ +2")}else console.log("   (eng の問題が無いので満点テストは省略)");
S.daily.done.num=0;S.rev.num[0].due=ymd();const s3=buildSession("num");
ok(s3.items.some(i=>i.rev&&i.id===S.rev.num[0].id),"期限が来た復習問題が入る");
S.hist.animal.last=[4];S.sess=buildSession("animal");if(S.sess.items.length===5){S.sess.res=[true,true,true,true,false];const r3=finishSession();ok(S.lv.animal===2&&r3.notes.some(n=>n.includes("むずかしい")),"2回連続4問以上で lv2 に: "+r3.notes.join("|"))}else console.log("   (animal の問題が無いので昇格テストは省略)");

console.log("== 4. レベルと かべ ==");
S=FRESH();migrate();S.str=8;S.wise=8;S.world=8;S.heart=8;
ok(level()===5&&chapterReady()&&chapterReady().foe.name==="たまごのから","合計32 → Lv5 → 第1話 出現");
S.foe=mkFoe(0);
const dmgStar=Math.floor(power("str")*multOf("str",S.foe)),dmgNorm=Math.floor(power("wise")*multOf("wise",S.foe));
ok(dmgStar===21&&dmgNorm===14,`★21 / ふつう14（威力 6+8）: ${dmgStar}/${dmgNorm}`);
ok(Math.ceil(70/dmgStar)===4&&Math.ceil(70/dmgNorm)===5,"第1話 HP70：★4ターン、ふつう5ターン");
S.ch=1;ok(stageIdx()===1&&chapterReady()===null,"第1話クリアで ようちゅう、第2話は Lv8 まで出ない");
S.str=14;S.wise=14;S.world=14;S.heart=14;ok(level()===8&&chapterReady().foe.name==="コバエ","Lv8 → コバエ");
S.ch=4;S.str=34;S.wise=34;S.world=34;S.heart=34;const f5=mkFoe(4);
ok(multOf("str",f5)===0.5&&multOf("world",f5)===1.5&&multOf("wise",f5)===1,"第5話 くずれるつち：🛡️💪 ×0.5、★💨 ×1.5、他 ×1");
ok(Math.ceil(f5.max/Math.floor(power("world")*1.5))===5&&Math.ceil(f5.max/power("wise"))===7,`第5話 HP${f5.max}：★5ターン、ふつう7ターン（威力 ${power("wise")}）`);
S.ch=6;S.str=58;S.wise=58;S.world=58;S.heart=58;
ok(stageIdx()===3&&moveOf("str").n==="かぶとタックル"&&power("str")===80,"せいちゅう Lv30：ステータス58 → かぶとタックル 威力80");
ok(level()===30&&chapterReady().foe.name==="ガキーン","Lv30 → ガキーン");
S.ch=CHAPTERS.length;ok(stageIdx()===4&&chapterReady()===null,"全章クリアで キング、かべ なし");
S.str=130;ok(moveOf("str").n==="おうさまのつの","キングで おうさまのつの");

console.log("== 4b. 国旗の画像化 ==");
ok(rich("🇯🇵 と 🇺🇸").includes('src="./img/flags/jp.svg"')&&rich("🇯🇵 と 🇺🇸").includes('us.svg'),"🇯🇵🇺🇸 → img");
ok(rich("🇽🇾")==="🇽🇾"&&rich("<b>")==="&lt;b&gt;","画像の無い国はそのまま、HTML はエスケープ");

console.log("== 4c. こっき の生成問題（70か国） ==");
const codeOf=e=>Array.from(e).map(c=>String.fromCharCode(c.codePointAt(0)-0x1F1E6+97)).join("");
ok(typeof COUNTRIES!=="undefined"&&COUNTRIES.length===70,"COUNTRIES は 70 か国: "+(typeof COUNTRIES!=="undefined"?COUNTRIES.length:"-"));
ok(COUNTRIES.every(c=>FLAG_CODES.has(c.c)),"全部の国に FLAG_CODES がある");
ok(new Set(COUNTRIES.map(c=>c.c)).size===70&&new Set(COUNTRIES.map(c=>c.n)).size===70,"国コードと国名に重複なし");
ok(COUNTRIES.every(c=>Array.from(c.n).length<=12),"国名は12文字以内");
const fq=genFlag();
ok(fq.length===(70-15)+(70-4),"生成数 "+fq.length+"（こっき→くに 55、くに→こっき 66）");
ok(fq.every(q=>!q.d.includes(q.a)&&new Set(q.d).size===q.d.length&&q.d.length>=1),"はずれ が正解と重ならない");
ok(fq.filter(q=>q.t==="ico").every(q=>[q.a,...q.d].every(e=>FLAG_CODES.has(codeOf(e)))),"くに→こっき の旗はぜんぶ画像がある");
ok(fq.filter(q=>q.t==="pick").every(q=>FLAG_CODES.has(codeOf(q.q))),"こっき→くに の旗はぜんぶ画像がある");
const fjq=fq.find(q=>q.id==="flag_f_fj");ok(fjq&&fjq.d.some(n=>["オーストラリア","ニュージーランド"].includes(n)),"lv3 は似ている国旗を はずれ に使う: "+(fjq&&fjq.d.join("/")));
ok(poolOf("flag").length>=30+fq.length-2,"こっき の出題プールが増えた: "+poolOf("flag").length);

console.log("== 4d. レビューで見つかった不具合の回帰 ==");
S=FRESH();migrate();dayRoll();VOICE.ja=false;
S.lv.eng=1;S.used.eng=poolOf("eng").filter(q=>q.lv===1).map(q=>q.id);const sx=buildSession("eng");
ok([0,1,3,4].every(i=>sx.items[i]&&sx.items[i].lv===1)&&sx.items[2].lv===2,"lv1 を使い切っても lv1 の出題済みを使い、lv2 は ちょうせん枠だけ: "+sx.items.map(i=>i.lv).join(","));
ok(!valid({name:"a",ch:0,view:"growth",str:"12",wise:1,world:1,heart:1,diary:[]}),"ステータスが文字列のセーブは valid を通らない");
S=FRESH();migrate();S.sess={cat:"num",d:"2000-01-01",i:5,items:[],res:[],result:{ok:3,gain:3,k:"str",notes:[]}};S.daily.d="2000-01-01";dayRoll();ok(!!S.sess&&!!S.sess.result,"採点ずみの結果画面は日付が変わっても残る");
S=FRESH();migrate();S.name="はると";S.kids=[];delete S.flags.intro;migrate();ok(S.kids[0]==="はると"&&S.flags.intro===true,"旧セーブは いまの なまえ を かぞく に入れる（一度だけ）");
S.kids=[];migrate();ok(S.kids.length===0,"2回目以降は復活しない");
ok(numberedOpts({t:"pick",opts:["にほん","かんこく","ちゅうごく"]})===true&&numberedOpts({t:"pick",opts:["3","2","4"]})===false&&numberedOpts({t:"pick",opts:["three","two","four"]})===false,"数字の選択肢には番号を付けない");
ok(genNum().filter(q=>q.id.startsWith("num_sub_")).every(q=>/^(🍎|🍓|🍬|🍪|🍙|🍊)/u.test(q.q))&&genNum().find(q=>q.id==="num_add_2_1").say.includes("2つと 1つ"),"のこり は食べ物だけ、あわせて の読み上げに数が入る");
ok(EMOJI_RE.test("🇯🇵")&&EMOJI_RE.test("🍎")&&!EMOJI_RE.test("にほん"),"国旗も絵文字として判定する");
S.str=12;S.wise=12;S.world=12;S.heart=12;S.ch=0;S.foe=mkFoe(0);S.foe.hp=0;S.sub="menu";
ok(!!chapterReady(),"（下準備）Lv7 で第1話が出ている");

console.log("== 4e. こえ の選択 ==");
VOICE.list=[{name:"Microsoft Haruka - Japanese (Japan)",lang:"ja-JP",localService:true},{name:"Microsoft Nanami Online (Natural) - Japanese (Japan)",lang:"ja-JP",localService:false},{name:"Google US English",lang:"en-US",localService:false}];
voiceSet("");ok(pickVoice("ja").name.startsWith("Microsoft Haruka"),"選んでいなければ端末内の声を先に使う");
voiceSet("Microsoft Nanami Online (Natural) - Japanese (Japan)");ok(pickVoice("ja").name.includes("Nanami")&&__store["kabun-voice-ja"]&&!JSON.stringify(S).includes("Nanami"),"選んだ声を使う（端末の localStorage に入り、セーブには入らない）");
voiceSet("そんざいしない こえ");ok(pickVoice("ja").name.startsWith("Microsoft Haruka"),"端末に無い声が選ばれていたら自動に戻る");
ok(voiceLabel(VOICE.list[1])==="Nanami (Natural)"&&voiceLabel(VOICE.list[0])==="Haruka","表示名を短くする: "+voiceLabel(VOICE.list[1]));
voiceSet("");VOICE.list=[];VOICE.ja=false;

console.log("== 4f. そと（エリア・ぬし・たんけん） ==");
ok(CHAPTERS.length===11&&CHAPTERS[7].foe.name==="ケローン"&&CHAPTERS[7].lv===35&&CHAPTERS[9].foe.name==="サメーン"&&CHAPTERS[9].lv===45&&CHAPTERS[10].evolve===4,"11章：Lv35 ケローン、Lv45 サメーン、最終話は クガーン");
ok(AREAS.map(a=>a.id).join(",")==="grass,river,sky,sea,forest"&&AREAS.every(a=>areaBossIdx(a)>=6),"5エリアに ぬし が1体ずつ");
S=FRESH();migrate();S.ch=6;S.str=S.wise=S.world=S.heart=58;
ok(stageIdx()===3&&areaOpen(AREAS[0])&&!areaOpen(AREAS[1])&&bossHere(AREAS[0])&&!bossHere(AREAS[1]),"せいちゅう Lv30：くさむら だけ ひらき、ガキーン が出ている");
S.ch=7;ok(areaOpen(AREAS[1])&&!areaOpen(AREAS[2])&&!bossHere(AREAS[1]),"ガキーンを倒すと かわ が ひらく（ケローンは Lv35 まで出ない）");
S.str=S.wise=S.world=S.heart=68;ok(level()===35&&bossHere(AREAS[1])&&!bossHere(AREAS[0]),"Lv35 で かわ に ケローン");
S.ch=11;ok(stageIdx()===4&&AREAS.every(areaOpen)&&chapterReady()===null,"全部倒すと キングで どこでも ひらく");
S.ch=1;ok(!areaOpen(AREAS[0]),"ようちゅう は そとに 出られない");
// ケローン／サメーン の強さ：★連打 5ターン、ふつう 8ターン、反撃は 8ターン以上もつ
S.ch=7;S.str=S.wise=S.world=S.heart=68;{const f=mkFoe(7);const st=Math.floor(power("world")*multOf("world",f)),nm=Math.floor(power("str")*multOf("str",f)),gd=Math.floor(power("heart")*multOf("heart",f));
 ok(Math.ceil(f.max/st)===5&&Math.ceil(f.max/nm)===8&&gd<nm&&Math.ceil(maxHp()/f.dmg)>=8,`ケローン HP${f.max}：★${Math.ceil(f.max/st)}ターン、ふつう${Math.ceil(f.max/nm)}ターン、🛡️こころ、反撃 ${Math.ceil(maxHp()/f.dmg)}ターン`)}
S.ch=9;S.str=S.wise=S.world=S.heart=88;{const f=mkFoe(9);const st=Math.floor(power("str")*multOf("str",f)),nm=Math.floor(power("world")*multOf("world",f));
 ok(level()===45&&Math.ceil(f.max/st)===5&&Math.ceil(f.max/nm)===8&&f.guard==="wise"&&Math.ceil(maxHp()/f.dmg)>=8,`サメーン HP${f.max}：★${Math.ceil(f.max/st)}ターン、ふつう${Math.ceil(f.max/nm)}ターン、🛡️ちえ`)}
// 旧セーブの章番号：7以下はそのまま、8（ホウリンまで）→9、9（全部）→11
for(const [from,to] of [[0,0],[6,6],[7,7],[8,9],[9,11]]){S=FRESH();S.ch=from;S.str=S.wise=S.world=S.heart=98;if(from>=7)S.foe={ch:from,hp:10,max:100};delete S.flags.ch11;migrate();ok(S.ch===to&&(from<7||S.foe===null||S.foe.ch===to),`章番号の移行 ${from} → ${S.ch}`+(from>=7?`（foe ${S.foe?S.foe.ch:"なし"}）`:""))}
S=FRESH();S.ch=8;migrate();migrate();ok(S.ch===9,"移行は一度だけ");
S=FRESH();S.ch=7;S.str=S.wise=S.world=S.heart=98;S.foe=Object.assign(mkFoe(8),{ch:7,hp:100});delete S.flags.ch11;migrate();ok(S.ch===7&&S.foe===null,"旧 第8話（ホウリン）と戦いかけのセーブ：章は 7 のまま、ぬし が ケローンに変わるので戦いかけは捨てる");
S=FRESH();S.ch=7;S.str=S.wise=S.world=S.heart=98;S.foe=Object.assign(mkFoe(7),{hp:100});migrate();ok(S.foe&&S.foe.id==="keroon"&&S.foe.hp===100,"いまの章の ぬし なら 戦いかけは残る");
S=FRESH();migrate();S.explore={area:"grass",d:ymd(),spots:[]};migrate();ok(S.explore===null,"pos の無い たんけん データは捨てる");
// たんけん：スポット生成と ずかん
S=FRESH();migrate();dayRoll();S.ch=6;S.str=S.wise=S.world=S.heart=58;
{const sp=genSpots(AREAS[0]);const ks=sp.map(s=>s.k).sort().join(",");
 ok(sp.length===5&&ks==="creature,creature,creature,look,net"&&sp.every(s=>s.x>=4&&s.x<=96&&s.y>=58&&s.y<=90)&&new Set(sp.filter(s=>s.z).map(s=>s.z)).size===3,"スポットは いきもの3＋あみ1＋ながめる1、地面の帯の中、いきもの は重複なし: "+ks);
 ok(sp.filter(s=>s.z).every(s=>ZUKAN.find(z=>z.id===s.z&&z.area==="grass")),"いきもの は そのエリアの ずかん から")}
ok(ZUKAN.length===25&&AREAS.every(a=>zukanOf(a).length===5&&zukanOf(a).filter(z=>z.rare).length===1),"ずかん は 5エリア × 5匹（✨ 1匹ずつ）");
S.explore={area:"grass",d:ymd(),spots:genSpots(AREAS[0]),pos:{x:8,y:88},n:0};syncBoss(AREAS[0]);
ok(S.explore.spots.some(s=>s.k==="boss"&&s.id==="gakeen"),"ぬし が出ていれば 🪧 が足される");
S.ch=7;syncBoss(AREAS[0]);ok(!S.explore.spots.some(s=>s.k==="boss"),"倒したら 🪧 は消える");
S.view="battle";S.sub="map";{const i=S.explore.spots.findIndex(s=>s.k==="creature");const z=S.explore.spots[i].z;UI.instantWalk=true;arriveSpot(i);
 ok(S.explore.spots[i].done&&S.dex[z]&&S.dex[z].n===1&&S.sub==="spot"&&S.msg.includes("ずかんに のった"),"いきもの を みつけると ずかん に のる");
 S.explore.spots[i].done=false;S.sub="map";arriveSpot(i);ok(S.dex[z].n===2&&!S.msg.includes("ずかんに のった"),"2回目は かずだけ 増える")}
{const i=S.explore.spots.findIndex(s=>s.k==="net");const before=S.items.net;S.view="battle";S.sub="map";arriveSpot(i);ok(S.items.net===before+1,"あみ のスポットで あみ +1");
 S.explore.spots[i].done=false;S.items.net=NET_MAX;S.view="battle";S.sub="map";arriveSpot(i);ok(S.items.net===NET_MAX&&S.msg.includes("いっぱい"),"あみ は上限を超えない");
 S.explore.spots[i].done=false;S.view="growth";S.sub="menu";arriveSpot(i);ok(!S.explore.spots[i].done&&S.sub==="menu","地図にいないときは 到着しても何も起きない")}
S.daily.explore="grass";S.daily.d="2000-01-01";S.explore.d="2000-01-01";dayRoll();ok(S.daily.explore===null&&S.explore===null,"日付が変わると たんけん は消える（翌日また 1回）");
// クガーンの しけん：ダメージは 1、5ターン目に ふきとばされる
S=FRESH();migrate();S.ch=6;S.str=S.wise=S.world=S.heart=58;S.view="battle";startTrial();
ok(S.sub==="fight"&&S.foe&&S.foe.trial&&S.foe.id==="kugaan"&&S.foe.ch===S.ch&&S.hp===maxHp(),"しけん 開始：クガーン、ふつうの バトル画面");
{let t=0;while(t<TRIAL_TURNS-1){t++;trialAttack("wise");ok(S.foe.hp===S.foe.max-t&&S.hp>0&&S.sub==="turn"&&S.msg.includes("びくとも"),`${t}ターン目：ダメージ 1、カブーンは まだ たっている（HP ${S.hp}）`)}
 trialAttack("str");ok(S.hp===0&&S.msg.includes("ふきとばされた")&&S.foe.hp>=S.foe.max-TRIAL_TURNS,"5ターン目：おうさまの いちげき で HP 0")}
ok(TRIAL_END.some(t=>t.includes("せかいを まわって ちからを つけてこい")),"まけたあと「せかいを まわって ちからを つけてこい」");
save();load();migrate();ok(S.foe&&S.foe.trial&&S.foe.id==="kugaan","再読み込みしても しけん の foe は捨てない");
S=FRESH();S.ch=7;migrate();ok(S.flags.outIntro===true,"すでに ガキーンを倒した旧セーブには 演出を出さない");
S=FRESH();S.ch=6;migrate();ok(S.flags.outIntro===undefined,"せいちゅうに なったばかりなら 演出が出る");

console.log("== 5. 日替わり ==");
S=FRESH();migrate();dayRoll();S.daily.done.num=1;S.daily.d="2000-01-01";
ok(dayRoll()===true&&!S.daily.done.num,"日付が変わると きょうの分 がリセット");

console.log(fails?`\n${fails} FAILED`:"\nALL OK");
process.exit(fails?1:0);
