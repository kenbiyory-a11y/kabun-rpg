# そと の 背景イラスト（SVG）を作る：grass / river / sky / sea / forest / dino / deep / space（500x250）と world / world2（500x340）。乱数は 種を固定して 毎回 同じ絵にする
import os, random, math, sys
OUT = sys.argv[1]; os.makedirs(OUT, exist_ok=True)
def svg(w, h, body): return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" preserveAspectRatio="xMidYMid slice">{body}</svg>'
def cloud(x, y, s=1, fill="#fff", op=.95):
    return f'<g fill="{fill}" opacity="{op}"><ellipse cx="{x}" cy="{y}" rx="{26*s:.0f}" ry="{11*s:.0f}"/><ellipse cx="{x-14*s:.0f}" cy="{y-7*s:.0f}" rx="{13*s:.0f}" ry="{10*s:.0f}"/><ellipse cx="{x+8*s:.0f}" cy="{y-10*s:.0f}" rx="{16*s:.0f}" ry="{12*s:.0f}"/></g>'
def hill(points, fill): return f'<path d="M{points} L500,250 L0,250Z" fill="{fill}"/>'
def tuft(x, y, s=1, c="#3f8f3a"):
    return f'<path d="M{x-5*s:.1f},{y} q{1*s:.1f},{-9*s:.1f} {-2*s:.1f},{-13*s:.1f} M{x},{y} q{1*s:.1f},{-12*s:.1f} {0},{-17*s:.1f} M{x+5*s:.1f},{y} q{-1*s:.1f},{-9*s:.1f} {3*s:.1f},{-12*s:.1f}" stroke="{c}" stroke-width="{2.2*s:.1f}" fill="none" stroke-linecap="round"/>'
def flower(x, y, c="#ff8fb1", s=1):
    pet = "".join(f'<circle cx="{x+4*s*math.cos(a):.1f}" cy="{y+4*s*math.sin(a):.1f}" r="{3*s:.1f}" fill="{c}"/>' for a in [i*math.pi*2/5 for i in range(5)])
    return f'<path d="M{x},{y} v{9*s:.0f}" stroke="#3f8f3a" stroke-width="2"/>{pet}<circle cx="{x}" cy="{y}" r="{2.2*s:.1f}" fill="#ffd94a"/>'
def tree(x, y, s=1, leaf="#2f7a3a", leaf2="#3f9548", trunk="#7a5230"):
    return (f'<rect x="{x-4*s:.1f}" y="{y-22*s:.1f}" width="{8*s:.1f}" height="{24*s:.1f}" rx="2" fill="{trunk}"/>'
            f'<circle cx="{x}" cy="{y-36*s:.1f}" r="{20*s:.1f}" fill="{leaf}"/><circle cx="{x-13*s:.1f}" cy="{y-27*s:.1f}" r="{13*s:.1f}" fill="{leaf}"/><circle cx="{x+13*s:.1f}" cy="{y-27*s:.1f}" r="{13*s:.1f}" fill="{leaf}"/>'
            f'<circle cx="{x-5*s:.1f}" cy="{y-41*s:.1f}" r="{9*s:.1f}" fill="{leaf2}" opacity=".8"/>')
def pine(x, y, s=1, c="#1f5a30"):
    return f'<rect x="{x-3*s:.1f}" y="{y-8*s:.1f}" width="{6*s:.1f}" height="{10*s:.1f}" fill="#5a3d22"/><path d="M{x},{y-52*s:.1f} l{15*s:.1f},{22*s:.1f} h{-7*s:.1f} l{11*s:.1f},{18*s:.1f} h{-38*s:.1f} l{11*s:.1f},{-18*s:.1f} h{-7*s:.1f}Z" fill="{c}"/>'
def rock(x, y, s=1): return f'<path d="M{x-12*s:.0f},{y} q{-2*s:.0f},{-12*s:.0f} {9*s:.0f},{-14*s:.0f} q{10*s:.0f},{-3*s:.0f} {15*s:.0f},{6*s:.0f} q{3*s:.0f},{6*s:.0f} {-2*s:.0f},{8*s:.0f}Z" fill="#9aa0a6"/><path d="M{x-6*s:.0f},{y-10*s:.0f} q{6*s:.0f},{-4*s:.0f} {11*s:.0f},0" stroke="#c9ced3" stroke-width="2" fill="none"/>'
def wave(y, c="#fff", op=.6, n=9, amp=4, off=0):
    d = f"M{-20+off},{y}" + "".join(f" q14,{-amp} 28,0 t28,0" for _ in range(n)); return f'<path d="{d}" stroke="{c}" stroke-width="2.5" fill="none" opacity="{op}" stroke-linecap="round"/>'
