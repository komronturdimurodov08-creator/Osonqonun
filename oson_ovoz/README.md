# OsonQonun — ElevenLabs ovoz moduli

edge-tts o'rniga ElevenLabs **Eleven v4** modeli bilan 5 personaj va Hikoyachi uchun professional ovoz beradi.

## 1. O'rnatish (5 daqiqa)

1. Papkani loyihangizga ko'chiring: `oson_ovoz.py`, `ovozlar.json`, `namuna_ssenariy.json`.
2. Kutubxonani o'rnating: `pip install requests` (ffmpeg allaqachon bor).
3. ElevenLabs → **Profile → API Keys → Create** qilib kalit oling.
4. Loyiha papkasida `.env` fayl yarating:
   ```
   ELEVENLABS_API_KEY=sk_xxxxxxxxxxxxxxxx
   ```
   ⚠️ `.gitignore` ga `.env` va `.ovoz_kesh/` ni qo'shing. Kalit GitHub'ga chiqib ketmasin!

## 2. Ishga tushirish

**Birinchi: o'zbekcha ovozlarni yaratish (Voice Design)**

```bash
python oson_ovoz.py dizayn            # 6 personaj × 3 variant → ovoz_dizayn/ papkasida mp3
python oson_ovoz.py tanla Afandi 2    # yoqqan variant akkauntga saqlanadi, ovozlar.json yangilanadi
```
Har bir personaj uchun `tanla` ni bajaring. Variant yoqmasa: `python oson_ovoz.py dizayn Afandi` qayta yaratadi.

**Keyin: sinash va sahna**

```bash
python oson_ovoz.py test                          # har bir personajdan namuna (ovoz_test/ papkada)
python oson_ovoz.py scene namuna_ssenariy.json    # butun sahna → ovoz_natija/
python oson_ovoz.py voices                        # akkauntingizdagi ovozlar va voice_id lar
python oson_ovoz.py matn "JK 25-moddasi 2026-yil" # API siz: matn qanday o'qilishini ko'rish
```

Sahna natijasi:
- `001_Hikoyachi.mp3 ...` — har bir replika alohida (animatsiyada og'iz harakati uchun)
- `1-sahna_shartnoma.mp3` — butun sahna, ovoz balandligi tekislangan (−16 LUFS)
- `.srt` — tayyor subtitr
- `_timing.json` — har bir replika qachon boshlanib, qachon tugashi

## 3. Dasturga (Streamlit) ulash

```python
from oson_ovoz import OsonOvoz
ovoz = OsonOvoz()

# edge-tts o'rniga bitta gap:
ovoz.say("Afandi", "[laughs] Ey bolam, avval o'qi!", "out/afandi_1.mp3")
ovoz.say("Aqlvoy", "По закону...", "out/aqlvoy_ru.mp3", til="ru")

# Gemini yozgan ssenariyni dict ko'rinishida berish:
natija = ovoz.scene({"nomi": "kazus_5", "til": "uz", "replikalar": [
    {"personaj": "Jasur", "matn": "..."},
    {"personaj": "Aqlvoy", "matn": "..."}
]})
# natija["audio"], natija["srt"], natija["replikalar"] → videoga
```

## 4. Professional ovoz uchun eng muhim qadam: ovozlarni tanlash

`ovozlar.json` dagi voice_id lar ElevenLabs'ning standart ovozlari, ishlashi uchun qo'yilgan. Ular asli inglizcha ovozlar, shuning uchun o'zbekchada **biroz aksent** bo'lishi mumkin. Aksentsiz ovoz olish uchun:

**A) Voice Library'dan o'zbekcha ovoz olish (tez)**
ElevenLabs → **Voices → Voice Library** → filtr: **Language = Uzbek** → yoqqanini tinglang → **Add to my voices**.
Keyin `python oson_ovoz.py voices` buyrug'i bilan uning `voice_id` sini oling va `ovozlar.json` ga qo'ying.

**B) O'z ovozingizni klonlash (eng sifatli)**
Pro tarifda **Professional Voice Clone** bor. O'zbek tilida ravon gapiradigan odamni (sizni, sherigingizni, tanishingizni) 30+ daqiqa yozib olsangiz, 100% tabiiy o'zbekcha ovoz chiqadi. Masalan, Afandi uchun keksaroq odamning ovozi.
⚠️ Begona odamning ovozini faqat uning roziligi bilan klonlang.

Tavsiya: **Afandi** va **Bekzod** uchun alohida ovoz izlang, chunki standart ovozlarda haqiqiy keksa va bola ovozi yo'q.

## 5. Hissiyot teglari (audio tags)

Matnga inglizcha teg qo'shing. Teg o'qilmaydi va subtitrdan avtomatik olib tashlanadi:

