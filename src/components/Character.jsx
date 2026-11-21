/* Character — har videoda bir xil ko'rinadigan SVG personajlar.
   Gapirganda og'iz qimirlaydi, ko'z pirpiraydi, qo'l harakatlari CSS animatsiyasi orqali. */

const CHARACTERS = {
  afandi: {
    name: "Afandi", skin: "#e2a77c", hat: "doppi", beard: "long", beardColor: "#f4f1ea", hair: "none",
    top: { type: "chopon", c1: "#1f4e9c", c2: "#14a3a8", c3: "#f2b134" }, belt: "#c8323c", legs: "#3a2f2a", shoes: "#5b3a1e"
  },
  aqlvoy: {
    name: "Aqlvoy", skin: "#f0c39b", hair: "short", hairColor: "#2b1d16", glasses: true,
    top: { type: "jacket", c1: "#14a3a8", c2: "#ffffff" }, legs: "#23324d", shoes: "#1b1b1b", prop: "folder"
  },
  qoshni: {
    name: "Qo'shni", skin: "#d99c6f", hat: "doppi", beard: "short", beardColor: "#4a3426", hair: "none",
    top: { type: "vest", c1: "#6b4c9a", c2: "#e9e4d8" }, legs: "#3b3b45", shoes: "#3a2a1a"
  },
  ishberuvchi: {
    name: "Ish beruvchi", skin: "#e6b08a", hair: "short", hairColor: "#3b3b3b", belly: true,
    top: { type: "suit", c1: "#55606e", c2: "#ffffff", tie: "#c8323c" }, legs: "#3c434d", shoes: "#111"
  },
  sotuvchi: {
    name: "Sotuvchi", skin: "#d6976a", hat: "doppi", hair: "none", beard: "short", beardColor: "#2b1d16",
    top: { type: "apron", c1: "#e9e4d8", c2: "#2f7d4f" }, legs: "#40372f", shoes: "#3a2a1a"
  },
  hokim: {
    name: "Hokim", skin: "#e6b08a", hair: "short", hairColor: "#9aa0a6", glasses: true,
    top: { type: "suit", c1: "#1d2a44", c2: "#ffffff", tie: "#1f4e9c" }, legs: "#1d2a44", shoes: "#111"
  },
  sudya: {
    name: "Sudya", skin: "#e8b48a", hair: "short", hairColor: "#55463c",
    top: { type: "mantle", c1: "#16161d", c2: "#ffffff" }, legs: "#16161d", shoes: "#111", prop: "gavel"
  },
  talabaqiz: {
    name: "Talaba qiz", skin: "#f1c6a0", hair: "braids", hairColor: "#2b1d16", female: true,
    top: { type: "dress", c1: "#c8323c", c2: "#f2b134", c3: "#1f4e9c" }, legs: "#c8323c", shoes: "#5b3a1e", prop: "book"
  },
  xodima: {
    name: "Xodima", skin: "#e9b892", hat: "scarf", hatColor: "#14a3a8", hair: "none", female: true,
    top: { type: "dress", c1: "#1f4e9c", c2: "#ffffff", c3: "#14a3a8" }, legs: "#1f4e9c", shoes: "#3a2a1a"
  },
  inspektor: {
    name: "Inspektor", skin: "#dfa57a", hat: "cap", hatColor: "#2a3f66", hair: "short", hairColor: "#2b1d16",
    top: { type: "uniform", c1: "#3b5b8f", c2: "#2a3f66" }, legs: "#2a3f66", shoes: "#111", prop: "papers"
  },
  bola: {
    name: "Bola", skin: "#f3c9a4", hair: "short", hairColor: "#3b2416", small: true,
    top: { type: "shirt", c1: "#f2b134", c2: "#ffffff" }, legs: "#1f4e9c", shoes: "#c8323c"
  }
};
const charName = (id) => (CHARACTERS[id] ? CHARACTERS[id].name : id);