def star(x, y, r=1.6, c="#fff8c9", op=1): return f'<circle cx="{x:.0f}" cy="{y:.0f}" r="{r:.1f}" fill="{c}" opacity="{op:.2f}"/>'
def mushroom(x, y, s=1, cap="#e0483b"):
    return f'<rect x="{x-3*s:.1f}" y="{y-9*s:.1f}" width="{6*s:.1f}" height="{10*s:.1f}" rx="2" fill="#f3ead8"/><path d="M{x-11*s:.1f},{y-8*s:.1f} q{11*s:.1f},{-16*s:.1f} {22*s:.1f},0Z" fill="{cap}"/><circle cx="{x-4*s:.1f}" cy="{y-12*s:.1f}" r="{1.8*s:.1f}" fill="#fff"/><circle cx="{x+4*s:.1f}" cy="{y-11*s:.1f}" r="{1.4*s:.1f}" fill="#fff"/>'
def defs(*g): return "<defs>" + "".join(g) + "</defs>"
def lg(i, stops, x2=0, y2=1): return f'<linearGradient id="{i}" x1="0" y1="0" x2="{x2}" y2="{y2}">' + "".join(f'<stop offset="{o}" stop-color="{c}"/>' for o, c in stops) + "</linearGradient>"

# ---------- くさむら（地面は y=135 から）----------
R = random.Random(11); b = defs(lg("s", [(0, "#8fd3ff"), (1, "#e6f7ff")]), lg("g", [(0, "#a8dd72"), (1, "#6fb84a")]))
b += '<rect width="500" height="250" fill="url(#s)"/><circle cx="430" cy="42" r="24" fill="#fff3a6"/><circle cx="430" cy="42" r="17" fill="#ffe14d"/>'
b += cloud(90, 40, 1.1) + cloud(250, 28, .8) + cloud(350, 70, .7, op=.8)
b += hill("0,128 Q90,88 190,120 T380,104 T500,118", "#8ccf7a") + hill("0,140 Q120,112 240,134 T500,126", "#79c264")
b += '<path d="M0,135 Q125,126 250,135 T500,133 V250 H0Z" fill="url(#g)"/>'
b += tree(40, 132, .75) + tree(468, 130, .85) + tree(300, 122, .45, "#4f9f4a", "#6ab55c")
for _ in range(34): b += tuft(R.uniform(5, 495), R.uniform(150, 246), R.uniform(.7, 1.3), R.choice(["#3f8f3a", "#4c9c40", "#357f33"]))
for _ in range(11): b += flower(R.uniform(10, 490), R.uniform(150, 238), R.choice(["#ff8fb1", "#fff", "#ffd94a", "#c79bff"]), R.uniform(.8, 1.1))
b += "".join(f'<path d="M{x},250 q{R.uniform(-4,4):.0f},-22 {R.uniform(-8,8):.0f},-{R.uniform(26,40):.0f}" stroke="#2f7a33" stroke-width="4" fill="none" stroke-linecap="round"/>' for x in list(range(0, 60, 9)) + list(range(445, 500, 9)))
open(os.path.join(OUT, "grass.svg"), "w", encoding="utf-8").write(svg(500, 250, b))

# ---------- かわ（川は y=112〜180、手前の きし は y=182 から）----------
R = random.Random(22); b = defs(lg("s", [(0, "#9bdcff"), (1, "#eaf8ff")]), lg("w", [(0, "#63c3ee"), (1, "#2f9bd6")]), lg("g", [(0, "#b4dd7c"), (1, "#7fbf55")]))
b += '<rect width="500" height="250" fill="url(#s)"/>' + cloud(110, 34, 1) + cloud(330, 24, .8) + cloud(440, 58, .6, op=.8)
b += hill("0,96 Q80,58 170,90 T330,70 T500,92", "#9fd39a") + hill("0,108 Q140,84 260,104 T500,98", "#7cc071")
b += pine(60, 108, .7) + pine(92, 110, .55, "#2a6a3a") + tree(410, 108, .6) + tree(455, 110, .7) + pine(250, 104, .5, "#2a6a3a")
b += '<path d="M0,112 Q125,104 250,112 T500,110 V184 H0Z" fill="url(#w)"/>'
b += wave(126, op=.55) + wave(144, op=.45, off=14) + wave(162, op=.5, off=6)
b += rock(120, 150, 1.2) + rock(330, 138, .9) + rock(420, 166, 1.1)
b += '<ellipse cx="210" cy="160" rx="16" ry="6" fill="#58a84a"/><path d="M210,160 l10,-3 v6Z" fill="#2f9bd6"/><circle cx="214" cy="156" r="3.5" fill="#ffb3d1"/><ellipse cx="60" cy="140" rx="12" ry="4.5" fill="#58a84a"/>'
b += '<path d="M0,182 Q125,174 250,182 T500,180 V250 H0Z" fill="url(#g)"/><path d="M0,182 Q125,174 250,182 T500,180" stroke="#e9dfb8" stroke-width="5" fill="none"/>'
for x in [14, 26, 38, 470, 482, 494, 460]: b += f'<path d="M{x},196 v-{R.uniform(34,52):.0f}" stroke="#4f8f3a" stroke-width="3"/><ellipse cx="{x}" cy="{196-R.uniform(40,54):.0f}" rx="3.5" ry="9" fill="#7a5230"/>'
for _ in range(22): b += tuft(R.uniform(5, 495), R.uniform(198, 246), R.uniform(.7, 1.2), R.choice(["#3f8f3a", "#4c9c40"]))
for _ in range(9): b += f'<ellipse cx="{R.uniform(10,490):.0f}" cy="{R.uniform(196,244):.0f}" rx="{R.uniform(4,8):.0f}" ry="{R.uniform(2.5,4.5):.1f}" fill="{R.choice(["#c9c4b4","#aeb4b8","#e0dccb"])}"/>'
for _ in range(5): b += flower(R.uniform(20, 480), R.uniform(202, 238), R.choice(["#fff", "#ffd94a", "#ff8fb1"]), .9)
open(os.path.join(OUT, "river.svg"), "w", encoding="utf-8").write(svg(500, 250, b))

