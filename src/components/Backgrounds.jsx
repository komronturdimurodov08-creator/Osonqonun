/* Backgrounds — milliy naqshli fonlar: mahalla, bozor, idora, sud zali, universitet.
   Qatlamlar: osmon/devor -> uzoq plan -> o'rta plan -> pol, ustidan yorug'lik va soya.
   Jonli detallar (bulut, qush, bug', barg, chiroq) — "amb" sinfi; pauzada to'xtaydi (scene.css). */

const BG_NAMES = { mahalla: "Mahalla", bozor: "Bozor", idora: "Idora", sud: "Sud zali", universitet: "Universitet" };

function PatternDefs() {
  return (
    <defs>
      {/* Girih — 8 qirrali yulduz naqshi (Samarqand koshinlari ruhida) */}
      <pattern id="girih" width="60" height="60" patternUnits="userSpaceOnUse">
        <rect width="60" height="60" fill="#1f4e9c" />
        <rect x="16" y="16" width="28" height="28" fill="#14a3a8" />
        <rect x="16" y="16" width="28" height="28" fill="#14a3a8" transform="rotate(45 30 30)" />
        <circle cx="30" cy="30" r="7" fill="#f4f1ea" />
        <circle cx="0" cy="0" r="6" fill="#f2b134" /><circle cx="60" cy="0" r="6" fill="#f2b134" />
        <circle cx="0" cy="60" r="6" fill="#f2b134" /><circle cx="60" cy="60" r="6" fill="#f2b134" />
      </pattern>
      <pattern id="islimi" width="80" height="40" patternUnits="userSpaceOnUse">
        <rect width="80" height="40" fill="#c8323c" />
        <path d="M0 20 Q20 0 40 20 T80 20" stroke="#f2b134" strokeWidth="4" fill="none" />
        <circle cx="20" cy="12" r="4" fill="#f4f1ea" /><circle cx="60" cy="28" r="4" fill="#f4f1ea" />
      </pattern>
      <pattern id="brick" width="60" height="30" patternUnits="userSpaceOnUse">
        <rect width="60" height="30" fill="#dcb886" />
        <path d="M0 15 H60 M30 0 V15 M0 15 V30 M60 15 V30" stroke="#c39864" strokeWidth="2" />
        <rect x="3" y="3" width="24" height="9" fill="#e6c595" opacity=".5" />
      </pattern>
      <pattern id="wood" width="40" height="200" patternUnits="userSpaceOnUse">
        <rect width="40" height="200" fill="#8a5a2f" />
        <path d="M8 0 Q14 100 8 200 M26 0 Q20 100 28 200" stroke="#744a24" strokeWidth="3" fill="none" />
      </pattern>
      <pattern id="tiles" width="120" height="60" patternUnits="userSpaceOnUse">
        <rect width="120" height="60" fill="#c9a77a" />
        <path d="M0 0 H120 M0 30 H120 M0 0 V30 M60 30 V60" stroke="#b48f61" strokeWidth="2" />
      </pattern>
      <pattern id="parquet" width="80" height="40" patternUnits="userSpaceOnUse">
        <rect width="80" height="40" fill="#b5834f" />
        <path d="M0 0 H80 M0 20 H80 M40 0 V20 M0 20 V40" stroke="#9c6d3d" strokeWidth="2" />
      </pattern>
      <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#5fb3e4" /><stop offset=".6" stopColor="#a9dcf3" /><stop offset="1" stopColor="#fbeed2" />
      </linearGradient>
      <linearGradient id="room" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#f3e8d2" /><stop offset="1" stopColor="#e8d6b4" />
      </linearGradient>
      <linearGradient id="floorShade" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#000" stopOpacity=".22" /><stop offset=".35" stopColor="#000" stopOpacity=".04" /><stop offset="1" stopColor="#000" stopOpacity=".12" />
      </linearGradient>
      <linearGradient id="wallShade" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#000" stopOpacity=".08" /><stop offset=".8" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity=".18" />
      </linearGradient>
      <radialGradient id="sunGlow" cx=".86" cy=".14" r=".7">
        <stop offset="0" stopColor="#fff6d6" stopOpacity=".75" /><stop offset=".35" stopColor="#fff1c4" stopOpacity=".2" /><stop offset="1" stopColor="#fff" stopOpacity="0" />
      </radialGradient>
      <radialGradient id="vignette" cx=".5" cy=".55" r=".75">
        <stop offset=".6" stopColor="#0b1220" stopOpacity="0" /><stop offset="1" stopColor="#0b1220" stopOpacity=".35" />
      </radialGradient>
      <radialGradient id="lampGlow" cx=".5" cy=".5" r=".5">
        <stop offset="0" stopColor="#fff2c2" stopOpacity=".85" /><stop offset="1" stopColor="#fff2c2" stopOpacity="0" />
      </radialGradient>
      <linearGradient id="beam" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#fff7dc" stopOpacity=".55" /><stop offset="1" stopColor="#fff7dc" stopOpacity="0" />
      </linearGradient>
      <linearGradient id="dome" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#0f7f84" /><stop offset=".45" stopColor="#2cc0c4" /><stop offset="1" stopColor="#0c6b70" />
      </linearGradient>
      <clipPath id="winClip"><rect x="16" y="16" width="388" height="298" /></clipPath>
    </defs>
  );
}

