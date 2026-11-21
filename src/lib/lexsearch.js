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
    return i >= need || (i >= 7 && i >= Math.min(a.length, b.length) - 3);
  }
  const STOP = new Set("va bu u men sen biz siz ular bilan uchun nima qanday qachon kim qaysi edi bor yo'q mumkinmi kerak bo'ladimi bo'lsa ham emas lekin agar endi shu hozir menga meni mening и в на не что как я мне меня это the a an is are to of my me i what how can do does".split(" "));
  const WORK = /(ish|oylik|maosh|rahbar|xo'jayin|ishxona|ishberuvchi|direktor|работ|зарплат|начальник|employer|boss|job|salary|work)/;

  // Har bir kalit so'z qanchalik "noyob": ko'p moddada uchraydigan so'z (masalan, "ish") kam og'irlikka ega
  let DF = null;
  function df(word) {
    if (!DF) DF = LEXBASE.map((e) => [...new Set(e.kw.flatMap((k) => words(k)).filter((w) => !STOP.has(w)))]);
    return DF.filter((ws) => ws.some((w) => same(w, word))).length || 1;
  }
  const wordWeight = (w) => {
    const base = 1 + Math.log2(LEXBASE.length / df(w)) * 0.6;
    return w.length <= 3 ? base * 0.5 : base;
  };

  function search(question, limit = 3) {
    const raw = norm(question);
    const qw = [...new Set(words(question).concat(words(lat(raw))))].filter((w) => !STOP.has(w));
    if (!qw.length) return [];
    const workQ = WORK.test(raw) || WORK.test(lat(raw));
    // Raqamli tekshiruv qaysi moddani ko'rsatsa — o'sha modda birinchi o'rinda
    const forced = new Set(LexCheck.run(question).map((f) => f.id));
    const scored = LEXBASE.map((e) => {
      let score = 0;
      const used = new Set();
      // Avval uzun iboralar, keyin yakka so'zlar; bitta savol so'zi bir moddaga faqat bir marta ball beradi
      for (const kws of e.kw.map((k) => words(k).filter((w) => !STOP.has(w))).filter((x) => x.length).sort((a, b) => b.length - a.length)) {
        const hits = kws.map((kw) => qw.find((q) => !used.has(q) && same(q, kw)));
        if (hits.some((h) => !h)) continue;
        hits.forEach((h) => used.add(h));
        score += kws.length > 1 ? 1 + kws.reduce((a, w) => a + wordWeight(w), 0) : wordWeight(kws[0]);
      }
      if (score > 0) for (const tw of words(e.title.uz)) if (tw.length > 4 && qw.some((q) => !used.has(q) && same(q, tw))) score += 0.4;
      if (workQ && e.law === "mehnat") score *= 1.2;
      if (forced.has(e.id)) score += 20;
      return { entry: e, score };
    }).filter((x) => x.score >= 2.6).sort((a, b) => b.score - a.score);
    if (!scored.length) return [];
    const best = scored[0].score;
    return scored.filter((x) => x.score >= Math.min(best * 0.55, 20)).slice(0, Math.max(limit, forced.size));
  }

  // Joriy til uchun matn (УЗБ — o'zbekcha, DOM qatlami kirillga o'giradi)
  const pick = (obj) => { const l = I18n.lang(); return obj[l === "ru" ? "ru" : l === "en" ? "en" : "uz"]; };
  const ref = (e) => { const s = LEXBASE_SOURCES[e.law]; const l = I18n.lang(); return pick(s.short) + ", " + (l === "ru" ? "ст. " + e.art : l === "en" ? "Art. " + e.art : e.art + "-modda"); };
  const url = (e) => LEXBASE_SOURCES[e.law].url;


  function context(matches, checks) {
    const facts = matches.map(({ entry: e }) => `- ${LEXBASE_SOURCES[e.law].short.uz}, ${e.art}-modda (${e.title.uz}): ${e.text.uz} [Manba: ${url(e)}]`).join("\n");
    const verdicts = (checks || []).map((c) => `- TEKSHIRUV: ${c.msg.uz}`).join("\n");
    return facts + (verdicts ? "\n" + verdicts : "");
  }

  return { search, pick, ref, url, context, norm, lat };
})();