# ---------- よるの そら（丘の 上。地面は y=145 から）----------
R = random.Random(33); b = defs(lg("s", [(0, "#0f1b3d"), (.6, "#27356b"), (1, "#4a4f8a")]), lg("g", [(0, "#3f6b4a"), (1, "#274a35")]))
b += '<rect width="500" height="250" fill="url(#s)"/>'
for _ in range(70): b += star(R.uniform(0, 500), R.uniform(0, 130), R.uniform(.7, 2.1), R.choice(["#fff8c9", "#fff", "#cfe3ff"]), R.uniform(.5, 1))
b += '<circle cx="408" cy="48" r="40" fill="#fff6b8" opacity=".18"/><circle cx="408" cy="48" r="27" fill="#fff3a0"/><circle cx="398" cy="40" r="5" fill="#f1e07c"/><circle cx="416" cy="56" r="7" fill="#f1e07c"/><circle cx="420" cy="38" r="3" fill="#f1e07c"/>'
b += '<path d="M70,30 l2.2,6.5 6.8,.2 -5.4,4.1 2,6.6 -5.6,-3.9 -5.6,3.9 2,-6.6 -5.4,-4.1 6.8,-.2Z" fill="#ffe66b"/><path d="M190,52 l1.6,4.6 4.9,.1 -3.9,3 1.4,4.7 -4,-2.8 -4,2.8 1.4,-4.7 -3.9,-3 4.9,-.1Z" fill="#ffe66b"/>'
b += '<path d="M130,18 l44,26" stroke="#fff" stroke-width="2" opacity=".7" stroke-linecap="round"/><circle cx="130" cy="18" r="2.6" fill="#fff"/>'
b += cloud(250, 78, 1.1, "#5a629c", .8) + cloud(60, 96, .9, "#4b5390", .8) + cloud(460, 104, .8, "#5a629c", .7)
b += hill("0,132 L60,96 L110,126 L170,84 L240,130 L300,102 L360,132 L430,92 L500,128", "#1f2f55") + hill("0,140 Q120,118 250,138 T500,132", "#2d4a4a")
b += pine(36, 142, .8, "#16382a") + pine(70, 144, .6, "#1b4030") + pine(462, 140, .9, "#16382a") + pine(430, 144, .6, "#1b4030")
b += '<path d="M0,145 Q125,134 250,145 T500,142 V250 H0Z" fill="url(#g)"/>'
for _ in range(26): b += tuft(R.uniform(5, 495), R.uniform(160, 246), R.uniform(.7, 1.2), R.choice(["#2f5d3d", "#3a6b45", "#254c33"]))
for _ in range(12):
    x, y = R.uniform(10, 490), R.uniform(150, 240); b += f'<circle cx="{x:.0f}" cy="{y:.0f}" r="5" fill="#e9ff7a" opacity=".22"/><circle cx="{x:.0f}" cy="{y:.0f}" r="1.8" fill="#f4ff9c"/>'
for _ in range(5): b += flower(R.uniform(20, 480), R.uniform(170, 238), R.choice(["#cfd6ff", "#fff"]), .85)
open(os.path.join(OUT, "sky.svg"), "w", encoding="utf-8").write(svg(500, 250, b))

