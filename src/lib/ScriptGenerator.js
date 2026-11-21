/* ScriptGenerator — hujjat/kazus/savoldan JSON video-ssenariy yaratadi.
   1) Claude (artifact ichida `sample` imkoniyati) — asosiy yo'l
   2) Oflayn shablon — AI ulanmagan bo'lsa, matndan modda, muddat va ogohlantirishlarni ajratib oladi */

const LEVELS = {
  bola: { label: "Bolaga tushuntir", hint: "8-12 yoshli bola uchun: juda sodda so'zlar, maktab va o'yindan misollar, atamalarni izohla." },
  fuqaro: { label: "Oddiy fuqaroga", hint: "Kattalar uchun oddiy so'zlashuv tili: hayotiy misollar, aniq muddat va qadamlar, atamalarni qavsda izohla." },
  talaba: { label: "Yurist-talabaga", hint: "Yurist-talaba uchun: aniq huquqiy atamalar, moddalar va qismlar, norma tuzilishi, amaliy tahlil." }
};

const SERIOUS = /(zo'ravon|kaltak|urdi|urish|tahdid|o'g'irla|hibs|qamoq|ushlab|o'ldir|jonimga|o'z joni|nomus|odam savdo|bolani ur)/i;

function buildPrompt(text, level, mode, context) {
  const lv = LEVELS[level] || LEVELS.fuqaro;
  return `Sen "OsonQonun" platformasining ssenariy yozuvchisisan. Qonunlarni o'zbek milliy personajlari ishtirokidagi 1-3 daqiqalik multfilmga aylantirasan.

QOIDALAR:
- Faqat berilgan matnga va O'zbekiston Respublikasining rasmiy manbalariga (lex.uz) tayan. Modda raqamini faqat aniq bilsang yoz. Bilmasang, Afandi "aniq bilmayman, lex.uz dan tekshiring" deydi va onScreenText.label ga "Manba aniqlanmadi" yoziladi.
- Hazil bo'lishi mumkin, lekin huquqiy mazmun hech qachon buzilmaydi; hech kimni kamsitma.
- Til: o'zbek tili, lotin yozuvi (o', g' uchun oddiy apostrof). Har bir replika 1-2 gap, 25 so'zdan oshmasin.
- Daraja: ${lv.label}. ${lv.hint}
- Personajlar: afandi (dono hazilkash ustoz, tushuntiradi), aqlvoy (zukko yosh yurist-talaba, savol beradi va xulosa qiladi), yordamchilar: qoshni, ishberuvchi, sotuvchi, hokim, sudya, talabaqiz, xodima, inspektor, bola.
- Fonlar: mahalla, bozor, idora, sud, universitet.
- emotion: neutral|happy|worried|surprised|serious. gesture: none|point|wave|explain|think|warn|shrug.
- onScreenText.kind: title|article|keyword|warning|steps (steps uchun items massivi).

TUZILMA (aynan 5 sahna):
1. "Hayotiy vaziyat" - qahramon muammoga duch keladi.
2. "Savol" - Aqlvoy so'raydi: "Bu ${mode === "savol" ? "holatda qonun" : "hujjat"} nima deydi?"
3. "Tushuntirish" - Afandi sodda tilda: huquqlar, majburiyatlar, muddatlar; onScreenText kind=article, label masalan "Mehnat kodeksi, 130-modda".
4. "Ehtiyot bo'ling!" - xavfli joylar (kind=warning).
5. "Endi nima qilish kerak?" - 3-5 qadam (kind=steps).${mode === "savol" ? "\nAgar holat jiddiy bo'lsa (zo'ravonlik, hibs, hayotga xavf), 5-sahnada bepul yuridik yordam va tegishli davlat organlariga murojaat qilishni maslahat ber." : ""}

FAQAT JSON qaytar, boshqa hech narsa yozma:
{"title":"...","summary":["3-6 ta qisqa konspekt bandi"],"source":{"title":"hujjat nomi","url":"https://lex.uz/..."},
 "scenes":[{"title":"...","background":"...","characters":[{"id":"...","position":"left|center|right"}],
 "lines":[{"speaker":"...","text":"...","emotion":"...","gesture":"..."}],
 "onScreenText":{"kind":"...","label":"...","text":"...","items":[]}}]}

${context ? `HUQUQIY BAZA (lex.uz bilan solishtirilgan moddalar). FAQAT shu moddalarga tayan, boshqa modda raqami yoki faktni o'zingdan qo'shma. source.url uchun shu yerdagi manbani ishlat:
${context}

` : ""}${mode === "savol" ? "FOYDALANUVCHI SAVOLI" : "HUJJAT MATNI"}:
"""
${text.slice(0, 12000)}
"""`;
}

function extractJson(t) {
  const a = t.indexOf("{"), b = t.lastIndexOf("}");
  if (a < 0 || b <= a) throw new Error("JSON topilmadi");
  return JSON.parse(t.slice(a, b + 1));
}

async function generateWithAI({ text, level, mode, image, onProgress, signal, context }) {
  const sample = await Bridge.sample();
  if (!sample) throw Object.assign(new Error("AI ulanmagan"), { code: "unavailable" });
  const opts = { modelTier: "default", signal, onText: ({ text: t }) => onProgress && onProgress(t.length) };
  if (image) {
    try { const lim = await sample.limits(); if (lim && lim.images) opts.images = [image]; } catch (e) {}
  }
  const res = await sample(buildPrompt(text || "(Matn rasmda berilgan - rasmni o'qib, mazmunini tushuntir.)", level, mode, context), opts);
  const raw = extractJson(res.text);
  const s = normalizeScript({ ...raw, level, id: "ai-" + uid() });
  s.aiMade = true;
  return s;
}

/* ---------- Oflayn shablon generator ---------- */
function sentencesOf(text) {
  return normApos(text).replace(/\s+/g, " ").split(/(?<=[.!?;])\s+/).map((x) => x.trim()).filter((x) => x.length > 12);
}
const clip = (s, n = 24) => { const w = s.split(" "); return w.length > n ? w.slice(0, n).join(" ") + "..." : s; };

function templateScript(text, level, mode) {
  const t = normApos(text);
  const sents = sentencesOf(t);
  const arts = [...new Set((t.match(/\d+\s*[-‑–]?\s*modda/gi) || []).map((m) => m.replace(/\s|[‑–]/g, "").replace("-modda", "") + "-modda"))];
  const terms = [...new Set((t.match(/\d+\s*(kalendar\s+|ish\s+)?(kun|oy|yil|soat|hafta)\w*/gi) || []).map((x) => x.trim()))].slice(0, 4);
  const warnRe = /(taqiqlan|mumkin emas|yo'l qo'yilmaydi|jarima|javobgar|\bshart\b|majbur|lozim|kerak|muddati)/i;
  const rightRe = /(huquq|haqli|ega|mumkin|kafolat)/i;
  const warns = sents.filter((s) => warnRe.test(s)).slice(0, 2);
  const rights = sents.filter((s) => rightRe.test(s) && !warns.includes(s)).slice(0, 2);
  const main = (rights.length ? rights : sents.slice(0, 2)).map((s) => clip(s));
  const first = clip(sents[0] || t, 10);
  const kid = level === "bola", stud = level === "talaba";
  const pre = kid ? "Oddiy qilib aytsam: " : "";
  const explainLines = main.map((s, i) => L("afandi", (i === 0 ? pre : "") + s, "neutral", i ? "point" : "explain"));
  if (!arts.length) explainLines.push(L("afandi", "Bu matnda modda raqami ko'rsatilmagan. Aniq bilmayman - lex.uz dan tekshirib ko'ring.", "worried", "shrug"));
  if (stud) explainLines.push(L("aqlvoy", "Talaba sifatida normaning gipoteza, dispozitsiya va sanksiyasini ajratib olaman.", "happy", "point"));
  const warnLines = warns.length
    ? warns.map((s, i) => L("afandi", clip(s), "serious", i ? "explain" : "warn"))
    : [L("afandi", "Muddatlar, imzo qo'yiladigan joylar va jarimalarga alohida e'tibor bering.", "serious", "warn")];
  const steps = [
    kid ? "Kattalarga - ota-ona yoki o'qituvchiga ko'rsating" : "Hujjatni oxirigacha o'qing, nusxasini saqlang",
    terms.length ? "Muddatni yozib qo'ying: " + terms.join(", ") : "Muddat va sanalarni aniqlang",
    "Tushunmagan bandni yozma ravishda so'rang",
    arts.length ? "Moddani lex.uz da tekshiring: " + arts.slice(0, 2).join(", ") : "Manbani lex.uz da tekshiring",
    "Kerak bo'lsa yuristga yoki bepul yuridik yordamga murojaat qiling"
  ];
  const isQ = mode === "savol";
  return normalizeScript({
    id: "tpl-" + uid(), title: isQ ? "Savolingiz: " + clip(sents[0] || t, 8) : "Hujjat: " + first, level, source: LEX.lex, offline: true,
    summary: [...main, ...warns.map((w) => "Ehtiyot bo'ling: " + clip(w, 18)), ...(terms.length ? ["Muddatlar: " + terms.join(", ")] : [])],
    scenes: [
      SC("Hayotiy vaziyat", "mahalla", ["qoshni", "aqlvoy"], [
        L("qoshni", isQ ? "Menda savol bor: " + clip(sents[0] || t, 18) : "Menga shunday hujjat keldi: «" + first + "». Hech narsa tushunmadim!", "worried", "shrug"),
        L("aqlvoy", "Xavotir olmang, birga tushunib olamiz.", "happy", "wave")
      ]),
      SC("Savol", "universitet", ["aqlvoy", "afandi"], [
        L("aqlvoy", isQ ? "Afandi bobo, bu holatda qonun nima deydi?" : "Afandi bobo, bu hujjat nima deydi?", "surprised", "think"),
        L("afandi", isQ ? "Savolga to'liq javob uchun AI ulanishi kerak. Hozircha umumiy yo'l-yo'riq beraman." : "Shoshma, bolam, hozir sodda qilib aytaman.", "happy", "wave")
      ]),
      SC("Tushuntirish", "idora", ["afandi", "aqlvoy"], explainLines,
        arts.length ? ART(arts[0], clip(main[0] || "", 9)) : KEY("Manba aniqlanmadi", "Modda raqamini lex.uz dan tekshiring")),
      SC("Ehtiyot bo'ling!", "idora", ["afandi", "qoshni"], warnLines, WARN("Ehtiyot bo'ling!", terms.length ? "Muddatlar: " + terms.join(", ") : "Muddat va majburiyatlarni tekshiring")),
      SC("Endi nima qilish kerak?", "mahalla", ["afandi", "qoshni"], [
        L("qoshni", "Xo'sh, endi nima qilay?", "neutral", "think"),
        L("afandi", "Ekrandagi qadamlarni birma-bir bajaring. Qonunni bilgan haqini oladi!", "happy", "explain")
      ], STEPS("Endi nima qilish kerak?", steps))
    ]
  });
}

/* ---------- Kazus: talaba javobini videodagi yechim bilan solishtirish ---------- */
async function compareAnswer(cs, answer) {
  const sample = await Bridge.sample();
  if (sample) {
    try {
      const prompt = `Sen yuridik fakultet o'qituvchisisan. Talabaning kazus yechimini namunaviy yechim bilan 5 bosqich bo'yicha solishtir: ${STAGE_NAMES.join(", ")}.
Kazus: ${cs.title}. Savol: ${cs.question}
Namunaviy yechim:
${cs.stages.map((s, i) => STAGE_NAMES[i] + ": " + s.screen).join("\n")}
Talaba javobi:
"""${answer.slice(0, 4000)}"""
FAQAT JSON qaytar: {"stages":[{"status":"ok|partial|miss","comment":"1 gap, o'zbek tilida, lotin"}],"overall":"2 gaplik umumiy baho"} — stages massivida aynan 5 element.`;
      const res = await sample(prompt, { modelTier: "default" });
      const j = extractJson(res.text);
      if (Array.isArray(j.stages) && j.stages.length === 5) return { ...j, by: "ai" };
    } catch (e) { /* oflayn tekshiruvga o'tamiz */ }
  }
  const a = normApos(answer).toLowerCase();
  const stages = cs.stages.map((st) => {
    const hit = st.keywords.filter((k) => a.includes(normApos(k).toLowerCase()));
    const status = hit.length >= 2 || (hit.length === 1 && st.keywords.length <= 3) ? "ok" : hit.length === 1 ? "partial" : "miss";
    return { status, comment: status === "ok" ? "To'g'ri yo'nalish." : "Videodagi yechim: " + st.screen };
  });
  const ok = stages.filter((s) => s.status === "ok").length;
  return { stages, by: "kalit-so'z", overall: ok >= 4 ? "Juda yaxshi - deyarli barcha bosqich yoritilgan." : ok >= 2 ? "Yarim yo'l bosib o'tildi. Qizil bosqichlarni videodan qayta ko'ring." : "Asosiy bosqichlar tushib qolgan. Yechim videosini yana bir bor ko'ring." };
}
