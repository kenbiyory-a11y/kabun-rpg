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
// たんけん：スポット生成（ダブりなし・にげる は 先に決める）
S=FRESH();migrate();dayRoll();S.ch=6;S.str=S.wise=S.world=S.heart=58;
ok(zukanOf(AREAS[0]).length===20&&zukanOf(AREAS[0]).filter(z=>z.rare).length===3&&new Set(ZUKAN.map(z=>z.id)).size===ZUKAN.length&&ZUKAN.every(z=>Array.from(z.fact).length<=20),"ずかん：くさむら 20匹（✨ 3匹）、id の重複なし、まめちしき は 20文字以内");
ok(AREAS.every(a=>zukanOf(a).length>=5),"どのエリアにも 5匹以上");
for(let r=0;r<30;r++){const sp=genSpots(AREAS[0]);const cs=sp.filter(s=>s.k==="creature");
 if(!(sp.length===5&&cs.length===3&&sp.filter(s=>s.k==="net").length===1&&sp.filter(s=>s.k==="look").length===1&&new Set(cs.map(s=>s.z)).size===3&&cs.some(s=>!s.flee)&&cs.every(s=>typeof s.flee==="boolean"&&zById(s.z).area==="grass")&&sp.every(s=>s.x>=4&&s.x<=96&&s.y>=58&&s.y<=90))){ok(false,"スポット生成 "+JSON.stringify(sp));break}
 if(r===29)ok(true,"スポットは いきもの3（重複なし・1匹は かならず かげが出る）＋あみ1＋ながめる1")}
{const got=zukanOf(AREAS[0]).slice(0,18);got.forEach(z=>S.dex[z.id]={d:ymd(),n:1});const sp=genSpots(AREAS[0]);const cs=sp.filter(s=>s.k==="creature");
 ok(cs.length===2&&cs.every(s=>!S.dex[s.z])&&sp.filter(s=>s.k==="look").length===2,"のこり 2匹なら いきもの は 2つ（つかまえた ものは 出ない）");
 zukanOf(AREAS[0]).forEach(z=>S.dex[z.id]={d:ymd(),n:1});const sp2=genSpots(AREAS[0]);ok(!sp2.some(s=>s.k==="creature")&&sp2.some(s=>s.k==="net"),"ぜんぶ つかまえたら いきもの は 出ない（あみ と ながめる だけ）");S.dex={}}
S.explore={area:"grass",d:ymd(),spots:genSpots(AREAS[0]),pos:{x:8,y:88},n:0};syncBoss(AREAS[0]);
ok(S.explore.spots.some(s=>s.k==="boss"&&s.id==="gakeen")&&!S.explore.spots.some(s=>s.k==="ura"),"ぬし が出ていれば 右はしに ぬし（うらボス は まだ）");
S.ch=7;syncBoss(AREAS[0]);ok(!S.explore.spots.some(s=>s.k==="boss")&&S.explore.spots.filter(s=>s.k==="ura").length===1&&S.explore.spots.find(s=>s.k==="ura").id==="ura_grass","ぬし を たおすと うらボス が出る");
syncBoss(AREAS[0]);ok(S.explore.spots.filter(s=>s.k==="ura").length===1,"うらボス は 1つだけ（そろえ直しても増えない）");
// かげ → ミニゲーム → つかまえる
UI.instantWalk=true;S.view="battle";S.sub="map";S.items.net=2;
{const cs=S.explore.spots.map((s,i)=>[s,i]).filter(([s])=>s.k==="creature");cs.forEach(([s])=>s.flee=false);
 const [s0,i0]=cs[0];arriveSpot(i0);ok(S.sub==="enc"&&UI.enc&&UI.enc.z===s0.z&&!s0.done&&S.seen[s0.z]===true&&!S.dex[s0.z],"かげ が出る（まだ ずかん には のらない。であった しるし だけ）");
 const g=pickMinigame(zById(s0.z));ok(MINIGAMES.length===8&&!!g&&MINIGAMES.filter(x=>x.ok(zById(s0.z))).length>=7&&new Set(MINIGAMES.map(x=>x.id)).size===8&&MINIGAMES.every(x=>x.n&&x.how&&x.w>0&&typeof x.start==="function"),"ミニゲームは 8種類、しゃしん が無くても 7種類は あそべる");
 {const cnt={};for(let r=0;r<400;r++){const x=pickMinigame(zById(s0.z)).id;cnt[x]=(cnt[x]||0)+1}ok(Object.keys(cnt).length>=7&&cnt.memory>cnt.count&&cnt.shell>cnt.odd,"くじびき：ぜんぶ出る。しんけいすいじゃく などが 多め "+JSON.stringify(cnt))}
 UI.mgForce="count";ok(pickMinigame(zById(s0.z)).id==="count","テスト用に ゲームを 固定できる");UI.mgForce=null;
 S.sub="mg";encResult(true);ok(S.sub==="caught"&&UI.caught===s0.z&&S.dex[s0.z]&&S.items.net===1&&s0.done&&UI.enc===null,"かつと つかまえる：ずかん に のり、あみ -1");
 S.sub="map";const [s1,i1]=cs[1];arriveSpot(i1);S.sub="mg";encResult(false);ok(S.sub==="spot"&&!S.dex[s1.z]&&S.items.net===1&&s1.done&&S.msg.includes("また あえる"),"まけると にげる：あみ は へらない");
 encResult(true);ok(!S.dex[s1.z],"結果は 1回だけ（であい が 終わったあとは 何も起きない）");
 S.sub="map";S.items.net=0;const [s2,i2]=cs[2];arriveSpot(i2);ok(S.sub==="spot"&&!s2.done&&S.msg.includes("あみが ない")&&UI.enc===null,"あみ が 0 だと あそべない（スポットは のこる）");
 S.sub="map";S.items.net=1;s2.flee=true;arriveSpot(i2);ok(S.sub==="spot"&&s2.done&&S.msg.includes("にげていった")&&!S.dex[s2.z]&&S.items.net===1,"にげる スポット：かげ も出ずに にげていく")}
{S.sub="map";const i=S.explore.spots.findIndex(s=>s.k==="net");const before=S.items.net;arriveSpot(i);ok(S.items.net===before+1,"あみ のスポットで あみ +1");
 S.explore.spots[i].done=false;S.items.net=NET_MAX;S.sub="map";arriveSpot(i);ok(S.items.net===NET_MAX&&S.msg.includes("いっぱい"),"あみ は上限を超えない");
 S.explore.spots[i].done=false;S.view="growth";S.sub="menu";arriveSpot(i);ok(!S.explore.spots[i].done&&S.sub==="menu","地図にいないときは 到着しても何も起きない")}