/* ---- umumiy detallar ---- */
function Cloud({ x, y, s = 1, d = 60, delay = 0 }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} opacity=".92">
      <g className="amb amb-cloud" style={{ animationDuration: d + "s", animationDelay: -delay + "s" }}>
        <ellipse cx="0" cy="0" rx="90" ry="32" fill="#fff" />
        <ellipse cx="-40" cy="-18" rx="46" ry="34" fill="#fff" />
        <ellipse cx="30" cy="-26" rx="54" ry="40" fill="#fff" />
        <ellipse cx="0" cy="14" rx="100" ry="16" fill="#e3f1f8" />
      </g>
    </g>
  );
}

function Birds({ y = 150, delay = 0 }) {
  const b = (dx, dy, k) => <path key={k} d={`M${dx - 14} ${dy} Q${dx - 6} ${dy - 9} ${dx} ${dy} Q${dx + 6} ${dy - 9} ${dx + 14} ${dy}`} stroke="#2b3a4a" strokeWidth="3.5" fill="none" strokeLinecap="round" className="amb amb-flap" style={{ animationDelay: k * 0.13 + "s" }} />;
  return (
    <g transform={`translate(0 ${y})`}>
      <g className="amb amb-birds" style={{ animationDelay: -delay + "s" }}>
        {b(0, 0, 0)}{b(34, 14, 1)}{b(-30, 18, 2)}
      </g>
    </g>
  );
}

function Tree({ x, y, s = 1, sway = 0 }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx="0" cy="196" rx="150" ry="20" fill="#000" opacity=".14" />
      <path d="M-16 196 Q-12 60 -6 -10 L6 -10 Q12 60 18 196 Z" fill="#6e4220" />
      <path d="M2 40 Q30 10 52 -10" stroke="#6e4220" strokeWidth="10" fill="none" strokeLinecap="round" />
      <g className="amb amb-sway" style={{ animationDelay: -sway + "s" }}>
        <circle cx="0" cy="-60" r="110" fill="#3a8546" />
        <circle cx="-80" cy="-10" r="70" fill="#4ea65a" />
        <circle cx="80" cy="-20" r="75" fill="#327a3e" />
        <circle cx="10" cy="-130" r="70" fill="#4ea65a" />
        <circle cx="-30" cy="-110" r="40" fill="#6cc078" opacity=".7" />
        <circle cx="50" cy="-70" r="34" fill="#6cc078" opacity=".5" />
      </g>
    </g>
  );
}

