/* ScriptGenerator — hujjat/kazus/savoldan JSON video-ssenariy yaratadi.
   1) Claude (artifact ichida `sample` imkoniyati) — asosiy yo'l
   2) Oflayn shablon — AI ulanmagan bo'lsa, matndan modda, muddat va ogohlantirishlarni ajratib oladi
      va ularni mavzuga mos tomonlar o'rtasidagi jonli suhbatga aylantiradi */

const LEVELS = {
  bola: { label: "Bolaga tushuntir", hint: "8-12 yoshli bola uchun: juda sodda so'zlar, maktab va o'yindan misollar, atamalarni izohla." },
  fuqaro: { label: "Oddiy fuqaroga", hint: "Kattalar uchun oddiy so'zlashuv tili: hayotiy misollar, aniq muddat va qadamlar, atamalarni qavsda izohla." },
  talaba: { label: "Yurist-talabaga", hint: "Yurist-talaba uchun: aniq huquqiy atamalar, moddalar va qismlar, norma tuzilishi, amaliy tahlil." }
};

const SERIOUS = /(zo'ravon|kaltak|urdi|urish|tahdid|o'g'irla|hibs|qamoq|ushlab|o'ldir|jonimga|o'z joni|nomus|odam savdo|bolani ur)/i;

/* Ikkala prompt (JS va server/ai.py) uchun umumiy rejissyorlik ko'rsatmasi */
const DIRECTION = `SAHNALASHTIRISH (haqiqiy qisqa multfilm-drama kabi):
- Mavzuga mos tomonlar va fonni tanla: mehnat -> ishberuvchi va xodima, idora; savdo/iste'molchi -> sotuvchi va qoshni, bozor; sud jarayoni -> sudya (yoki inspektor) va qoshni, sud; oila -> xodima va qoshni, mahalla; ta'lim -> talabaqiz va bola, universitet; uy-joy -> qoshni va talabaqiz, mahalla; yo'l harakati, soliq, jarima -> inspektor va qoshni, idora yoki mahalla.
- 1-sahna: shu tomonlar o'rtasida haqiqiy kichik nizo, FAQAT dialog orqali (hikoyachi yo'q, Afandi yo'q). Bir tomon noto'g'ri talab qiladi yoki qonunni noto'g'ri tushunadi, ikkinchisi hayron bo'ladi, e'tiroz bildiradi.
- ISTISNO: zo'ravonlik, tahdid, jinsiy yoki bolaga qarshi tajovuz kabi jiddiy holatlarda 1-sahnada zo'ravonlikni ko'rsatma va nizo o'ynama: qahramon Aqlvoyga voqeani xotirjam hikoya qiladi, ohang hazilsiz va hamdard bo'ladi, oxirida 102 va bepul yuridik yordamga murojaat tavsiya etiladi.
- 2-sahnada muammoli tomon Aqlvoy va Afandiga keladi va vaziyatni o'z so'zi bilan aytadi.
- Ikki kishi bir-biriga qarab turadi: biri "left", biri "right". Uch kishi bo'lsa, tushuntiruvchi "center"da.
- Har sahnada 3-6 replika, so'zlovchilar navbatma-navbat. Tinglovchi javob qaytaradi: "Nima?!", "Rostdanmi?", "Ha-ya...", "Shoshmang-chi". Bitta personaj ketma-ket 2 tadan ortiq gapirmasin.
- Hissiyot yoyi: boshida worried/serious -> o'rtada surprised -> oxirida happy (yengil tortish, minnatdorlik).

JONLI O'ZBEKCHA:
- Har replika 1-2 qisqa gap, 18 so'zdan oshmasin. Og'zaki til: "-ku", "-da", "-chi", "xo'sh", "qarang", "axir", "nima qilay".
- Qonun matnini so'zma-so'z O'QIMA. Sodda qilib qayta ayt ("Oddiy qilib aytsam, ...", "Qonun bo'yicha ..."); aniq modda havolasi onScreenText kartasida turadi.
- Savollar, gapni bo'lish ("Lekin men... - Shoshmang, oxirigacha eshiting"), qisqa hayratlar bo'lsin. Rasmiy-quruq iboralardan qoch.
- Afandi: dono, xotirjam, xalqona hazilkash - butun videoda ko'pi bilan BITTA qisqa hazil yoki maqol. Aqlvoy: qiziquvchan yosh yurist-talaba - savol beradi va "Demak, ..." deb xulosa qiladi.

EMOTSIYA VA IMO-ISHORA har replikaning ma'nosiga mos bo'lsin:
- savol -> think; raqam, modda, muddat -> point; ogohlantirish -> warn; salom/xayrlashuv -> wave; tushuntirish -> explain; ikkilanish, "bilmadim" -> shrug; oddiy javob va reaksiyalar -> none (replikalarning ko'pi "none" bo'lishi tabiiy).
- Bitta personaj ketma-ket ikki marta bir xil gesture qilmasin. emotion gap ohangiga mos: hayrat -> surprised, xavotir -> worried, qat'iy gap -> serious.
- "pause" (ixtiyoriy, 0-800 ms): muhim savol yoki hayratdan keyingi dramatik jimlik. Ko'p ishlatma.

OHANG NAMUNASI (raqamlari faqat misol, ularni ko'chirma):
YOMON: {"speaker":"afandi","text":"Kodeksning tegishli moddasiga muvofiq dastlabki sinov muddati belgilangan muddatdan ortiq bo'lishi mumkin emas, bundan tashqari ...","emotion":"neutral","gesture":"explain"}
YAXSHI:
{"speaker":"ishberuvchi","text":"Sizni olamiz, lekin olti oy sinov bilan.","emotion":"neutral","gesture":"explain"}
{"speaker":"xodima","text":"Olti oy?! Bu juda ko'p emasmi?","emotion":"surprised","gesture":"none","pause":400}
{"speaker":"afandi","text":"Oddiy qilib aytsam, sinov uch oydan oshmaydi. Olti oy - faqat rahbarlarga.","emotion":"neutral","gesture":"point"}
{"speaker":"aqlvoy","text":"Demak, Malika opaga olti oy noto'g'ri ekan-da!","emotion":"happy","gesture":"none"}`;

const SCHEMA = `{"title":"...","summary":["3-6 ta qisqa konspekt bandi"],"source":{"title":"hujjat nomi","url":"https://lex.uz/..."},
 "scenes":[{"title":"...","background":"...","characters":[{"id":"...","position":"left|center|right"}],
 "lines":[{"speaker":"...","text":"...","emotion":"...","gesture":"...","pause":0}],
 "onScreenText":{"kind":"...","label":"...","text":"...","items":[]}}]}`;

function buildPrompt(text, level, mode) {
  const lv = LEVELS[level] || LEVELS.fuqaro;
  return `Sen "OsonQonun" platformasining ssenariy yozuvchisi va rejissyorisan. Qonunlarni o'zbek milliy personajlari ishtirokidagi 1-3 daqiqalik jonli multfilmga aylantirasan: tirik odamlar, haqiqiy nizo, tabiiy suhbat.

HUQUQIY ANIQLIK (eng muhim qoida):
- Faqat berilgan matnga va O'zbekiston Respublikasining rasmiy manbalariga (lex.uz) tayan. Modda raqamini faqat aniq bilsang yoz. Matnda yo'q raqam, muddat, summani o'ylab topma. Bilmasang, Afandi "aniq bilmayman, lex.uz dan tekshiring" deydi va onScreenText.label ga "Manba aniqlanmadi" yoziladi.
- Hazil bo'lishi mumkin, lekin huquqiy mazmun hech qachon buzilmaydi; hech kimni kamsitma.
- Til: o'zbek tili, lotin yozuvi (o', g' uchun oddiy apostrof).
- Daraja: ${lv.label}. ${lv.hint}
- Personajlar: afandi (dono hazilkash ustoz, tushuntiradi), aqlvoy (zukko yosh yurist-talaba, savol beradi va xulosa qiladi), yordamchilar: qoshni, ishberuvchi, sotuvchi, hokim, sudya, talabaqiz, xodima, inspektor, bola.
- Fonlar: mahalla, bozor, idora, sud, universitet.
- emotion: neutral|happy|worried|surprised|serious. gesture: none|point|wave|explain|think|warn|shrug.
- onScreenText.kind: title|article|keyword|warning|steps (steps uchun items massivi).

${DIRECTION}

TUZILMA (aynan 5 sahna):
1. "Hayotiy vaziyat" - mavzu tomonlari o'rtasidagi kichik nizo (3-5 replika, dialog).
2. "Savol" - muammoli tomon Aqlvoy va Afandiga keladi; Aqlvoy so'raydi: "Bu ${mode === "savol" ? "holatda qonun" : "hujjat"} nima deydi?"
3. "Tushuntirish" - Afandi sodda tilda (huquqlar, majburiyatlar, muddatlar), Aqlvoy yoki qahramon savol berib, hayron bo'lib turadi; onScreenText kind=article, label masalan "Mehnat kodeksi, 130-modda".
4. "Ehtiyot bo'ling!" - xavfli joylar, qahramon reaksiyasi bilan (kind=warning).
5. "Endi nima qilish kerak?" - 3-5 qadam (kind=steps); oxirida qahramon yengil tortadi, minnatdorchilik bildiradi.${mode === "savol" ? "\nAgar holat jiddiy bo'lsa (zo'ravonlik, hibs, hayotga xavf), 5-sahnada bepul yuridik yordam va tegishli davlat organlariga murojaat qilishni maslahat ber; bunday holatda hazil qilma." : ""}

FAQAT JSON qaytar, boshqa hech narsa yozma:
${SCHEMA}

${mode === "savol" ? "FOYDALANUVCHI SAVOLI" : "HUJJAT MATNI"}:
"""
${text.slice(0, 12000)}
"""`;
}

function extractJson(t) {
  const a = t.indexOf("{"), b = t.lastIndexOf("}");
  if (a < 0 || b <= a) throw new Error("JSON topilmadi");
  return JSON.parse(t.slice(a, b + 1));
}

async function generateWithAI({ text, level, mode, image, onProgress, signal }) {
  const sample = await Bridge.sample();
  if (!sample) throw Object.assign(new Error("AI ulanmagan"), { code: "unavailable" });
  const opts = { modelTier: "default", signal, onText: ({ text: t }) => onProgress && onProgress(t.length) };
  if (image) {
    try { const lim = await sample.limits(); if (lim && lim.images) opts.images = [image]; } catch (e) {}
  }
  const res = await sample(buildPrompt(text || "(Matn rasmda berilgan - rasmni o'qib, mazmunini tushuntir.)", level, mode), opts);
  const raw = extractJson(res.text);
  const s = normalizeScript({ ...raw, level, id: "ai-" + uid() }, { direct: true, text: text || "", mode });
  s.aiMade = true;
  return s;
}

/* ---------- Oflayn shablon generator ---------- */
function sentencesOf(text) {
  return normApos(text).replace(/\s+/g, " ").split(/(?<=[.!?;])\s+/).map((x) => x.trim()).filter((x) => x.length > 12);
}
const words = (s) => String(s || "").split(/\s+/).filter(Boolean);
const clip = (s, n = 24) => { const w = words(s); return w.length > n ? w.slice(0, n).join(" ") + "..." : s; };
/* Qisqa sarlavha uchun: so'z chegarasida, "..."siz */
const shortTitle = (s, n = 8) => words(s).slice(0, n).join(" ").replace(/[,;:.!?-]+$/, "");
const capFirst = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);
const lowFirst = (s) => (s && !/^[A-Z]{2}|^\d/.test(s) && !/^O'zbekiston/.test(s) ? s.charAt(0).toLowerCase() + s.slice(1) : s);
/* Qonun gapini ovozli o'qishga tozalash: raqamlash, qavslar ichidagi havolalar, qo'shtirnoqlar */
const cleanLegal = (s) => normApos(s)
  .replace(/^\s*(\d+[-.)]\s*(modda\.?)?|[a-z]\)|[-•*])\s*/i, "")
  .replace(/\s*\((?:[^()]*?\d+[^()]*?)\)/g, "")
  .replace(/[«»"]/g, "").replace(/\s+/g, " ").trim();

/* Uzun gapni ≤max so'zli bo'laklarga ajratadi ("..." bilan qirqmaydi).
   Kesish joyi: vergul/nuqtali vergul yoki bog'lovchi oldi; fe'l bilan tugagan bo'lak ("kerak,", "bo'lsa,") afzal,
   shunda har bo'lak alohida tushunarli gap bo'ladi */
const CONJ = /^(va|yoki|lekin|ammo|biroq|agar|shuningdek|hamda)$/i;
const VERBISH = /(kerak|mumkin|lozim|shart|emas|haqli|majbur|\w+(di|adi|ydi|gan|sa|masa|ganda|guncha|ib|adi|ladi|nadi|siz|miz))[,;:]$/i;
function splitPieces(sentence, max = 20) {
  const s = cleanLegal(sentence).replace(/[.;!?]+$/, "");
  if (!s) return [];
  const cut = (w) => {
    if (w.length <= max) return [w];
    let best = -1, bestScore = Infinity;
    for (let i = 3; i <= w.length - 3; i++) {
      const prev = w[i - 1], next = w[i];
      if (!/[,;:]$/.test(prev) && !CONJ.test(next)) continue;
      const score = Math.abs(i - w.length / 2) - (VERBISH.test(prev) ? w.length / 3 : 0) - (/[;:]$/.test(prev) ? 2 : 0);
      if (score < bestScore) { bestScore = score; best = i; }
    }
    if (best < 0) best = Math.min(max, Math.ceil(w.length / 2));
    return [...cut(w.slice(0, best)), ...cut(w.slice(best))];
  };
  return cut(words(s)).map((w) => capFirst(w.join(" ").replace(/^(va|yoki|lekin|ammo|biroq|hamda)\s+/i, "").replace(/[,;:]+$/, "")) + ".");
}

/* Mavzu: director.js dagi detectTopic bo'lsa — o'sha, bo'lmasa umumiy (mahalla, qoshni) */
function topicOf(text) {
  let tp = null;
  try { if (typeof detectTopic === "function") tp = detectTopic(text); } catch (e) { tp = null; }
  if (!tp || !tp.key) tp = { key: "umumiy", background: "mahalla", cast: ["qoshni"], label: "Umumiy" };
  return tp;
}

/* Mavzu bo'yicha 1-sahna: a — muammoga duch kelgan tomon, b — qarshi tomon.
   lines(ctx) — [speaker-rol, matn, emotion, gesture, pause?] */
const CONFLICTS = {
  mehnat: { a: "xodima", b: "ishberuvchi", bg: "idora", lines: [
    ["b", "Malika, ertadan boshlab ishga kelmasangiz ham bo'ladi.", "serious", "none"],
    ["a", "Nima?! Hech qanday ogohlantirishsiz-a?", "surprised", "none", 500],
    ["b", "Shartnomaga imzo qo'ygansiz-ku. Hammasi o'sha yerda yozilgan.", "neutral", "point"],
    ["a", "Men... uni oxirigacha o'qimagan edim. Endi nima qilaman?", "worried", "shrug"]
  ], says: "Xo'jayinim meni ertadan ishdan chiqarmoqchi. Shunday qilishga haqqi bormi?" },
  savdo: { a: "qoshni", b: "sotuvchi", bg: "bozor", lines: [
    ["a", "Assalomu alaykum! Kecha olgan choynagim darz ketibdi. Qaytarib olasizmi?", "worried", "wave"],
    ["b", "Sotilgan mol qaytarilmaydi, aka. Bozorning qoidasi shu!", "serious", "shrug"],
    ["a", "Qanaqasiga? Chekim ham bor-ku!", "surprised", "point", 400],
    ["b", "Chekni bilmadim. Ko'rib olish kerak edi-da.", "neutral", "none"]
  ], says: "Buzuq mol sotishdi, qaytarib olishmayapti. Pulimni qaytarib ololmaymanmi?" },
  oila: { a: "xodima", b: "qoshni", bg: "mahalla", lines: [
    ["b", "Eshitdimmi, kelin, ajrashayotgan emishsiz? Bolalar endi kimda qoladi?", "worried", "think"],
    ["a", "Bilmayman, qo'shni... Hammasi chalkashib ketdi.", "worried", "shrug"],
    ["b", "Bunaqa ishni erkak kishi hal qiladi-da, ko'p o'ylamang.", "neutral", "none"],
    ["a", "Rostdanmi? Mening ham haqqim bordir axir?", "surprised", "none", 400]
  ], says: "Oilamda muammo bor. Qonun bo'yicha mening haqqim nima?" },
  sud: { a: "qoshni", b: "sudya", bg: "sud", lines: [
    ["b", "Fuqaro, arizangizga hech qanday dalil ilova qilinmagan.", "serious", "point"],
    ["a", "Dalil? Men hammasini og'zaki aytib beraman-ku!", "surprised", "explain"],
    ["b", "Sud og'zaki gapga emas, qonun va dalilga tayanadi.", "serious", "none"],
    ["a", "Unda... ishimni yutqazamanmi endi?", "worried", "shrug", 500]
  ], says: "Sudda ishim bor, lekin qanday qilishni bilmayapman. Nima qilsam bo'ladi?" },
  talim: { a: "talabaqiz", b: "bola", bg: "universitet", lines: [
    ["b", "Opa, kontraktni to'lamasang, imtihonga kiritmaymiz deyishyapti!", "worried", "none"],
    ["a", "Nima?! Kim aytdi buni?", "surprised", "none", 400],
    ["b", "Dekanatdagilar. Ertagacha to'lash kerak emish.", "neutral", "shrug"],
    ["a", "Shoshma, avval qonunda nima deyilganini bilishim kerak.", "serious", "think"]
  ], says: "O'qishimda muammo chiqdi. Qonun bo'yicha qanday huquqlarim bor?" },
  uy: { a: "talabaqiz", b: "qoshni", bg: "mahalla", lines: [
    ["b", "Qizim, ertaga uydan chiqasiz. Uyni boshqaga beraman.", "serious", "none"],
    ["a", "Ertagami?! Ijara puli oy oxirigacha to'langan-ku!", "surprised", "none", 400],
    ["b", "Uy meniki, o'zim bilaman.", "neutral", "shrug"],
    ["a", "Axir shartnomamiz bor edi... Bunday qilish mumkinmi?", "worried", "think"]
  ], says: "Uy egasi meni birdan chiqarib yubormoqchi. Bunga haqqi bormi?" },
  transport: { a: "qoshni", b: "inspektor", bg: "mahalla", lines: [
    ["b", "Hujjatlaringizni ko'rsating. Sizga jarima yoziladi.", "serious", "none"],
    ["a", "Jarima? Nima uchun? Men hech narsani buzmadim-ku!", "surprised", "shrug", 400],
    ["b", "Bayonnomaga imzo qo'ying, keyin bilasiz.", "neutral", "point"],
    ["a", "Avval nima uchunligini tushuntiring-chi.", "serious", "none"]
  ], says: "Menga jarima yozishmoqchi, nima uchunligini ham aytishmadi. To'g'rimi shu?" },
  soliq: { a: "qoshni", b: "inspektor", bg: "idora", lines: [
    ["b", "Assalomu alaykum. Sizning soliq bo'yicha qarzingiz bor ekan.", "serious", "wave"],
    ["a", "Qarz? Men har yili vaqtida to'layman-ku!", "surprised", "none", 400],
    ["b", "Bizning ma'lumotda boshqacha. Muddati o'tib ketibdi.", "neutral", "point"],
    ["a", "Rostdanmi? Qaysi muddat o'zi?", "worried", "think"]
  ], says: "Soliqdan qarzingiz bor deyishyapti. Men nima qilishim kerak?" },
  umumiy: { a: "qoshni", b: "bola", bg: "mahalla", lines: [
    ["b", "Dada, pochtachi sizga xat tashlab ketdi!", "happy", "wave"],
    ["a", "Qani-chi... Voy, bu yerda qonun haqida yozilgan-ku.", "surprised", "none"],
    ["b", "Yomon narsami, dada?", "worried", "think", 400],
    ["a", "Bilmadim, o'g'lim. Bunaqa tilni hech tushunmayman.", "worried", "shrug"]
  ], qlines: [
    ["b", "Dada, nega xafa o'tiribsiz?", "worried", "none"],
    ["a", "Bir muammoga duch keldim, o'g'lim. Kimdan so'rashni bilmayman.", "worried", "shrug"],
    ["b", "Aqlvoy akadan so'rang! U yurist bo'lib o'qiydi-ku.", "happy", "point", 300],
    ["a", "To'g'ri aytasan. Qani, ketdik!", "neutral", "wave"]
  ], says: "Menga shunday hujjat keldi. O'qidim-u, hech narsa tushunmadim!" }
};

/* Bir personaj ketma-ket bir xil imo qilmasin; savol -> think kabi mos imo */
function varyGestures(scenes) {
  const last = {};
  scenes.forEach((sc) => (sc.lines || []).forEach((l) => {
    if (l.gesture !== "none" && last[l.speaker] === l.gesture) l.gesture = /\?\s*$/.test(l.text) && l.gesture !== "think" ? "think" : "none";
    last[l.speaker] = l.gesture;
  }));
  return scenes;
}
const LP = (speaker, text, emotion, gesture, pause) => { const l = L(speaker, text, emotion, gesture); if (pause) l.pause = pause; return l; };

function templateScript(text, level, mode) {
  const t = normApos(text);
  const sents = sentencesOf(t);
  /* Sarlavha/modda nomi qatorlari ("130-modda. Dastlabki sinov muddati.") suhbatga yaramaydi */
  const body = sents.filter((s) => words(s).length > 4 && !/modda\.?$/i.test(s.trim()));
  const arts = [...new Set((t.match(/\d+\s*[-‑–]?\s*modda/gi) || []).map((m) => m.replace(/\s|[‑–]/g, "").replace("-modda", "") + "-modda"))];
  const terms = [...new Set((t.match(/\d+\s*(kalendar\s+|ish\s+)?(kun|oy|yil|soat|hafta)\w*/gi) || []).map((x) => x.trim()))].slice(0, 4);
  const warnRe = /(taqiqlan|mumkin emas|yo'l qo'yilmaydi|jarima|javobgar|\bshart\b|majbur|lozim|kerak|muddati)/i;
  const rightRe = /(huquq|haqli|ega|mumkin|kafolat)/i;
  /* Ovozli o'qishga qulay bo'lishi uchun qisqaroq gaplar avval tanlanadi (asl tartib saqlanadi) */
  const pickShort = (arr, n) => arr.map((s, i) => ({ s, i, w: words(s).length })).sort((a, b) => (a.w > 45) - (b.w > 45) || a.i - b.i).slice(0, n).sort((a, b) => a.i - b.i).map((x) => x.s);
  /* Huquq gaplari tushuntirishga, qolgan taqiq/majburiyatlar ogohlantirishga (ikkisiga ham mos bo'lsa — huquq) */
  const rights = pickShort(body.filter((s) => rightRe.test(s)), 2);
  const warnsAll = body.filter((s) => warnRe.test(s));
  const warns = pickShort(warnsAll.filter((s) => !rights.includes(s)).length ? warnsAll.filter((s) => !rights.includes(s)) : warnsAll, 2);
  const pool = body.length ? body : sents;
  const main = rights.length ? rights : (pool.filter((s) => !warns.includes(s)).length ? pool.filter((s) => !warns.includes(s)) : pool).slice(0, 2);
  /* Bir gap ham tushuntirishda, ham ogohlantirishda takrorlanmasin */
  const warnsOnly = warns.filter((w) => !main.includes(w));
  warns.length = 0; warns.push(...warnsOnly);
  const kid = level === "bola", stud = level === "talaba";
  const isQ = mode === "savol";
  const first = shortTitle(sents[0] || t, 10);

  const tp = topicOf(t);
  const cf = CONFLICTS[tp.key] || CONFLICTS.umumiy;
  let A = cf.a, B = cf.b;
  if (!CONFLICTS[tp.key] && Array.isArray(tp.cast)) {
    const c = tp.cast.filter((id) => CHARACTERS[id] && id !== "afandi" && id !== "aqlvoy");
    if (c[0]) A = c[0];
    if (c[1]) B = c[1];
  }
  const bg = BACKGROUNDS.includes(tp.background) ? tp.background : cf.bg;
  const R = (r) => (r === "a" ? A : B);

  /* 1. Hayotiy vaziyat — tomonlar nizosi (jiddiy holatda zo'ravonlik sahnalashtirilmaydi: qahramon xotirjam hikoya qiladi) */
  const grave = isQ && SERIOUS.test(t);
  const s1 = grave
    ? [L(A, "Bugun bir voqea bo'ldi... Hali ham o'zimga kelolmayapman.", "worried", "none"),
       LP("aqlvoy", "Avval o'tiring, tinchlaning. Hammasini birga hal qilamiz.", "serious", "none", 400),
       L(A, "Kimga murojaat qilishni ham bilmayman.", "worried", "shrug")]
    : (isQ && cf.qlines ? cf.qlines : cf.lines).map(([r, x, e, g, p]) => LP(R(r), x, e, g, p));

  /* 2. Savol — qahramon Aqlvoy va Afandiga keladi */
  const q = isQ ? splitPieces(sents[0] || t, 18)[0] || cf.says : cf.says;
  const s2 = [
    ...(grave ? [] : [L("aqlvoy", "Assalomu alaykum! Nima bo'ldi, rangingiz o'chib ketibdi?", "worried", "wave")]),
    L(A, isQ ? (grave ? "Gap shunda: " : "Bir savol tinchlik bermayapti: ") + lowFirst(q) : cf.says, "worried", "explain"),
    LP("aqlvoy", isQ ? "Afandi bobo, bu holatda qonun nima deydi?" : "Afandi bobo, bu hujjat aslida nima deydi?", "surprised", "think", 500),
    L("afandi", isQ ? "Savolga to'liq javob uchun AI kerak. Hozircha umumiy yo'l-yo'riq beraman." : "Xotirjam bo'linglar. Eshagimni ko'p yo'qotganman, lekin qonunni hech qachon!", "happy", isQ ? "explain" : "none")
  ];
  if (terms.length) s2.push(LP(A, "Qog'ozda «" + terms[0] + "» degan gap bor. Bu nima degani?", "worried", "think", 300));

  /* 3. Tushuntirish — sodda qayta aytish, ≤20 so'zli bo'laklar, tinglovchilar reaksiyasi */
  const frames = kid ? ["Oddiy qilib aytsam, ", "Yana bir qoida bor: "] : ["Qonunda aytilishicha, ", "Oddiy qilib aytsam, "];
  const reacts = kid
    ? [["aqlvoy", "Voy, rostdanmi? Buni bilmagan ekanman!", "surprised", "none"], ["aqlvoy", "Demak, kattalar ham shu qoidaga amal qilishi kerak ekan-da.", "happy", "none"]]
    : stud
      ? [["aqlvoy", "Bu normaning dispozitsiyasi-ku. Sanksiyasi qayerda?", "surprised", "think"], ["aqlvoy", "Demak, normani gipoteza, dispozitsiya va sanksiyaga ajratib olaman.", "happy", "point"]]
      : [[A, "Rostdanmi? Men buni bilmas edim.", "surprised", "none"], ["aqlvoy", "Demak, avval qonunni bilib, keyin gaplashish kerak ekan-da.", "happy", "point"]];
  const s3 = [];
  let afandiCount = 0;
  if (isQ) {
    s3.push(L("afandi", "Har bir holatda avval qaysi qonun tegishli ekanini aniqlash kerak.", "neutral", "explain"));
    s3.push(LP("aqlvoy", "Masalan, kodeksmi yoki alohida qonunmi?", "surprised", "think", 300));
    s3.push(L("afandi", "Ha. Keyin aniq moddani lex.uz dan topib, birga o'qiymiz.", "neutral", "point"));
  } else main.forEach((sent, si) => {
    const pcs = splitPieces(sent, 17);
    if (!pcs.length || afandiCount >= 4) return;
    if (afandiCount + pcs.length > 4 && si > 0) return; /* ikkinchi gap to'liq sig'masa — qo'shmaymiz */
    pcs.slice(0, 4 - afandiCount).forEach((p, pi) => {
      const txt = pi === 0 ? frames[Math.min(si, frames.length - 1)] + lowFirst(p) : p;
      s3.push(L("afandi", txt, "neutral", pi === 0 ? "explain" : /\d/.test(p) ? "point" : "none"));
      afandiCount++;
    });
    const r = reacts[si];
    if (r) s3.push(L(r[0], r[1], r[2], r[3]));
  });
  if (!isQ && s3.length && s3.length < 4 && !s3.some((l) => l.text === reacts[1][1])) s3.push(L(reacts[1][0], reacts[1][1], reacts[1][2], reacts[1][3]));
  if (!s3.length) s3.push(L("afandi", "Bu matnda aniq qoida topa olmadim. Asl hujjatni birga o'qib chiqamiz.", "neutral", "explain"));
  if (!arts.length) s3.push(L("afandi", isQ ? "Aniq modda raqamini hozir aytolmayman - lex.uz dan tekshirib ko'ring." : "Bu matnda modda raqami ko'rsatilmagan. Aniq bilmayman - lex.uz dan tekshirib ko'ring.", "worried", "shrug"));

  /* 4. Ehtiyot bo'ling! */
  const s4 = [];
  if (warns.length) {
    const w1 = splitPieces(warns[0], 18).slice(0, 2);
    w1.forEach((p, i) => s4.push(L("afandi", i === 0 ? "Diqqat! " + p : p, "serious", i === 0 ? "warn" : "explain")));
    s4.push(LP(A, "Voy... Buni hech kim aytmagan edi-ku!", "surprised", "none", 400));
    if (warns[1]) {
      const w2 = splitPieces(warns[1], 17)[0];
      if (w2) s4.push(L("afandi", "Yana bir narsa: " + lowFirst(w2), "serious", "point"));
    }
  } else if (isQ && SERIOUS.test(t)) {
    s4.push(L("afandi", "Bunday holatda jim turmang va dalillarni saqlang: xabarlar, guvohlar, shifokor xulosasi.", "serious", "warn"));
    s4.push(L(A, "Tushundim. Hammasini yozib boraman.", "worried", "none"));
  } else {
    s4.push(L("afandi", "Muddatlar, imzo qo'yiladigan joylar va jarimalarga alohida e'tibor bering.", "serious", "warn"));
    s4.push(L(A, "Imzo qo'yishdan oldin o'qish kerak ekan-da.", "worried", "none"));
  }
  if (s4.length < 3 && !terms.length) s4.push(L("aqlvoy", "Demak, buni oldindan bilib qo'yish kerak ekan.", "serious", "none"));
  if (terms.length) s4.push(L("aqlvoy", "Muddatni unutmang: " + terms.join(", ") + ".", "serious", "point"));

  /* 5. Endi nima qilish kerak? */
  const steps = [
    kid ? "Kattalarga - ota-ona yoki o'qituvchiga ko'rsating" : "Hujjatni oxirigacha o'qing, nusxasini saqlang",
    terms.length ? "Muddatni yozib qo'ying: " + terms.join(", ") : "Muddat va sanalarni aniqlang",
    "Tushunmagan bandni yozma ravishda so'rang",
    arts.length ? "Moddani lex.uz da tekshiring: " + arts.slice(0, 2).join(", ") : "Manbani lex.uz da tekshiring",
    "Kerak bo'lsa yuristga yoki bepul yuridik yordamga murojaat qiling"
  ];
  const s5 = grave ? [
    LP(A, "Xo'sh, endi men nima qilay?", "worried", "think", 300),
    L("afandi", "Avvalo xavfsizligingiz muhim. Xavf bo'lsa, darhol 102 ga yoki ichki ishlar organiga murojaat qiling.", "serious", "warn"),
    L("afandi", "Keyin bepul yuridik yordamdan maslahat oling. Siz yolg'iz emassiz.", "neutral", "explain"),
    L(A, "Rahmat. Hoziroq shunday qilaman.", "neutral", "none")
  ] : [
    LP(A, "Xo'sh, endi men nima qilay?", "worried", "think", 300),
    L("afandi", "Oson! Ekrandagi qadamlarni birma-bir bajaring.", "neutral", "explain"),
    L(A, "Rahmat, Afandi bobo! Endi ko'nglim joyiga tushdi.", "happy", "none"),
    L("afandi", "Qonunni bilgan haqini oladi!", "happy", "wave")
  ];

  const cardText = (main[0] ? (splitPieces(main[0], 12)[0] || "").replace(/\.$/, "") : "") || "Asosiy qoida";
  const scenes = varyGestures([
    SC("Hayotiy vaziyat", bg, [{ id: A, position: "left" }, { id: B, position: "right" }], s1),
    SC("Savol", "mahalla", [{ id: A, position: "left" }, { id: "afandi", position: "center" }, { id: "aqlvoy", position: "right" }], s2),
    SC("Tushuntirish", bg === "sud" ? "sud" : "idora", [{ id: "aqlvoy", position: "left" }, { id: "afandi", position: "center" }, { id: A, position: "right" }], s3,
      arts.length ? ART(arts[0], cardText) : KEY("Manba aniqlanmadi", "Modda raqamini lex.uz dan tekshiring")),
    SC("Ehtiyot bo'ling!", bg, [{ id: "afandi", position: "left" }, { id: A, position: "right" }], s4,
      WARN("Ehtiyot bo'ling!", terms.length ? "Muddatlar: " + terms.join(", ") : "Muddat va majburiyatlarni tekshiring")),
    SC("Endi nima qilish kerak?", "mahalla", [{ id: A, position: "left" }, { id: "afandi", position: "right" }], s5, STEPS("Endi nima qilish kerak?", steps))
  ]);

  return normalizeScript({
    id: "tpl-" + uid(), title: isQ ? "Savolingiz: " + shortTitle(sents[0] || t, 8) : "Hujjat: " + first, level, source: LEX.lex, offline: true,
    summary: [...main.map((s) => clip(cleanLegal(s))), ...warns.map((w) => "Ehtiyot bo'ling: " + clip(cleanLegal(w), 18)), ...(terms.length ? ["Muddatlar: " + terms.join(", ")] : [])],
    scenes
  }, { direct: true, text: t, mode });
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