// コンプリート
{S.view="battle";S.sub="map";S.items.net=3;zukanOf(AREAS[0]).forEach(z=>S.dex[z.id]={d:ymd(),n:1});const last=zukanOf(AREAS[0])[19];delete S.dex[last.id];
 S.explore.spots.push({k:"creature",x:50,y:70,z:last.id,flee:false,done:false,cover:"🌿"});const i=S.explore.spots.length-1;arriveSpot(i);S.sub="mg";encResult(true);
 ok(S.flags.comp_grass===true&&zLeft(AREAS[0]).length===0,"20匹 ぜんぶ つかまえると コンプリート");S.explore.spots.splice(i,1)}
// うらボス：バトル → かつと ずかんの ぬし に。ぬし との たたかいかけ は のこる
{S.view="battle";S.sub="map";S.ch=7;S.str=S.wise=S.world=S.heart=68;S.foe=Object.assign(mkFoe(7),{hp:123});syncBoss(AREAS[0]);
 ok(bossHere(AREAS[1])&&uraHere(AREAS[0])&&!uraHere(AREAS[1]),"かわ に ケローン、くさむら に うらボス");
 const iu=S.explore.spots.findIndex(s=>s.k==="ura");arriveSpot(iu);
 ok(S.sub==="fight"&&S.foe.ura==="ura_grass"&&S.foe.name==="クモーン"&&S.foe.ch===S.ch&&S.foeKeep&&S.foeKeep.id==="keroon"&&S.foeKeep.hp===123,"うらボス と バトル。ケローン との たたかいかけ は とっておく");
 const u=uraOf("ura_grass");const st=Math.floor(power(u.weak)*multOf(u.weak,S.foe)),nm=Math.floor(power("wise")*multOf("wise",S.foe));
 ok(u.hp>CHAPTERS[6].foe.hp&&Math.ceil(u.hp/st)<=6&&Math.ceil(u.hp/nm)>=7&&multOf(u.guard,S.foe)===0.5&&Math.ceil(maxHp()/u.dmg)>=8,`クモーン HP${u.hp}：★${Math.ceil(u.hp/st)}ターン、ふつう${Math.ceil(u.hp/nm)}ターン、反撃 ${Math.ceil(maxHp()/u.dmg)}ターン`);
 S.foe.hp=300;uraLeave();ok(S.uraHp.ura_grass===300&&S.foe&&S.foe.id==="keroon"&&S.foe.hp===123&&S.foeKeep===null,"はなれると うらボス の きず を おぼえ、ケローン が もどる");
 S.sub="map";arriveSpot(iu);ok(S.foe.ura==="ura_grass"&&S.foe.hp===300,"もういちど いくと きず は そのまま");
 S.foe.hp=0;uraWin();ok(S.dex.ura_grass&&S.sub==="caught"&&UI.caught==="ura_grass"&&S.foe&&S.foe.id==="keroon"&&S.uraHp.ura_grass===undefined&&!uraHere(AREAS[0]),"かつと ずかんの ぬし に のり、もう 出ない。ケローン は のこる");
 syncBoss(AREAS[0]);ok(!S.explore.spots.some(s=>s.k==="ura"),"かったあとは 地図から 消える");
 ok(URA.length===5&&AREAS.every(a=>uraOfArea(a)&&uraOfArea(a).weak!==uraOfArea(a).guard&&CHARS[uraOfArea(a).id]),"うらボス は 5エリアに 1体ずつ（★ と 🛡️ は 別）")}
// 読み込みなおし：うらボス と たたかっている途中
S=FRESH();migrate();S.ch=7;S.str=S.wise=S.world=S.heart=68;S.foeKeep=Object.assign(mkFoe(7),{hp:99});S.foe={ch:7,id:"ura_grass",ura:"ura_grass",name:"クモーン",hp:250,max:670,dmg:13};migrate();
ok(S.foe&&S.foe.id==="keroon"&&S.foe.hp===99&&S.uraHp.ura_grass===250&&S.foeKeep===null,"うらボス戦の途中で閉じても、きず を おぼえて ケローン戦 に もどる");
S=FRESH();migrate();S.ch=7;S.foe={ch:7,id:"ura_grass",ura:"ura_grass",name:"クモーン",hp:0,max:670,dmg:13};migrate();ok(S.dex.ura_grass&&S.foe===null,"たおした直後に閉じても ずかん に のる");
S=FRESH();migrate();dayRoll();S.explore={area:"grass",d:ymd(),spots:[],pos:{x:8,y:88},n:0};
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
