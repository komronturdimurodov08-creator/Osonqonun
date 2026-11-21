/* OsonQonun — umumiy yordamchilar: store, transliteratsiya, ovoz, PDF, Claude ko'prigi */
const { useState, useEffect, useRef, useMemo, useCallback } = React;
const h = React.createElement;

/* ---------- Kichik yordamchilar ---------- */
const cx = (...a) => a.filter(Boolean).join(" ");
const fmtTime = (ms) => {
  const s = Math.max(0, Math.round(ms / 1000));
  return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0");
};
const normApos = (s) => String(s || "").replace(/[ʻʼ‘’`]/g, "'");
const uid = () => Math.random().toString(36).slice(2, 9);

/* ---------- Store (progress va sozlamalar shu qurilmada) ---------- */
const STORE_KEY = "osonqonun.v1";
const defaultState = {
  watched: {},          // videoId -> true
  cases: {},            // caseId -> { solved, answer }
  quiz: {},             // lessonId -> { correct, total }
  threshold: 70,        // o'qituvchi belgilagan o'tish foizi
  saved: [],            // offline saqlangan ssenariylar
  externalVideos: {},   // scriptId -> { url, provider } — NotebookLM/YouTube batafsil videolari
  settings: { alphabet: "lat", bigFont: false, contrast: false, voice: true, voiceEngine: "auto", maleVoice: "", femaleVoice: "" }
};
const Store = (() => {
  let state = defaultState;
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) {
      const p = JSON.parse(raw);
      state = { ...defaultState, ...p, settings: { ...defaultState.settings, ...(p.settings || {}) } };
    }
  } catch (e) { /* localStorage yo'q — xotirada ishlaymiz */ }
  const subs = new Set();
  return {
    get: () => state,
    set(patch) {
      state = typeof patch === "function" ? patch(state) : { ...state, ...patch };
      try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (e) {}
      subs.forEach((f) => f(state));
    },
    sub(f) { subs.add(f); return () => subs.delete(f); },
    reset() { this.set(JSON.parse(JSON.stringify(defaultState))); }
  };
})();
function useStore() {
  const [s, setS] = useState(Store.get());
  useEffect(() => Store.sub(setS), []);
  return s;
}

/* ---------- Lotin -> Kirill ---------- */
const Translit = (() => {
  const single = { a: "а", b: "б", c: "с", d: "д", e: "е", f: "ф", g: "г", h: "ҳ", i: "и", j: "ж", k: "к", l: "л", m: "м", n: "н", o: "о", p: "п", q: "қ", r: "р", s: "с", t: "т", u: "у", v: "в", w: "в", x: "х", y: "й", z: "з" };
  const di = { "o'": "ў", "g'": "ғ", sh: "ш", ch: "ч", yo: "ё", yu: "ю", ya: "я", ye: "е" };
  const re = /(o['ʻ‘’`ʼ]|g['ʻ‘’`ʼ]|sh|ch|yo|yu|ya|ye|[a-z]|['ʼ’])/gi;
  const isLetter = (c) => !!c && /[a-zа-яўғқҳё]/i.test(c);
  function word(w) {
    if (/https?:|www\.|\w\.(uz|com|org|ru)\b|@/i.test(w)) return w;
    return w.replace(re, (m, _g, off, str) => {
      const low = normApos(m.toLowerCase());
      const prev = str[off - 1];
      let out;
      if (low === "'") out = isLetter(prev) && isLetter(str[off + 1]) ? "ъ" : m;
      else if (di[low]) out = di[low];
      else if (low === "e") out = isLetter(prev) ? "е" : "э";
      else out = single[low] || m;
      const up = m[0] !== m[0].toLowerCase();
      if (!up) return out;
      const allUp = m.length > 1 && m[1] !== m[1].toLowerCase() && /[a-z]/i.test(m[1]);
      return allUp || out.length === 1 ? out.toUpperCase() : out[0].toUpperCase() + out.slice(1);
    });
  }
  const toCyr = (s) => String(s).split(/(\s+)/).map(word).join("");
  // DOM darajasida: matn tugunlarini almashtiramiz, asl matnni eslab qolamiz
  const orig = new WeakMap();
  let mode = "lat", writing = false, obs = null;
  function skip(node) {
    const p = node.parentElement;
    return !p || p.closest(".notr, script, style, textarea, input, code");
  }
  function apply(node) {
    if (skip(node)) return;
    const cur = node.nodeValue;
    if (!/[a-z]/i.test(cur)) return;
    orig.set(node, cur);
    writing = true; node.nodeValue = toCyr(cur); writing = false;
  }
  function walk(root, fn) {
    const it = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let n; while ((n = it.nextNode())) fn(n);
  }
  function setMode(m, root) {
    if (m === mode) return;
    mode = m;
    if (m === "cyr") {
      walk(root, apply);
      obs = new MutationObserver((muts) => {
        if (writing) return;
        for (const mu of muts) {
          if (mu.type === "characterData") apply(mu.target);
          else mu.addedNodes.forEach((n) => (n.nodeType === 3 ? apply(n) : n.nodeType === 1 && walk(n, apply)));
        }
      });
      obs.observe(root, { subtree: true, childList: true, characterData: true });
    } else {
      if (obs) obs.disconnect();
      writing = true;
      walk(root, (n) => { if (orig.has(n)) { n.nodeValue = orig.get(n); orig.delete(n); } });
      writing = false;
    }
  }
  return { toCyr, setMode };
})();