/* --- yordamchi: id dan barqaror "tasodifiy" son (har personaj o'z ritmida) --- */
function charSeed(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
  return (h >>> 0) / 4294967295;
}
const rnd = (a, b) => a + Math.random() * (b - a);
const VB = { transformBox: "view-box" };

/* Og'iz shakllari (visemalar): [yarim kenglik, ochiqlik] */
const VISEMES = [
  [7, 0.6],   // yopiq
  [6, 2.6],   // kichik
  [7.6, 4.6], // o'rta
  [8.6, 6.6], // keng ochiq "a"
  [10, 3.2],  // keng "e/i"
  [5, 5.6]    // "o/u"
];
const MOUTH_EMO = {
  happy: { w: 2, h: 0, smile: 3.2 },
  worried: { w: -1, h: -0.4, smile: -1.8 },
  surprised: { w: -1, h: 1.2, smile: 0 },
  serious: { w: -1, h: -0.8, smile: -0.4 },
  neutral: { w: 0, h: 0, smile: 0.8 }
};

function TalkMouth({ emotion, viseme }) {
  const e = MOUTH_EMO[emotion] || MOUTH_EMO.neutral;
  const [bw, bh] = VISEMES[viseme] || VISEMES[0];
  const w = Math.max(4, bw + e.w), h = Math.max(0.5, bh + e.h);
  const yc = 116 - e.smile;
  const d = `M${100 - w} ${yc} Q100 ${116 - h * 0.45 - e.smile * 0.2} ${100 + w} ${yc} Q100 ${116 + h * 1.6 + e.smile * 0.6} ${100 - w} ${yc} Z`;
  return (
    <g>
      <path className="mouth-shape" d={d} fill="#5a1f1f" stroke="#5a1f1f" strokeWidth="1.6" strokeLinejoin="round" />
      {h > 3.5 && <ellipse cx="100" cy={116 + h * 1.05} rx={w * 0.42} ry={h * 0.28} fill="#e66b6b" />}
      {h > 3 && e.smile > 2 && <path d={`M${100 - w * 0.7} ${yc + 1.2} Q100 ${yc + 2.4} ${100 + w * 0.7} ${yc + 1.2}`} stroke="#fff" strokeWidth="1.6" fill="none" opacity=".85" />}
    </g>
  );
}

function Mouth({ emotion, talking, viseme }) {
  if (talking) return <TalkMouth emotion={emotion || "neutral"} viseme={viseme} />;
  const d = {
    happy: "M88 112 Q100 126 112 112",
    worried: "M90 120 Q100 112 110 120",
    surprised: null,
    serious: "M91 116 L109 116",
    neutral: "M91 114 Q100 120 109 114"
  }[emotion || "neutral"];
  if (!d) return <ellipse cx="100" cy="117" rx="5.5" ry="7" fill="#5a1f1f" />;
  return <path d={d} fill="none" stroke="#5a1f1f" strokeWidth="3.4" strokeLinecap="round" />;
}

/* Qoshlar: CSS transform orqali silliq o'tadi. raise = tinglovchining qisqa reaksiyasi */
const BROW_POSE = {
  neutral: { y: 0, r: 0 },
  happy: { y: -2.5, r: -3 },
  worried: { y: -1.5, r: -17 },
  serious: { y: 1.8, r: 14 },
  surprised: { y: -7, r: -4 }
};
function Brows({ emotion, color, raise }) {
  const p = BROW_POSE[emotion] || BROW_POSE.neutral;
  const ty = p.y - (raise ? 3.2 : 0);
  return (
    <g stroke={color} strokeWidth="3.6" strokeLinecap="round" fill="none">
      <path className="brow" d="M76 78 Q84 75.5 92 78" style={{ ...VB, transformOrigin: "84px 78px", transform: `translate(0px, ${ty}px) rotate(${p.r}deg)` }} />
      <path className="brow" d="M108 78 Q116 75.5 124 78" style={{ ...VB, transformOrigin: "116px 78px", transform: `translate(0px, ${ty}px) rotate(${-p.r}deg)` }} />
    </g>
  );
}