# ---------- うみ（海は y=112〜186、すなはま は y=186 から）----------
R = random.Random(44); b = defs(lg("s", [(0, "#7fd0ff"), (1, "#eafaff")]), lg("w", [(0, "#49b4ea"), (1, "#1f86c9")]), lg("g", [(0, "#f6e7b6"), (1, "#e9cf8a")]))
b += '<rect width="500" height="250" fill="url(#s)"/><circle cx="80" cy="46" r="26" fill="#fff3a6"/><circle cx="80" cy="46" r="18" fill="#ffe14d"/>' + cloud(230, 36, 1.1) + cloud(400, 54, .9) + cloud(320, 86, .6, op=.8)
b += '<path d="M0,112 H500 V190 H0Z" fill="url(#w)"/>'
b += '<path d="M356,112 q24,-22 52,0Z" fill="#e9cf8a"/><path d="M382,100 q-2,-18 4,-30" stroke="#7a5230" stroke-width="4" fill="none"/><path d="M386,70 q-18,-6 -24,6 M386,70 q16,-10 26,2 M386,70 q-8,-16 -22,-12 M386,70 q10,-14 22,-8" stroke="#2f8a3a" stroke-width="4.5" fill="none" stroke-linecap="round"/>'
b += '<path d="M150,108 l26,0 -6,9 h-14Z" fill="#b5542f"/><path d="M163,108 v-24 l14,20Z" fill="#fff"/><path d="M161,108 v-18 l-10,15Z" fill="#ffe9e0"/>'
b += wave(126, op=.6) + wave(142, op=.5, off=12) + wave(158, op=.55, off=4) + wave(172, op=.6, off=18)
b += '<path d="M0,186 Q62,176 125,186 T250,186 T375,186 T500,186 V250 H0Z" fill="url(#g)"/><path d="M0,186 Q62,176 125,186 T250,186 T375,186 T500,186" stroke="#fff" stroke-width="6" fill="none" opacity=".85"/>'
for _ in range(30): b += f'<circle cx="{R.uniform(4,496):.0f}" cy="{R.uniform(196,247):.0f}" r="{R.uniform(.8,1.6):.1f}" fill="#d9bd72"/>'
for x, y, c in [(70, 226, "#ffb3c7"), (200, 240, "#fff"), (330, 222, "#ffd9a8"), (446, 236, "#ffb3c7")]:
    b += f'<path d="M{x-9},{y} q9,-16 18,0Z" fill="{c}"/><path d="M{x},{y} v-8 M{x-4},{y} l2,-6 M{x+4},{y} l-2,-6" stroke="#e59ab0" stroke-width="1.2"/>'
b += '<path d="M128,214 l3,8 8.5,.3 -6.7,5.2 2.4,8.2 -7.2,-4.8 -7.2,4.8 2.4,-8.2 -6.7,-5.2 8.5,-.3Z" fill="#ff8a5c"/><path d="M398,206 l2.4,6.5 7,.2 -5.5,4.3 2,6.8 -5.9,-4 -5.9,4 2,-6.8 -5.5,-4.3 7,-.2Z" fill="#ffb24d"/>'
b += '<path d="M20,250 q-6,-40 8,-70" stroke="#7a5230" stroke-width="7" fill="none"/><path d="M28,180 q-26,-8 -34,10 M28,180 q22,-14 38,2 M28,180 q-10,-22 -30,-16 M28,180 q16,-20 34,-10" stroke="#2f8a3a" stroke-width="6" fill="none" stroke-linecap="round"/>'
open(os.path.join(OUT, "sea.svg"), "w", encoding="utf-8").write(svg(500, 250, b))

# ---------- もり（地面は y=150 から）----------
R = random.Random(55); b = defs(lg("s", [(0, "#15402b"), (1, "#2f6b3f")]), lg("g", [(0, "#7a5a36"), (1, "#553b20")]))
b += '<rect width="500" height="250" fill="url(#s)"/>'
for x in range(10, 500, 44): b += f'<rect x="{x+R.uniform(-8,8):.0f}" y="0" width="{R.uniform(14,22):.0f}" height="160" fill="#234a30" opacity=".9"/>'
for _ in range(16): b += f'<circle cx="{R.uniform(0,500):.0f}" cy="{R.uniform(0,70):.0f}" r="{R.uniform(28,48):.0f}" fill="{R.choice(["#1f5a33","#27683b","#1a4f2d"])}"/>'
b += '<path d="M150,0 l-60,160 h40 l50,-160Z" fill="#fff7c2" opacity=".10"/><path d="M330,0 l-40,160 h34 l40,-160Z" fill="#fff7c2" opacity=".09"/>'
for x, s in [(90, 1.0), (210, .8), (300, .95), (400, .85)]: b += f'<rect x="{x-9*s:.0f}" y="40" width="{18*s:.0f}" height="118" fill="#4a3320"/><path d="M{x-9*s:.0f},158 q-10,2 -16,10 M{x+9*s:.0f},158 q10,2 16,10" stroke="#4a3320" stroke-width="6" fill="none" stroke-linecap="round"/>'
for _ in range(10): b += f'<circle cx="{R.uniform(0,500):.0f}" cy="{R.uniform(30,80):.0f}" r="{R.uniform(20,34):.0f}" fill="{R.choice(["#2f7a3f","#3a8a48","#2a6f3a"])}" opacity=".95"/>'
b += '<path d="M0,150 Q125,140 250,150 T500,147 V250 H0Z" fill="url(#g)"/>'
for _ in range(26):
    x, y = R.uniform(5, 495), R.uniform(160, 246); b += f'<ellipse cx="{x:.0f}" cy="{y:.0f}" rx="6" ry="3" transform="rotate({R.uniform(-40,40):.0f} {x:.0f} {y:.0f})" fill="{R.choice(["#c7772e","#d99a3a","#a85a26","#8a4a22"])}"/>'
for x, y, s, c in [(60, 200, 1.1, "#e0483b"), (160, 236, .9, "#e0483b"), (340, 214, 1.0, "#d98a2b"), (450, 238, 1.1, "#e0483b"), (250, 190, .7, "#d98a2b")]: b += mushroom(x, y, s, c)
for x in [18, 120, 232, 372, 482]:
    for a in (-1, 1): b += f'<path d="M{x},{232+R.uniform(-6,10):.0f} q{a*14},-18 {a*26},-8" stroke="#3f8f3a" stroke-width="3.5" fill="none" stroke-linecap="round"/>'
