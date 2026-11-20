/* Kazus-multfilmlar: voqea -> to'xtash -> 5 bosqichli yechim -> ko'p uchraydigan xatolar */

const STAGE_NAMES = ["Faktlar", "Huquqiy masala", "Qoida", "Tahlil", "Xulosa"];
const STAGE_Q = ["Nima bo'ldi?", "Qanday savol hal qilinishi kerak?", "Qaysi modda qo'llanadi?", "Qoidani faktlarga qo'llaymiz", "Yakuniy javob"];

function makeCaseScript(c) {
  const scenes = [
    SC("Kazus", c.bg, [], [], TITLE(c.subject + " · Kazus", c.title), { duration: 3 }),
    ...c.event,
    SC("To'xtash", "universitet", ["aqlvoy"], [
      L("aqlvoy", "To'xtang! Endi navbat sizda. " + c.question, "serious", "point")
    ], TITLE("Siz qanday hal qilardingiz?", c.question), { stop: true }),
    ...c.stages.map((st, i) => SC((i + 1) + ". " + STAGE_NAMES[i], i === 2 ? "sud" : "universitet", ["afandi", "aqlvoy"], st.lines,
      i === 2 ? ART(st.article, st.ruleText) : { kind: "stage", label: (i + 1) + "-bosqich · " + STAGE_NAMES[i], text: st.screen })),
    SC("Ko'p uchraydigan xatolar", "universitet", ["afandi", "talabaqiz"], [
      L("talabaqiz", "Talabalar odatda qayerda adashadi?", "worried", "think"),
      ...c.mistakes.map((m, i) => L("afandi", (i === 0 ? "Birinchidan, " : i === 1 ? "Ikkinchidan, " : "Uchinchidan, ") + m.say, "serious", i % 2 ? "explain" : "warn"))
    ], STEPS("Ko'p uchraydigan xatolar", c.mistakes.map((m) => m.short)))
  ];
  return normalizeScript({
    id: c.id, title: c.title, level: "talaba", subject: c.subject, source: c.source, verified: false,
    summary: [c.question, ...c.stages.map((s, i) => STAGE_NAMES[i] + ": " + s.screen)],
    scenes
  });
}

