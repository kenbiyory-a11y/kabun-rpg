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
S.ch=9;ok(stageIdx()===4&&chapterReady()===null,"全章クリアで キング、かべ なし");
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

console.log("== 5. 日替わり ==");
S=FRESH();migrate();dayRoll();S.daily.done.num=1;S.daily.d="2000-01-01";
ok(dayRoll()===true&&!S.daily.done.num,"日付が変わると きょうの分 がリセット");

console.log(fails?`\n${fails} FAILED`:"\nALL OK");
process.exit(fails?1:0);