b += '<rect x="-14" y="0" width="38" height="250" fill="#3a2716"/><rect x="474" y="0" width="40" height="250" fill="#3a2716"/><circle cx="10" cy="20" r="46" fill="#1f5a33"/><circle cx="492" cy="14" r="50" fill="#1f5a33"/>'
open(os.path.join(OUT, "forest.svg"), "w", encoding="utf-8").write(svg(500, 250, b))

# ---------- せかいちず（500x340。エリアの ふだ の位置：くさむら 19,78／かわ 15,36／そら 50,15／うみ 85,36／もり 81,78、まんなか 50,58）----------
R = random.Random(66); W, H = 500, 340
b = defs(lg("g", [(0, "#a9dc78"), (1, "#86c95c")]))
b += f'<rect width="{W}" height="{H}" fill="url(#g)"/>'
# そら（上）：よぞら と やま
b += '<path d="M120,0 H380 V70 Q250,112 120,70Z" fill="#1c2a55"/>'
for _ in range(26): b += star(R.uniform(128, 372), R.uniform(4, 70), R.uniform(.8, 1.9), "#fff8c9", R.uniform(.6, 1))
b += '<circle cx="330" cy="26" r="13" fill="#fff3a0"/><path d="M150,84 L196,34 L226,66 L250,40 L286,84Z" fill="#5d6fa8"/><path d="M196,34 l-9,10 h18Z M250,40 l-8,9 h16Z" fill="#fff"/><path d="M120,70 Q250,112 380,70" stroke="#3a4a80" stroke-width="5" fill="none"/>'
# かわ（左上）：くねくね した 川
b += '<path d="M0,60 Q50,70 60,104 T36,160 Q10,178 0,176Z" fill="#6ec6f0"/><path d="M0,60 Q50,70 60,104 T36,160 Q10,178 0,176" stroke="#e9dfb8" stroke-width="5" fill="none"/><path d="M60,104 Q110,110 150,150 T214,196" stroke="#6ec6f0" stroke-width="16" fill="none" stroke-linecap="round"/><path d="M60,104 Q110,110 150,150 T214,196" stroke="#bfe8fb" stroke-width="3" fill="none" stroke-dasharray="8 12" stroke-linecap="round"/>'
b += rock(120, 132, .6) + '<ellipse cx="22" cy="120" rx="9" ry="3.5" fill="#58a84a"/>'
# うみ（右上）：なみ と すなはま
b += '<path d="M500,40 Q430,52 418,110 T452,188 Q480,196 500,192Z" fill="#f1dfa4"/><path d="M500,52 Q444,62 434,112 T462,178 Q484,186 500,184Z" fill="#3fa5e0"/>'
b += '<path d="M446,96 q7,-5 14,0 t14,0 M452,124 q7,-5 14,0 t14,0 M462,152 q7,-5 14,0 t14,0" stroke="#fff" stroke-width="2.4" fill="none" opacity=".8" stroke-linecap="round"/><path d="M478,74 l12,0 -3,5 h-6Z" fill="#b5542f"/><path d="M484,74 v-11 l7,9Z" fill="#fff"/>'
# もり（右下）：き が いっぱい
b += '<path d="M500,214 Q430,206 398,246 T372,340 H500Z" fill="#3f8a45"/>'
for x, y, s in [(420, 262, .55), (462, 250, .6), (488, 286, .55), (440, 304, .6), (398, 322, .5), (476, 330, .6), (428, 338, .5)]: b += tree(x, y, s, R.choice(["#1f6a33", "#27763b"]), "#3f9548")
b += mushroom(384, 300, .7)
# くさむら（左下）：せの たかい くさ と はな
b += '<path d="M0,214 Q70,206 102,246 T128,340 H0Z" fill="#c4e98a"/>'
for _ in range(20): b += tuft(R.uniform(4, 110), R.uniform(240, 336), R.uniform(.8, 1.3), R.choice(["#3f8f3a", "#4c9c40"]))
for _ in range(8): b += flower(R.uniform(8, 104), R.uniform(236, 326), R.choice(["#ff8fb1", "#fff", "#ffd94a", "#c79bff"]), .8)
# まんなか の のはら：ちいさな くさ・はな・き
for _ in range(28):
    x, y = R.uniform(130, 370), R.uniform(110, 330)
    if abs(x - 250) < 46 and abs(y - 190) < 46: continue
    b += tuft(x, y, R.uniform(.5, .8), "#5aa64a")