/* Ko'zlar: oq qism, qorachiq (nigoh), qovoqlar (emotsiya), pirpirash */
function Eyes({ c, emotion, blink, gaze }) {
  const skin = c.skin;
  const sur = emotion === "surprised";
  const lid = (name) => ({ opacity: emotion === name ? 1 : 0 });
  return (
    <g className={cx("eyes", blink && "blinking")} style={{ ...VB, transformOrigin: "100px 91px" }}>
      <g className="eye-whites" style={{ ...VB, transformOrigin: "100px 91px", transform: sur ? "scale(1.14)" : "scale(1)" }}>
        <ellipse cx="84" cy="91" rx="7" ry="8" fill="#fff" />
        <ellipse cx="116" cy="91" rx="7" ry="8" fill="#fff" />
        <g className="pupils" style={{ transform: `translate(${gaze.x}px, ${gaze.y}px)` }}>
          <circle cx="84" cy="92" r={sur ? 3.3 : 4} fill="#1d1d1d" />
          <circle cx="116" cy="92" r={sur ? 3.3 : 4} fill="#1d1d1d" />
          <circle cx="85.4" cy="90.4" r="1.2" fill="#fff" opacity=".9" />
          <circle cx="117.4" cy="90.4" r="1.2" fill="#fff" opacity=".9" />
        </g>
      </g>
      <g fill={skin}>
        <g className="lid" style={lid("worried")}>
          <path d="M74 80 L94 80 L94 84 Q84 84.5 74 90 Z" /><path d="M106 80 L126 80 L126 90 Q116 84.5 106 84 Z" />
        </g>
        <g className="lid" style={lid("serious")}>
          <path d="M74 80 L94 80 L94 89.5 L74 86.5 Z" /><path d="M106 80 L126 80 L126 86.5 L106 89.5 Z" />
        </g>
        <g className="lid" style={lid("happy")}>
          <path d="M74 102 L94 102 L94 97 Q84 91 74 97 Z" /><path d="M106 102 L126 102 L126 97 Q116 91 106 97 Z" />
        </g>
      </g>
    </g>
  );
}

function Hat({ c }) {
  if (c.hat === "doppi") {
    return (
      <g>
        <path d="M60 70 L64 40 Q100 26 136 40 L140 70 Q100 62 60 70 Z" fill="#141414" />
        {/* Chust do'ppisidagi qalampir naqshlari */}
        {[74, 100, 126].map((x, i) => (
          <path key={i} d={`M${x} 60 q-7 -8 0 -16 q5 6 2 11 q-1 3 -2 5 Z`} fill="#f4f1ea" />
        ))}
        <path d="M60 70 Q100 62 140 70" stroke="#f4f1ea" strokeWidth="2" fill="none" strokeDasharray="3 4" />
      </g>
    );
  }
  if (c.hat === "cap") {
    return (
      <g>
        <path d="M58 66 Q60 34 100 32 Q140 34 142 66 Z" fill={c.hatColor} />
        <path d="M56 66 L150 66 Q154 74 144 76 L60 74 Z" fill="#1b2a44" />
        <rect x="92" y="42" width="16" height="12" rx="3" fill="#f2b134" />
      </g>
    );
  }
  if (c.hat === "scarf") {
    return (
      <g>
        <path d="M52 100 Q50 38 100 34 Q150 38 148 100 Q146 70 100 62 Q54 70 52 100 Z" fill={c.hatColor} />
        <path d="M54 92 Q48 150 70 168 L62 120 Z" fill={c.hatColor} />
        <path d="M146 92 Q152 150 130 168 L138 120 Z" fill={c.hatColor} />
        {[70, 92, 114, 134].map((x, i) => <circle key={i} cx={x} cy={48 + (i % 2) * 4} r="3" fill="#ffffff" opacity=".8" />)}
      </g>
    );
  }
  return null;
}