/* ---------- Ovoz: Claude ovozi (artifact ichida) yoki brauzerning eng yaxshi ovozi ---------- */
const FEMALE_CHARS = { talabaqiz: 1, xodima: 1 };
const VOICE_PROFILE = {   // yengil farqlar: haddan tashqari pitch ovozni "robot"ga aylantiradi
  afandi: { pitch: 0.9, rate: 0.9 }, aqlvoy: { pitch: 1.05, rate: 1.03 },
  qoshni: { pitch: 0.95, rate: 0.98 }, ishberuvchi: { pitch: 0.9, rate: 0.97 },
  sotuvchi: { pitch: 1, rate: 1.05 }, hokim: { pitch: 0.92, rate: 0.95 },
  sudya: { pitch: 0.88, rate: 0.92 }, talabaqiz: { pitch: 1.08, rate: 1.03 },
  xodima: { pitch: 1.02, rate: 1 }, inspektor: { pitch: 1, rate: 1 }, bola: { pitch: 1.25, rate: 1.05 }
};
const CLAUDE_VOICE = { afandi: "rounded", aqlvoy: "glassy", talabaqiz: "airy", xodima: "airy", bola: "airy", qoshni: "buttery", ishberuvchi: "buttery", sotuvchi: "glassy", hokim: "rounded", sudya: "rounded", inspektor: "buttery" };