function Leaves({ x, y }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      {[0, 1, 2].map((i) => (
        <g key={i} transform={`translate(${i * 70 - 60} ${i * 30})`}>
          <path className="amb amb-leaf" style={{ animationDelay: -i * 2.7 + "s" }} d="M0 0 q8 -10 16 0 q-8 10 -16 0z" fill={i % 2 ? "#e0a93a" : "#6cb257"} />
        </g>
      ))}
    </g>
  );
}

function Steam({ x, y }) {
  return (
    <g transform={`translate(${x} ${y})`} stroke="#fff" strokeWidth="5" fill="none" strokeLinecap="round">
      {[0, 1, 2].map((i) => (
        <path key={i} className="amb amb-steam" style={{ animationDelay: i * 0.9 + "s" }}
          d={`M${i * 12 - 12} 0 q-10 -18 0 -34 q10 -16 0 -34`} />
      ))}
    </g>
  );
}

function Flag({ x, y, h = 160 }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x="-3" y="0" width="6" height={h} fill="#8d8d8d" /><circle cx="0" cy="-4" r="7" fill="#f2b134" />
      <g className="amb amb-flag">
        <path d="M3 4 h84 v18 h-84z" fill="#1eb3e6" /><path d="M3 22 h84 v3 h-84z" fill="#c8323c" />
        <path d="M3 25 h84 v18 h-84z" fill="#fff" /><path d="M3 43 h84 v3 h-84z" fill="#c8323c" />
        <path d="M3 46 h84 v18 h-84z" fill="#1aa64a" />
      </g>
    </g>
  );
}

function Lighting({ sun = true, vignette = 0.9 }) {
  return (
    <g pointerEvents="none">
      {sun && <rect width="1600" height="900" fill="url(#sunGlow)" />}
      <rect width="1600" height="900" fill="url(#vignette)" opacity={vignette} />
    </g>
  );
}

function Ground({ y, fill, edge }) {
  return (
    <g>
      <rect x="0" y={y} width="1600" height={900 - y} fill={fill} />
      <rect x="0" y={y} width="1600" height={900 - y} fill="url(#floorShade)" />
      <rect x="0" y={y - 4} width="1600" height="8" fill={edge} />
    </g>
  );
}