| Teg | Natija |
|---|---|
| `[laughs]` | kuladi |
| `[sighs]` | xo'rsinadi |
| `[excited]` | hayajon bilan |
| `[curious]` | qiziqib |
| `[whispers]` | pichirlab |
| `[sad]` | xafa |
| `[angry]` | jahl bilan |
| `[warmly]` | iliq, mehribon |
| `[hesitant]` | ikkilanib |

Bitta gapga 1 ta teg yetadi. Ko'p qo'shilsa, ovoz g'alati chiqadi.

## 6. Matnni avtomatik tozalash

O'zbekcha matnda TTS'dan oldin quyidagilar avtomatik o'zgartiriladi:
- `25-modda` → "yigirma beshinchi modda", `2026-yil` → "ikki ming yigirma oltinchi yil"
- `15%` → "o'n besh foiz", `1 200 000` → "bir million ikki yuz ming", `2,5` → "ikki butun o'ndan besh"
- `JK`, `FK`, `MK`, `MJtK`, `O'zR`, `BHM`, `IIV` → to'liq nomi
- `o‘ ʻ ’` → bitta apostrof

Yangi qisqartma kerak bo'lsa, `ovozlar.json` → `"qisqartmalar"` ga qo'shing.

## 7. Sozlamalar (`ovozlar.json`)

| Parametr | Ma'nosi |
|---|---|
| `stability` | 0 = ko'proq hissiyot, 1 = bir tekis, robotga o'xshash. 0.5 tavsiya etiladi |
| `similarity_boost` | asl ovozga o'xshashlik (0.75–0.85) |
| `style` | ekspressivlik: Afandi 0.55, Aqlvoy 0.25 |
| `speed` | tezlik (0.7–1.2): Afandi 0.9, Bekzod 1.08 |

Personajning ruscha ovozi boshqacha bo'lsin desangiz: `"voice_id_ru": "..."` qo'shing.

## 8. Kredit tejash

- Bir xil gap qayta so'ralsa, `.ovoz_kesh/` dan olinadi va kredit sarflanmaydi.
- Avval `test` buyrug'i bilan ovozlarni tanlab oling, keyin to'liq sahnalarga o'ting.
- Gapni o'zgartirmasdan faqat videoni qayta yig'sangiz, kredit ketmaydi.

## 9. EasyLaw ilovasiga ulash (studiya ovozi)

Ilovadagi barcha multfilmlar (haftaning multfilmi, kazuslar, darslar, yo'l xaritasi) ElevenLabs ovozi bilan o'ynaydi.
Pleyer har bir replika uchun `dist/audio/<kalit>.mp3` ni qidiradi; fayl bo'lmasa — avvalgidek Claude yoki brauzer ovozi.

```bash
# EasyLaw papkasida:
node oson_ovoz/eksport_replikalar.mjs          # ilovadagi replikalar -> oson_ovoz/replikalar.json
cd oson_ovoz
python oson_ovoz.py ilova weekly-sinov         # avval bitta video (≈1 650 kredit) — sinab ko'ring
python oson_ovoz.py ilova                      # keyin hammasi (≈15 000 kredit)
cd ..
npm run build                                  # dist/index.html studiya ovozini ko'radi
```

- Ilova personajlari qaysi ovoz bilan gapirishi `ovozlar.json` → `ilova_personajlar` da. Ro'yxatdagi birinchi ovozi bor personaj tanlanadi:
  `afandi`→Afandi, `aqlvoy`→Aqlvoy, `bola`→Bekzod, `talabaqiz`/`xodima`→Nilufar, `qoshni`→Qoshni (yo'q bo'lsa Hikoyachi),
  `ishberuvchi`/`hokim`→Ishberuvchi (yo'q bo'lsa Jasur), `inspektor`/`sudya`→Hikoyachi, `sotuvchi`→Jasur.
- Ikki yangi ovoz (ixtiyoriy, tavsiya etiladi): `python oson_ovoz.py dizayn Qoshni`, `python oson_ovoz.py dizayn Ishberuvchi`, keyin `tanla`.
  Ularni `ilova` dan OLDIN yarating — aks holda o'sha replikalar zaxira ovoz bilan yoziladi (qayta yozish uchun `dist/audio` dagi fayllarni o'chiring).
- Hissiyot: replikaning `emotion` maydoni teg bo'ladi (`happy`→`[cheerfully]`, `worried`→`[worried]`, `surprised`→`[surprised]`) — `emotsiya_teglari`.
- Matn yoki yangi video qo'shilsa: yana `eksport_replikalar.mjs` → `ilova` → `npm run build`. Faqat yangi/o'zgargan replikalar yoziladi.
- Saytni joylashda `dist/index.html` bilan birga `dist/audio/` papkasini ham yuklang. Sozlamalar → Ovoz → "Studiya ovozi".