/* O'zbekcha raqamlar: "31-modda" -> "o'ttiz birinchi modda", "2023" -> "ikki ming yigirma uch" */
const UzNum = (() => {
  const ones = ["nol", "bir", "ikki", "uch", "to'rt", "besh", "olti", "yetti", "sakkiz", "to'qqiz"];
  const tens = ["", "o'n", "yigirma", "o'ttiz", "qirq", "ellik", "oltmish", "yetmish", "sakson", "to'qson"];
  function card(n) {
    n = Math.floor(n);
    if (n === 0) return "nol";
    if (n >= 1e6) return String(n);
    const out = [];
    if (n >= 1000) { out.push(card(Math.floor(n / 1000)) + " ming"); n %= 1000; }
    if (n >= 100) { out.push(ones[Math.floor(n / 100)] + " yuz"); n %= 100; }
    if (n >= 10) { out.push(tens[Math.floor(n / 10)]); n %= 10; }
    if (n > 0) out.push(ones[n]);
    return out.join(" ");
  }
  const ord = (n) => { const w = card(n); return /[aeiou]$/.test(w) ? w + "nchi" : w + "inchi"; };
  const MONTHS = "yanvar|fevral|mart|aprel|may|iyun|iyul|avgust|sentabr|sentyabr|oktabr|oktyabr|noyabr|dekabr";
  function speakable(s) {
    return normApos(s)
      .replace(/\bMK\b/g, "Mehnat kodeksi").replace(/\bJK\b/g, "Jinoyat kodeksi").replace(/\bFK\b/g, "Fuqarolik kodeksi")
      .replace(/lex\.uz/gi, "leks uz")
      .replace(/(\d+)\s*%/g, (_, n) => card(+n) + " foiz")
      .replace(/(\d+)\s*[-–]\s*(\d+)\s+(yosh|yil|kun|oy)/g, (_, a, b, w) => card(+a) + "-" + card(+b) + " " + w)
      .replace(new RegExp("(\\d+)-(" + MONTHS + ")", "gi"), (_, n, m) => ord(+n) + " " + m)
      .replace(/(\d+)-(modda|moddasi|moddaga|moddalar|yil|yili|son|band|qism|bob|sahna|dars|bosqich|qoida|sinf|kun|o'rin)/gi, (_, n, w) => ord(+n) + " " + w)
      .replace(/\d+/g, (n) => card(+n))
      .replace(/[«»"“”]/g, "").replace(/\s[-–—]\s/g, ", ").replace(/[✓•→⚠]/g, "").replace(/\.\.\./g, ".")
      .replace(/\s+/g, " ").trim();
  }
  return { card, ord, speakable };
})();

/* Ovozning tiliga moslab yozish: turk ovozi o'zbekchani turk imlosida yaxshiroq o'qiydi, rus ovozi — kirillda */
function adaptForLang(text, lang) {
  const l = (lang || "").toLowerCase();
  if (l.startsWith("tr")) {
    return text.toLowerCase().replace(/o'/g, "o").replace(/g'/g, "ğ").replace(/sh/g, "ş").replace(/ch/g, "ç")
      .replace(/q/g, "k").replace(/x/g, "h").replace(/j/g, "c").replace(/'/g, "");
  }
  if (l.startsWith("ru") || l.startsWith("kk") || l.startsWith("ky")) {
    let c = Translit.toCyr(text);
    if (l.startsWith("ru")) c = c.replace(/ў/g, "у").replace(/Ў/g, "У").replace(/қ/g, "к").replace(/Қ/g, "К").replace(/ғ/g, "г").replace(/Ғ/g, "Г").replace(/ҳ/g, "х").replace(/Ҳ/g, "Х");
    else c = c.replace(/ў/g, "у").replace(/Ў/g, "У").replace(/ҳ/g, "х").replace(/Ҳ/g, "Х");
    return c;
  }
  return text;
}

const Speech = (() => {
  const ok = typeof window !== "undefined" && "speechSynthesis" in window;
  let all = [];
  const FEM = /(female|woman|madina|zira|seda|yelda|emel|filiz|milena|irina|svetlana|alena|daria|dariya|ekaterina|aigul|aigerim|samantha|karen|tessa|victoria|anna|ayşe|zeynep|aida|amira|natasha|katya|elena|lilya|sabina|nigora)/i;
  const MALE = /(\bmale|\bman\b|sardor|ahmet|tolga|dmitri|dmitry|pavel|yuri|daulet|erkek|maxim|aleksandr|alexander|artem|daniel|cem|emre)/i;
  const langScore = (v) => { const l = (v.lang || "").toLowerCase(); return l.startsWith("uz") ? 100 : l.startsWith("tr") ? 60 : l.startsWith("kk") ? 50 : l.startsWith("ky") ? 45 : l.startsWith("ru") ? 40 : 0; };
  const quality = (v) => (/natural|neural|online|premium|enhanced/i.test(v.name) ? 25 : 0) + (/google/i.test(v.name) ? 10 : 0);
  const score = (v) => langScore(v) + quality(v);
  function load() { if (ok) all = speechSynthesis.getVoices() || []; }
  if (ok) { load(); try { speechSynthesis.addEventListener("voiceschanged", load); } catch (e) { speechSynthesis.onvoiceschanged = load; } }
  const usable = () => all.filter((v) => langScore(v) > 0).sort((a, b) => score(b) - score(a));
  function pick(who) {
    const st = Store.get().settings;
    const female = !!FEMALE_CHARS[who] || who === "bola";
    const chosen = female ? st.femaleVoice : st.maleVoice;
    if (chosen) { const v = all.find((x) => x.name === chosen); if (v) return v; }
    const list = usable();
    if (!list.length) return all[0] || null;
    const top = langScore(list[0]);
    const same = list.filter((v) => langScore(v) === top);
    if (female) return same.find((v) => FEM.test(v.name)) || same[0];
    return same.find((v) => MALE.test(v.name)) || same.find((v) => !FEM.test(v.name)) || same[0];
  }
  function speak(text, who, speed, onend) {
    if (!ok) { onend && onend(); return; }
    try {
      speechSynthesis.cancel();
      const v = pick(who);
      const u = new SpeechSynthesisUtterance(adaptForLang(UzNum.speakable(text), v ? v.lang : "uz"));
      const p = VOICE_PROFILE[who] || { pitch: 1, rate: 1 };
      const femaleVoiceOnFemale = FEMALE_CHARS[who] && v && FEM.test(v.name);
      if (v) { u.voice = v; u.lang = v.lang; } else u.lang = "uz-UZ";
      u.pitch = femaleVoiceOnFemale ? 1 : p.pitch;
      u.rate = Math.max(0.5, Math.min(2, p.rate * speed));
      let done = false;
      const end = () => { if (!done) { done = true; onend && onend(); } };
      u.onend = end; u.onerror = end;
      speechSynthesis.speak(u);
    } catch (e) { onend && onend(); }
  }
  return {
    ok, speak, pick, usable,
    voices: () => all,
    hasUzbek: () => all.some((v) => (v.lang || "").toLowerCase().startsWith("uz")),
    cancel() { if (ok) try { speechSynthesis.cancel(); } catch (e) {} },
    voiceName: (who) => { const v = pick(who || "afandi"); return v ? v.name + " (" + v.lang + ")" : "standart"; }
  };
})();

/* Qaysi dvigatel: Claude ovozi (yuqori sifat) yoki brauzer */
const Voice = (() => {
  let tts = null, lang, langReady = null, broken = false;
  async function claude() {
    if (broken) return null;
    if (tts) return tts;
    const t = await Bridge.tts();
    if (t && !langReady) {
      langReady = (async () => {
        try {
          const ls = (await (t.languages ? t.languages() : Promise.resolve(undefined)).catch(() => undefined)) || [];
          lang = ls.includes("uz") ? "uz" : ls.includes("tr") ? "tr" : undefined;
        } catch (e) { lang = undefined; }
      })();
    }
    if (langReady) await langReady;
    tts = t;
    return t;
  }
  async function engine() {
    const pref = Store.get().settings.voiceEngine || "auto";
    if (pref === "browser") return "browser";
    const t = await claude();
    if (pref === "claude") return t ? "claude" : "browser";
    // avto: brauzerda tabiiy o'zbekcha ovoz bo'lsa — u, aks holda Claude ovozi
    if (Speech.hasUzbek()) return "browser";
    return t ? "claude" : "browser";
  }
  const lineFor = (text, who, id) => ({
    text: lang === "tr" ? adaptForLang(UzNum.speakable(text), "tr") : UzNum.speakable(text),
    voice: CLAUDE_VOICE[who] || "buttery", id: String(id)
  });
  return {
    claude, engine, lineFor,
    lang: () => lang,
    markBroken() { broken = true; },
    clampRate: (r) => Math.max(0.7, Math.min(1.5, r))
  };
})();

/* ---------- Studiya ovozi: oldindan ElevenLabs'da yozilgan mp3 (dist/audio/<kalit>.mp3) ----------
   Kalitlar ro'yxatini build.mjs window.OQ_AUDIO_KEYS ga yozadi. Fayl bo'lmasa — Claude/brauzer ovoziga qaytamiz. */
const ElevenAudio = (() => {
  const keys = new Set((typeof window !== "undefined" && window.OQ_AUDIO_KEYS) || []);
  const enc = typeof TextEncoder !== "undefined" ? new TextEncoder() : null;
  // oson_ovoz.py dagi audio_kalit() bilan bir xil: FNV-1a 32-bit, UTF-8
  const key = (who, text) => {
    let h = 0x811c9dc5;
    const bytes = enc ? enc.encode(who + "|" + text) : [];
    for (let i = 0; i < bytes.length; i++) { h ^= bytes[i]; h = Math.imul(h, 0x01000193) >>> 0; }
    return ("0000000" + h.toString(16)).slice(-8);
  };
  let a = null, token = 0;
  const enabled = () => { const p = Store.get().settings.voiceEngine || "auto"; return keys.size > 0 && (p === "auto" || p === "studio"); };
  const has = (who, text) => !!who && !!text && enabled() && keys.has(key(who, text));
  function stop() {
    token++;
    if (a) { a.onended = a.onerror = null; try { a.pause(); } catch (e) {} a = null; }
  }
  function play(who, text, rate, onend, onfail) {
    stop();
    const my = token, k = key(who, text);
    const el = new Audio("audio/" + k + ".mp3");
    try { el.preservesPitch = true; el.playbackRate = rate || 1; } catch (e) {}
    const fail = () => { if (my !== token) return; keys.delete(k); a = null; onfail && onfail(); };
    el.onended = () => { if (my === token) { a = null; onend && onend(); } };
    el.onerror = fail;
    a = el;
    const p = el.play();
    if (p && p.catch) p.catch((e) => { if (!e || e.name !== "AbortError") fail(); });
  }
  return {
    has, play, stop, key,
    count: () => keys.size,
    pause() { if (a) try { a.pause(); } catch (e) {} },
    resume() { if (!a) return false; const p = a.play(); if (p && p.catch) p.catch(() => {}); return true; },
    setRate(r) { if (a) try { a.playbackRate = r; } catch (e) {} }
  };
})();

/* ---------- Claude imkoniyatlari (artifact ichida) ---------- */
const Bridge = (() => {
  // window.claude sahifa ishga tushgandan keyinroq paydo bo'ladi — 4 soniyagacha kutamiz
  const ready = new Promise((res) => {
    let n = 0;
    const t = () => (window.claude && typeof window.claude.use === "function") ? res(true) : (++n > 20 ? res(false) : setTimeout(t, 200));
    t();
  });
  const get = async (name) => {
    try {
      if (!(await ready)) return null;
      return await window.claude.use(name);
    } catch (e) { return null; }
  };
  return { sample: () => get("sample"), downloads: () => get("downloads"), tts: () => get("tts") };
})();

/* ---------- Oddiy PDF yasovchi (konspekt uchun, kutubxonasiz) ---------- */
function makePdf(title, paragraphs) {
  const clean = (s) => normApos(s).replace(/[“”«»]/g, '"').replace(/[–—]/g, "-").replace(/…/g, "...")
    .replace(/[^\x20-\x7E\xA0-\xFF]/g, "");
  const esc = (s) => s.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
  const wrap = (s, n) => {
    const out = []; let line = "";
    for (const w of s.split(/\s+/)) {
      if ((line + " " + w).trim().length > n) { out.push(line); line = w; } else line = (line + " " + w).trim();
    }
    if (line) out.push(line);
    return out;
  };
  const rows = [{ t: clean(title), size: 16, bold: true }, { t: "", size: 8 }];
  paragraphs.forEach((p) => {
    const bullet = p.startsWith("# ") ? null : "- ";
    if (!bullet) { rows.push({ t: "", size: 6 }); rows.push({ t: clean(p.slice(2)), size: 12.5, bold: true }); return; }
    wrap(clean(p), 86).forEach((l, i) => rows.push({ t: (i ? "   " : bullet) + l, size: 11 }));
  });
  rows.push({ t: "", size: 10 });
  rows.push({ t: "OsonQonun - ta'limiy material, yuridik maslahat emas. Manba: lex.uz", size: 9 });
  const pages = []; let cur = [], y = 790;
  rows.forEach((r) => {
    const lh = r.size * 1.45;
    if (y - lh < 50) { pages.push(cur); cur = []; y = 790; }
    cur.push({ ...r, y }); y -= lh;
  });
  pages.push(cur);
  const objs = [];
  objs[1] = "<< /Type /Catalog /Pages 2 0 R >>";
  objs[3] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>";
  objs[4] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>";
  const kids = [];
  pages.forEach((pg, i) => {
    const pid = 5 + i * 2, cid = pid + 1;
    kids.push(pid + " 0 R");
    const stream = pg.map((r) => "BT /" + (r.bold ? "F2" : "F1") + " " + r.size + " Tf 50 " + r.y.toFixed(1) + " Td (" + esc(r.t) + ") Tj ET").join("\n");
    objs[pid] = "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents " + cid + " 0 R >>";
    objs[cid] = "<< /Length " + stream.length + " >>\nstream\n" + stream + "\nendstream";
  });
  objs[2] = "<< /Type /Pages /Kids [" + kids.join(" ") + "] /Count " + pages.length + " >>";
  let pdf = "%PDF-1.4\n";
  const offs = [];
  for (let i = 1; i < objs.length; i++) { offs[i] = pdf.length; pdf += i + " 0 obj\n" + objs[i] + "\nendobj\n"; }
  const xref = pdf.length;
  pdf += "xref\n0 " + objs.length + "\n0000000000 65535 f \n";
  for (let i = 1; i < objs.length; i++) pdf += String(offs[i]).padStart(10, "0") + " 00000 n \n";
  pdf += "trailer\n<< /Size " + objs.length + " /Root 1 0 R >>\nstartxref\n" + xref + "\n%%EOF";
  const bytes = new Uint8Array(pdf.length);
  for (let i = 0; i < pdf.length; i++) bytes[i] = pdf.charCodeAt(i) & 255;
  return bytes;
}
async function saveFile(filename, bytes, mime) {
  const dl = await Bridge.downloads();
  if (dl) {
    try { await dl.save({ filename, data: new Blob([bytes], { type: mime }) }); return "ok"; }
    catch (e) { return "declined"; }
  }
  try {
    const url = URL.createObjectURL(new Blob([bytes], { type: mime }));
    const a = document.createElement("a");
    a.href = url; a.download = filename; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
    return "ok";
  } catch (e) { return "fail"; }
}
async function copyText(t) {
  try { await navigator.clipboard.writeText(t); return true; } catch (e) { return false; }
}