/* ---- sahnalar ---- */
function Mahalla() {
  return (
    <g>
      <rect width="1600" height="900" fill="url(#sky)" />
      <circle cx="1380" cy="140" r="110" fill="#fff3c4" opacity=".45" className="amb amb-pulse" />
      <circle cx="1380" cy="140" r="66" fill="#ffd66b" />
      <Cloud x={300} y={110} s={1} d={90} />
      <Cloud x={900} y={70} s={.7} d={120} delay={40} />
      <Cloud x={1250} y={210} s={.55} d={140} delay={80} />
      <Birds y={170} />
      {/* uzoq tog'lar va uylar */}
      <path d="M0 420 L180 300 L330 380 L520 270 L760 400 L1000 290 L1250 380 L1450 300 L1600 360 L1600 470 L0 470 Z" fill="#a7c9c4" opacity=".75" />
      <g fill="#e2cfa8" opacity=".9">
        {[60, 210, 1300, 1440].map((x, i) => <g key={x}><rect x={x} y={330 + (i % 2) * 14} width="120" height="80" /><path d={`M${x - 8} ${332 + (i % 2) * 14} L${x + 60} ${300 + (i % 2) * 14} L${x + 128} ${332 + (i % 2) * 14} Z`} fill="#b9825a" /></g>)}
      </g>
      {/* devor */}
      <rect x="0" y="380" width="1600" height="360" fill="url(#brick)" />
      <rect x="0" y="380" width="1600" height="360" fill="url(#wallShade)" />
      <rect x="0" y="372" width="1600" height="16" fill="#b8875a" />
      {/* naqshli yog'och darvoza */}
      <g transform="translate(560 410)">
        <rect x="-26" y="-34" width="532" height="364" fill="#6b4422" />
        <rect x="-14" y="-24" width="508" height="24" fill="url(#islimi)" />
        <rect width="480" height="330" fill="url(#wood)" />
        <rect x="236" width="8" height="330" fill="#5b3a1e" />
        {[0, 1].map((i) => (
          <g key={i} transform={`translate(${30 + i * 240} 30)`}>
            <rect width="180" height="120" fill="none" stroke="#f2b134" strokeWidth="6" />
            <rect x="60" y="30" width="60" height="60" fill="#f2b134" transform="rotate(45 90 60)" />
            <rect width="180" height="120" y="150" fill="none" stroke="#f2b134" strokeWidth="6" />
          </g>
        ))}
        <circle cx="222" cy="200" r="9" fill="#f2b134" /><circle cx="258" cy="200" r="9" fill="#f2b134" />
        <rect width="480" height="330" fill="url(#wallShade)" />
      </g>
      {/* tok simi va chiroq */}
      <path d="M0 250 Q400 300 800 262 T1600 250" stroke="#33404d" strokeWidth="3" fill="none" />
      <g transform="translate(800 268)">
        <circle r="60" fill="url(#lampGlow)" className="amb amb-flicker" />
        <path d="M-14 0 h28 l-6 14 h-16z" fill="#33404d" />
      </g>
      <Tree x={240} y={560} s={1.15} />
      <Leaves x={300} y={430} />
      {/* so'ri / tapchan, choynak bilan */}
      <g transform="translate(1180 600)">
        <ellipse cx="170" cy="140" rx="200" ry="16" fill="#000" opacity=".16" />
        <rect width="340" height="22" fill="#7a4a24" />
        <rect y="-14" width="340" height="16" fill="url(#islimi)" />
        <rect x="10" y="22" width="16" height="110" fill="#5b3a1e" /><rect x="314" y="22" width="16" height="110" fill="#5b3a1e" />
        <rect x="40" y="-22" width="260" height="10" rx="5" fill="#1f4e9c" />
        {/* choynak */}
        <g transform="translate(120 -22)">
          <ellipse cx="0" cy="-22" rx="30" ry="24" fill="#f4f1ea" />
          <path d="M-22 -30 h44" stroke="#1f4e9c" strokeWidth="5" />
          <path d="M28 -26 q22 -6 26 -24" stroke="#f4f1ea" strokeWidth="8" fill="none" strokeLinecap="round" />
          <path d="M-28 -32 q-20 6 -14 22" stroke="#f4f1ea" strokeWidth="6" fill="none" />
          <circle cx="0" cy="-48" r="6" fill="#1f4e9c" />
          <Steam x={54} y={-56} />
        </g>
        {[190, 230].map((x) => <g key={x} transform={`translate(${x} -24)`}><path d="M-14 -16 h28 l-5 16 h-18z" fill="#f4f1ea" /><path d="M-12 -10 h24" stroke="#1f4e9c" strokeWidth="3" /></g>)}
      </g>
      <Ground y={740} fill="#d8c29a" edge="#c4ab7f" />
      <Lighting />
    </g>
  );
}

