// Ilovadagi barcha multfilm ssenariylaridan replikalarni ajratib oladi -> replikalar.json
// Ishga tushirish (EasyLaw papkasidan):  node oson_ovoz/eksport_replikalar.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const here = dirname(fileURLToPath(import.meta.url));
const src = join(here, "..", "src");
const FILES = ["lib/core.js", "lib/scriptTools.js", "data/helpers.js", "data/weekly.js", "data/cases.js", "data/lessons.js", "data/roadmap.js"];

const mem = {};
const stub = new Proxy(function () {}, { get: () => stub, apply: () => stub, construct: () => stub });
const ctx = {
  console, setTimeout, clearTimeout, performance, TextEncoder,
  localStorage: { getItem: (k) => mem[k] ?? null, setItem: (k, v) => { mem[k] = String(v); }, removeItem: (k) => { delete mem[k]; } },
  navigator: { userAgent: "node" }, document: stub, React: stub, ReactDOM: stub, MutationObserver: stub,
};
ctx.window = ctx;
vm.createContext(ctx);
// Character.jsx da JSX bor — undan faqat CHARACTERS ro'yxatini olamiz
const chr = readFileSync(join(src, "components/Character.jsx"), "utf8");
const chars = chr.slice(chr.indexOf("const CHARACTERS"), chr.indexOf("const charName"));
const code = chars + "\nconst charName = (id) => (CHARACTERS[id] ? CHARACTERS[id].name : id);\n" +
  FILES.map((f) => readFileSync(join(src, f), "utf8")).join("\n;\n") +
  `\n;globalThis.__OUT = { WEEKLY: typeof WEEKLY !== "undefined" ? WEEKLY : null, CASES: typeof CASES !== "undefined" ? CASES : [], LESSONS: typeof LESSONS !== "undefined" ? LESSONS : [], RECAP: typeof RECAP !== "undefined" ? RECAP : null, ROADMAP: typeof ROADMAP !== "undefined" ? ROADMAP : [], ALWAYS_RIGHTS: typeof ALWAYS_RIGHTS !== "undefined" ? ALWAYS_RIGHTS : [], rightScript: typeof rightScript !== "undefined" ? rightScript : null, speakable: UzNum.speakable };`;
vm.runInContext(code, ctx, { filename: "osonqonun-data.js" });
const O = ctx.__OUT;

// Ob'ekt ichidan barcha ssenariylarni (scenes[].lines[]) topamiz
const scripts = new Map();
const seen = new Set();
(function walk(x, depth) {
  if (!x || typeof x !== "object" || seen.has(x) || depth > 8) return;
  seen.add(x);
  if (Array.isArray(x.scenes) && x.id) { scripts.set(x.id, x); }
  for (const v of Array.isArray(x) ? x : Object.values(x)) walk(v, depth + 1);
})({ W: O.WEEKLY, C: O.CASES, L: O.LESSONS, R: O.RECAP }, 0);
// Yo'l xaritasidagi videolar ish vaqtida yasaladi — ularni ham yasab olamiz
if (O.rightScript) {
  for (const age of O.ROADMAP) for (const item of age.items || age.rights || []) {
    try { const s = O.rightScript(item, age.label || age.age || "", age.bg); if (s && s.id) scripts.set(s.id, s); } catch (e) {}
  }
}

const lines = [];
const uniq = new Set();
for (const s of scripts.values()) s.scenes.forEach((sc, si) => sc.lines.forEach((ln) => {
  const k = ln.speaker + "|" + ln.text;
  if (uniq.has(k)) return;
  uniq.add(k);
  lines.push({ script: s.id, scene: si, speaker: ln.speaker, emotion: ln.emotion || "neutral", text: ln.text, speakable: O.speakable(ln.text) });
}));
const out = join(here, "replikalar.json");
writeFileSync(out, JSON.stringify({ scripts: [...scripts.keys()], lines }, null, 2));
const harf = lines.reduce((a, l) => a + l.speakable.length, 0);
console.log(`${scripts.size} ta ssenariy, ${lines.length} ta replika, ${harf} harf -> ${out}`);