/* LexCheck — savol yoki hujjatdagi raqamlarni (sinov oylari, ta'til kunlari, soatlar, yosh...) qonundagi raqamlar bilan solishtiradi.
   Natija: [{ id, ok, soft, msg:{uz,ru,en} }]. id — LEXBASE moddasi. Faqat LEXBASE matnidagi faktlar ishlatiladi. */
const LexCheck = (() => {
  const NUMW = { bir: 1, ikki: 2, uch: 3, "to'rt": 4, besh: 5, olti: 6, yetti: 7, sakkiz: 8, "to'qqiz": 9, "o'n": 10 };
  const prep = (text) => {
    let t = LexSearch.lat(normApos(String(text).toLowerCase())).replace(/[«»"“”]/g, " ");
    t = t.replace(/\b(bir|ikki|uch|to'rt|besh|olti|yetti|sakkiz|to'qqiz|o'n)\s+(oy|kun|soat|yosh|hafta|sutka)/g, (m, w, u) => NUMW[w] + " " + u);
    return t;
  };
  const M = (uz, ru, en) => ({ uz, ru, en });
  const num = (m) => m && parseInt(m.find((x, i) => i > 0 && /^\d+$/.test(x || "")), 10);
  const rules = [
    // Sinov muddati (Mehnat kodeksi, 130)
    (t) => {
      const m = t.match(/sinov[^.!?]{0,40}?(\d+)\s*oy/) || t.match(/(\d+)\s*oy\w*\s+(muddatga\s+)?(dastlabki\s+)?sinov/);
      const n = num(m); if (!n) return null;
      if (n <= 3) return { id: "m130", ok: true, msg: M(`${n} oy sinov — qonunga mos: sinov 3 oydan oshmasligi kerak.`, `Испытание ${n} мес. — соответствует закону: не более 3 месяцев.`, `A ${n}-month probation is lawful: it may not exceed 3 months.`) };
      if (n <= 6) return { id: "m130", ok: false, msg: M(`${n} oy sinov — oddiy xodim uchun qonunga zid. Sinov 3 oydan oshmasligi kerak; 6 oygacha faqat rahbar, uning o'rinbosarlari, bosh buxgalter va bo'linma rahbarlari uchun.`, `Испытание ${n} мес. — для обычного работника противоречит закону: не более 3 месяцев; до 6 месяцев — только для руководителя, заместителей, главбуха и руководителей подразделений.`, `A ${n}-month probation is unlawful for an ordinary employee: the limit is 3 months; up to 6 months only for heads, their deputies, chief accountants and heads of divisions.`) };
      return { id: "m130", ok: false, msg: M(`${n} oy sinov — qonunga zid. Sinov hech kim uchun 6 oydan, oddiy xodim uchun 3 oydan oshmaydi.`, `Испытание ${n} мес. — противоречит закону: максимум 6 месяцев даже для руководителей, для обычных работников — 3.`, `A ${n}-month probation is unlawful: never more than 6 months, and 3 months for ordinary employees.`) };
    },
    // Yillik ta'til (217)
    (t) => {
      const m = t.match(/(\d+)\s*(ish\s+|kalendar\s+)?kun\w*\s+(yillik\s+)?(mehnat\s+)?ta'til/) || t.match(/ta'til\w*[^.!?]{0,25}?(\d+)\s*(ish\s+|kalendar\s+)?kun/);
      const n = num(m); if (!n) return null;
      if (n >= 21) return { id: "m217", ok: true, msg: M(`${n} kunlik yillik ta'til — qonunga mos: kamida 21 kalendar kun bo'lishi kerak.`, `Отпуск ${n} дн. — соответствует закону: не менее 21 календарного дня.`, `${n} days of annual leave is lawful: the minimum is 21 calendar days.`) };
      return { id: "m217", ok: false, msg: M(`${n} kunlik yillik ta'til — qonunga zid. Yillik asosiy ta'til kamida 21 kalendar kun (18 yoshgacha va I–II guruh nogironligi bo'lganlarga — 30 kun).`, `Отпуск ${n} дн. — противоречит закону: ежегодный отпуск не менее 21 календарного дня (до 18 лет и при инвалидности I–II группы — 30).`, `${n} days of annual leave is unlawful: the minimum is 21 calendar days (30 for under-18s and people with group I–II disability).`) };
    },
    // Haftalik ish vaqti (182)
    (t) => {
      const m = t.match(/hafta(siga|da)\s*(\d+)\s*soat/) || t.match(/(\d+)\s*soat\w*\s+(ish\s+)?hafta/);
      const n = num(m); if (!n) return null;
      if (n <= 40) return { id: "m182", ok: true, msg: M(`Haftasiga ${n} soat ish — qonunga mos: 40 soatdan oshmasligi kerak.`, `${n} ч в неделю — соответствует закону: не более 40 часов.`, `${n} hours a week is lawful: the limit is 40.`) };
      return { id: "m182", ok: false, msg: M(`Haftasiga ${n} soat ish — qonunga zid. Ish vaqti haftasiga 40 soatdan oshmasligi kerak.`, `${n} ч в неделю — противоречит закону: не более 40 часов в неделю.`, `${n} hours a week is unlawful: the limit is 40 hours a week.`) };
    },
    // Ishga qabul qilish yoshi (118)
    (t) => {
      if (!/(ishla|ishga\s+(kir|ol|qabul|joyla))/.test(t) || /ishdan\s+(bo'shat|hayd|chiq)/.test(t)) return null;
      const n = num(t.match(/(\d+)\s*yosh/)); if (!n || n > 30) return null;
      if (n >= 16) return { id: "m118", ok: true, msg: M(`${n} yoshda ishga qabul qilish mumkin: qonun 16 yoshdan ruxsat beradi.`, `В ${n} лет работать можно: закон допускает приём с 16 лет.`, `At ${n} you can be employed: the law allows it from 16.`) };
      if (n === 15) return { id: "m118", ok: true, soft: true, msg: M(`15 yoshda faqat o'qishdan bo'sh vaqtda yengil ishga, ota-onadan birining yozma roziligi bilan ishlash mumkin.`, `В 15 лет можно только на лёгкую работу в свободное от учёбы время и с письменного согласия одного из родителей.`, `At 15 only light work outside school hours, with a parent's written consent.`) };
      return { id: "m118", ok: false, msg: M(`${n} yoshda ishga qabul qilinmaydi: qonun 16 yoshdan (15 yoshdan — faqat yengil ishga, ota-ona roziligi bilan) ruxsat beradi.`, `В ${n} лет на работу не принимают: с 16 лет (с 15 — только лёгкий труд с согласия родителей).`, `At ${n} you cannot be employed: the minimum is 16 (15 only for light work with parental consent).`) };
    },
    // Oylik to'lanmasligi / oyiga bir marta (253)
    (t) => {
      if (!/(oylik|maosh|ish haqi|zarplata|ойлик)/.test(t)) return null;
      if (/(oyda|oyiga)\s*(1|bir)\s*marta/.test(t)) return { id: "m253", ok: false, msg: M(`Oylikni oyiga bir marta to'lash qonunga zid: ish haqi oyiga kamida ikki marta, ikki to'lov orasi 16 kundan oshmagan holda to'lanishi kerak.`, `Выплата зарплаты раз в месяц противоречит закону: минимум дважды в месяц, промежуток не более 16 дней.`, `Paying wages once a month is unlawful: at least twice a month, no more than 16 days apart.`) };
      const n = num(t.match(/(\d+)\s*oy\w*\s*(beri|buyon|dan\s+beri)/));
      if (n && /(berma|berilma|to'lama|to'lanma|kechik|bermay)/.test(t)) return { id: "m253", ok: false, msg: M(`Oylikni ${n} oy bermaslik — qonunga zid. Ish haqi oyiga kamida ikki marta to'lanishi shart, kechiktirilgani uchun ish beruvchi zararni qoplaydi (319-modda).`, `Невыплата зарплаты ${n} мес. — нарушение закона: зарплата выплачивается минимум дважды в месяц, за задержку работодатель возмещает ущерб (ст. 319).`, `Withholding wages for ${n} month(s) is unlawful: wages are due at least twice a month, and the employer must compensate for delay (Art. 319).`) };
      return null;
    },
    // Ushlab turish 48 soat (Konstitutsiya, 27)
    (t) => {
      if (!/(ushla|qamoq|hibs|politsiya|militsiya|задерж)/.test(t)) return null;
      let h = null, m;
      if ((m = t.match(/(\d+)\s*(kun|sutka)/))) h = +m[1] * 24; else if ((m = t.match(/(\d+)\s*soat/))) h = +m[1];
      if (!h) return null;
      if (h > 48) return { id: "k27", ok: false, msg: M(`Sud qarori bo'lmasa, ${h} soat ushlab turish qonunga zid: sud qarorisiz 48 soatdan ortiq ushlab turish taqiqlangan.`, `Без решения суда удерживать ${h} ч незаконно: задержание без судебного решения более 48 часов запрещено.`, `Without a court decision, holding someone for ${h} hours is unlawful: detention over 48 hours without a court order is prohibited.`) };
      return { id: "k27", ok: true, soft: true, msg: M(`Sud qarorisiz ushlab turish 48 soatdan oshmasligi kerak — undan keyin sud qarori bo'lishi shart.`, `Без решения суда задержание не может превышать 48 часов.`, `Without a court decision, detention may not exceed 48 hours.`) };
    },
    // Xodimning ishdan ketish ogohlantirishi (160)
    (t) => {
      if (!/(o'z xohish|ishdan ket|bo'shamoqchi|ketmoqchi|ariza)/.test(t)) return null;
      const n = num(t.match(/(\d+)\s*(kalendar\s+|ish\s+)?kun\w*\s+(oldin|avval)/)); if (!n) return null;
      if (n <= 14) return { id: "m160", ok: true, msg: M(`Ishdan o'z xohishi bilan ketishda ${n} kun oldin ogohlantirish — qonunga mos: muddatsiz shartnomada 14 kalendar kun.`, `Предупреждение за ${n} дн. при увольнении по собственному желанию — соответствует закону: 14 календарных дней.`, `${n} days' notice when resigning is lawful: the rule is 14 calendar days.`) };
      return { id: "m160", ok: false, soft: true, msg: M(`${n} kun oldin ogohlantirish talabi qonundan uzoq: muddatsiz shartnomada xodim 14 kalendar kun oldin ogohlantiradi (ayrim toifalar uchun boshqa muddat bo'lishi mumkin).`, `Требование предупредить за ${n} дн. дольше закона: по бессрочному договору — 14 календарных дней (для отдельных категорий сроки иные).`, `Requiring ${n} days' notice exceeds the law: for an open-ended contract it is 14 calendar days (some categories differ).`) };
    },
    // Shtat qisqarishida ogohlantirish (165)
    (t) => {
      if (!/(qisqar|shtat|tugatil)/.test(t)) return null;
      const m = t.match(/(\d+)\s*(kun|hafta|oy)\w*\s+(oldin|avval)/); if (!m) return null;
      const days = +m[1] * (m[2] === "oy" ? 30 : m[2] === "hafta" ? 7 : 1);
      if (days >= 60) return { id: "m165", ok: true, msg: M(`Shtat qisqarishida ${m[1]} ${m[2]} oldin ogohlantirish — qonunga mos: kamida 2 oy.`, `Предупреждение о сокращении за ${m[1]} — соответствует закону: не менее 2 месяцев.`, `Notice of ${m[1]} ${m[2]}(s) for redundancy is lawful: the minimum is 2 months.`) };
      return { id: "m165", ok: false, msg: M(`Shtat qisqarishida ${m[1]} ${m[2]} oldin ogohlantirish — qonunga zid: kamida 2 oy oldin yozma ogohlantirish kerak.`, `Предупреждение о сокращении за ${m[1]} — нарушение: нужно письменно предупредить не менее чем за 2 месяца.`, `Notice of ${m[1]} ${m[2]}(s) for redundancy is unlawful: at least 2 months' written notice is required.`) };
    }
  ];
  function run(text) {
    if (!text) return [];
    const parts = prep(text).split(/(?<=[.!?;\n])\s+|\s+\d+\.\s+/).filter((x) => x.trim());
    const out = [];
    for (const part of parts.length ? parts : [prep(text)]) for (const r of rules) {
      const f = r(part);
      if (f && !out.some((o) => o.id === f.id)) out.push(f);
    }
    return out;
  }
  return { run };
})();

const ANS = (e) => (typeof LEXBASE_ANS !== "undefined" && LEXBASE_ANS[e.id]) || {};
const sentencesUz = (t) => t.split(/(?<=[.!?])\s+/).filter(Boolean);

/* Anonim savol uchun multfilm: aniq javob → modda → istisnolar → aniq qadamlar. Faqat LEXBASE faktlari. */
function lexTemplateScript(question, matches, level, checks) {
  checks = checks || [];
  const top = (checks.length && matches.find((m) => m.entry.id === checks[0].id) || matches[0]).entry;
  const src = LEXBASE_SOURCES[top.law];
  const kid = level === "bola";
  const q = clip(normApos(question).replace(/\s+/g, " ").trim(), 22);
  const bad = checks.filter((c) => !c.ok && !c.soft);
  const answerSents = checks.length ? checks.slice(0, 2).map((c) => c.msg.uz) : sentencesUz(ANS(top).a || top.text.uz).slice(0, 2);
  const answer = answerSents.map((s, i) => L("afandi", (i === 0 && kid ? "Oddiy qilib aytsam: " : "") + s, bad.length ? "serious" : "neutral", i ? "point" : (bad.length ? "warn" : "explain")));
  const headline = bad.length ? "Bu qonunga zid" : checks.some((c) => c.ok && !c.soft) ? "Bu qonunga mos" : "Qisqa javob";
  const lawLines = [L("afandi", LexSearch.ref(top) + ". " + sentencesUz(top.text.uz)[0], "neutral", "explain")];
  const second = matches.find((m) => m.entry.id !== top.id);
  if (second && !kid) lawLines.push(L("aqlvoy", "Yana bir modda bor: " + LexSearch.ref(second.entry) + ". " + sentencesUz(ANS(second.entry).a || second.entry.text.uz)[0], "neutral", "point"));
  if (level === "talaba") lawLines.push(L("aqlvoy", "Talaba sifatida normaning gipoteza, dispozitsiya va sanksiyasini ajratib olaman.", "happy", "point"));
  const rest = sentencesUz(top.text.uz).slice(1);
  const caution = rest.length ? rest[rest.length - 1] : "Bu umumiy ma'lumot. O'z holatingiz uchun lex.uz dagi rasmiy matnni o'qing.";
  const steps = (ANS(top).d || LEXBASE_STEPS[top.law].uz).slice(0, 5);
  return normalizeScript({
    id: "lex-" + uid(), title: top.title.uz, level, offline: true, lexBased: true,
    source: { title: src.uz, url: src.url },
    summary: [...checks.map((c) => c.msg.uz), ...matches.map(({ entry: e }) => LexSearch.ref(e) + ": " + e.text.uz)],
    scenes: [
      SC("Hayotiy vaziyat", top.law === "mehnat" ? "idora" : "mahalla", ["qoshni", "aqlvoy"], [
        L("qoshni", q, "worried", "shrug"),
        L("aqlvoy", "Xavotir olmang, qonunga qarab aniq javob topamiz.", "happy", "wave")
      ]),
      SC(headline, "universitet", ["afandi", "qoshni"], answer, bad.length ? WARN(headline, clip(answerSents[0], 14)) : KEY(headline, clip(answerSents[0], 14))),
      SC("Qonun nima deydi", "idora", ["afandi", "aqlvoy"], lawLines, ART(LexSearch.ref(top), top.title.uz)),
      SC("Ehtiyot bo'ling!", "idora", ["afandi", "qoshni"], [L("afandi", caution, "serious", "warn")], WARN("Ehtiyot bo'ling!", "Rasmiy matn: lex.uz — " + LexSearch.ref(top))),
      SC("Endi nima qilish kerak?", "mahalla", ["afandi", "qoshni"], [
        L("qoshni", "Xo'sh, endi nima qilay?", "neutral", "think"),
        L("afandi", "Ekrandagi qadamlarni birma-bir bajaring. Qonunni bilgan haqini oladi!", "happy", "explain")
      ], STEPS("Endi nima qilish kerak?", steps))
    ]
  });
}

/* Hujjat uchun multfilm: hujjatdagi bandlar qonun bilan solishtiriladi */
function docLexScript(text, checks, matches, level) {
  const first = clip(sentencesUz(normApos(text).replace(/\s+/g, " ").trim())[0] || text, 10);
  const bad = checks.filter((c) => !c.ok);
  const good = checks.filter((c) => c.ok);
  const topId = (bad[0] || good[0] || {}).id || (matches[0] && matches[0].entry.id);
  const top = LEXBASE.find((e) => e.id === topId);
  const src = LEXBASE_SOURCES[top.law];
  const verdict = bad.length ? `Hujjatda ${bad.length} ta band qonunga zid.` : good.length ? "Tekshirgan bandlarim qonunga mos." : "Hujjat mavzusiga oid moddalarni topdim.";
  const lines = (checks.length ? checks.slice(0, 3).map((c) => c.msg.uz + " (" + LexSearch.ref(LEXBASE.find((e) => e.id === c.id)) + ")")
    : matches.slice(0, 2).map(({ entry: e }) => LexSearch.ref(e) + ". " + sentencesUz(ANS(e).a || e.text.uz)[0]))
    .map((s, i) => L("afandi", s, !checks[i] || checks[i].ok ? "neutral" : "serious", i ? "point" : "explain"));
  if (level === "talaba") lines.push(L("aqlvoy", "Talaba sifatida har bir bandni tegishli modda bilan solishtirib chiqaman.", "happy", "point"));
  const steps = bad.length
    ? ["Qonunga zid bandlarni belgilab qo'ying", "Imzolashdan oldin ularni o'zgartirishni yozma so'rang", "Moddani lex.uz da o'zingiz o'qing: " + LexSearch.ref(top), "Kelishilmasa, mehnat inspeksiyasi yoki yuristga murojaat qiling"]
    : ["Hujjatni oxirigacha o'qing, nusxasini saqlang", "Moddani lex.uz da o'qing: " + LexSearch.ref(top), "Tushunmagan bandni yozma ravishda so'rang", "Kerak bo'lsa yuristga murojaat qiling"];
  return normalizeScript({
    id: "doc-" + uid(), title: bad.length ? "Hujjatda qonunga zid bandlar bor" : "Hujjat qonun bilan solishtirildi", level, offline: true, lexBased: true,
    source: { title: src.uz, url: src.url },
    summary: [...checks.map((c) => (c.ok ? "✓ " : "✗ ") + c.msg.uz), ...matches.map(({ entry: e }) => LexSearch.ref(e) + ": " + e.text.uz)],
    scenes: [
      SC("Hayotiy vaziyat", "mahalla", ["qoshni", "aqlvoy"], [
        L("qoshni", "Menga shunday hujjat keldi: «" + first + "». Imzolasam bo'ladimi?", "worried", "shrug"),
        L("aqlvoy", "Shoshmang, avval qonun bilan solishtiramiz.", "happy", "wave")
      ]),
      SC("Qonun bilan solishtiramiz", "universitet", ["aqlvoy", "afandi"], [
        L("aqlvoy", "Afandi bobo, bu hujjat qonunga mosmi?", "surprised", "think"),
        L("afandi", verdict, bad.length ? "serious" : "happy", bad.length ? "warn" : "explain")
      ], bad.length ? WARN("Natija", verdict) : KEY("Natija", verdict)),
      SC("Tushuntirish", "idora", ["afandi", "aqlvoy"], lines, ART(LexSearch.ref(top), top.title.uz)),
      SC("Ehtiyot bo'ling!", "idora", ["afandi", "qoshni"], [
        L("afandi", bad.length ? "Qonunga zid bandli hujjatga imzo qo'yishdan oldin uni o'zgartirishni yozma so'rang." : "Men faqat bazadagi moddalar bo'yicha tekshirdim. Boshqa bandlarni lex.uz da o'zingiz ham o'qing.", "serious", "warn")
      ], WARN("Ehtiyot bo'ling!", "Rasmiy matn: lex.uz")),
      SC("Endi nima qilish kerak?", "mahalla", ["afandi", "qoshni"], [
        L("qoshni", "Xo'sh, endi nima qilay?", "neutral", "think"),
        L("afandi", "Ekrandagi qadamlarni birma-bir bajaring.", "happy", "explain")
      ], STEPS("Endi nima qilish kerak?", steps))
    ]
  });
}