function Bozor() {
  const stall = (x, c, goods) => (
    <g transform={`translate(${x} 330)`}>
      <ellipse cx="140" cy="400" rx="190" ry="18" fill="#000" opacity=".16" />
      <rect x="10" y="80" width="12" height="320" fill="#6e4220" /><rect x="258" y="80" width="12" height="320" fill="#6e4220" />
      <g className="amb amb-awning">
        <path d="M-20 0 L300 0 L280 80 L0 80 Z" fill={c} />
        {[0, 1, 2, 3, 4, 5, 6].map((i) => <path key={i} d={`M${i * 46} 0 L${i * 46 + 23} 0 L${i * 44 + 22} 80 L${i * 44} 80 Z`} fill="#fff" opacity=".85" />)}
        <path d="M0 80 q20 18 40 0 q20 18 40 0 q20 18 40 0 q20 18 40 0 q20 18 40 0 q20 18 40 0 q20 18 40 0" fill={c} />
      </g>
      <rect x="0" y="80" width="280" height="40" fill="#000" opacity=".12" />
      <rect x="0" y="300" width="280" height="90" fill="#8a5a2f" />
      <rect x="0" y="300" width="280" height="10" fill="#a87442" />
      {goods}
    </g>
  );
  return (
    <g>
      <rect width="1600" height="900" fill="url(#sky)" />
      <Cloud x={250} y={120} s={.8} d={100} />
      <Cloud x={1100} y={90} s={.9} d={130} delay={60} />
      <Birds y={130} delay={6} />
      {/* uzoqdagi bozor gumbazi va minora */}
      <g transform="translate(800 330)">
        <rect x="-300" y="-10" width="600" height="110" fill="#e2d2b0" opacity=".8" />
        <rect x="-220" y="-40" width="440" height="140" fill="#eadcc0" />
        {[-150, -50, 50, 150].map((x) => <path key={x} d={`M${x - 30} 100 V30 Q${x} 0 ${x + 30} 30 V100Z`} fill="#c9b48c" />)}
        <path d="M-180 -40 A180 180 0 0 1 180 -40 Z" fill="url(#dome)" />
        <path d="M-180 -40 A180 180 0 0 1 180 -40" fill="none" stroke="#1f4e9c" strokeWidth="10" />
        <rect x="-220" y="-56" width="440" height="18" fill="url(#girih)" />
        <rect x="330" y="-200" width="56" height="300" fill="#d9c49c" /><rect x="324" y="-214" width="68" height="20" fill="url(#girih)" />
        <path d="M326 -214 Q358 -262 390 -214Z" fill="#14a3a8" />
      </g>
      {/* bayroqchalar */}
      <path d="M0 200 Q800 300 1600 200" stroke="#5b3a1e" strokeWidth="3" fill="none" />
      {Array.from({ length: 16 }, (_, i) => {
        const x = 50 + i * 100, t = x / 1600, y = 200 + 200 * t * (1 - t);
        return <g key={i} transform={`translate(${x} ${y - 2})`}><path className="amb amb-bunting" style={{ animationDelay: -i * 0.35 + "s" }} d="M-18 0 h36 l-18 34z" fill={["#c8323c", "#f2b134", "#14a3a8", "#1f4e9c"][i % 4]} /></g>;
      })}
      {/* olomon soyasi */}
      <g fill="#7b8a96" opacity=".35">
        {[430, 520, 610, 980, 1070, 1150].map((x, i) => <g key={x}><circle cx={x} cy={560 - (i % 2) * 8} r="20" /><rect x={x - 24} y={578 - (i % 2) * 8} width="48" height="110" rx="20" /></g>)}
      </g>
      {stall(80, "#c8323c", <g>{[0, 1, 2, 3, 4].map((i) => <ellipse key={i} cx={40 + i * 50} cy="290" rx="26" ry="18" fill="#f2c94c" stroke="#c9a227" strokeWidth="3" />)}{[0, 1, 2, 3].map((i) => <ellipse key={"b" + i} cx={65 + i * 50} cy="268" rx="24" ry="17" fill="#e7b93a" />)}</g>)}
      {stall(1220, "#1f4e9c", <g>{[0, 1, 2, 3, 4, 5].map((i) => <circle key={i} cx={30 + i * 44} cy="284" r="18" fill="#c8323c" />)}{[0, 1, 2, 3, 4].map((i) => <circle key={"t" + i} cx={52 + i * 44} cy="256" r="17" fill="#a82632" />)}</g>)}
      {/* tandir va bug' */}
      <g transform="translate(640 650)">
        <ellipse cx="0" cy="88" rx="90" ry="12" fill="#000" opacity=".15" />
        <path d="M-70 88 Q-80 0 -40 -20 L40 -20 Q80 0 70 88Z" fill="#c9895a" />
        <ellipse cx="0" cy="-20" rx="40" ry="12" fill="#5b3a1e" />
        <Steam x={0} y={-30} />
      </g>
      {/* non savati */}
      <g transform="translate(1010 640)">
        <ellipse cx="0" cy="62" rx="130" ry="14" fill="#000" opacity=".15" />
        <ellipse cx="0" cy="40" rx="110" ry="30" fill="#b07a3c" />
        {[-50, 0, 50].map((x) => <g key={x}><circle cx={x} cy="22" r="40" fill="#d79a4d" /><circle cx={x} cy="22" r="22" fill="#f0c27b" />{[0, 1, 2, 3, 4, 5].map((k) => <circle key={k} cx={x + Math.cos(k) * 12} cy={22 + Math.sin(k) * 12} r="2.5" fill="#8a5a2f" />)}</g>)}
      </g>
      <Ground y={740} fill="#cdb48a" edge="#b89d70" />
      <Lighting />
    </g>
  );
}

