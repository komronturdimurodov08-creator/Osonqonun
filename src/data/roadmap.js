/* Huquqlar yo'l xaritasi: yosh bo'yicha ochiladigan huquq va majburiyatlar */
const ROADMAP = [
  { age: 0, label: "Tug'ilgandan", bg: "mahalla", items: [
    { title: "Yashash huquqi", text: "Yashash huquqi har bir insonning ajralmas huquqi.", ref: "Konstitutsiya, 25-modda", src: "konst" },
    { title: "Bola huquqlari himoyada", text: "Bolalar huquqlarini ta'minlash va ularning rivojlanishi uchun eng yaxshi sharoit yaratish - davlat majburiyati.", ref: "Konstitutsiya, 78-modda", src: "konst" }
  ] },
  { age: 6, label: "6-7 yosh", bg: "universitet", items: [
    { title: "Ta'lim olish huquqi", text: "Umumiy o'rta ta'lim bepul va majburiy - maktabga borish huquqingiz ham, burchingiz ham.", ref: "Konstitutsiya, 50-modda", src: "konst" }
  ] },
  { age: 14, label: "14 yosh", bg: "bozor", items: [
    { title: "Qisman muomala layoqati", text: "O'z ish haqingiz, stipendiyangiz va boshqa daromadingizni mustaqil tasarruf eta olasiz.", ref: "Fuqarolik kodeksi, 27-modda", src: "lex" }
  ] },
  { age: 15, label: "15 yosh", bg: "idora", items: [
    { title: "Ota-ona roziligi bilan ishlash", text: "Ota-onadan birining (yoki vasiyning) yozma roziligi bilan yengil ishga qabul qilinishingiz mumkin.", ref: "Mehnat kodeksi, 31-modda", src: "mehnat" }
  ] },
  { age: 16, label: "16 yosh", bg: "idora", items: [
    { title: "Mehnatga oid layoqat", text: "16 yoshdan mehnat shartnomasini mustaqil tuza olasiz.", ref: "Mehnat kodeksi, 20-modda", src: "mehnat" },
    { title: "Javobgarlik ham boshlanadi", text: "Jinoiy javobgarlik umumiy qoidaga ko'ra 16 yoshdan; ayrim og'ir jinoyatlar uchun undan oldinroq.", ref: "Jinoyat kodeksi, 17-modda", src: "lex", duty: true }
  ] },
  { age: 18, label: "18 yosh", bg: "universitet", items: [
    { title: "Saylash huquqi", text: "18 yoshga to'lgan fuqarolar saylovda ovoz beradi.", ref: "Konstitutsiya, 128-modda", src: "konst" },
    { title: "Nikoh yoshi", text: "Nikoh yoshi erkaklar va ayollar uchun 18 yosh.", ref: "Oila kodeksi, 15-modda", src: "oila" },
    { title: "To'liq muomala layoqati", text: "O'z harakatlaringiz bilan barcha fuqarolik huquq va majburiyatlarini to'liq amalga oshirasiz.", ref: "Fuqarolik kodeksi, 22-modda", src: "lex" }
  ] },
  { age: 25, label: "25 yosh", bg: "idora", items: [
    { title: "Deputatlikka saylanish", text: "25 yoshga to'lgan fuqaro Oliy Majlis Qonunchilik palatasiga deputat bo'lib saylanishi mumkin.", ref: "Konstitutsiya, 92-modda", src: "konst" }
  ] },
  { age: 35, label: "35 yosh", bg: "sud", items: [
    { title: "Prezidentlikka nomzod", text: "35 yoshdan kichik bo'lmagan, davlat tilini yaxshi biladigan va kamida 10 yil O'zbekistonda muqim yashayotgan fuqaro.", ref: "Konstitutsiya, 106-modda", src: "konst" }
  ] }
];
const ALWAYS_RIGHTS = [
  { title: "Sud orqali himoya", text: "Har qanday yoshda huquqingizni sud orqali himoya qila olasiz.", ref: "Konstitutsiya, 55-modda", src: "konst" },
  { title: "Yuridik yordam", text: "Malakali yuridik yordam olish huquqi; qonunda nazarda tutilgan hollarda - davlat hisobidan.", ref: "Konstitutsiya, 29-modda", src: "konst" }
];

/* Har bir huquq uchun 1 daqiqalik multfilm (shablon asosida) */
function rightScript(item, ageLabel, bg) {
  return normalizeScript({
    id: "right-" + normApos(item.title).toLowerCase().replace(/[^a-z]+/g, "-"),
    title: ageLabel + ": " + item.title, level: "fuqaro", source: LEX[item.src] || LEX.lex,
    summary: [item.text, "Manba: " + item.ref],
    scenes: [
      SC("Savol", bg, ["bola", "aqlvoy"], [
        L("bola", (ageLabel === "Tug'ilgandan" ? "Tug'ilganimdan" : ageLabel + "da") + " menga qanday huquq ochiladi?", "surprised", "think"),
        L("aqlvoy", "Zo'r savol! Afandi bobo aniq biladi.", "happy", "wave")
      ]),
      SC(item.title, bg, ["afandi", "bola"], [
        L("afandi", item.text, "happy", "explain"),
        L("afandi", "Bu " + item.ref + "da yozilgan.", "neutral", "point"),
        L("bola", item.duty ? "Demak, javobgarlikni ham unutmaslik kerak ekan." : "Endi bilaman, rahmat!", item.duty ? "serious" : "happy", item.duty ? "warn" : "wave")
      ], ART(item.ref, item.title))
    ]
  });
}
