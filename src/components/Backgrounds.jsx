/* Backgrounds — milliy naqshli fonlar: mahalla, bozor, idora, sud zali, universitet */

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
        <rect width="60" height="30" fill="#d9b382" />
        <path d="M0 15 H60 M30 0 V15 M0 15 V30 M60 15 V30" stroke="#c49a66" strokeWidth="2" />
      </pattern>
      <pattern id="wood" width="40" height="200" patternUnits="userSpaceOnUse">
        <rect width="40" height="200" fill="#8a5a2f" />
        <path d="M8 0 Q14 100 8 200 M26 0 Q20 100 28 200" stroke="#744a24" strokeWidth="3" fill="none" />
      </pattern>
      <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#7cc6ec" /><stop offset="1" stopColor="#dff3fb" />
      </linearGradient>
      <linearGradient id="room" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#f6efe0" /><stop offset="1" stopColor="#efe2c8" />
      </linearGradient>
    </defs>
  );
}

function Tree({ x, y, s = 1 }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x="-14" y="-10" width="28" height="200" rx="8" fill="#7a4a24" />
      <circle cx="0" cy="-60" r="110" fill="#3f8f4a" />
      <circle cx="-80" cy="-10" r="70" fill="#4ea65a" />
      <circle cx="80" cy="-20" r="75" fill="#368043" />
      <circle cx="10" cy="-130" r="70" fill="#4ea65a" />
    </g>
  );
}

function Mahalla() {
  return (
    <g>
      <rect width="1600" height="900" fill="url(#sky)" />
      <circle cx="1380" cy="140" r="70" fill="#ffd66b" />
      <path d="M0 470 L220 330 L420 450 L640 300 L900 460 L1180 320 L1600 470 Z" fill="#b9d7c9" opacity=".7" />
      <rect x="0" y="380" width="1600" height="360" fill="url(#brick)" />
      <rect x="0" y="372" width="1600" height="16" fill="#b8875a" />
      {/* naqshli yog'och darvoza */}
      <g transform="translate(560 410)">
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
      </g>
      <Tree x={240} y={560} s={1.15} />
      {/* so'ri / tapchan */}
      <g transform="translate(1180 600)">
        <rect width="340" height="22" fill="#7a4a24" />
        <rect y="-14" width="340" height="16" fill="url(#islimi)" />
        <rect x="10" y="22" width="16" height="110" fill="#5b3a1e" /><rect x="314" y="22" width="16" height="110" fill="#5b3a1e" />
      </g>
      <rect x="0" y="740" width="1600" height="160" fill="#d8c29a" />
      <rect x="0" y="736" width="1600" height="8" fill="#c4ab7f" />
    </g>
  );
}

function Bozor() {
  const stall = (x, c, goods) => (
    <g transform={`translate(${x} 330)`}>
      <path d="M-20 0 L300 0 L280 80 L0 80 Z" fill={c} />
      {[0, 1, 2, 3, 4, 5, 6].map((i) => <path key={i} d={`M${i * 46} 0 L${i * 46 + 23} 0 L${i * 44 + 22} 80 L${i * 44} 80 Z`} fill="#fff" opacity=".85" />)}
      <rect x="10" y="80" width="12" height="300" fill="#7a4a24" /><rect x="258" y="80" width="12" height="300" fill="#7a4a24" />
      <rect x="0" y="300" width="280" height="90" fill="#8a5a2f" />
      {goods}
    </g>
  );
  return (
    <g>
      <rect width="1600" height="900" fill="url(#sky)" />
      {/* uzoqdagi gumbaz */}
      <g transform="translate(800 330)">
        <rect x="-220" y="-40" width="440" height="140" fill="#e9dcc0" />
        <path d="M-180 -40 A180 180 0 0 1 180 -40 Z" fill="#14a3a8" />
        <path d="M-180 -40 A180 180 0 0 1 180 -40" fill="none" stroke="#1f4e9c" strokeWidth="10" />
        <rect x="-220" y="-56" width="440" height="18" fill="url(#girih)" />
      </g>
      {stall(80, "#c8323c", <g>{[0, 1, 2, 3, 4].map((i) => <ellipse key={i} cx={40 + i * 50} cy="290" rx="26" ry="18" fill="#f2c94c" stroke="#c9a227" strokeWidth="3" />)}{[0, 1, 2, 3].map((i) => <ellipse key={"b" + i} cx={65 + i * 50} cy="268" rx="24" ry="17" fill="#e7b93a" />)}</g>)}
      {stall(1220, "#1f4e9c", <g>{[0, 1, 2, 3, 4, 5].map((i) => <circle key={i} cx={30 + i * 44} cy="284" r="18" fill="#c8323c" />)}{[0, 1, 2, 3, 4].map((i) => <circle key={"t" + i} cx={52 + i * 44} cy="256" r="17" fill="#a82632" />)}</g>)}
      {/* non savati */}
      <g transform="translate(1010 640)">
        <ellipse cx="0" cy="40" rx="110" ry="30" fill="#b07a3c" />
        {[-50, 0, 50].map((x) => <g key={x}><circle cx={x} cy="22" r="40" fill="#d79a4d" /><circle cx={x} cy="22" r="22" fill="#f0c27b" />{[0, 1, 2, 3, 4, 5].map((k) => <circle key={k} cx={x + Math.cos(k) * 12} cy={22 + Math.sin(k) * 12} r="2.5" fill="#8a5a2f" />)}</g>)}
      </g>
      <rect x="0" y="740" width="1600" height="160" fill="#cdb48a" />
      <rect x="0" y="736" width="1600" height="8" fill="#b89d70" />
    </g>
  );
}