function Idora() {
  return (
    <g>
      <rect width="1600" height="900" fill="url(#room)" />
      <rect x="0" y="0" width="1600" height="700" fill="url(#wallShade)" />
      <rect x="0" y="0" width="1600" height="40" fill="url(#girih)" />
      <rect x="0" y="40" width="1600" height="8" fill="#000" opacity=".12" />
      {/* shift chiroq */}
      <g transform="translate(620 48)">
        <ellipse cx="0" cy="40" rx="220" ry="120" fill="url(#lampGlow)" className="amb amb-flicker" opacity=".6" />
        <rect x="-110" y="0" width="220" height="14" rx="6" fill="#d9d4c8" />
      </g>
      {/* deraza: bulutlar ichkarida suzadi */}
      <g transform="translate(1040 120)">
        <rect x="-10" y="-10" width="440" height="350" fill="#5b3a1e" opacity=".25" />
        <rect width="420" height="330" fill="#7a4a24" />
        <g clipPath="url(#winClip)">
          <rect x="16" y="16" width="388" height="298" fill="url(#sky)" />
          <Cloud x={120} y={80} s={.45} d={50} />
          <Cloud x={320} y={130} s={.35} d={70} delay={30} />
          <path d="M16 240 L130 170 L230 220 L330 150 L404 200 L404 314 L16 314 Z" fill="#9cc9a8" />
          <path d="M16 270 L120 240 L260 270 L404 250 L404 314 L16 314 Z" fill="#7cb08a" />
        </g>
        <rect x="204" y="16" width="12" height="298" fill="#7a4a24" />
        <rect x="16" y="160" width="388" height="10" fill="#7a4a24" />
        <rect x="-16" y="326" width="452" height="18" fill="#9a6a3a" />
      </g>
      {/* derazadan tushgan nur */}
      <path d="M1056 450 L1444 450 L1300 900 L760 900 Z" fill="url(#beam)" opacity=".55" />
      {/* javon va papkalar */}
      <g transform="translate(120 150)">
        <rect x="8" y="8" width="380" height="440" fill="#000" opacity=".15" />
        <rect width="380" height="440" fill="#9a6a3a" />
        {[0, 1, 2].map((r) => (
          <g key={r} transform={`translate(18 ${18 + r * 140})`}>
            <rect width="344" height="122" fill="#6b4020" />
            {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => <rect key={i} x={10 + i * 41} y={18 + (i % 3) * 6} width="32" height={104 - (i % 3) * 6} rx="3" fill={["#c8323c", "#1f4e9c", "#14a3a8", "#f2b134"][(i + r) % 4]} />)}
            <rect width="344" height="14" fill="#000" opacity=".18" />
          </g>
        ))}
      </g>
      {/* soat: sekund mili aylanadi */}
      <g transform="translate(760 190)">
        <circle r="62" fill="#000" opacity=".1" cx="4" cy="5" />
        <circle r="56" fill="#fff" stroke="#1f4e9c" strokeWidth="10" />
        {[0, 1, 2, 3].map((i) => <rect key={i} x="-3" y="-44" width="6" height="10" fill="#1f4e9c" transform={`rotate(${i * 90})`} />)}
        <line x1="0" y1="0" x2="0" y2="-32" stroke="#222" strokeWidth="6" strokeLinecap="round" />
        <line x1="0" y1="0" x2="24" y2="10" stroke="#222" strokeWidth="5" strokeLinecap="round" />
        <g className="amb amb-tick"><line x1="0" y1="6" x2="0" y2="-42" stroke="#c8323c" strokeWidth="2.5" /></g>
        <circle r="4" fill="#c8323c" />
      </g>
      {/* yozuv stoli */}
      <g transform="translate(560 560)">
        <ellipse cx="190" cy="150" rx="230" ry="14" fill="#000" opacity=".14" />
        <rect width="380" height="24" rx="4" fill="#8a5a2f" />
        <rect x="20" y="24" width="14" height="120" fill="#6b4020" /><rect x="346" y="24" width="14" height="120" fill="#6b4020" />
        <rect x="230" y="24" width="120" height="80" fill="#7a4a24" />
        <rect x="40" y="-14" width="90" height="14" fill="#f4f1ea" transform="rotate(-4 85 -7)" />
        <rect x="160" y="-60" width="80" height="56" rx="4" fill="#33404d" /><rect x="192" y="-6" width="16" height="6" fill="#33404d" />
        <rect x="166" y="-54" width="68" height="44" fill="#9fd4f0" className="amb amb-screen" />
      </g>
      {/* gul */}
      <g transform="translate(1500 560)">
        <ellipse cx="0" cy="160" rx="60" ry="10" fill="#000" opacity=".15" />
        <rect x="-36" y="70" width="72" height="90" rx="6" fill="#c8323c" />
        <g className="amb amb-sway"><path d="M0 70 Q-70 -10 -40 -80 M0 70 Q10 -30 0 -110 M0 70 Q60 -10 50 -70" stroke="#3f8f4a" strokeWidth="14" fill="none" strokeLinecap="round" /></g>
      </g>
      <rect x="0" y="700" width="1600" height="200" fill="url(#parquet)" />
      <rect x="0" y="700" width="1600" height="200" fill="url(#floorShade)" />
      <rect x="0" y="700" width="1600" height="16" fill="url(#islimi)" />
      <Lighting sun={false} vignette={.8} />
    </g>
  );
}