for x, y in [(168, 250), (332, 240), (250, 300), (200, 130), (300, 128)]: b += flower(x, y, R.choice(["#fff", "#ffd94a", "#ff8fb1"]), .7)
b += tree(150, 312, .5) + tree(352, 316, .45) + tree(232, 120, .4, "#4f9f4a", "#6ab55c")
open(os.path.join(OUT, "world.svg"), "w", encoding="utf-8").write(svg(W, H, b).replace('preserveAspectRatio="xMidYMid slice"', 'preserveAspectRatio="none"'))
# ================= キングの 3エリア と ふしぎな せかい の ちず =================
def fern(x, y, s=1, c="#2f7a3a"):
    out = ""
    for a in (-60, -30, 0, 30, 60):
        r = math.radians(a - 90); ex, ey = x + 22 * s * math.cos(r), y + 22 * s * math.sin(r)
        out += f'<path d="M{x},{y} Q{(x+ex)/2+4*s*math.cos(r+1.5):.1f},{(y+ey)/2+4*s*math.sin(r+1.5):.1f} {ex:.1f},{ey:.1f}" stroke="{c}" stroke-width="{3.2*s:.1f}" fill="none" stroke-linecap="round"/>'
    return out
def cycad(x, y, s=1):
    out = f'<path d="M{x-5*s:.0f},{y} q{-2*s:.0f},{-26*s:.0f} {3*s:.0f},{-46*s:.0f} h{6*s:.0f} q{3*s:.0f},{22*s:.0f} {2*s:.0f},{46*s:.0f}Z" fill="#7a5a36"/>'
    for a in (-70, -40, -12, 12, 40, 70):
        r = math.radians(a - 90); ex, ey = x + 34 * s * math.cos(r), y - 46 * s + 30 * s * math.sin(r) + 12 * s
        out += f'<path d="M{x},{y-46*s:.0f} Q{(x+ex)/2:.0f},{y-70*s:.0f} {ex:.0f},{ey:.0f}" stroke="#2f8a3a" stroke-width="{5*s:.1f}" fill="none" stroke-linecap="round"/>'
    return out

# ---------- きょうりゅうじだい（地面は y=152 から）----------
R = random.Random(77); b = defs(lg("s", [(0, "#ffb36b"), (.55, "#ffd9a0"), (1, "#fff0c9")]), lg("g", [(0, "#9aa85a"), (1, "#6f7f3c")]))
b += '<rect width="500" height="250" fill="url(#s)"/><circle cx="96" cy="56" r="30" fill="#fff1b8" opacity=".8"/><circle cx="96" cy="56" r="20" fill="#ffe680"/>'
b += cloud(300, 40, 1.0, "#fff6e0", .8) + cloud(190, 70, .7, "#fff6e0", .7)
b += '<path d="M330,150 L392,58 L410,58 L470,150Z" fill="#7b5d4a"/><path d="M392,58 L401,44 L410,58Z" fill="#5d4638"/><path d="M394,58 q7,-10 14,0 q-2,18 6,34 q-10,-6 -14,-22 q-6,10 -12,12 q8,-10 6,-24Z" fill="#ff6a3c"/>'
b += '<g fill="#b9a9a0" opacity=".85"><circle cx="404" cy="30" r="12"/><circle cx="418" cy="18" r="9"/><circle cx="392" cy="16" r="8"/></g>'
b += hill("0,140 Q80,104 170,134 T330,120 T500,138", "#b8b86a") + hill("0,150 Q130,128 260,146 T500,140", "#a3ad5c")
b += '<path d="M218,70 l10,-6 12,5 -9,3 -4,7 -3,-7Z" fill="#6b5a52"/><path d="M150,96 l8,-5 10,4 -8,2 -3,6 -2,-6Z" fill="#6b5a52"/>'
b += '<path d="M0,152 Q125,142 250,152 T500,149 V250 H0Z" fill="url(#g)"/>'
b += cycad(44, 170, 1.0) + cycad(462, 166, 1.1) + cycad(250, 150, .55)
for _ in range(12): b += fern(R.uniform(10, 490), R.uniform(170, 246), R.uniform(.6, 1.0), R.choice(["#2f7a3a", "#3f8f3a", "#2a6a33"]))
for _ in range(8): b += rock(R.uniform(20, 480), R.uniform(176, 244), R.uniform(.5, .9))
b += '<path d="M176,238 q8,-12 16,0 q8,12 16,0" stroke="#e9dfc4" stroke-width="5" fill="none" stroke-linecap="round"/><circle cx="174" cy="238" r="4" fill="#e9dfc4"/><circle cx="210" cy="238" r="4" fill="#e9dfc4"/>'
b += '<ellipse cx="330" cy="226" rx="9" ry="12" fill="#f3ead8"/><path d="M324,220 l4,4 4,-4 4,4" stroke="#c9b98f" stroke-width="1.5" fill="none"/>'
open(os.path.join(OUT, "dino.svg"), "w", encoding="utf-8").write(svg(500, 250, b))