function Hair({ c }) {
  if (c.hair === "short") return <path d="M58 92 Q54 40 100 36 Q148 40 142 92 Q138 60 100 58 Q66 60 58 92 Z" fill={c.hairColor} />;
  if (c.hair === "braids") {
    return (
      <g fill={c.hairColor}>
        <path d="M56 100 Q50 36 100 34 Q150 36 144 100 Q140 62 100 56 Q62 62 56 100 Z" />
        {[0, 1, 2, 3, 4].map((i) => <ellipse key={"l" + i} cx={56 - i * 1.5} cy={118 + i * 22} rx="9" ry="12" />)}
        {[0, 1, 2, 3, 4].map((i) => <ellipse key={"r" + i} cx={144 + i * 1.5} cy={118 + i * 22} rx="9" ry="12" />)}
      </g>
    );
  }
  return null;
}

function Beard({ c }) {
  if (c.beard === "long") {
    return (
      <g>
        <path d="M66 104 Q66 150 100 186 Q134 150 134 104 Q124 132 100 134 Q76 132 66 104 Z" fill={c.beardColor} />
        <path d="M80 110 Q100 100 120 110 Q110 116 100 112 Q90 116 80 110 Z" fill={c.beardColor} />
      </g>
    );
  }
  if (c.beard === "short") return <path d="M70 108 Q74 146 100 150 Q126 146 130 108 Q120 130 100 131 Q80 130 70 108 Z" fill={c.beardColor} />;
  return null;
}

function Prop({ type }) {
  if (type === "folder") return <g><rect x="-22" y="-6" width="44" height="34" rx="3" fill="#c8323c" /><rect x="-22" y="-6" width="44" height="6" fill="#9e2430" /></g>;
  if (type === "book") return <g><rect x="-18" y="-4" width="36" height="28" rx="2" fill="#1f4e9c" /><rect x="-16" y="-2" width="4" height="24" fill="#f2b134" /></g>;
  if (type === "gavel") return <g><rect x="-3" y="-30" width="6" height="34" rx="2" fill="#7a4a24" /><rect x="-16" y="-40" width="32" height="14" rx="4" fill="#5b3a1e" /></g>;
  if (type === "papers") return <g><rect x="-14" y="-4" width="30" height="36" fill="#ffffff" stroke="#9aa7b8" /><line x1="-9" y1="6" x2="11" y2="6" stroke="#9aa7b8" /><line x1="-9" y1="14" x2="11" y2="14" stroke="#9aa7b8" /></g>;
  return null;
}

/* Qo'l pozalari. u = yelka burchagi, f = tirsak burchagi (gradus), y = yelka ko'tarilishi (px).
   Chap qo'l: + tashqariga; o'ng qo'l (oldingi, suhbatdosh tomon): − tashqariga/oldinga. */
const ARM_REST = { l: { u: 4, f: -5, y: 0 }, r: { u: -4, f: 6, y: 0 } };
const ARM_POSES = {
  none: ARM_REST,
  point: { l: { u: 3, f: -4, y: 0 }, r: { u: -80, f: -6, y: -1 } },
  wave: { l: ARM_REST.l, r: { u: -118, f: -34, y: -2 } },
  explain: { l: { u: 18, f: 62, y: 0 }, r: { u: -18, f: -62, y: 0 } },
  think: { l: { u: 2, f: -3, y: 0 }, r: { u: 10, f: 152, y: 0 } },
  warn: { l: ARM_REST.l, r: { u: -26, f: -150, y: -2 } },
  shrug: { l: { u: 14, f: 74, y: -8 }, r: { u: -14, f: -74, y: -8 } }
};

