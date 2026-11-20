/* Video darslar: Konstitutsiyaviy huquq — 5 ta dars, tekshiruv savollari bilan.
   Har savolning ref maydoni — javob tushuntirilgan sahna raqami (vaqti avtomatik hisoblanadi). */

const Q = (q, options, answer, ref, why) => ({ q, options, answer, ref, why });

const LESSONS_RAW = [
  {
    id: "les-1", title: "Konstitutsiya — Asosiy qonun",
    recap: "Konstitutsiya - Asosiy qonun. 15-moddaga ko'ra u oliy yuridik kuchga ega; yangi tahriri 2023-yil 30-aprelda referendumda qabul qilingan.",
    recapArt: ART("Konstitutsiya, 15-modda", "Oliy yuridik kuch"),
    scenes: [
      SC("1-dars", "universitet", [], [], TITLE("1-dars · Konstitutsiyaviy huquq", "Konstitutsiya — Asosiy qonun"), { duration: 3 }),
      SC("Savol", "universitet", ["talabaqiz", "aqlvoy"], [
        L("talabaqiz", "Aqlvoy, imtihonda «Konstitutsiyaning ustunligi» degan savol bor. Bu nima degani?", "worried", "think"),
        L("aqlvoy", "Keling, Afandi boboning o'zidan so'raymiz!", "happy", "wave")
      ]),
      SC("Ustunlik", "universitet", ["afandi", "aqlvoy"], [
        L("afandi", "Konstitutsiya - uyning poydevori. Boshqa barcha qonunlar shu poydevor ustiga quriladi.", "happy", "explain"),
        L("afandi", "15-moddaga ko'ra, Konstitutsiya va qonunlarning ustunligi so'zsiz tan olinadi, Konstitutsiya oliy yuridik kuchga ega.", "serious", "warn"),
        L("aqlvoy", "Demak, qonun Konstitutsiyaga zid bo'lsa, u amal qila olmaydi.", "happy", "point")
      ], ART("Konstitutsiya, 15-modda", "Konstitutsiya va qonunlarning ustunligi so'zsiz tan olinadi")),
      SC("Yangi tahrir", "mahalla", ["afandi", "talabaqiz"], [
        L("afandi", "Yangi tahrirdagi Konstitutsiya 2023-yil 30-aprelda referendumda qabul qilingan va 1-maydan kuchga kirgan.", "neutral", "explain"),
        L("talabaqiz", "Demak, uni xalqning o'zi ovoz berib qabul qilgan.", "happy", "point")
      ], KEY("2023-yil 30-aprel", "Yangi tahrir referendumda qabul qilindi")),
      SC("1-modda", "universitet", ["afandi", "talabaqiz"], [
        L("afandi", "1-modda: O'zbekiston - boshqaruvning respublika shakliga ega bo'lgan suveren, demokratik, huquqiy, ijtimoiy va dunyoviy davlat.", "serious", "explain"),
        L("talabaqiz", "Besh so'z - besh tamoyil. Yodlab oldim!", "happy", "wave")
      ], ART("Konstitutsiya, 1-modda", "Suveren, demokratik, huquqiy, ijtimoiy, dunyoviy davlat"))
    ],
    quiz: [
      Q("Konstitutsiyaning oliy yuridik kuchi qaysi moddada belgilangan?", ["15-modda", "1-modda", "55-modda", "128-modda"], 0, 2, "15-modda Konstitutsiya va qonunlarning ustunligini belgilaydi."),
      Q("Yangi tahrirdagi Konstitutsiya qachon referendumda qabul qilingan?", ["2023-yil 30-aprel", "1992-yil 8-dekabr", "2023-yil 1-may", "2022-yil 30-aprel"], 0, 3, "30-aprel - referendum kuni, 1-may - kuchga kirgan kun."),
      Q("1-moddada qaysi tavsif YO'Q?", ["Monarxiya", "Dunyoviy", "Ijtimoiy", "Huquqiy"], 0, 4, "O'zbekiston - respublika boshqaruv shaklidagi davlat.")
    ]
  },
  {
    id: "les-2", title: "Yashash va shaxsiy erkinlik huquqi",
    recap: "25-modda: yashash huquqi ajralmas, o'lim jazosi taqiqlangan. 27-modda: sud qarorisiz 48 soatdan ortiq ushlab turish mumkin emas. 28-modda: aybsizlik prezumpsiyasi.",
    recapArt: ART("Konstitutsiya, 25, 27, 28-moddalar", "Hayot, erkinlik, aybsizlik"),
    scenes: [
      SC("2-dars", "sud", [], [], TITLE("2-dars · Konstitutsiyaviy huquq", "Yashash va shaxsiy erkinlik huquqi"), { duration: 3 }),
      SC("Hayotiy vaziyat", "mahalla", ["qoshni", "aqlvoy"], [
        L("qoshni", "Qo'shnimni ikki kundan beri ushlab turishibdi, hali sudga olib borishmadi.", "worried", "explain"),
        L("aqlvoy", "Ikki kun? Sud qarorisizmi? Bu qonuniymi?", "surprised", "think")
      ]),
      SC("Yashash huquqi", "sud", ["afandi", "aqlvoy"], [
        L("afandi", "Avval eng asosiysi. 25-modda: yashash huquqi har bir insonning ajralmas huquqi.", "serious", "explain"),
        L("afandi", "Yangi Konstitutsiyada o'lim jazosi taqiqlangan.", "serious", "warn")
      ], ART("Konstitutsiya, 25-modda", "Yashash huquqi ajralmas; o'lim jazosi taqiqlanadi")),
      SC("48 soat qoidasi", "sud", ["afandi", "aqlvoy"], [
        L("afandi", "27-moddaga ko'ra, qamoqqa olish va qamoqda saqlash sud qarori bilan bo'ladi.", "neutral", "explain"),
        L("afandi", "Sud qarorisiz shaxs qirq sakkiz soatdan ortiq ushlab turilishi mumkin emas.", "serious", "warn"),
        L("aqlvoy", "Ikki kun - bu qirq sakkiz soat. Undan oshsa, qonun buzilgan bo'ladi!", "surprised", "point")
      ], ART("Konstitutsiya, 27-modda", "Sud qarorisiz 48 soatdan ortiq ushlab turish mumkin emas")),
      SC("Aybsizlik prezumpsiyasi", "sud", ["afandi", "aqlvoy"], [
        L("afandi", "28-modda: aybi sudda isbotlanmaguncha va hukm kuchga kirmaguncha shaxs aybsiz hisoblanadi.", "neutral", "explain"),
        L("aqlvoy", "Ya'ni gumon - hali ayb emas.", "happy", "point")
      ], ART("Konstitutsiya, 28-modda", "Aybsizlik prezumpsiyasi")),
      SC("Yuridik yordam", "idora", ["afandi", "qoshni"], [
        L("afandi", "29-modda: har kim malakali yuridik yordam olish huquqiga ega. Qonunda nazarda tutilgan hollarda u davlat hisobidan beriladi.", "happy", "explain"),
        L("qoshni", "Unda qo'shnimga darhol advokat kerak!", "serious", "point")
      ], ART("Konstitutsiya, 29-modda", "Malakali yuridik yordam huquqi"))
    ],
    quiz: [
      Q("Sud qarorisiz ushlab turishning eng ko'p muddati qancha?", ["48 soat", "72 soat", "24 soat", "10 kun"], 0, 3, "27-modda: 48 soatdan ortiq emas."),
      Q("Aybsizlik prezumpsiyasi qaysi moddada?", ["28-modda", "25-modda", "31-modda", "33-modda"], 0, 4, "28-modda: ayb sudda isbotlanguncha shaxs aybsiz."),
      Q("Yangi Konstitutsiyada o'lim jazosi haqida nima deyilgan?", ["Taqiqlangan", "Faqat og'ir jinoyatlar uchun", "Sud hal qiladi", "Hech narsa"], 0, 2, "25-modda o'lim jazosini taqiqlaydi."),
      Q("Malakali yuridik yordam huquqi qaysi moddada?", ["29-modda", "27-modda", "55-modda", "60-modda"], 0, 5, "29-modda.")
    ]
  },
  {
    id: "les-3", title: "Uy-joy daxlsizligi va so'z erkinligi",
    recap: "31-modda: uy-joy daxlsiz, tintuv faqat sud qaroriga asosan; yozishmalar siri himoyada. 33-modda: fikr, so'z va axborot erkinligi.",
    recapArt: ART("Konstitutsiya, 31 va 33-moddalar", "Daxlsizlik va so'z erkinligi"),
    scenes: [
      SC("3-dars", "mahalla", [], [], TITLE("3-dars · Konstitutsiyaviy huquq", "Uy-joy daxlsizligi va so'z erkinligi"), { duration: 3 }),
      SC("Hayotiy vaziyat", "mahalla", ["talabaqiz", "qoshni"], [
        L("talabaqiz", "Ijtimoiy tarmoqda shahrimizdagi muammo haqida yozdim. Endi kimdir «o'chir» deyapti.", "worried", "explain"),
        L("qoshni", "Meni esa uyimga ruxsatsiz kirmoqchi bo'lishdi!", "surprised", "warn")
      ]),
      SC("Uy-joy daxlsizligi", "mahalla", ["afandi", "qoshni"], [
        L("afandi", "31-modda: har kim uy-joy daxlsizligi huquqiga ega. Uy-joyda tintuv faqat qonunga muvofiq va sud qaroriga asosan o'tkaziladi.", "serious", "warn"),
        L("afandi", "Yozishmalar, telefon so'zlashuvlari va elektron xabarlar siri ham shu moddada himoyalangan.", "neutral", "explain")
      ], ART("Konstitutsiya, 31-modda", "Uy-joy daxlsizligi; tintuv faqat sud qarori bilan")),
      SC("So'z erkinligi", "universitet", ["afandi", "talabaqiz"], [
        L("afandi", "33-modda: har kim fikrlash, so'z va e'tiqod erkinligiga ega. Axborot izlash, olish va tarqatish huquqi ham bor.", "happy", "explain"),
        L("talabaqiz", "Demak, muammo haqida yozishim - mening huquqim.", "happy", "point")
      ], ART("Konstitutsiya, 33-modda", "Fikr, so'z, e'tiqod va axborot erkinligi")),
      SC("Ehtiyot bo'ling!", "universitet", ["afandi", "aqlvoy"], [
        L("aqlvoy", "Lekin 60-moddaga ko'ra boshqalarning huquqi va sha'nini hurmat qilish ham burchimiz.", "serious", "warn"),
        L("afandi", "To'g'ri. Erkinlik qonun doirasida: birovni haqorat qilish yoki yolg'on tarqatish javobgarlikka sabab bo'lishi mumkin.", "neutral", "explain")
      ], WARN("Ehtiyot bo'ling!", "Erkinlik - boshqalar huquqini hurmat qilish bilan birga"))
    ],
    quiz: [
      Q("Uy-joyda tintuv o'tkazish uchun nima zarur?", ["Qonunga muvofiq sud qarori", "Mahalla raisining ruxsati", "Qo'shnining shikoyati", "Tashkilotning ichki buyrug'i"], 0, 2, "31-modda: faqat qonunga muvofiq va sud qaroriga asosan."),
      Q("So'z erkinligi qaysi moddada?", ["33-modda", "31-modda", "42-modda", "50-modda"], 0, 3, "33-modda."),
      Q("Axborot izlash, olish va tarqatish huquqi haqida to'g'ri gap:", ["33-modda bilan kafolatlangan", "Faqat jurnalistlarga tegishli", "Konstitutsiyada yo'q", "Faqat 18 yoshdan"], 0, 3, "33-modda har kimga tegishli.")
    ]
  },
  {
    id: "les-4", title: "Ijtimoiy huquqlar: ta'lim, mehnat, dam olish, sog'liq",
    recap: "50-modda: umumiy o'rta ta'lim bepul va majburiy. 42-modda: mehnat qilish huquqi. 44-modda: majburiy mehnat taqiqlanadi. 45-modda: dam olish. 48-modda: sog'liqni saqlash.",
    recapArt: ART("Konstitutsiya, 42-50-moddalar", "Ijtimoiy huquqlar"),
    scenes: [
      SC("4-dars", "bozor", [], [], TITLE("4-dars · Konstitutsiyaviy huquq", "Ijtimoiy huquqlar"), { duration: 3 }),
      SC("Hayotiy vaziyat", "bozor", ["sotuvchi", "bola"], [
        L("sotuvchi", "O'g'lim, maktabga borma, bugun bozorda menga yordam berasan.", "neutral", "point"),
        L("bola", "Lekin men o'qishni xohlayman...", "worried", "shrug")
      ]),
      SC("Ta'lim huquqi", "universitet", ["afandi", "bola"], [
        L("afandi", "50-modda: har kim ta'lim olish huquqiga ega. Davlat bepul umumiy o'rta ta'limni kafolatlaydi.", "happy", "explain"),
        L("afandi", "Umumiy o'rta ta'lim majburiy. Bolani maktabdan qoldirish - uning huquqini buzish.", "serious", "warn"),
        L("bola", "Hurray! Demak, men maktabga boraman!", "happy", "wave")
      ], ART("Konstitutsiya, 50-modda", "Umumiy o'rta ta'lim bepul va majburiy")),
      SC("Mehnat huquqi", "idora", ["afandi", "aqlvoy"], [
        L("afandi", "42-modda: har kim munosib mehnat qilish, kasbni erkin tanlash va ishsizlikdan himoyalanish huquqiga ega.", "neutral", "explain"),
        L("afandi", "44-modda: majburiy mehnat taqiqlanadi.", "serious", "warn")
      ], ART("Konstitutsiya, 42 va 44-moddalar", "Mehnat huquqi; majburiy mehnat taqiqi")),
      SC("Dam olish va sog'liq", "mahalla", ["afandi", "aqlvoy"], [
        L("afandi", "45-modda: har kim dam olish huquqiga ega, bunga haq to'lanadigan yillik ta'til ham kiradi.", "happy", "explain"),
        L("afandi", "48-modda: har kim sog'lig'ini saqlash va malakali tibbiy yordam olish huquqiga ega.", "neutral", "explain"),
        L("aqlvoy", "Ta'til kunlari esa Mehnat kodeksida - kamida yigirma bir kalendar kun.", "happy", "point")
      ], ART("Konstitutsiya, 45 va 48-moddalar", "Dam olish va sog'liqni saqlash huquqi"))
    ],
    quiz: [
      Q("Umumiy o'rta ta'lim haqida to'g'ri gap:", ["Bepul va majburiy", "Pullik va ixtiyoriy", "Faqat shaharlarda", "Faqat 7 yildan"], 0, 2, "50-modda."),
      Q("Majburiy mehnat taqiqi qaysi moddada?", ["44-modda", "42-modda", "45-modda", "50-modda"], 0, 3, "44-modda."),
      Q("Haq to'lanadigan yillik ta'til huquqi qaysi moddada?", ["45-modda", "48-modda", "42-modda", "60-modda"], 0, 4, "45-modda.")
    ]
  },
  {
    id: "les-5", title: "Burchlar va huquqni himoya qilish",
    recap: "55-modda: huquqni sud orqali himoya qilish. 60 va 63-moddalar: qonunlarga rioya qilish va soliq to'lash burchi. 128-modda: 18 yoshdan saylash huquqi.",
    recapArt: ART("Konstitutsiya, 55, 60, 63, 128-moddalar", "Himoya va burchlar"),
    scenes: [
      SC("5-dars", "idora", [], [], TITLE("5-dars · Konstitutsiyaviy huquq", "Burchlar va huquqni himoya qilish"), { duration: 3 }),
      SC("Hayotiy vaziyat", "idora", ["qoshni", "hokim"], [
        L("qoshni", "Murojaatim bo'yicha chiqqan qaror noto'g'ri deb o'ylayman. Endi nima qilay?", "worried", "think"),
        L("hokim", "Qaror chiqdi, shikoyat qilishning foydasi yo'q.", "serious", "shrug")
      ]),
      SC("Sud orqali himoya", "sud", ["afandi", "aqlvoy"], [
        L("afandi", "55-modda: har kim o'z huquq va erkinliklarini sud orqali va qonunda taqiqlanmagan boshqa usullar bilan himoya qila oladi.", "serious", "explain"),
        L("aqlvoy", "Demak, mansabdor shaxsning qarori ustidan ham sudga murojaat qilish mumkin.", "happy", "point")
      ], ART("Konstitutsiya, 55-modda", "Huquqni sud orqali himoya qilish")),
      SC("Burchlar", "idora", ["afandi", "aqlvoy"], [
        L("afandi", "Huquq bilan birga burch ham bor. 60-modda: fuqarolar Konstitutsiya va qonunlarga rioya etishi, boshqalarning huquqi va sha'nini hurmat qilishi shart.", "neutral", "explain"),
        L("afandi", "63-modda: qonunda belgilangan soliqlar va yig'imlarni to'lash ham burch.", "serious", "warn")
      ], ART("Konstitutsiya, 60 va 63-moddalar", "Qonunlarga rioya; soliq to'lash burchi")),
      SC("Saylov huquqi", "universitet", ["afandi", "aqlvoy"], [
        L("afandi", "128-modda: o'n sakkiz yoshga to'lgan fuqarolar saylash huquqiga ega.", "happy", "explain"),
        L("aqlvoy", "Men o'tgan yili o'n sakkizga to'ldim - endi ovoz bera olaman!", "happy", "wave")
      ], ART("Konstitutsiya, 128-modda", "18 yoshdan saylash huquqi"))
    ],
    quiz: [
      Q("Huquqni sud orqali himoya qilish qaysi moddada?", ["55-modda", "60-modda", "63-modda", "128-modda"], 0, 2, "55-modda."),
      Q("Saylash huquqi qaysi yoshdan boshlanadi?", ["18 yosh", "16 yosh", "21 yosh", "25 yosh"], 0, 4, "128-modda: 18 yosh."),
      Q("Soliq va yig'imlarni to'lash burchi qaysi moddada?", ["63-modda", "60-modda", "55-modda", "65-modda"], 0, 3, "63-modda.")
    ]
  }
];

const LESSONS = LESSONS_RAW.map((les) => ({
  ...les,
  script: normalizeScript({
    id: les.id, title: les.title, level: "talaba", subject: "Konstitutsiyaviy huquq", source: LEX.konst, verified: false,
    scenes: les.scenes
  })
}));

/* 60 soniyalik takrorlash videosi: har mavzu bo'yicha qisqa xulosa ketma-ket */
const RECAP = normalizeScript({
  id: "recap-konst", title: "Imtihondan oldin takrorlash: Konstitutsiyaviy huquq", level: "talaba", source: LEX.konst,
  summary: LESSONS_RAW.map((l) => l.recap),
  scenes: [
    SC("Takrorlash", "universitet", [], [], TITLE("Imtihondan oldin takrorlash", "5 mavzu · 1 daqiqada"), { duration: 2.5 }),
    ...LESSONS_RAW.map((l, i) => SC((i + 1) + ". " + l.title, ["universitet", "sud", "mahalla", "bozor", "idora"][i], ["afandi", "aqlvoy"], [
      L(i % 2 ? "aqlvoy" : "afandi", l.recap, "neutral", i % 2 ? "point" : "explain")
    ], l.recapArt))
  ]
});