function Idora() {
  return (
    <g>
      <rect width="1600" height="900" fill="url(#room)" />
      <rect x="0" y="0" width="1600" height="40" fill="url(#girih)" />
      {/* deraza */}
      <g transform="translate(1040 120)">
        <rect width="420" height="330" fill="#7a4a24" />
        <rect x="16" y="16" width="388" height="298" fill="url(#sky)" />
        <path d="M30 230 L130 160 L230 220 L330 150 L390 200 L390 300 L30 300 Z" fill="#9cc9a8" />
        <rect x="204" y="16" width="12" height="298" fill="#7a4a24" />
      </g>
      {/* javon va papkalar */}
      <g transform="translate(120 150)">
        <rect width="380" height="440" fill="#9a6a3a" />
        {[0, 1, 2].map((r) => (
          <g key={r} transform={`translate(18 ${18 + r * 140})`}>
            <rect width="344" height="122" fill="#7a4a24" />
            {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => <rect key={i} x={10 + i * 41} y={18 + (i % 3) * 6} width="32" height={104 - (i % 3) * 6} fill={["#c8323c", "#1f4e9c", "#14a3a8", "#f2b134"][(i + r) % 4]} />)}
          </g>
        ))}
      </g>
      {/* soat */}
      <g transform="translate(760 170)"><circle r="56" fill="#fff" stroke="#1f4e9c" strokeWidth="10" /><line x1="0" y1="0" x2="0" y2="-34" stroke="#222" strokeWidth="6" /><line x1="0" y1="0" x2="26" y2="10" stroke="#222" strokeWidth="5" /></g>
      {/* gul */}
      <g transform="translate(1500 560)"><rect x="-36" y="70" width="72" height="90" fill="#c8323c" /><path d="M0 70 Q-70 -10 -40 -80 M0 70 Q10 -30 0 -110 M0 70 Q60 -10 50 -70" stroke="#3f8f4a" strokeWidth="14" fill="none" strokeLinecap="round" /></g>
      <rect x="0" y="700" width="1600" height="200" fill="#b98a5a" />
      <rect x="0" y="700" width="1600" height="16" fill="url(#islimi)" />
    </g>
  );
}

function Sud() {
  return (
    <g>
      <rect width="1600" height="900" fill="#efe4cf" />
      <rect x="0" y="0" width="1600" height="420" fill="url(#wood)" opacity=".9" />
      {[160, 1440].map((x) => <g key={x}><rect x={x - 40} y="60" width="80" height="640" fill="#f4ecdc" /><rect x={x - 54} y="50" width="108" height="24" fill="#e2d4b6" /><rect x={x - 54} y="690" width="108" height="24" fill="#e2d4b6" /></g>)}
      {/* adolat tarozisi (umumiy belgi) */}
      <g transform="translate(800 150)" stroke="#f2b134" strokeWidth="8" fill="none" strokeLinecap="round">
        <circle cx="0" cy="0" r="92" fill="#1f4e9c" stroke="#f2b134" />
        <line x1="0" y1="-50" x2="0" y2="52" /><line x1="-58" y1="-26" x2="58" y2="-26" />
        <path d="M-58 -26 L-76 18 L-40 18 Z M58 -26 L40 18 L76 18 Z" fill="#f2b134" />
        <line x1="-26" y1="56" x2="26" y2="56" />
      </g>
      {/* sudya stoli */}
      <g transform="translate(470 420)">
        <rect width="660" height="300" fill="#7a4a24" />
        <rect y="0" width="660" height="26" fill="url(#islimi)" />
        <rect x="40" y="60" width="580" height="200" fill="none" stroke="#a87442" strokeWidth="8" />
      </g>
      <rect x="0" y="720" width="1600" height="180" fill="#9a6a3a" />
      <rect x="0" y="716" width="1600" height="10" fill="#7a4a24" />
    </g>
  );
}

function Universitet() {
  return (
    <g>
      <rect width="1600" height="900" fill="url(#sky)" />
      {/* peshtoq */}
      <g transform="translate(800 140)">
        <rect x="-420" y="40" width="840" height="560" fill="#e9dcc0" />
        <rect x="-300" y="0" width="600" height="600" fill="url(#girih)" />
        <path d="M-180 600 L-180 230 Q-180 90 0 70 Q180 90 180 230 L180 600 Z" fill="#14324f" />
        <path d="M-180 600 L-180 230 Q-180 90 0 70 Q180 90 180 230 L180 600" fill="none" stroke="#f2b134" strokeWidth="14" />
        <rect x="-300" y="-6" width="600" height="30" fill="#f2b134" />
        {[-370, 370].map((x) => <g key={x}><rect x={x - 40} y="-80" width="80" height="680" fill="url(#girih)" /><path d={`M${x - 48} -80 Q${x} -150 ${x + 48} -80 Z`} fill="#14a3a8" /></g>)}
      </g>
      <Tree x={120} y={600} s={0.9} />
      <Tree x={1490} y={600} s={0.9} />
      {/* zinapoyalar */}
      {[0, 1, 2].map((i) => <rect key={i} x={560 - i * 40} y={740 + i * 0} width={480 + i * 80} height="14" fill="#cfc3a8" />)}
      <rect x="0" y="752" width="1600" height="148" fill="#c9bea4" />
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