function Hand({ sx, side, skin, finger }) {
  const t = side === "l" ? 1 : -1; // bosh barmoq tana tomonda
  return (
    <g fill={skin}>
      <ellipse cx={sx + t * 8} cy="265" rx="4" ry="7.5" transform={`rotate(${t * -28} ${sx + t * 8} 265)`} />
      <path d={`M${sx - 9.5} 262 Q${sx - 11} 276 ${sx - 6} 281 Q${sx} 285 ${sx + 6} 281 Q${sx + 11} 276 ${sx + 9.5} 262 Z`} />
      {finger
        ? <rect x={sx - 2.7} y="276" width="5.4" height="17" rx="2.7" />
        : <path d={`M${sx - 5} 279 L${sx - 5} 284 M${sx} 280 L${sx} 286 M${sx + 5} 279 L${sx + 5} 284`} stroke={skin} strokeWidth="4.4" strokeLinecap="round" />}
    </g>
  );
}

function Arm({ side, c, gesture }) {
  const g = ARM_POSES[gesture] ? gesture : "none";
  const pose = ARM_POSES[g][side];
  const sx = side === "l" ? 60 : 140;
  const sleeve = c.top.type === "chopon" ? c.top.c1 : c.top.type === "apron" || c.top.type === "shirt" ? c.top.c2 : c.top.c1;
  const wide = c.top.type === "chopon" || c.top.type === "mantle";
  const hw = wide ? 15 : 11;
  const finger = side === "r" && (g === "point" || g === "warn");
  const showProp = c.prop && side === "r" && !finger && g !== "think";
  const shoulder = { ...VB, transformOrigin: `${sx}px 160px` };
  const elbow = { ...VB, transformOrigin: `${sx}px 210px` };
  return (
    <g className={`arm arm-${side} g-${g}`} style={{ ...shoulder, transform: `translate(0px, ${pose.y}px) rotate(${pose.u}deg)` }}>
      <g className="arm-sway" style={shoulder}>
        <path d={`M${sx - hw} 154 Q${sx} 146 ${sx + hw} 154 L${sx + hw} 212 L${sx - hw} 212 Z`} fill={sleeve} />
        <circle cx={sx} cy="210" r={hw} fill={sleeve} />
        <g className="fore" style={{ ...elbow, transform: `rotate(${pose.f}deg)` }}>
          <g className="fore-loop" style={elbow}>
            <path d={wide
              ? `M${sx - 15} 208 L${sx + 15} 208 L${sx + 17} 262 L${sx - 17} 262 Z`
              : `M${sx - 10.5} 208 L${sx + 10.5} 208 L${sx + 9.5} 260 L${sx - 9.5} 260 Z`} fill={sleeve} />
            {c.top.type === "chopon" && <path d={`M${sx - 16} 246 L${sx + 16} 246`} stroke={c.top.c3} strokeWidth="6" />}
            <Hand sx={sx} side={side} skin={c.skin} finger={finger} />
            {showProp && <g transform={`translate(${sx} 278)`}><Prop type={c.prop} /></g>}
          </g>
        </g>
      </g>
    </g>
  );
}