const CASES_RAW = [
  {
    id: "case-tintuv", subject: "Konstitutsiyaviy huquq", bg: "mahalla", source: LEX.konst,
    title: "Eshik oldidagi «tekshiruv»",
    short: "Sud qarorisiz uyda tintuv o'tkazildi. Bu qonuniymi?",
    question: "Inspektorning harakati qonuniymi va Botir aka huquqini qanday himoya qiladi?",
    event: [
      SC("Voqea", "mahalla", ["qoshni", "inspektor"], [
        L("inspektor", "Botir aka, qo'shnilaringizdan shikoyat tushdi. Hozir uyingizda tintuv o'tkazamiz.", "serious", "point"),
        L("qoshni", "Sud qarori bormi? Ko'rsating-chi.", "surprised", "think"),
        L("inspektor", "Qaror shart emas, mahalla raisi og'zaki ruxsat berdi.", "neutral", "shrug"),
        L("qoshni", "Men bunga rozi emasman!", "worried", "warn")
      ]),
      SC("Voqea davomi", "mahalla", ["qoshni", "inspektor"], [
        L("inspektor", "Rozi bo'lmasangiz ham kiramiz. Mana bu hujjatlarni olib ketamiz.", "serious", "explain"),
        L("qoshni", "Uyimga ruxsatsiz kirishdi, qog'ozlarimni olib ketishdi. Endi nima qilaman?", "worried", "shrug")
      ])
    ],
    stages: [
      { screen: "Uy egasining roziligisiz, sud qarorisiz, faqat og'zaki ruxsat bilan tintuv; hujjatlar olib ketildi",
        keywords: ["roziligisiz", "rozi emas", "rozi bo'lmagan", "sud qarori", "qarorsiz", "og'zaki", "mahalla raisi"],
        lines: [L("aqlvoy", "Faktlar: Botir akaning uyida, uning roziligisiz tintuv o'tkazildi.", "neutral", "point"),
                L("afandi", "Sud qarori yo'q edi, faqat mahalla raisining og'zaki ruxsati bor edi. Hujjatlar ham olib ketildi.", "serious", "explain")] },
      { screen: "Sud qarorisiz va egasining xohishiga qarshi uy-joyda tintuv o'tkazish Konstitutsiyaga muvofiqmi?",
        keywords: ["qonuniymi", "daxlsiz", "tintuv", "konstitutsiyaga"],
        lines: [L("afandi", "Masala bitta: sud qarorisiz, egasining xohishiga qarshi uyda tintuv o'tkazish mumkinmi?", "neutral", "think")] },
      { article: "Konstitutsiya, 31-modda", ruleText: "Har kim uy-joy daxlsizligi huquqiga ega. Uy-joyda tintuv faqat qonunga muvofiq va sud qaroriga asosan o'tkaziladi (mazmuni).",
        screen: "Konstitutsiya 31-modda: tintuv faqat qonunga muvofiq va sud qaroriga asosan",
        keywords: ["31"],
        lines: [L("afandi", "Konstitutsiyaning 31-moddasi: har kim uy-joy daxlsizligi huquqiga ega.", "serious", "warn"),
                L("afandi", "Uy-joyda tintuv faqat qonunga muvofiq va sudning qaroriga asosan o'tkaziladi.", "neutral", "explain")] },
      { screen: "Mahalla raisi - sud emas; shikoyat - qaror emas. 31-moddaning talabi bajarilmagan",
        keywords: ["sud emas", "rais", "shikoyat", "talab", "bajarilmagan", "qaror yo'q"],
        lines: [L("aqlvoy", "Mahalla raisi sud emas, qo'shnining shikoyati ham sud qarori emas.", "happy", "point"),
                L("afandi", "To'g'ri. Qonunda alohida holatlar bo'lishi mumkin, lekin bu voqeada ular yo'q. Demak, 31-modda talabi bajarilmagan.", "neutral", "explain")] },
      { screen: "Tintuv noqonuniy. Botir aka sudga shikoyat qiladi (55-modda), advokat yordamidan foydalanadi (29-modda), hujjatlarni qaytarishni talab qiladi",
        keywords: ["noqonuniy", "qonunga zid", "sudga", "shikoyat", "advokat", "55", "29"],
        lines: [L("afandi", "Xulosa: tintuv noqonuniy. 55-moddaga ko'ra Botir aka huquqini sud orqali himoya qiladi.", "happy", "wave"),
                L("aqlvoy", "29-moddaga ko'ra advokat yordamidan foydalanadi va hujjatlarini qaytarishni talab qiladi.", "happy", "point")] }
    ],
    mistakes: [
      { short: "«Rais yoki boshqa mansabdorning ruxsati yetarli» deb o'ylash", say: "rais yoki boshqa mansabdorning ruxsatini yetarli deb o'ylashadi. Konstitutsiya sud qarorini talab qiladi." },
      { short: "Uy-joy daxlsizligini faqat «shaxsiy hayot» deb tor tushunish", say: "31-moddani faqat shaxsiy hayot deb tor tushunib, uy-joy daxlsizligini ko'rmay qolishadi." },
      { short: "Himoya yo'lini (55, 29-moddalar) ko'rsatmay xulosa qilish", say: "xulosada himoya yo'lini - sud va advokatni - ko'rsatishni unutishadi." }
    ]
  },
  {
    id: "case-sinov", subject: "Mehnat huquqi", bg: "idora", source: LEX.mehnat,
    title: "Homilador xodima va «sinov muddati»",
    short: "Homilador ayolga 4 oylik sinov belgilanib, keyin bo'shatildi.",
    question: "Malikani sinov natijasi bilan bo'shatish qonuniymi?",
    event: [
      SC("Voqea", "idora", ["xodima", "ishberuvchi"], [
        L("xodima", "Men homiladorman, buni ishga kirishda aytgan edim.", "neutral", "explain"),
        L("ishberuvchi", "Mayli, shartnomaga to'rt oylik sinov muddatini yozamiz. Imzolang.", "neutral", "point")
      ]),
      SC("Ikki oydan keyin", "idora", ["xodima", "ishberuvchi"], [
        L("ishberuvchi", "Malika, siz sinovdan o'tmadingiz. Mana buyruq, ertadan ishga kelmang.", "serious", "warn"),
        L("xodima", "Axir shartnomani imzolagan edim... Endi hech narsa qilib bo'lmaydimi?", "worried", "shrug")
      ])
    ],
    stages: [
      { screen: "Homilador xodimaga shartnomada 4 oylik sinov belgilandi; 2 oydan keyin «sinovdan o'tmadi» deb buyruq bilan bo'shatildi",
        keywords: ["homilador", "4 oy", "to'rt oy", "sinov", "bo'shat"],
        lines: [L("aqlvoy", "Faktlar: Malika homilador, ish beruvchi buni bilgan.", "neutral", "point"),
                L("afandi", "Shartnomaga to'rt oylik sinov yozilgan, ikki oydan so'ng «sinovdan o'tmadi» deb bo'shatilgan.", "neutral", "explain")] },
      { screen: "1) Homilador ayolga sinov belgilash mumkinmi? 2) Uni ish beruvchi tashabbusi bilan bo'shatish mumkinmi?",
        keywords: ["mumkinmi", "qonuniymi", "belgilash", "tashabbus"],
        lines: [L("afandi", "Ikki masala bor: homilador ayolga sinov belgilash mumkinmi va uni ish beruvchi tashabbusi bilan bo'shatish mumkinmi?", "neutral", "think")] },
      { article: "Mehnat kodeksi, 129, 130, 408-moddalar", ruleText: "129: homilador ayolga sinov belgilanmaydi. 130: sinov 3 oydan oshmaydi. 408: homilador ayol bilan ish beruvchi tashabbusi bilan bekor qilish taqiqlanadi (tashkilot tugatilishi bundan mustasno).",
        screen: "MK 129 (sinov belgilanmaydi), 130 (3 oydan oshmaydi), 408 (bo'shatish taqiqlanadi)",
        keywords: ["129", "130", "408"],
        lines: [L("afandi", "129-modda: homilador ayolga dastlabki sinov belgilanmaydi. 130-modda: sinov odatda uch oydan oshmaydi.", "serious", "warn"),
                L("afandi", "408-modda: homilador ayol bilan mehnat shartnomasini ish beruvchi tashabbusi bilan bekor qilish taqiqlanadi.", "serious", "explain")] },
      { screen: "Sinov sharti qonunga zid - Malika sinovsiz qabul qilingan hisoblanadi; «sinov natijasi» bilan bo'shatish ham ish beruvchi tashabbusi, u 408-modda bilan taqiqlangan",
        keywords: ["zid", "sinovsiz", "imzo", "taqiqlangan", "tashabbus"],
        lines: [L("aqlvoy", "Imzo qo'yilgan bo'lsa ham, qonunga zid shart amal qilmaydi. Demak, Malika sinovsiz qabul qilingan.", "happy", "point"),
                L("afandi", "Sinov natijasi bahonasida bo'shatish ham ish beruvchi tashabbusi. 408-modda buni taqiqlaydi. Ustiga-ustak, to'rt oy - uch oydan ko'p.", "neutral", "explain")] },
      { screen: "Bo'shatish noqonuniy. Malika ishga tiklash va majburiy ishsizlik davri uchun haq to'lashni talab qilib sudga murojaat qiladi - muddatni o'tkazib yubormaslik kerak",
        keywords: ["noqonuniy", "tiklash", "sudga", "inspeksiya", "haq"],
        lines: [L("afandi", "Xulosa: bo'shatish noqonuniy. Malika ishga tiklashni so'rab sudga yoki mehnat inspeksiyasiga murojaat qiladi.", "happy", "wave"),
                L("aqlvoy", "Majburiy ishsizlik davri uchun haq to'lashni ham talab qiladi. Faqat kechiktirmasin - da'vo muddati qisqa.", "serious", "warn")] }
    ],
    mistakes: [
      { short: "«Shartnomani imzolagan - demak sinov qonuniy» deb hisoblash", say: "imzo qo'yilgani uchun sinovni qonuniy deb hisoblashadi. Qonunga zid shart amal qilmaydi." },
      { short: "Faqat «4 oy > 3 oy» ni ko'rib, 129 va 408-moddalarni o'tkazib yuborish", say: "faqat to'rt oy uch oydan ko'p ekanini ko'rib, asosiy moddalar - 129 va 408 ni o'tkazib yuborishadi." },
      { short: "Ishga tiklash talabini va muddatni unutish", say: "xulosada ishga tiklash talabini va da'vo muddatini unutishadi." }
    ]
  },
  {
    id: "case-tatil", subject: "Mehnat huquqi", bg: "idora", source: LEX.mehnat,
    title: "Ta'til «15 ish kuni» va bo'shatish tahdidi",
    short: "Xodimga qisqa ta'til berildi, ta'til paytida bo'shatildi.",
    question: "Jasurning ta'tili to'g'ri hisoblanganmi va uni ta'til paytida bo'shatish mumkinmi?",
    event: [
      SC("Voqea", "idora", ["qoshni", "ishberuvchi"], [
        L("qoshni", "Bir yildan beri ishlayapman. Yillik ta'tilimni olsam bo'ladimi?", "neutral", "think"),
        L("ishberuvchi", "O'n besh ish kuni beraman, shu yetadi.", "neutral", "shrug")
      ]),
      SC("Ta'tilning beshinchi kuni", "mahalla", ["qoshni", "ishberuvchi"], [
        L("ishberuvchi", "Jasur, ish ko'p! Ertaga chiqmasang, seni bo'shatdim. Buyruq tayyor.", "serious", "warn"),
        L("qoshni", "Men ta'tildaman-ku! Tashkilot ishlab turibdi, nega bo'shatasiz?", "worried", "shrug")
      ])
    ],
    stages: [
      { screen: "Jasur bir yil ishlagan; unga 15 ish kuni ta'til berildi; ta'tilning 5-kuni bo'shatish buyrug'i chiqdi; tashkilot tugatilmagan",
        keywords: ["15", "ish kuni", "ta'til", "bo'shat", "tugatilmagan"],
        lines: [L("aqlvoy", "Faktlar: Jasur bir yil ishlagan, unga o'n besh ish kuni ta'til berilgan.", "neutral", "point"),
                L("afandi", "Ta'tilning beshinchi kuni bo'shatish buyrug'i chiqarilgan. Tashkilot esa ishlab turibdi.", "neutral", "explain")] },
      { screen: "1) Ta'til muddati to'g'ri hisoblanganmi? 2) Ta'tildagi xodimni ish beruvchi tashabbusi bilan bo'shatish mumkinmi?",
        keywords: ["muddat", "hisob", "mumkinmi", "ta'tilda"],
        lines: [L("afandi", "Ikki masala: ta'til to'g'ri hisoblanganmi va ta'tildagi xodimni ish beruvchi bo'shata oladimi?", "neutral", "think")] },
      { article: "Mehnat kodeksi, 215 va 217-moddalar", ruleText: "217: yillik asosiy ta'til kamida 21 kalendar kun. 215: ta'til davrida ish joyi saqlanadi, ish beruvchi tashabbusi bilan bekor qilishga yo'l qo'yilmaydi (tashkilot tugatilishi bundan mustasno). Konstitutsiya 45-modda: haq to'lanadigan yillik ta'til huquqi.",
        screen: "MK 217: kamida 21 kalendar kun. MK 215: ta'tildagi xodimni ish beruvchi bo'shata olmaydi",
        keywords: ["217", "215", "21", "45"],
        lines: [L("afandi", "217-modda: yillik asosiy ta'til kamida yigirma bir kalendar kun.", "serious", "warn"),
                L("afandi", "215-modda: ta'til davrida ish joyi saqlanadi, ish beruvchi tashabbusi bilan shartnomani bekor qilib bo'lmaydi.", "neutral", "explain")] },
      { screen: "15 ish kuni - eski tartib; yangi kodeksda ta'til kalendar kunlarida va kamida 21 kun. Tashkilot tugatilmagan, demak bo'shatish taqiqlangan",
        keywords: ["kalendar", "eski", "21", "tugatilmagan", "taqiq"],
        lines: [L("aqlvoy", "O'n besh ish kuni - eski kodeksdagi tartib. Endi ta'til kalendar kunlarida hisoblanadi.", "happy", "point"),
                L("afandi", "Tashkilot tugatilmagan. Shuning uchun ta'tildagi Jasurni bo'shatish mumkin emas.", "neutral", "explain")] },
      { screen: "Jasur kamida 21 kalendar kunlik ta'tilga haqli; bo'shatish buyrug'i noqonuniy - u sud orqali ishga tiklanishi mumkin",
        keywords: ["21", "noqonuniy", "tiklash", "sudga", "haqli"],
        lines: [L("afandi", "Xulosa: Jasur kamida yigirma bir kalendar kunlik ta'tilga haqli.", "happy", "wave"),
                L("aqlvoy", "Bo'shatish buyrug'i noqonuniy. Jasur sudga murojaat qilib, ishga tiklanishi mumkin.", "happy", "point")] }
    ],
    mistakes: [
      { short: "Ta'tilni ish kunlarida hisoblash (eski «15 ish kuni»)", say: "ta'tilni eski tartibda - ish kunlarida hisoblashadi." },
      { short: "215-modda kafolatini bilmaslik", say: "ta'tildagi xodimni himoya qiluvchi 215-moddani bilishmaydi." },
      { short: "Konstitutsiyaviy asosni (45-modda) ko'rsatmaslik", say: "talaba javobida Konstitutsiyaning 45-moddasini - dam olish huquqini - ko'rsatmay qo'yishadi." }
    ]
  }
];
const CASES = CASES_RAW.map((c) => ({ ...c, script: makeCaseScript(c) }));
