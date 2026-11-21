/* LexSearch — anonim savolni LexBase moddalari bilan solishtirib, eng mos moddalarni topadi.
   Hech qanday tashqi xizmat kerak emas: oflayn ishlaydi. Savol o'zbek (lotin/kirill), rus yoki ingliz tilida bo'lishi mumkin.
   Natija: [{ entry, score }] — bo'sh bo'lsa, platforma javob o'ylab topmaydi. */

const LexSearch = (() => {
  // O'zbek kirillni lotinga (qidiruv uchun) — ruscha so'zlar kirillda qoladi va alohida solishtiriladi
  const C2L = { а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "yo", ж: "j", з: "z", и: "i", й: "y", к: "k", л: "l", м: "m", н: "n", о: "o", п: "p", р: "r", с: "s", т: "t", у: "u", ф: "f", х: "x", ц: "ts", ч: "ch", ш: "sh", ъ: "'", ь: "", э: "e", ю: "yu", я: "ya", ў: "o'", ғ: "g'", қ: "q", ҳ: "h" };
  const lat = (s) => s.replace(/[а-яёўғқҳ]/g, (c) => C2L[c] ?? c);
  const norm = (s) => normApos(String(s).toLowerCase()).replace(/[«»"“”.,!?;:()\[\]—–-]/g, " ").replace(/\s+/g, " ").trim();
  const words = (s) => norm(s).split(" ").filter((w) => w.length > 1);
  // Ikki so'z bir xil o'zakka egami: qo'shimchalar (-lar, -ni, -ga, -dan, -ish...) farqini e'tiborsiz qoldiramiz
  function same(a, b) {
    if (a === b) return true;
    const n = Math.min(a.length, b.length);
    if (n < 4) return false;
    const need = Math.max(4, Math.min(b.length, a.length) - 2);
    let i = 0; while (i < n && a[i] === b[i]) i++;
    return i >= need || (i >= 6 && i >= Math.min(a.length, b.length) - 3);
  }
  const STOP = new Set("va bu u men sen biz siz ular bilan uchun nima qanday qachon kim qaysi edi bor yo'q mumkinmi kerak bo'ladimi bo'lsa ham emas lekin agar endi shu hozir menga meni mening и в на не что как я мне меня это the a an is are to of my me i what how can do does".split(" "));
  const WORK = /(ish|oylik|maosh|rahbar|xo'jayin|ishxona|ishberuvchi|direktor|работ|зарплат|начальник|employer|boss|job|salary|work)/;

  function search(question, limit = 3) {
    const raw = norm(question);
    const qw = [...new Set(words(question).concat(words(lat(raw))))].filter((w) => !STOP.has(w));
    if (!qw.length) return [];
    const workQ = WORK.test(raw) || WORK.test(lat(raw));
    const scored = LEXBASE.map((e) => {
      let score = 0, kwScore = 0;
      for (const k of e.kw) {
        const kws = words(k);
        if (!kws.length) continue;
        const hit = kws.every((kw) => qw.some((q) => same(q, kw)));
        if (hit) { const w = kws.length > 1 ? 3 : kw_weight(kws[0]); score += w; kwScore += w; }
      }
      // Kalit so'zlar bo'yicha aniq moslik bo'lmasa (faqat sarlavhadagi umumiy so'z) — moddani ko'rsatmaymiz
      if (kwScore < 2) return { entry: e, score: 0 };
      // sarlavha so'zlari ham biroz hisobga olinadi
      for (const tw of words(e.title.uz).concat(words(e.title.ru), words(e.title.en))) if (tw.length > 4 && qw.some((q) => same(q, tw))) score += 0.5;
      if (workQ && e.law === "mehnat") score *= 1.3;
      return { entry: e, score };
    }).filter((x) => x.score >= 2).sort((a, b) => b.score - a.score);
    if (!scored.length) return [];
    const best = scored[0].score;
    return scored.filter((x) => x.score >= best * 0.45).slice(0, limit);
  }
  const kw_weight = (w) => (w.length >= 6 ? 1.6 : 1.1);

  // Joriy til uchun matn (УЗБ — o'zbekcha, DOM qatlami kirillga o'giradi)
  const pick = (obj) => { const l = I18n.lang(); return obj[l === "ru" ? "ru" : l === "en" ? "en" : "uz"]; };
  const ref = (e) => { const s = LEXBASE_SOURCES[e.law]; const l = I18n.lang(); return pick(s.short) + ", " + (l === "ru" ? "ст. " + e.art : l === "en" ? "Art. " + e.art : e.art + "-modda"); };
  const url = (e) => LEXBASE_SOURCES[e.law].url;

  // AI uchun kontekst: faqat topilgan moddalar
  function context(matches) {
    return matches.map(({ entry: e }) => `- ${LEXBASE_SOURCES[e.law].short.uz}, ${e.art}-modda (${e.title.uz}): ${e.text.uz} [Manba: ${url(e)}]`).join("\n");
  }

  return { search, pick, ref, url, context, norm };
})();

/* Topilgan moddalardan multfilm ssenariysi (AI ulanmagan bo'lsa) — faqat bazadagi faktlar bilan */
function lexTemplateScript(question, matches, level) {
  const top = matches[0].entry;
  const src = LEXBASE_SOURCES[top.law];
  const P = LexSearch.pick;
  const first = (t) => (t.split(/(?<=[.!?])\s+/)[0] || t);
  const q = clip(normApos(question).replace(/\s+/g, " ").trim(), 18);
  const explain = matches.slice(0, 2).flatMap(({ entry: e }, i) => [
    L("afandi", LexSearch.ref(e) + ". " + first(P(e.text)), i ? "neutral" : "serious", i ? "point" : "explain")
  ]);
  if (level === "talaba") explain.push(L("aqlvoy", "Talaba sifatida normaning gipoteza, dispozitsiya va sanksiyasini ajratib olaman.", "happy", "point"));
  const rest = P(top.text).split(/(?<=[.!?])\s+/).slice(1).join(" ");
  const steps = (LEXBASE_STEPS[top.law] || LEXBASE_STEPS.konst);
  return normalizeScript({
    id: "lex-" + uid(), title: P(top.title), level, offline: true, lexBased: true,
    source: { title: P(src), url: src.url },
    summary: matches.map(({ entry: e }) => LexSearch.ref(e) + ": " + P(e.text)),
    scenes: [
      SC("Hayotiy vaziyat", top.law === "mehnat" ? "idora" : "mahalla", ["qoshni", "aqlvoy"], [
        L("qoshni", q, "worried", "shrug"),
        L("aqlvoy", "Xavotir olmang, birga tushunib olamiz.", "happy", "wave")
      ]),
      SC("Savol", "universitet", ["aqlvoy", "afandi"], [
        L("aqlvoy", "Afandi bobo, bu holatda qonun nima deydi?", "surprised", "think"),
        L("afandi", "Zo'r savol! Afandi bobo aniq biladi.", "happy", "wave")
      ]),
      SC("Tushuntirish", "idora", ["afandi", "aqlvoy"], explain, ART(LexSearch.ref(top), P(top.title))),
      SC("Ehtiyot bo'ling!", "idora", ["afandi", "qoshni"], [
        L("afandi", rest ? first(rest) : "Bu umumiy ma'lumot. Rasmiy matnni lex.uz da o'qing.", "serious", "warn")
      ], WARN("Ehtiyot bo'ling!", "Bu umumiy ma'lumot. Rasmiy matnni lex.uz da o'qing.")),
      SC("Endi nima qilish kerak?", "mahalla", ["afandi", "qoshni"], [
        L("qoshni", "Xo'sh, endi nima qilay?", "neutral", "think"),
        L("afandi", "Ekrandagi qadamlarni birma-bir bajaring. Qonunni bilgan haqini oladi!", "happy", "explain")
      ], STEPS("Endi nima qilish kerak?", P(steps).slice(0, 5)))
    ]
  });
}