function Torso({ c, id }) {
  const t = c.top;
  if (t.type === "chopon") {
    return (
      <g>
        <defs>
          <pattern id={`stripe-${id}`} width="18" height="10" patternUnits="userSpaceOnUse">
            <rect width="18" height="10" fill={t.c1} />
            <rect width="5" height="10" fill={t.c2} />
            <rect x="9" width="2.5" height="10" fill={t.c3} />
          </pattern>
        </defs>
        <path d="M58 150 Q100 136 142 150 L156 352 L44 352 Z" fill={`url(#stripe-${id})`} />
        <path d="M100 146 L84 352 L116 352 Z" fill="#f4f1ea" opacity=".9" />
        <rect x="58" y="236" width="84" height="14" rx="3" fill={c.belt} />
      </g>
    );
  }
  if (t.type === "mantle") {
    return (
      <g>
        <path d="M56 150 Q100 136 144 150 L158 350 L42 350 Z" fill={t.c1} />
        <path d="M84 146 L100 176 L116 146 Z" fill={t.c2} />
      </g>
    );
  }
  if (t.type === "dress") {
    return (
      <g>
        <defs>
          <pattern id={`ikat-${id}`} width="28" height="36" patternUnits="userSpaceOnUse">
            <rect width="28" height="36" fill={t.c1} />
            <path d="M14 2 L24 18 L14 34 L4 18 Z" fill={t.c2} />
            <path d="M14 10 L19 18 L14 26 L9 18 Z" fill={t.c3} />
          </pattern>
        </defs>
        <path d="M64 150 Q100 140 136 150 L156 330 L44 330 Z" fill={`url(#ikat-${id})`} />
      </g>
    );
  }
  const body = c.belly ? "M60 150 Q100 138 140 150 Q160 220 144 292 L56 292 Q40 220 60 150 Z" : "M62 150 Q100 140 138 150 L142 292 L58 292 Z";
  return (
    <g>
      <path d={body} fill={t.type === "apron" || t.type === "shirt" ? t.c2 : t.c1} />
      {t.type === "suit" && <g><path d="M86 148 L100 200 L114 148 Z" fill={t.c2} /><path d="M97 158 L103 158 L106 210 L100 220 L94 210 Z" fill={t.tie} /></g>}
      {t.type === "jacket" && <g><path d="M88 148 L100 230 L112 148 Z" fill={t.c2} /><line x1="100" y1="230" x2="100" y2="290" stroke="#0e7f84" strokeWidth="2" /></g>}
      {t.type === "vest" && <g><path d="M88 148 L100 290 L112 148 Z" fill={t.c2} /><circle cx="90" cy="220" r="3" fill="#f2b134" /><circle cx="110" cy="220" r="3" fill="#f2b134" /></g>}
      {t.type === "apron" && <path d="M72 180 L128 180 L134 300 L66 300 Z" fill={t.c1} stroke={t.c2} strokeWidth="4" />}
      {t.type === "uniform" && <g><line x1="100" y1="150" x2="100" y2="290" stroke={t.c2} strokeWidth="3" />{[175, 205, 235, 265].map((y) => <circle key={y} cx="100" cy={y} r="3" fill="#f2b134" />)}<rect x="66" y="176" width="22" height="16" rx="2" fill={t.c2} /></g>}
      {t.type === "shirt" && <path d="M64 150 L136 150 L138 200 L62 200 Z" fill={t.c1} />}
    </g>
  );
}

/* Kichik taymer yordamchisi: effekt tozalanganda barcha setTimeout lar bekor qilinadi */
function useTimers() {
  const ref = useRef([]);
  const later = (fn, ms) => { const t = setTimeout(fn, ms); ref.current.push(t); return t; };
  const clear = () => { ref.current.forEach(clearTimeout); ref.current = []; };
  return { later, clear };
}

