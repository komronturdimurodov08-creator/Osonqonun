/* Orqa fon: sekin suzuvchi huquqiy belgilar + logotip (tarozi + ochiq kitob) */

const LAW_ICONS = {
  scales: <g><path d="M32 8v46M18 54h28M32 14 12 20M32 14l20 6" /><path d="M12 20 5 36h14zM52 20l-7 16h14z" /><path d="M5 36a7 4 0 0 0 14 0M45 36a7 4 0 0 0 14 0" /><circle cx="32" cy="10" r="2.5" /></g>,
  gavel: <g><path d="m24 10 16 16M18 16l16 16M21 13l6-6 16 16-6 6z" /><path d="m30 28-18 18a3 3 0 0 0 4 4l18-18" /><path d="M36 54h22M40 48h14v6H40z" /></g>,
  book: <g><path d="M32 16c-6-5-16-6-24-4v38c8-2 18-1 24 4 6-5 16-6 24-4V12c-8-2-18-1-24 4z" /><path d="M32 16v38M14 22c4 0 8 1 12 3M14 30c4 0 8 1 12 3M38 25c4-2 8-3 12-3M38 33c4-2 8-3 12-3" /></g>,
  section: <g><path d="M40 14c-2-4-6-6-10-6-6 0-10 3-10 8 0 10 22 8 22 20 0 5-4 8-10 8" /><path d="M24 50c2 4 6 6 10 6 6 0 10-3 10-8 0-10-22-8-22-20 0-5 4-8 10-8" /></g>,
  shield: <g><path d="M32 6 10 14v16c0 14 10 23 22 28 12-5 22-14 22-28V14z" /><path d="m22 31 7 7 14-15" /></g>,
  court: <g><path d="M6 22 32 8l26 14zM8 22h48M10 54h44M6 58h52" /><path d="M14 26v24M24 26v24M40 26v24M50 26v24" /><circle cx="32" cy="16" r="2" /></g>,
  scroll: <g><path d="M16 8h28a6 6 0 0 1 6 6v36H20a6 6 0 0 1-6-6V10" /><path d="M14 10a4 4 0 0 1 8 0v34a6 6 0 0 1-6 6M26 18h16M26 26h16M26 34h10" /><circle cx="44" cy="44" r="6" /><path d="m41 49-2 8 5-3 5 3-2-8" /></g>,
  pen: <g><path d="M44 8 56 20 26 50l-14 4 4-14z" /><path d="m38 14 12 12M16 40l8 8M8 58h20" /></g>
};

// [belgi, rang, x%, y%, o'lcham, animatsiya, davomiylik(s), kechikish(s)]
const LAW_LAYOUT = [
  ["scales", "lapis", 4, 10, 120, "a", 14, 0], ["section", "anor", 88, 8, 90, "b", 11, -3], ["book", "tq", 72, 30, 130, "c", 17, -6],
  ["gavel", "saf", 12, 46, 110, "b", 13, -2], ["shield", "tq", 46, 6, 80, "a", 12, -8], ["court", "lapis", 82, 62, 140, "c", 19, -4],
  ["scroll", "anor", 26, 78, 105, "a", 15, -10], ["pen", "saf", 58, 84, 85, "b", 12, -5], ["section", "lapis", 36, 42, 70, "c", 16, -12],
  ["scales", "saf", 92, 38, 75, "a", 18, -7], ["book", "anor", 2, 88, 80, "b", 14, -9], ["shield", "lapis", 64, 56, 64, "a", 13, -1]
];

const LawBackground = React.memo(function LawBackground() {
  return (
    <div className="law-bg" aria-hidden="true">
      {LAW_LAYOUT.map(([name, color, x, y, size, anim, dur, delay], i) => (
        <svg key={i} className={"law-ico law-" + color + " float-" + anim} viewBox="0 0 64 64" width={size} height={size}
          style={{ left: x + "%", top: y + "%", animationDuration: dur + "s", animationDelay: delay + "s" }}>{LAW_ICONS[name]}</svg>
      ))}
    </div>
  );
});

function LogoMark({ size = 48 }) {
  return (
    <svg className="logo-mark" viewBox="0 0 48 48" width={size} height={size} aria-hidden="true">
      <defs><linearGradient id="lm-g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#1a6ff0" /><stop offset="1" stopColor="#12b5a8" /></linearGradient></defs>
      <rect width="48" height="48" rx="12" fill="url(#lm-g)" />
      <g fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M24 9v20M15 13l9-2 9 2" />
        <path d="M15 13l-4 9h8zM33 13l-4 9h8z" fill="rgba(255,255,255,.18)" />
        <path d="M24 33c-3-2.5-8-3-12-2v6c4-1 9-.5 12 2 3-2.5 8-3 12-2v-6c-4-1-9-.5-12 2z" fill="#ffd36b" stroke="#ffd36b" />
      </g>
      <circle cx="24" cy="9" r="2" fill="#ffd36b" />
    </svg>
  );
}