function Sud() {
  return (
    <g>
      <rect width="1600" height="900" fill="#efe4cf" />
      <rect x="0" y="0" width="1600" height="420" fill="url(#wood)" opacity=".9" />
      <rect x="0" y="0" width="1600" height="720" fill="url(#wallShade)" />
      {/* baland derazalardan nur */}
      {[420, 1180].map((x) => <path key={x} d={`M${x - 50} 0 L${x + 50} 0 L${x + 210} 720 L${x - 10} 720 Z`} fill="url(#beam)" opacity=".35" />)}
      {[160, 1440].map((x) => <g key={x}><rect x={x - 40} y="60" width="80" height="640" fill="#f4ecdc" /><rect x={x - 40} y="60" width="22" height="640" fill="#000" opacity=".06" /><rect x={x - 54} y="50" width="108" height="24" fill="#e2d4b6" /><rect x={x - 54} y="690" width="108" height="24" fill="#e2d4b6" /></g>)}
      <Flag x={1300} y={240} h={460} />
      {/* devor chiroqlari */}
      {[330, 1270].map((x, i) => <g key={x} transform={`translate(${x} 300)`}><circle r="70" fill="url(#lampGlow)" className="amb amb-flicker" style={{ animationDelay: -i * 1.7 + "s" }} /><path d="M-12 -8 h24 l-4 22 h-16z" fill="#f2b134" /></g>)}
      {/* adolat tarozisi (umumiy belgi) */}
      <g transform="translate(800 150)" stroke="#f2b134" strokeWidth="8" fill="none" strokeLinecap="round">
        <circle cx="0" cy="0" r="104" fill="#000" stroke="none" opacity=".12" />
        <circle cx="0" cy="0" r="92" fill="#1f4e9c" stroke="#f2b134" />
        <line x1="0" y1="-50" x2="0" y2="52" />
        <g className="amb amb-scale"><line x1="-58" y1="-26" x2="58" y2="-26" />
          <path d="M-58 -26 L-76 18 L-40 18 Z M58 -26 L40 18 L76 18 Z" fill="#f2b134" /></g>
        <line x1="-26" y1="56" x2="26" y2="56" />
      </g>
      {/* sudya stoli */}
      <g transform="translate(470 420)">
        <ellipse cx="330" cy="300" rx="380" ry="20" fill="#000" opacity=".2" />
        <rect width="660" height="300" fill="#7a4a24" />
        <rect y="0" width="660" height="26" fill="url(#islimi)" />
        <rect x="40" y="60" width="580" height="200" fill="none" stroke="#a87442" strokeWidth="8" />
        <rect width="660" height="300" fill="url(#wallShade)" />
        <rect x="520" y="-22" width="70" height="16" rx="4" fill="#5b3a1e" /><rect x="548" y="-40" width="14" height="22" fill="#5b3a1e" />
      </g>
      <Ground y={720} fill="#9a6a3a" edge="#7a4a24" />
      <Lighting sun={false} />
    </g>
  );
}