# ---------- しんかい（うみの そこ は y=162 から）----------
R = random.Random(88); b = defs(lg("s", [(0, "#0c3a6b"), (.5, "#082650"), (1, "#040f2a")]), lg("g", [(0, "#26355a"), (1, "#141d3a")]))
b += '<rect width="500" height="250" fill="url(#s)"/><path d="M210,0 l-70,170 h60 l60,-170Z" fill="#9fd8ff" opacity=".07"/><path d="M330,0 l-30,150 h36 l40,-150Z" fill="#9fd8ff" opacity=".05"/>'
for _ in range(40): b += f'<circle cx="{R.uniform(0,500):.0f}" cy="{R.uniform(0,160):.0f}" r="{R.uniform(.8,2):.1f}" fill="#bfe8ff" opacity="{R.uniform(.15,.5):.2f}"/>'
for x in (70, 96, 410, 250):
    for k in range(5): b += f'<circle cx="{x+R.uniform(-6,6):.0f}" cy="{150-k*26+R.uniform(-6,6):.0f}" r="{2+k*.7:.1f}" fill="none" stroke="#bfe8ff" stroke-width="1.4" opacity="{.6-k*.08:.2f}"/>'
b += '<path d="M0,150 L40,110 L70,140 L110,96 L150,150Z" fill="#101c3c"/><path d="M360,150 L400,104 L430,132 L470,90 L500,120 V150Z" fill="#101c3c"/>'
b += '<path d="M0,162 Q125,152 250,162 T500,159 V250 H0Z" fill="url(#g)"/>'
for x, h, c in [(40, 46, "#ff7aa8"), (58, 34, "#ff9ac0"), (446, 50, "#7ad9c8"), (466, 36, "#9be6d6"), (300, 30, "#ffb36b")]:
    b += f'<path d="M{x},176 q-6,-{h/2:.0f} 0,-{h} M{x},{176-h/2:.0f} q8,-6 10,-16 M{x},{176-h/3:.0f} q-8,-4 -10,-14" stroke="{c}" stroke-width="4" fill="none" stroke-linecap="round"/>'
for x in (150, 380):
    for k in (-1, 0, 1): b += f'<path d="M{x+k*9},200 q{k*4},-20 {k*2},-42" stroke="#f6e7b6" stroke-width="5" fill="none" stroke-linecap="round"/><circle cx="{x+k*11}" cy="158" r="5" fill="#ff5a5a"/>'
for _ in range(9): b += rock(R.uniform(20, 480), R.uniform(190, 246), R.uniform(.5, 1.0)).replace("#9aa0a6", "#3a4a72").replace("#c9ced3", "#5a6a96")
for _ in range(14):
    x, y = R.uniform(10, 490), R.uniform(40, 240); c = R.choice(["#7df9ff", "#b6ff8a", "#ffe66b"]); b += f'<circle cx="{x:.0f}" cy="{y:.0f}" r="6" fill="{c}" opacity=".14"/><circle cx="{x:.0f}" cy="{y:.0f}" r="1.8" fill="{c}"/>'
open(os.path.join(OUT, "deep.svg"), "w", encoding="utf-8").write(svg(500, 250, b))

# ---------- うちゅう（つきの じめん は y=156 から）----------
R = random.Random(99); b = defs(lg("s", [(0, "#05051c"), (1, "#191445")]), lg("g", [(0, "#b9bcc8"), (1, "#868a9a")]))
b += '<rect width="500" height="250" fill="url(#s)"/>'
b += '<ellipse cx="250" cy="70" rx="260" ry="40" fill="#6b5bd6" opacity=".12" transform="rotate(-14 250 70)"/><ellipse cx="250" cy="70" rx="220" ry="16" fill="#c9b8ff" opacity=".10" transform="rotate(-14 250 70)"/>'
for _ in range(110): b += star(R.uniform(0, 500), R.uniform(0, 160), R.uniform(.6, 2.0), R.choice(["#fff", "#fff8c9", "#cfe3ff", "#ffd6f0"]), R.uniform(.5, 1))
b += '<circle cx="92" cy="58" r="30" fill="#2f7fd6"/><path d="M70,48 q12,-10 24,-2 q-4,10 -14,10 q-8,6 -10,-8Z M96,66 q10,-4 18,4 q-8,10 -18,6Z" fill="#4fb84f"/><path d="M66,44 q20,-8 44,2" stroke="#fff" stroke-width="3" fill="none" opacity=".6"/><circle cx="92" cy="58" r="30" fill="none" stroke="#9fd8ff" stroke-width="3" opacity=".5"/>'
b += '<ellipse cx="392" cy="56" rx="46" ry="10" fill="none" stroke="#e9cf8a" stroke-width="5" transform="rotate(-18 392 56)"/><circle cx="392" cy="56" r="22" fill="#e0b060"/><path d="M372,50 h40 M371,60 h42" stroke="#c8943f" stroke-width="3"/><path d="M349,70 a46,10 -18 0 0 86,-28" fill="none" stroke="#f3dfa6" stroke-width="5"/>'
b += '<path d="M230,30 l40,22" stroke="#fff" stroke-width="2" opacity=".7" stroke-linecap="round"/><circle cx="230" cy="30" r="2.6" fill="#fff"/><circle cx="300" cy="112" r="9" fill="#d8644a"/><circle cx="182" cy="118" r="5" fill="#c9c9d6"/>'
b += '<path d="M0,156 Q125,142 250,156 T500,152 V250 H0Z" fill="url(#g)"/>'
for x, y, r in [(70, 190, 22), (190, 226, 16), (300, 182, 13), (400, 214, 24), (470, 176, 10), (128, 172, 8), (350, 238, 10)]:
    b += f'<ellipse cx="{x}" cy="{y}" rx="{r}" ry="{r*.42:.0f}" fill="#7b7f90"/><ellipse cx="{x}" cy="{y+r*.1:.0f}" rx="{r*.8:.0f}" ry="{r*.28:.0f}" fill="#9a9eae"/>'
