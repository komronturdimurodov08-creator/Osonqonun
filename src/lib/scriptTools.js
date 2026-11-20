/* Ssenariy bilan ishlash: tekshirish/normallashtirish, vaqt chizig'i, konspekt */

const LEX = {
  konst: { title: "O'zbekiston Respublikasi Konstitutsiyasi", url: "https://lex.uz/docs/-6445145" },
  mehnat: { title: "O'zbekiston Respublikasining Mehnat kodeksi", url: "https://lex.uz/docs/-6257288" },
  oila: { title: "O'zbekiston Respublikasining Oila kodeksi", url: "https://lex.uz/docs/-104720" },
  lex: { title: "Qonunchilik ma'lumotlari milliy bazasi", url: "https://lex.uz" }
};
const BACKGROUNDS = ["mahalla", "bozor", "idora", "sud", "universitet"];
const EMOTIONS = ["neutral", "happy", "worried", "surprised", "serious"];
const GESTURES = ["none", "point", "wave", "explain", "think", "warn", "shrug"];

function normalizeScript(raw) {
  const s = JSON.parse(JSON.stringify(raw || {}));
  s.id = s.id || "v-" + uid();
  s.title = s.title || "Nomsiz video";
  s.scenes = (Array.isArray(s.scenes) ? s.scenes : []).filter(Boolean).map((sc, i) => {
    const scene = { ...sc };
    scene.id = scene.id || s.id + "-s" + i;
    scene.background = BACKGROUNDS.includes(scene.background) ? scene.background : "mahalla";
    scene.lines = (Array.isArray(scene.lines) ? scene.lines : []).filter((l) => l && l.text).map((l) => ({
      speaker: CHARACTERS[l.speaker] ? l.speaker : "afandi",
      text: String(l.text).trim(),
      emotion: EMOTIONS.includes(l.emotion) ? l.emotion : "neutral",
      gesture: GESTURES.includes(l.gesture) ? l.gesture : "none"
    }));
    let chars = (Array.isArray(scene.characters) ? scene.characters : [])
      .map((c) => (typeof c === "string" ? { id: c } : c))
      .filter((c) => c && CHARACTERS[c.id]);
    scene.lines.forEach((l) => { if (!chars.find((c) => c.id === l.speaker)) chars.push({ id: l.speaker }); });
    chars = chars.slice(0, 3);
    const auto = chars.length === 1 ? ["center"] : chars.length === 2 ? ["left", "right"] : ["left", "center", "right"];
    const used = new Set();
    scene.characters = chars.map((c, k) => {
      let p = ["left", "center", "right"].includes(c.position) && !used.has(c.position) ? c.position : auto.find((a) => !used.has(a)) || auto[k];
      used.add(p);
      return { id: c.id, position: p, enter: c.enter || (k % 2 ? "slide" : "pop") };
    });
    return scene;
  });
  if (!s.scenes.length) s.scenes = [{ id: s.id + "-s0", background: "mahalla", characters: [{ id: "afandi", position: "center" }], lines: [{ speaker: "afandi", text: "Bu ssenariy bo'sh. Matn kiritib qaytadan urinib ko'ring.", emotion: "worried", gesture: "shrug" }] }];
  if (!Array.isArray(s.summary) || !s.summary.length) s.summary = autoSummary(s);
  s.source = s.source && s.source.url ? s.source : LEX.lex;
  return s;
}

function autoSummary(s) {
  const out = [];
  s.scenes.forEach((sc) => {
    const o = sc.onScreenText;
    if (o && o.kind === "steps" && o.items) o.items.forEach((x) => out.push(x));
    else if (o && o.text && o.kind !== "title") out.push((o.label ? o.label + ": " : "") + o.text);
  });
  if (out.length < 3) s.scenes.forEach((sc) => sc.lines.filter((l) => l.speaker === "afandi").slice(0, 1).forEach((l) => out.push(l.text)));
  return out.slice(0, 8);
}

const estimateDur = (text) => {
  const words = String(text || "").split(/\s+/).filter(Boolean).length;
  return Math.max(1900, Math.min(9500, 900 + words * 360));
};

function buildTimeline(script) {
  const items = [];
  let t = 0;
  script.scenes.forEach((sc, s) => {
    if (!sc.lines.length) {
      const dur = (sc.duration || 3.5) * 1000;
      items.push({ s, l: -1, dur, start: t, first: true, text: "" }); t += dur;
    } else {
      sc.lines.forEach((ln, l) => {
        const dur = estimateDur(ln.text);
        items.push({ s, l, dur, start: t, first: l === 0, text: ln.text, speaker: ln.speaker }); t += dur;
      });
    }
  });
  return { items, total: t };
}
const sceneStart = (tl, s) => { const it = tl.items.find((i) => i.s === s); return it ? it.start : 0; };

function scriptToText(script) {
  return script.scenes.map((sc, i) => (i + 1) + ". " + (sc.title || "Sahna") + "\n" + sc.lines.map((l) => "  " + charName(l.speaker) + ": " + l.text).join("\n")).join("\n\n");
}

function downloadKonspekt(script) {
  const paras = ["# Qisqa konspekt", ...script.summary];
  const refs = script.scenes.map((s) => s.onScreenText).filter((o) => o && o.kind === "article").map((o) => o.label + " - " + o.text);
  if (refs.length) { paras.push("# Moddalar"); refs.forEach((r) => paras.push(r)); }
  paras.push("# Manba"); paras.push(script.source.title + ": " + script.source.url);
  const name = "konspekt-" + normApos(script.title).toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 40) + ".pdf";
  return saveFile(name, makePdf(script.title, paras), "application/pdf");
}
