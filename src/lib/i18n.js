/* I18n — 4 til: UZB (o'zbek lotin), RUS, ENG, УЗБ (o'zbek kirill).
   Ilova matnlari o'zbekcha (lotin) yozilgan. Til tanlanganda:
   - УЗБ: mavjud Translit moduli matnni kirillga o'giradi;
   - RUS/ENG: ekrandagi har bir matn tuguni va placeholder/aria-label/title atributlari
     I18N_PAIRS lug'ati (data/i18n-*.js) va quyidagi naqshlar orqali tarjima qilinadi.
   Asl matn eslab qolinadi, shuning uchun til qaytarilganda o'zbekcha matn tiklanadi.
   Lug'atda yo'q matn (masalan, foydalanuvchi kiritgan hujjat) o'zgarishsiz qoladi. */

const LANGS = [
  { id: "uz", short: "UZB", name: "O'zbekcha", html: "uz" },
  { id: "ru", short: "RUS", name: "Русский", html: "ru" },
  { id: "en", short: "ENG", name: "English", html: "en" },
  { id: "uzc", short: "УЗБ", name: "Ўзбекча", html: "uz-Cyrl" }
];

const I18n = (() => {
  const key = (s) => normApos(String(s)).replace(/\s+/g, " ").trim();
  const DICT = { ru: new Map(), en: new Map() };
  I18N_PAIRS.forEach(([uz, ru, en]) => { const k = key(uz); DICT.ru.set(k, ru); DICT.en.set(k, en); });

  const LAW = {
    "Konstitutsiya": ["Конституция", "Constitution"],
    "Mehnat kodeksi": ["Трудовой кодекс", "Labour Code"],
    "Oila kodeksi": ["Семейный кодекс", "Family Code"],
    "Fuqarolik kodeksi": ["Гражданский кодекс", "Civil Code"],
    "Jinoyat kodeksi": ["Уголовный кодекс", "Criminal Code"],
    "MK": ["ТК", "LC"]
  };
  const isRu = (l) => l === "ru";
  const and = (l, s) => s.replace(/ va /g, isRu(l) ? " и " : " and ");
  // "31" -> "ст. 31" / "Art. 31"; "31 va 33" -> "ст. 31 и 33" / "Arts. 31 and 33"
  const arts = (l, nums) => {
    const many = /[,\s-]/.test(nums.trim());
    return (isRu(l) ? "ст. " : many ? "Arts. " : "Art. ") + and(l, nums);
  };

  // Raqamli va tarkibli matnlar uchun naqshlar: [regex, (lang, ...guruhlar) => tarjima]
  const PATTERNS = [
    [/^(\d+)-modda([.:]?)$/, (l, n, p) => (isRu(l) ? "Статья " : "Article ") + n + p],
    [/^(\d+)-dars$/, (l, n) => (isRu(l) ? "Урок " : "Lesson ") + n],
    [/^(\d+)-bosqich$/, (l, n) => (isRu(l) ? "Шаг " : "Step ") + n],
    [/^(\d+)-qoida$/, (l, n) => (isRu(l) ? "Правило " : "Rule ") + n],
    [/^(\d+)\s*yosh$/, (l, n) => n + (isRu(l) ? " лет" : n === "1" ? " year" : " years")],
    [/^(\d+)-(\d+)\s*yosh$/, (l, a, b) => a + "–" + b + (isRu(l) ? " лет" : " years")],
    [/^(\d+)\s*yoshda menga qanday huquq ochiladi\?$/, (l, n) => (isRu(l) ? "Какие права у меня появляются в " + n + " лет?" : "What rights do I get at " + n + "?")],
    [/^Hali ochilmagan: (\d+) yil qoldi$/, (l, n) => (isRu(l) ? "Ещё не наступило: осталось " + n + " г." : "Not yet: " + n + (n === "1" ? " year" : " years") + " to go")],
    [/^Bu (.+)da yozilgan\.$/, (l, ref) => (isRu(l) ? "Это закреплено здесь: " : "It's set out in ") + t(ref, l) + "."],
    [/^(Konstitutsiya|Mehnat kodeksi|Oila kodeksi|Fuqarolik kodeksi|Jinoyat kodeksi|MK),? ([\d][\d,\s\-va]*?)-modda(?:lar)?$/, (l, law, nums) => LAW[law][isRu(l) ? 0 : 1] + ", " + arts(l, nums)],
    [/^(Konstitutsiya|Mehnat kodeksi),? (\d+)-modda: (.+)$/, (l, law, n, rest) => LAW[law][isRu(l) ? 0 : 1] + ", " + arts(l, n) + ": " + t(rest, l)],
    [/^(\d+)\. (.+)$/, (l, n, rest) => n + ". " + t(rest, l)],
    [/^(\d+) daqiqa$/, (l, n) => n + (isRu(l) ? " мин" : " min")],
    [/^(\d+) sahna$/, (l, n) => n + (isRu(l) ? " сцен" : " scenes")],
    [/^(\d+)\s*ta$/, (l, n) => n]
  ];
  const SEPS = [" · ", ": ", "; ", " — "];

  function lookup(s, lang) {
    const k = key(s);
    if (!k) return null;
    const hit = DICT[lang].get(k);
    if (hit != null) return hit;
    for (const [re, fn] of PATTERNS) { const m = k.match(re); if (m) return fn(lang, ...m.slice(1)); }
    // Tarkibli matn: "Multfilm: X", "1-dars · Y", "A; B" — har bo'lagini alohida tarjima qilamiz
    for (const sep of SEPS) {
      const i = k.indexOf(sep);
      if (i <= 0) continue;
      const parts = sep === ": " ? [k.slice(0, i), k.slice(i + 2)] : k.split(sep);
      const out = parts.map((p) => lookup(p, lang));
      if (out.every((o, j) => o != null || !/[a-z]/i.test(parts[j]))) return out.map((o, j) => (o == null ? parts[j] : o)).join(sep);
    }
    return null;
  }
  // t(): bitta matnni joriy (yoki berilgan) tilga o'giradi; topilmasa asl matn qaytadi
  function t(s, lang) {
    const l = lang || cur;
    if (l !== "ru" && l !== "en") return s;
    const r = lookup(s, l);
    return r == null ? s : r;
  }

  // ---- DOM qatlami ----
  let cur = "uz", obs = null, writing = false;
  const origText = new WeakMap();
  const origAttr = new WeakMap();
  // O'zimiz yozgan qiymatlar: MutationObserver ularni qayta tarjima qilmasligi uchun
  const wroteText = new WeakMap();
  const wroteAttr = new WeakMap();
  const ATTRS = ["placeholder", "aria-label", "title"];
  const skip = (el) => !el || el.closest(".notr, script, style, textarea, code, pre");
  const hasLatin = (s) => /[a-z]{2}/i.test(s);

  function trNode(n) {
    if (skip(n.parentElement)) return;
    const v = n.nodeValue;
    if (wroteText.get(n) === v) return;
    if (!v || !hasLatin(v)) return;
    const r = conv(v);
    if (r == null || r === v.trim()) return;
    const lead = v.match(/^\s*/)[0], tail = v.match(/\s*$/)[0];
    origText.set(n, v);
    const out = lead + r + tail;
    wroteText.set(n, out);
    writing = true; n.nodeValue = out; writing = false;
  }
  function trAttrs(el) {
    if (!el || el.closest(".notr")) return; // atributlar (placeholder) textarea/input ichida ham tarjima qilinadi
    for (const a of ATTRS) {
      const v = el.getAttribute(a);
      const w = wroteAttr.get(el);
      if (w && w[a] === v) continue;
      if (!v || !hasLatin(v)) continue;
      const r = conv(v);
      if (r == null) continue;
      const o = origAttr.get(el) || {};
      o[a] = v; origAttr.set(el, o);
      const ww = wroteAttr.get(el) || {}; ww[a] = r; wroteAttr.set(el, ww);
      writing = true; el.setAttribute(a, r); writing = false;
    }
  }
  // УЗБ: kirillga transliteratsiya (Translit), RUS/ENG: lug'at bo'yicha tarjima
  const conv = (v) => (cur === "uzc" ? Translit.toCyr(v.trim()) : lookup(v, cur));
  function walk(root) {
    const it = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let n; while ((n = it.nextNode())) trNode(n);
    if (root.nodeType === 1) { trAttrs(root); root.querySelectorAll("[placeholder],[aria-label],[title]").forEach(trAttrs); }
  }
  function restore(root) {
    writing = true;
    const it = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let n; while ((n = it.nextNode())) if (origText.has(n)) { n.nodeValue = origText.get(n); origText.delete(n); wroteText.delete(n); }
    root.querySelectorAll("[placeholder],[aria-label],[title]").forEach((el) => {
      const o = origAttr.get(el); if (!o) return;
      for (const a in o) el.setAttribute(a, o[a]);
      origAttr.delete(el); wroteAttr.delete(el);
    });
    writing = false;
  }
  function observe(root) {
    obs = new MutationObserver((muts) => {
      if (writing) return;
      for (const mu of muts) {
        if (mu.type === "characterData") trNode(mu.target);
        else if (mu.type === "attributes") trAttrs(mu.target);
        else mu.addedNodes.forEach((n) => (n.nodeType === 3 ? trNode(n) : n.nodeType === 1 && walk(n)));
      }
    });
    obs.observe(root, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ATTRS });
  }

  // setLang(): tilni almashtiradi — avval oldingi tarjimani bekor qiladi, keyin yangisini qo'llaydi
  function setLang(lang, root) {
    if (!LANGS.some((x) => x.id === lang)) lang = "uz";
    if (lang === cur) return;
    if (obs) { obs.disconnect(); obs = null; }
    restore(root);
    Translit.setMode("lat", root);
    cur = lang;
    document.documentElement.lang = LANGS.find((x) => x.id === lang).html;
    if (lang !== "uz") { walk(root); observe(root); }
  }

  return { t, setLang, lang: () => cur, speechLang: () => (cur === "ru" ? "ru" : cur === "en" ? "en" : "uz"), has: (s, l) => lookup(s, l || cur) != null };
})();

// Saqlangan sozlamadan joriy til: eski versiyadagi "alphabet" ham hisobga olinadi
const curLang = (store) => store.settings.lang || (store.settings.alphabet === "cyr" ? "uzc" : "uz");