for _ in range(16): b += f'<circle cx="{R.uniform(4,496):.0f}" cy="{R.uniform(166,247):.0f}" r="{R.uniform(1,2.4):.1f}" fill="#6f7384"/>'
b += '<path d="M244,206 v-34" stroke="#e8e8ee" stroke-width="2.5"/><path d="M244,172 h20 l-4,6 4,6 h-20Z" fill="#ff5a5a"/>'
open(os.path.join(OUT, "space.svg"), "w", encoding="utf-8").write(svg(500, 250, b))

# ---------- ふしぎな せかい の ちず（500x340。ふだ：きょうりゅう 17,60／しんかい 50,17／うちゅう 83,60、まんなか 50,58、とびら 50,90）----------
R = random.Random(101); W, H = 500, 340
b = defs(lg("g", [(0, "#2a1f5c"), (1, "#3d2f7a")]))
b += f'<rect width="{W}" height="{H}" fill="url(#g)"/>'
for _ in range(60): b += star(R.uniform(0, 500), R.uniform(0, 340), R.uniform(.6, 1.8), R.choice(["#fff", "#ffe9a8", "#d9c8ff"]), R.uniform(.3, .8))
# きょうりゅうじだい（左）：かざん と ジャングル
b += '<path d="M0,96 Q90,90 150,150 T170,290 Q90,330 0,320Z" fill="#b8b86a"/><path d="M14,196 L60,120 L74,120 L118,196Z" fill="#7b5d4a"/><path d="M60,120 q7,-10 14,0 q-1,14 5,26 q-9,-5 -12,-18 q-5,8 -10,10 q6,-9 3,-18Z" fill="#ff6a3c"/>'
b += '<g fill="#cfc2bb" opacity=".8"><circle cx="68" cy="98" r="9"/><circle cx="80" cy="88" r="7"/></g>' + cycad(132, 250, .5) + cycad(30, 280, .55) + fern(100, 300, .7) + fern(60, 240, .6)
# しんかい（上）：ふかい うみ
b += '<path d="M130,0 H370 V80 Q250,128 130,80Z" fill="#072a5c"/><path d="M130,80 Q250,128 370,80" stroke="#3f7fd0" stroke-width="5" fill="none"/>'
for _ in range(14): b += f'<circle cx="{R.uniform(140,360):.0f}" cy="{R.uniform(8,84):.0f}" r="{R.uniform(1.4,3.4):.1f}" fill="none" stroke="#bfe8ff" stroke-width="1.3" opacity=".6"/>'
b += '<path d="M176,74 q-5,-14 0,-28 M176,60 q7,-5 8,-13" stroke="#ff7aa8" stroke-width="3.5" fill="none" stroke-linecap="round"/><path d="M322,78 q-5,-12 0,-24 M322,66 q-7,-4 -8,-12" stroke="#7ad9c8" stroke-width="3.5" fill="none" stroke-linecap="round"/><circle cx="214" cy="36" r="2" fill="#7df9ff"/><circle cx="292" cy="30" r="2" fill="#b6ff8a"/>'
# うちゅう（右）：ほし と わくせい
b += '<path d="M500,96 Q410,90 350,150 T330,290 Q410,330 500,320Z" fill="#0b0b26"/>'
for _ in range(34): b += star(R.uniform(350, 498), R.uniform(104, 316), R.uniform(.7, 1.9), R.choice(["#fff", "#fff8c9", "#cfe3ff"]), R.uniform(.6, 1))
b += '<ellipse cx="452" cy="150" rx="30" ry="7" fill="none" stroke="#e9cf8a" stroke-width="4" transform="rotate(-18 452 150)"/><circle cx="452" cy="150" r="14" fill="#e0b060"/><circle cx="388" cy="262" r="12" fill="#2f7fd6"/><path d="M380,258 q8,-6 14,0 q-4,6 -10,5Z" fill="#4fb84f"/><circle cx="470" cy="282" r="7" fill="#d8644a"/>'
# まんなか：ふしぎな ひかり
b += '<circle cx="250" cy="200" r="70" fill="#fff3a0" opacity=".06"/><circle cx="250" cy="200" r="44" fill="#fff3a0" opacity=".07"/>'
for _ in range(10): b += f'<path d="M{R.uniform(190,310):.0f},{R.uniform(150,300):.0f} l2,5 5,2 -5,2 -2,5 -2,-5 -5,-2 5,-2Z" fill="#ffe9a8" opacity=".7"/>'
open(os.path.join(OUT, "world2.svg"), "w", encoding="utf-8").write(svg(W, H, b).replace('preserveAspectRatio="xMidYMid slice"', 'preserveAspectRatio="none"'))
for f in sorted(os.listdir(OUT)): print(f, os.path.getsize(os.path.join(OUT, f)))