function Universitet() {
  return (
    <g>
      <rect width="1600" height="900" fill="url(#sky)" />
      <Cloud x={200} y={100} s={.8} d={110} />
      <Cloud x={1350} y={150} s={.7} d={95} delay={50} />
      <Birds y={110} delay={12} />
      {/* peshtoq */}
      <g transform="translate(800 140)">
        <rect x="-430" y="50" width="860" height="560" fill="#000" opacity=".08" />
        <rect x="-420" y="40" width="840" height="560" fill="#e9dcc0" />
        <rect x="-300" y="0" width="600" height="600" fill="url(#girih)" />
        <path d="M-180 600 L-180 230 Q-180 90 0 70 Q180 90 180 230 L180 600 Z" fill="#14324f" />
        <path d="M-150 600 L-150 250 Q-150 130 0 112 Q150 130 150 250 L150 600 Z" fill="#1c4468" />
        <path d="M-180 600 L-180 230 Q-180 90 0 70 Q180 90 180 230 L180 600" fill="none" stroke="#f2b134" strokeWidth="14" />
        <rect x="-300" y="-6" width="600" height="30" fill="#f2b134" />
        {[-370, 370].map((x) => <g key={x}><rect x={x - 40} y="-80" width="80" height="680" fill="url(#girih)" /><rect x={x - 40} y="-80" width="20" height="680" fill="#000" opacity=".12" /><path d={`M${x - 48} -80 Q${x} -150 ${x + 48} -80 Z`} fill="#14a3a8" /></g>)}
        <rect x="-420" y="40" width="840" height="560" fill="url(#wallShade)" />
      </g>
      <Flag x={800} y={20} h={110} />
      <Tree x={120} y={600} s={0.9} />
      <Tree x={1490} y={600} s={0.9} sway={2} />
      <Leaves x={1420} y={460} />
      {/* zinapoyalar */}
      {[0, 1, 2].map((i) => <g key={i}><rect x={560 - i * 40} y={712 + i * 14} width={480 + i * 80} height="14" fill="#d8cdb3" /><rect x={560 - i * 40} y={722 + i * 14} width={480 + i * 80} height="4" fill="#000" opacity=".1" /></g>)}
      <Ground y={752} fill="#c9bea4" edge="#b6aa8e" />
      <Lighting />
    </g>
  );
}

function Background({ name }) {
  const B = { mahalla: Mahalla, bozor: Bozor, idora: Idora, sud: Sud, universitet: Universitet }[name] || Mahalla;
  return (
    <svg className="bg" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMax slice" aria-label={BG_NAMES[name] || "fon"}>
      <PatternDefs />
      <B />
    </svg>
  );
}