function Character({ id, talking, emotion, gesture, facing, playing, listening, lookAt }) {
  const c = CHARACTERS[id] || CHARACTERS.qoshni;
  const brow = c.hairColor || (c.beardColor === "#f4f1ea" ? "#cfcac0" : "#2b1d16");
  const mirrored = facing === "left";
  const active = !!playing;
  const isTalking = !!talking;
  const isListening = !!listening && !isTalking;

  /* Har nusxa uchun o'z ritmi: id dan barqaror qism + tasodifiy qism */
  const rhythm = useMemo(() => {
    const s = charSeed(String(id || "x"));
    const r = () => (s + Math.random()) % 1;
    return {
      "--br-dur": (3.4 + r() * 1.6).toFixed(2) + "s",
      "--br-del": (-r() * 5).toFixed(2) + "s",
      "--sw-dur": (5.5 + r() * 3.5).toFixed(2) + "s",
      "--sw-del": (-r() * 9).toFixed(2) + "s",
      "--hd-dur": (4.2 + r() * 3).toFixed(2) + "s",
      "--hd-del": (-r() * 7).toFixed(2) + "s",
      "--ar-dur": (2.8 + r() * 1.8).toFixed(2) + "s",
      "--ar-del": (-r() * 4).toFixed(2) + "s",
      "--gx-dur": (1.15 + r() * 0.5).toFixed(2) + "s"
    };
  }, [id]);

  /* 1) Pirpirash: 2.5–6 s tasodifiy oraliq, ba'zan ikki marta */
  const [blink, setBlink] = useState(false);
  const blinkT = useTimers();
  useEffect(() => {
    if (!active) { setBlink(false); return; }
    let alive = true;
    const once = (after) => { setBlink(true); blinkT.later(() => { if (!alive) return; setBlink(false); after && after(); }, rnd(90, 140)); };
    const loop = () => blinkT.later(() => {
      if (!alive) return;
      if (Math.random() < 0.22) once(() => blinkT.later(() => alive && once(loop), rnd(110, 180)));
      else once(loop);
    }, rnd(2500, 6000));
    loop();
    return () => { alive = false; blinkT.clear(); };
  }, [active]);

  /* 2) Nigoh: lookAt (ekran) -> lokal yo'nalish (svg ko'zgu aks etganda teskari) */
  const screenDir = lookAt === "left" ? -1 : lookAt === "right" ? 1 : 0;
  const localDir = mirrored ? -screenDir : screenDir;
  const [sacc, setSacc] = useState({ x: 0, y: 0, away: false });
  const saccT = useTimers();
  useEffect(() => {
    if (!active) { setSacc({ x: 0, y: 0, away: false }); return; }
    let alive = true;
    const step = () => saccT.later(() => {
      if (!alive) return;
      const away = isTalking && Math.random() < 0.3; // gapiruvchi ba'zan tomoshabinga qaraydi
      setSacc({ x: rnd(-1.1, 1.1), y: rnd(-0.9, 0.9), away });
      step();
    }, isTalking ? rnd(500, 1600) : rnd(900, 2800));
    step();
    return () => { alive = false; saccT.clear(); };
  }, [active, isTalking]);
  const dir = sacc.away ? 0 : localDir;
  const gaze = { x: (dir !== 0 ? dir * 2.8 : 1.4) + sacc.x, y: sacc.y + (emotion === "worried" ? 0.6 : 0) };

  /* 3) Lab harakati: notekis visemalar 70–130 ms, vaqti-vaqti bilan pauza */
  const [viseme, setViseme] = useState(0);
  const lipT = useTimers();
  useEffect(() => {
    if (!(active && isTalking)) { setViseme(0); return; }
    let alive = true, last = 0, n = 0, nextPause = Math.round(rnd(7, 14));
    const tick = () => {
      if (!alive) return;
      n++;
      if (n >= nextPause) {
        n = 0; nextPause = Math.round(rnd(7, 15)); last = 0; setViseme(0);
        lipT.later(tick, rnd(140, 320));
        return;
      }
      let v;
      do { v = 1 + Math.floor(Math.random() * (VISEMES.length - 1)); } while (v === last);
      if (Math.random() < 0.12) v = 0;
      last = v; setViseme(v);
      lipT.later(tick, rnd(70, 130));
    };
    tick();
    return () => { alive = false; lipT.clear(); };
  }, [active, isTalking]);

  /* 4) Tinglovchi reaksiyalari: bosh irg'ash, qosh ko'tarish */
  const [react, setReact] = useState(null); // "nod" | "brow" | null
  const reactT = useTimers();
  useEffect(() => {
    if (!(active && (isListening || isTalking))) { setReact(null); return; }
    let alive = true;
    const step = () => reactT.later(() => {
      if (!alive) return;
      const p = Math.random();
      const kind = isTalking ? (p < 0.35 ? "nod" : p < 0.55 ? "brow" : null) : (p < 0.45 ? "nod" : p < 0.7 ? "brow" : null);
      if (kind) { setReact(kind); reactT.later(() => alive && setReact(null), kind === "nod" ? 760 : 650); }
      step();
    }, isTalking ? rnd(1800, 4200) : rnd(2400, 6000));
    step();
    return () => { alive = false; reactT.clear(); };
  }, [active, isListening, isTalking]);

  const g = ARM_POSES[gesture] ? gesture : "none";
  const headStyle = {
    ...VB, transformOrigin: "100px 140px",
    transform: `translate(${localDir * 1.6}px, ${g === "shrug" ? 4 : 0}px) rotate(${localDir * 2.4 + (g === "think" ? 4 : 0)}deg)`
  };

  return (
    <svg className={cx("char", playing ? "is-playing" : "is-paused", isTalking && "talking", isListening && "listening")}
      viewBox="0 0 200 400" aria-label={c.name}
      style={{ ...rhythm, transform: mirrored ? "scaleX(-1)" : "none" }}>
      <ellipse className="shadow" cx="100" cy="394" rx="62" ry="8" fill="#000" opacity=".18" style={{ ...VB, transformOrigin: "100px 394px" }} />
      <g className="body-sway" style={{ ...VB, transformOrigin: "100px 392px" }}>
        {/* oyoqlar */}
        <rect x="72" y="290" width="22" height="98" rx="6" fill={c.legs} />
        <rect x="106" y="290" width="22" height="98" rx="6" fill={c.legs} />
        <ellipse cx="80" cy="390" rx="20" ry="8" fill={c.shoes} />
        <ellipse cx="120" cy="390" rx="20" ry="8" fill={c.shoes} />
        <g className="breath" style={{ ...VB, transformOrigin: "100px 300px" }}>
          <Arm side="l" c={c} gesture={g} />
          <Torso c={c} id={id} />
          {/* bo'yin va bosh */}
          <rect x="90" y="128" width="20" height="24" fill={c.skin} />
          <g className="head-pose" style={headStyle}>
            <g className={cx("head-idle", react === "nod" && "nodding")} style={{ ...VB, transformOrigin: "100px 140px" }}>
              {c.hair === "braids" && <Hair c={c} />}
              <circle cx="58" cy="100" r="9" fill={c.skin} />
              <circle cx="142" cy="100" r="9" fill={c.skin} />
              <ellipse cx="100" cy="96" rx="42" ry="46" fill={c.skin} />
              {c.hair !== "braids" && <Hair c={c} />}
              <g className="blush" style={{ opacity: emotion === "happy" ? 0.55 : 0 }}>
                <ellipse cx="72" cy="108" rx="7" ry="4" fill="#e8746a" />
                <ellipse cx="128" cy="108" rx="7" ry="4" fill="#e8746a" />
              </g>
              <Beard c={c} />
              <Eyes c={c} emotion={emotion} blink={blink} gaze={gaze} />
              <Brows emotion={emotion} color={brow} raise={react === "brow"} />
              <path d="M100 96 Q96 106 100 108" stroke="#a8673f" strokeWidth="2.6" fill="none" strokeLinecap="round" />
              {c.beard === "long" && <path d="M84 110 Q100 102 116 110" stroke={c.beardColor} strokeWidth="6" fill="none" strokeLinecap="round" />}
              <Mouth emotion={emotion} talking={isTalking} viseme={viseme} />
              {c.glasses && (
                <g fill="none" stroke="#1d1d1d" strokeWidth="3">
                  <circle cx="84" cy="91" r="12" /><circle cx="116" cy="91" r="12" /><line x1="96" y1="91" x2="104" y2="91" />
                </g>
              )}
              <Hat c={c} />
            </g>
          </g>
          <Arm side="r" c={c} gesture={g} />
        </g>
      </g>
    </svg>
  );
}
