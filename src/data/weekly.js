/* "Haftaning multfilmi" — namuna video (Mehnat kodeksi, dastlabki sinov) */
const WEEKLY = normalizeScript({
  id: "weekly-sinov",
  title: "Ishga kirayapsizmi? Sinov muddati haqida 3 qoida",
  level: "fuqaro",
  subject: "Mehnat huquqi",
  source: LEX.mehnat,
  verified: false,
  summary: [
    "Dastlabki sinov odatda 3 oydan oshmaydi; tashkilot rahbari, uning o'rinbosari va bosh buxgalter uchun - 6 oygacha (Mehnat kodeksi, 130-modda).",
    "Homilador ayol, 3 yoshga to'lmagan bolasi bor ayol va 18 yoshga to'lmagan shaxslarga sinov belgilanmaydi (129-modda).",
    "Sinov sharti mehnat shartnomasida yozilmagan bo'lsa, xodim sinovsiz qabul qilingan hisoblanadi.",
    "Sinov natijasi qoniqarsiz bo'lsa, ish beruvchi 3 kun oldin yozma ogohlantirishi kerak.",
    "Homilador xodima bilan ish beruvchi tashabbusi bilan mehnat shartnomasini bekor qilish taqiqlanadi (408-modda)."
  ],
  scenes: [
    SC("Haftaning multfilmi", "idora", [], [], TITLE("Haftaning multfilmi", "Ishga kirayapsizmi? Sinov muddati haqida 3 qoida"), { duration: 3.2 }),
    SC("Hayotiy vaziyat", "idora", ["xodima", "ishberuvchi"], [
      L("ishberuvchi", "Xush kelibsiz, Malika! Sizni ishga olamiz, faqat olti oylik sinov muddati bilan.", "happy", "explain"),
      L("xodima", "Olti oy? Lekin men homiladorman, buni oldin aytgan edim-ku.", "worried", "think"),
      L("ishberuvchi", "Bizda qoida shunaqa. Rozi bo'lmasangiz, boshqa joy qidiring.", "serious", "shrug")
    ]),
    SC("Savol", "mahalla", ["aqlvoy", "afandi"], [
      L("aqlvoy", "Afandi bobo, ish beruvchi sinov muddatini xohlagancha belgilay oladimi?", "surprised", "think"),
      L("afandi", "Yo'q, bolam. Mehnat kodeksida buning chegarasi bor. Keling, uchta qoidani o'rganamiz.", "happy", "wave")
    ]),
    SC("1-qoida: muddat", "universitet", ["afandi", "aqlvoy"], [
      L("afandi", "Birinchi qoida: dastlabki sinov odatda uch oydan oshmaydi.", "neutral", "explain"),
      L("afandi", "Faqat tashkilot rahbari, uning o'rinbosari va bosh buxgalter uchun olti oygacha bo'lishi mumkin.", "neutral", "point"),
      L("aqlvoy", "Demak, oddiy xodimga olti oy belgilash noto'g'ri ekan.", "happy", "point")
    ], ART("Mehnat kodeksi, 130-modda", "Dastlabki sinov 3 oydan oshmaydi (rahbarlar uchun 6 oygacha)")),
    SC("2-qoida: kimlarga mumkin emas", "universitet", ["afandi", "aqlvoy"], [
      L("afandi", "Ikkinchi qoida: ayrim odamlarga sinov umuman belgilanmaydi.", "serious", "warn"),
      L("afandi", "Masalan, homilador ayolga, uch yoshga to'lmagan bolasi bor ayolga va o'n sakkiz yoshga to'lmaganlarga.", "neutral", "explain"),
      L("aqlvoy", "Unda Malika opaga sinov belgilashning o'zi qonunga zid!", "surprised", "point")
    ], ART("Mehnat kodeksi, 129-modda", "Homilador ayol va 18 yoshga to'lmaganlarga sinov belgilanmaydi")),
    SC("Ehtiyot bo'ling!", "idora", ["afandi", "xodima"], [
      L("afandi", "Uchinchi qoida: sinov sharti mehnat shartnomasida yozilishi kerak. Yozilmagan bo'lsa, siz sinovsiz qabul qilingansiz.", "serious", "warn"),
      L("afandi", "Sinov qoniqarsiz bo'lsa ham, ish beruvchi uch kun oldin yozma ogohlantirishi shart.", "neutral", "explain"),
      L("xodima", "Homilador xodimani ish beruvchi o'z tashabbusi bilan bo'shata oladimi?", "worried", "think"),
      L("afandi", "Yo'q. 408-moddaga ko'ra bu taqiqlangan, tashkilot tugatilgan holat bundan mustasno.", "serious", "warn")
    ], WARN("Ehtiyot bo'ling!", "Shartnomani imzolashdan oldin sinov bandini o'qing")),
    SC("Endi nima qilish kerak?", "mahalla", ["afandi", "aqlvoy"], [
      L("aqlvoy", "Xo'sh, endi Malika opa nima qilishi kerak?", "neutral", "think"),
      L("afandi", "Shartnomadagi sinov bandini o'qiydi, muddatni tekshiradi va yozma e'tiroz bildiradi.", "neutral", "explain"),
      L("afandi", "Kelishilmasa, davlat mehnat inspeksiyasiga yoki sudga murojaat qiladi. Qonunni bilgan haqini oladi!", "happy", "wave")
    ], STEPS("Endi nima qilish kerak?", [
      "Shartnomadagi sinov bandini o'qing",
      "Muddat 3 oydan oshmaganini tekshiring",
      "Sinov belgilanmaydigan toifada bo'lsangiz - yozma e'tiroz bildiring",
      "Hal bo'lmasa - mehnat inspeksiyasi yoki sudga murojaat qiling"
    ]))
  ]
});
