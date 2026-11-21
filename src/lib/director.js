/* Rejissor (director) — har qanday yaratilgan ssenariyni hayotiyroq sahnalashtiradi:
   mavzuga mos personaj va fon, uzun monologlarni bo'lish, tinglovchi reaksiyasi,
   matnga mos emotsiya/imo-ishora, gaplar orasidagi tabiiy pauzalar.
   Huquqiy mazmun o'zgarmaydi: faqat qisqa, faktga ega bo'lmagan reaksiya replikalari qo'shilishi mumkin.
   Global: detectTopic(text), directScript(script, ctx). CHARACTERS (Character.jsx) dan keyin ulanadi. */

const DIR_EXPLAINERS = { afandi: 1, aqlvoy: 1 };
const DIR_AUTHORITY = { ishberuvchi: 1, sotuvchi: 1, hokim: 1, sudya: 1, inspektor: 1 };
const DIR_GENERIC = { afandi: 1, aqlvoy: 1, qoshni: 1 };
const DIR_BGS = ["mahalla", "bozor", "idora", "sud", "universitet"];

const dirLow = (s) => normApos(s).toLowerCase();
const dirWords = (s) => String(s || "").split(/\s+/).filter(Boolean).length;
const dirHash = (s) => { let h = 2166136261; s = String(s); for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };
// so'z boshidan qidiruvchi regex (apostrof so'z ichida hisoblanadi)
const dirRe = (alts) => new RegExp("(?:^|[^a-z0-9'])(?:" + alts.join("|") + ")", "g");

const TOPICS = {
  mehnat: {
    label: "Mehnat huquqi", background: "idora", cast: ["ishberuvchi", "xodima"], hero: "xodima", other: "ishberuvchi",
    re: dirRe(["ish(?:ga|dan|da|ni|im|imni|imdan|ingiz|xona|chi|chilar)?(?![a-z'])", "ish haq", "maosh", "oylik", "ta'til", "mehnat", "xodim", "bo'shat", "ishdan", "ishberuvchi", "ish beruvchi", "lavozim", "dekret", "sinov muddat", "mehnat shartnoma", "kasaba"])
  },
  savdo: {
    label: "Iste'molchi huquqlari", background: "bozor", cast: ["sotuvchi", "qoshni"], hero: "qoshni", other: "sotuvchi",
    re: dirRe(["do'kon", "xarid", "mahsulot", "tovar", "qaytar", "sotuvchi", "sotib ol", "kafolat", "chek(?![a-z'])", "iste'molchi", "bozor", "sifatsiz", "almashtir", "narx", "savdo"])
  },
  sud: {
    label: "Sud va javobgarlik", background: "sud", cast: ["sudya", "inspektor"], hero: "qoshni", other: "sudya",
    re: dirRe(["urdi", "urish", "kaltak", "tahdid", "zo'ravon", "o'g'irla", "tan jarohat", "sud(?:ga|da|dan|ning|ni|lar|lov)?(?![a-z'])", "sudya", "jinoy", "hibs", "qamoq", "ma'muriy", "jarima", "prokuror", "advokat", "ayblan", "tergov", "huquqbuzar", "da'vo", "militsiya", "politsiya", "ichki ishlar"])
  },
  oila: {
    label: "Oila huquqi", background: "mahalla", cast: ["qoshni", "xodima"], hero: "qoshni", other: "xodima",
    re: dirRe(["oila", "nikoh", "ajrash", "aliment", "farzand", "er-xotin", "ota-ona", "vasiy", "homiylik", "meros", "kelin", "to'y"])
  },
  talim: {
    label: "Ta'lim", background: "universitet", cast: ["talabaqiz"], hero: "talabaqiz", other: null,
    re: dirRe(["ta'lim", "talaba", "universitet", "kontrakt", "o'qish", "maktab", "o'qituvchi", "stipendiya", "imtihon", "diplom", "o'quvchi", "institut", "litsey", "kollej"])
  },
  uy: {
    label: "Uy-joy va qo'shnichilik", background: "mahalla", cast: ["qoshni", "hokim"], hero: "qoshni", other: "hokim",
    re: dirRe(["uy-joy", "uy(?:im|ni|ga|da|dan|ingiz)?(?![a-z'])", "qo'shni", "ijara", "kommunal", "kvartira", "xonadon", "ko'chmas mulk", "gaz(?![a-z'])", "elektr", "hovli", "mahalla", "ko'p qavatli"])
  },
  transport: {
    label: "Yo'l harakati", background: "mahalla", cast: ["inspektor", "qoshni"], hero: "qoshni", other: "inspektor",
    re: dirRe(["transport", "yhxb", "yhx", "yo'l harakat", "haydovchi", "avtomobil", "mashina", "guvohnoma", "prava", "avtobus", "taksi", "piyoda", "svetofor", "tezlik", "jarima ball"])
  },
  soliq: {
    label: "Soliq", background: "idora", cast: ["inspektor", "ishberuvchi"], hero: "ishberuvchi", other: "inspektor",
    re: dirRe(["soliq", "deklaratsiya", "stir(?![a-z'])", "yakka tartib", "tadbirkor", "bojxona", "qqs", "patent"])
  }
};

