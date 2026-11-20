# OsonQonun — MVP

Qonunlarni o'zbek milliy personajlari (Afandi va Aqlvoy) ishtirokidagi multfilm uslubidagi videolar orqali tushuntiruvchi platforma. Lex hackatoni, 2-yo'nalish: "Huquqiy ta'lim va targ'ibot".

## Ishga tushirish

**Eng oson yo'l:** `dist/index.html` faylini brauzerda oching (ikki marta bosing). Internet shart emas — React ichiga joylangan.

**Koddan yig'ish:**
```bash
npm install
npm run build      # dist/index.html qayta yasaladi
```
Node.js 18+ kerak.

**AI rejimi.** Ilova Claude artifacti sifatida ochilganda "Multfilm yaratish" va kazus javobini solishtirish Claude orqali ishlaydi. Oddiy fayl sifatida ochilganda oflayn shablon generator ishlaydi: matndan modda raqami, muddat va ogohlantirishlarni ajratib, 5 sahnali ssenariy tuzadi. O'z LLM API'ingizni ulash uchun `src/lib/ScriptGenerator.js` dagi `generateWithAI` funksiyasini almashtiring — prompt (`buildPrompt`) va JSON sxema tayyor.

## Tuzilma

```
src/
  lib/core.js              store (localStorage), lotin→kirill, Web Speech ovozlari, PDF konspekt, Claude ko'prigi
  lib/scriptTools.js       ssenariyni tekshirish/normallashtirish, vaqt chizig'i, konspekt
  lib/ScriptGenerator.js   AI prompt + oflayn shablon + kazus javobini solishtirish
  components/Character.jsx     SVG personajlar (11 ta): og'iz, ko'z, qo'l harakatlari
  components/Backgrounds.jsx   5 ta fon: mahalla, bozor, idora, sud zali, universitet
  components/SceneRenderer.jsx sahna: personajlar, gap pufakchasi, ekrandagi matn, subtitr
  components/VideoPlayer.jsx   pleyer: play/pause, 0.75–2x, CC, ovoz, sahna ←/→, to'liq ekran, 9:16
  components/CaseVideo.jsx     kazus: voqea → to'xtash → 5 bosqichli yechim → xatolar → solishtirish
  components/LessonPlaylist.jsx video darslar, testlar, takrorlash, o'qituvchi o'tish foizi
  components/RightsRoadmap.jsx yosh bo'yicha huquqlar vaqt chizig'i
  data/                    haftaning multfilmi, 3 kazus, 5 dars, yo'l xaritasi
  pages/Pages.jsx, App.jsx sahifalar va navigatsiya
docs/script-schema.json    video-ssenariy JSON sxemasi
build.mjs                  bitta oflayn HTML yig'uvchi
```

## Yangi video qo'shish

Videoning o'zi — JSON ssenariy (`docs/script-schema.json`). `src/data/` ga yangi ob'ekt qo'shing yoki AI yozgan JSON'ni "Ssenariy JSON" blokidan nusxalab oling. Pleyer har qanday to'g'ri ssenariyni o'ynaydi.

## NotebookLM bilan batafsil video

Har video ostida «Batafsil video» bloki bor:
1. «NotebookLM uchun tayyorlash» → «Manba (.txt)» — ssenariy, konspekt, moddalar va lex.uz havolasi bitta faylda.
2. notebooklm.google.com da yangi daftar → faylni (va lex.uz dagi asl qonunni) manba sifatida qo'shing.
3. Chiqish tilini o'zbekcha qiling, Studio → Video Overview, tayyor promptni yo'naltiruvchi prompt maydoniga joylang.
4. Tayyor videoni lex.uz bilan solishtirib tekshiring, YouTube/Telegram'ga joylang.
5. Havolani «Batafsil video» maydoniga biriktiring.

Hozircha havolalar shu qurilmada saqlanadi. Supabase ulanganda o'qituvchi biriktirgan havola hamma talabalarga ko'rinadi (`externalVideos` maydoni).

## Kontent haqida

Namuna moddalar lex.uz dagi amaldagi tahrirlar asosida tayyorlangan: Konstitutsiya (2023), Mehnat kodeksi (2022/2023). Ular hali yurist tekshiruvidan o'tmagan, shuning uchun hech biriga "Tekshirilgan ✓" belgisi qo'yilmagan (`verified: false`). Ommaga chiqarishdan oldin yurist tekshirishi kerak.

## Keyingi bosqichlar

- Supabase: ro'yxatdan o'tish, bir nechta qurilmada progress, o'qituvchi paneli (guruhlar)
- O'zbekcha TTS xizmati (hozir: brauzerning Web Speech API'si)
- PDF'dan matn ajratish (pdf.js), lex.uz havolasidan matnni server orqali olish
- Ssenariydan haqiqiy MP4 multfilm (personaj etalon rasmi asosida AI video) va 9:16 eksport
- Qolgan fanlar: Fuqarolik, Jinoyat, Ma'muriy, Oila, protsessual huquq; rus va ingliz tillari
