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

function Mouth({ emotion, talking }) {
  if (talking) {
    return (
      <g className="mouth-talk" style={{ transformOrigin: "100px 117px", transformBox: "view-box" }}>
        <ellipse cx="100" cy="117" rx="9" ry="6.5" fill="#5a1f1f" />
        <ellipse cx="100" cy="120.5" rx="5" ry="2.4" fill="#e66b6b" />
      </g>
    );
  }
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

function Brows({ emotion, color }) {
  const tilt = { worried: [6, -6], serious: [-5, 5], surprised: [-3, -3], happy: [-1, -1] }[emotion] || [0, 0];
  return (
    <g stroke={color} strokeWidth="3.6" strokeLinecap="round">
      <line x1="76" y1={78 + tilt[0]} x2="92" y2={78 - tilt[0] * 0.3} />
      <line x1="108" y1={78 - tilt[1] * 0.3} x2="124" y2={78 + tilt[1]} />
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

function Arm({ side, c, gesture }) {
  const sx = side === "l" ? 60 : 140;
  const sleeve = c.top.type === "chopon" ? c.top.c1 : c.top.type === "apron" || c.top.type === "shirt" ? c.top.c2 : c.top.c1;
  const wide = c.top.type === "chopon" || c.top.type === "mantle";
  return (
    <g className={`arm arm-${side} g-${gesture || "none"}`} style={{ transformOrigin: `${sx}px 160px`, transformBox: "view-box" }}>
      <path d={wide
        ? `M${sx - 15} 152 L${sx + 15} 152 L${sx + 17} 262 L${sx - 17} 262 Z`
        : `M${sx - 11} 152 L${sx + 11} 152 L${sx + 10} 260 L${sx - 10} 260 Z`} fill={sleeve} />
      {c.top.type === "chopon" && <path d={`M${sx - 16} 240 L${sx + 16} 240`} stroke={c.top.c3} strokeWidth="6" />}
      <circle cx={sx} cy="270" r="12" fill={c.skin} />
      {c.prop && side === "r" && <g transform={`translate(${sx} 276)`}><Prop type={c.prop} /></g>}
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

function Character({ id, talking, emotion, gesture, facing, playing }) {
  const c = CHARACTERS[id] || CHARACTERS.qoshni;
  const brow = c.hairColor || (c.beardColor === "#f4f1ea" ? "#cfcac0" : "#2b1d16");
  return (
    <svg className={cx("char", playing ? "is-playing" : "is-paused")} viewBox="0 0 200 400" aria-label={c.name}
      style={{ transform: facing === "left" ? "scaleX(-1)" : "none" }}>
      <ellipse cx="100" cy="394" rx="62" ry="8" fill="#000" opacity=".18" />
      {/* oyoqlar */}
      <rect x="72" y="290" width="22" height="98" rx="6" fill={c.legs} />
      <rect x="106" y="290" width="22" height="98" rx="6" fill={c.legs} />
      <ellipse cx="80" cy="390" rx="20" ry="8" fill={c.shoes} />
      <ellipse cx="120" cy="390" rx="20" ry="8" fill={c.shoes} />
      <Arm side="l" c={c} gesture={gesture} />
      <Torso c={c} id={id} />
      {/* bo'yin va bosh */}
      <rect x="90" y="128" width="20" height="22" fill={c.skin} />
      {c.hair === "braids" && <Hair c={c} />}
      <circle cx="58" cy="100" r="9" fill={c.skin} />
      <circle cx="142" cy="100" r="9" fill={c.skin} />
      <ellipse cx="100" cy="96" rx="42" ry="46" fill={c.skin} />
      {c.hair !== "braids" && <Hair c={c} />}
      <Beard c={c} />
      <g className="eyes" style={{ transformOrigin: "100px 90px", transformBox: "view-box" }}>
        <ellipse cx="84" cy="91" rx="7" ry="8" fill="#fff" />
        <ellipse cx="116" cy="91" rx="7" ry="8" fill="#fff" />
        <circle cx="86" cy="92" r="4" fill="#1d1d1d" />
        <circle cx="118" cy="92" r="4" fill="#1d1d1d" />
      </g>
      <Brows emotion={emotion} color={brow} />
      <path d="M100 96 Q96 106 100 108" stroke="#a8673f" strokeWidth="2.6" fill="none" strokeLinecap="round" />
      {c.beard === "long" && <path d="M84 110 Q100 102 116 110" stroke={c.beardColor} strokeWidth="6" fill="none" strokeLinecap="round" />}
      <Mouth emotion={emotion} talking={talking} />
      {c.glasses && (
        <g fill="none" stroke="#1d1d1d" strokeWidth="3">
          <circle cx="84" cy="91" r="12" /><circle cx="116" cy="91" r="12" /><line x1="96" y1="91" x2="104" y2="91" />
        </g>
      )}
      <Hat c={c} />
      <Arm side="r" c={c} gesture={gesture} />
    </svg>
  );
}