function detectTopic(text) {
  const t = " " + dirLow(text) + " ";
  let best = "umumiy", bestN = 0;
  Object.keys(TOPICS).forEach((k) => {
    const n = (t.match(TOPICS[k].re) || []).length;
    if (n > bestN) { best = k; bestN = n; }
  });
  if (best === "umumiy" || bestN < 1) return { key: "umumiy", background: "mahalla", cast: ["qoshni"], label: "Umumiy", hero: "qoshni", other: null };
  const T = TOPICS[best];
  let cast = T.cast.slice(), other = T.other;
  if (best === "oila" && /(^|[^a-z'])(bola|farzand|aliment|o'g'il|qiz(?![a-z']))/.test(t)) { cast = ["qoshni", "bola"]; other = "bola"; }
  return { key: best, background: T.background, cast, label: T.label, hero: T.hero, other };
}

/* ---------- matn signallari ---------- */
const CUE = {
  pos: /(rahmat|zo'r|yaxshi|haqli|huquqingiz bor|huquqi bor|ajoyib|barakalla|tabrik|xursand|tushundim|endi bilaman|qoyil)/,
  warn: /(taqiqlan|mumkin emas|yo'l qo'yilmaydi|jarima|javobgar|ehtiyot|jinoyat|qonunga zid|noqonuniy)/,
  worry: /(muammo|qo'rq|nima qilay|nima qilaman|bo'shat|xavotir|tushunmadim|yordam bering|voy|haqimni|aldad|aldan|buzil|shikoyat|mayapti|may qo'y|ma(?:di|dim)(?![a-z']))/,
  num: /(\d|modda|muddat|(^|[^a-z'])(kun|oy|yil|hafta|soat|foiz|so'm)(?![a-z']))/,
  greet: /(assalom|salom|xush kelibsiz|xayrli (kun|tong|kech)|keling,? )/
};
const roleOf = (id) => (DIR_EXPLAINERS[id] ? "exp" : DIR_AUTHORITY[id] ? "auth" : "lay");

function emotionCue(text, speaker) {
  const low = dirLow(text), role = roleOf(speaker), q = /\?\s*["»”]?\s*$/.test(text) || /\?/.test(text);
  if (role === "lay" && CUE.worry.test(low)) return "worried";
  if (q) return role === "lay" ? "surprised" : "neutral";
  if (CUE.warn.test(low)) return role === "lay" ? "worried" : "serious";
  if (CUE.pos.test(low) && (/!/.test(text) || /(rahmat|tushundim|barakalla)/.test(low))) return "happy";
  return null;
}

function gestureCue(text, speaker, firstOfSpeaker) {
  const low = dirLow(text), role = roleOf(speaker);
  if (firstOfSpeaker && CUE.greet.test(low)) return "wave";
  if (CUE.warn.test(low) && role !== "lay" && !/(haqli|huquqi bor|huquqingiz bor)/.test(low)) return "warn";
  if (/\?/.test(text)) return role === "lay" && CUE.worry.test(low) ? "shrug" : "think";
  if (role === "lay" && CUE.worry.test(low)) return "shrug";
  if (CUE.num.test(low)) return "point";
  if (role !== "lay" && dirWords(text) >= 8) return "explain";
  return null;
}
const ALT_GESTURE = { explain: "point", point: "explain", think: "shrug", shrug: "think", warn: "point", wave: "explain" };

/* ---------- qisqa reaksiyalar (faktsiz) ---------- */
const REACTIONS = {
  warn: [["Voy, buni bilmas ekanman.", "surprised"], ["Bu jiddiy ekan-ku.", "worried"], ["Shunaqami?!", "surprised"]],
  num: [["Demak, muddat muhim ekan-da?", "surprised"], ["Buni yozib qo'yay.", "neutral"], ["Shunaqa deng...", "surprised"]],
  any: [["Hmm, tushunarli.", "neutral"], ["Shunaqami?!", "surprised"], ["Qiziq-ku!", "happy"], ["Ha, endi tushunyapman.", "happy"], ["Davom eting, eshityapman.", "neutral"]]
};
function pickReaction(prevText, seed, used) {
  const low = dirLow(prevText);
  const pool = CUE.warn.test(low) ? REACTIONS.warn.concat(REACTIONS.any) : CUE.num.test(low) ? REACTIONS.num.concat(REACTIONS.any) : REACTIONS.any;
  for (let k = 0; k < pool.length; k++) {
    const r = pool[(seed + k) % pool.length];
    if (!used.has(r[0])) { used.add(r[0]); return r; }
  }
  return pool[seed % pool.length];
}

/* ---------- matnni bo'lish ---------- */
function stripClip(text) {
  let t = String(text).trim();
  t = t.replace(/(\S)\s*(?:\.{3}|…)(\s*[»"”)])/g, "$1$2"); // «...gap...» -> «...gap»
  if (/(?:\.{3}|…)\s*$/.test(t)) {
    t = t.replace(/\s*(?:\.{3}|…)\s*$/, "").replace(/[,;:\-–]\s*$/, "");
    if (!/[.!?»"”)]$/.test(t)) t += ".";
  }
  return t;
}
function splitLong(text, max) {
  if (dirWords(text) <= max) return [text];
  const sents = text.split(/(?<=[.!?])\s+(?=["«“]?[A-ZÀ-ÞĞŞÇÖÜO‘0-9])/);
  const parts = [];
  sents.forEach((s) => {
    if (dirWords(s) > max + 6) {
      // juda uzun yagona gap: o'rtaga eng yaqin vergul/nuqtali vergulda bo'lamiz
      const w = s.split(/\s+/), mid = w.length / 2;
      let cut = -1;
      w.forEach((x, i) => { if (/[,;:]$/.test(x) && i >= 4 && w.length - i - 1 >= 4 && (cut < 0 || Math.abs(i - mid) < Math.abs(cut - mid))) cut = i; });
      if (cut >= 0) { parts.push(w.slice(0, cut + 1).join(" ")); parts.push(w.slice(cut + 1).join(" ")); return; }
    }
    parts.push(s);
  });
  const out = [];
  parts.forEach((p) => {
    const last = out[out.length - 1];
    if (last && dirWords(last) + dirWords(p) <= max) out[out.length - 1] = last + " " + p; else out.push(p);
  });
  return out.filter((x) => x.trim());
}

/* ---------- asosiy funksiya ---------- */
function directScript(script, ctx) {
  ctx = ctx || {};
  const s = JSON.parse(JSON.stringify(script || {}));
  if (!Array.isArray(s.scenes) || !s.scenes.length) return s;
  const allText = [s.title || ""].concat(...s.scenes.map((sc) => (sc.lines || []).map((l) => l.text))).join(" ") + " " + String(ctx.text || "").slice(0, 6000);
  const topic = detectTopic(allText);
  s.topic = topic.key;
  const hasAudio = (l) => typeof l.audio === "string";
  const ids = (sc) => (sc.characters || []).map((c) => c.id);

  // 1) Personajlar va joy
  const firstIdx = (() => {
    const k = s.scenes.findIndex((sc) => sc.lines && sc.lines.length && /hayot|vaziyat/i.test(normApos(sc.title || "")));
    return k >= 0 ? k : s.scenes.findIndex((sc) => sc.lines && sc.lines.length);
  })();
  if (topic.key !== "umumiy" && firstIdx >= 0) {
    const first = s.scenes[firstIdx];
    const generic = ids(first).concat(first.lines.map((l) => l.speaker)).every((id) => DIR_GENERIC[id]);
    if (generic) {
      const hero = topic.hero;
      // qo'shni "umumiy qahramon" edi — mavzuga mos qahramonga almashtiramiz (studiya ovozi bo'lsa tegmaymiz)
      const canSwap = hero && hero !== "qoshni" && CHARACTERS[hero] &&
        !s.scenes.some((sc) => (sc.lines || []).some((l) => l.speaker === "qoshni" && hasAudio(l))) &&
        !s.scenes.some((sc) => ids(sc).includes(hero) || (sc.lines || []).some((l) => l.speaker === hero));
      if (canSwap) s.scenes.forEach((sc) => {
        sc.lines.forEach((l) => { if (l.speaker === "qoshni") l.speaker = hero; });
        sc.characters = (sc.characters || []).map((c) => (c.id === "qoshni" ? { ...c, id: hero } : c));
      });
      const heroId = canSwap ? hero : ids(first).includes("qoshni") || first.lines.some((l) => l.speaker === "qoshni") ? "qoshni" : hero;
      const want = [heroId, topic.other].filter((x) => x && CHARACTERS[x]);
      want.forEach((id) => { if (!ids(first).includes(id)) first.characters.push({ id }); });
      first.background = topic.background;
      first.topicStaged = true;
      // oxirgi sahnaga qahramon tinglovchi sifatida qaytadi
      const lastIdx = s.scenes.length - 1;
      const last = s.scenes[lastIdx];
      if (lastIdx > firstIdx && last.lines && last.lines.length && heroId && !ids(last).includes(heroId) && ids(last).length < 3) last.characters.push({ id: heroId });
    }
  }

  // 2) Replikalar gigienasi: kesilgan "...", uzun gaplarni bo'lish, uzun monologga reaksiya
  const usedReact = new Set();
  s.scenes.forEach((sc, si) => {
    const out = [];
    (sc.lines || []).forEach((l) => {
      if (hasAudio(l)) { out.push({ ...l }); return; }
      const text = stripClip(l.text);
      const parts = splitLong(text, 22);
      parts.forEach((p, k) => out.push({ ...l, text: p, ...(k ? { cont: true } : {}) }));
    });
    // > 3 ketma-ket bir xil gapiruvchi: tinglovchidan bitta qisqa reaksiya
    const onScreen = ids(sc).concat(out.map((l) => l.speaker)).filter((v, i, a) => a.indexOf(v) === i);
    let run = 1;
    for (let i = 1; i < out.length; i++) {
      run = out[i].speaker === out[i - 1].speaker ? run + 1 : 1;
      if (run === 3 && out[i + 1] && out[i + 1].speaker === out[i].speaker) {
        const sp = out[i].speaker;
        const cands = onScreen.filter((id) => id !== sp);
        const reactor = cands.find((id) => roleOf(id) === "lay") || cands.find((id) => id === "aqlvoy") || cands[0];
        if (!reactor) break;
        const r = pickReaction(out[i].text, dirHash((s.id || "") + si), usedReact);
        out.splice(i + 1, 0, { speaker: reactor, text: r[0], emotion: r[1], gesture: "none", reaction: true });
        if (out[i + 2]) delete out[i + 2].cont;
        break; // sahnada ko'pi bilan bitta reaksiya
      }
    }
    sc.lines = out;
  });

  // 3) Kadrdagi personajlar (max 3), fon takrorlanmasligi, joylashuv uzluksizligi
  const side = {};
  let prevIds = [];
  s.scenes.forEach((sc, si) => {
    const speakers = [];
    sc.lines.forEach((l) => { if (!speakers.includes(l.speaker)) speakers.push(l.speaker); });
    let list = ids(sc).concat(speakers).filter((v, i, a) => CHARACTERS[v] && a.indexOf(v) === i);
    if (list.length > 3) list = speakers.slice(0, 3).concat(list.filter((x) => !speakers.includes(x))).slice(0, 3);
    // gapirmaydigan qo'shimchalarni kesamiz, gapiruvchilar albatta qoladi
    const words = {};
    sc.lines.forEach((l) => { words[l.speaker] = (words[l.speaker] || 0) + dirWords(l.text); });
    const pos = {};
    if (list.length === 1) pos[list[0]] = "center";
    else if (list.length >= 2) {
      let center = null;
      if (list.length === 3) {
        // markazda asosiy tushuntiruvchi: gapirayotgan Afandi, aks holda eng ko'p gapirgan
        center = words.afandi ? "afandi" : list.slice().sort((a, b) => (words[b] || 0) - (words[a] || 0))[0];
        pos[center] = "center";
      }
      const rest = list.filter((x) => x !== center);
      const pref = rest.map((id) => (side[id] === "left" || side[id] === "right" ? side[id] : null));
      if (pref[0] && pref[1] && pref[0] === pref[1]) pref[1] = null; // ziddiyat: birinchisi o'z joyida qoladi
      if (!pref[0] && !pref[1]) {
        // gapni boshlagan chapda (o'ngga qaraydi), ikkinchisi o'ngda
        const opener = rest.slice().sort((a, b) => (speakers.indexOf(a) < 0 ? 99 : speakers.indexOf(a)) - (speakers.indexOf(b) < 0 ? 99 : speakers.indexOf(b)))[0];
        pos[opener] = "left"; pos[rest.find((x) => x !== opener)] = "right";
      } else {
        const a = pref[0] || (pref[1] === "left" ? "right" : "left");
        pos[rest[0]] = a; pos[rest[1]] = a === "left" ? "right" : "left";
      }
    }
    sc.characters = list.map((id) => {
      const p = pos[id];
      const cont = prevIds.includes(id);
      return { id, position: p, enter: cont ? "fade" : p === "center" ? "pop" : "slide" };
    });
    list.forEach((id) => { side[id] = pos[id]; });
    prevIds = list;

    // fon: ketma-ket bir xil fon — faqat davom etayotgan voqea bo'lsa
    if (si > 0 && !sc.topicStaged) {
      const prev = s.scenes[si - 1];
      const sharedHero = list.some((id) => !DIR_EXPLAINERS[id] && prev.characters.some((c) => c.id === id));
      if (sc.background === prev.background && !sharedHero) {
        const next = s.scenes[si + 1];
        const pool = ["universitet", "mahalla", "idora", topic.background].filter((b, i, a) => DIR_BGS.includes(b) && a.indexOf(b) === i);
        const alt = pool.find((b) => b !== prev.background && (!next || b !== next.background)) || pool.find((b) => b !== prev.background);
        if (alt) sc.background = alt;
      }
    }
    delete sc.topicStaged;
  });

  // 4) Emotsiya va imo-ishora, 5) pauzalar
  const all = [];
  s.scenes.forEach((sc) => {
    const seen = {};
    let lastG = {}, lastE = {}, sameE = {};
    sc.lines.forEach((l, li) => {
      const firstOfSpeaker = !seen[l.speaker];
      seen[l.speaker] = true;
      if (!l.reaction) {
        // emotsiya
        const ce = emotionCue(l.text, l.speaker);
        if (ce && (l.emotion === "neutral" || (l.emotion === "happy" && (ce === "worried" || ce === "serious")) ||
          ((l.emotion === "worried" || l.emotion === "serious") && ce === "happy"))) l.emotion = ce;
        // bir xil emotsiya mexanik takrorlanmasin (ketma-ket 3-chi)
        if (!ce && l.emotion !== "neutral" && lastE[l.speaker] === l.emotion && sameE[l.speaker] >= 2) l.emotion = "neutral";
        // imo-ishora
        let g = gestureCue(l.text, l.speaker, firstOfSpeaker);
        if (!g) g = l.gesture === "wave" && !firstOfSpeaker ? "none" : l.gesture || "none";
        if (g !== "none" && lastG[l.speaker] === g) g = l.cont ? "none" : ALT_GESTURE[g] && ALT_GESTURE[g] !== lastG[l.speaker] ? ALT_GESTURE[g] : "none";
        if (g === "wave" && !firstOfSpeaker) g = "explain";
        l.gesture = g;
      }
      sameE[l.speaker] = lastE[l.speaker] === l.emotion ? (sameE[l.speaker] || 1) + 1 : 1;
      lastE[l.speaker] = l.emotion;
      lastG[l.speaker] = l.gesture;
      // pauza (ms): gapiruvchi almashganda tinglash "nafasi"
      const prev = sc.lines[li - 1];
      let pause = 0;
      if (prev && prev.speaker !== l.speaker) pause = l.reaction ? 150 : /\?\s*["»”]?\s*$/.test(prev.text) ? 500 : /!\s*["»”]?\s*$/.test(prev.text) ? 350 : 250;
      else if (prev && !l.cont) pause = 120;
      if (prev && prev.reaction) pause = 200;
      if (pause) l.pause = pause; else delete l.pause;
      all.push({ l, li, sc });
    });
  });
  // ~25% replikada imo-ishora yo'q (doimiy qo'l silkitish g'ayritabiiy)
  const lines = all.filter((x) => !x.l.reaction);
  const need = Math.ceil(lines.length * 0.25) - lines.filter((x) => x.l.gesture === "none").length;
  if (need > 0) {
    const cands = lines.filter((x) => x.li > 0 && (x.l.gesture === "explain" || x.l.gesture === "point"))
      .sort((a, b) => (b.l.cont ? 1 : 0) - (a.l.cont ? 1 : 0) || dirWords(a.l.text) - dirWords(b.l.text));
    cands.slice(0, need).forEach((x) => { x.l.gesture = "none"; });
  }
  all.forEach((x) => { delete x.l.cont; delete x.l.reaction; });
  s.directed = true;
  return s;
}
