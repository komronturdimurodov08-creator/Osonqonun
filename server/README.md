# OsonQonun server

Foydalanuvchi hujjat yoki savol yozadi → server **lex.uz** dan hujjatni topadi va rasmiy matnini oladi → mos moddalarni ajratadi → **Gemini** ulardan multfilm ssenariysini yozadi → personajlar **ElevenLabs** ovozida gapiradi. Ilovaning o'zi (`dist/`) ham shu serverdan ochiladi.

## Kompyuterda ishga tushirish

```bash
# EasyLaw papkasida
npm run build                 # dist/index.html yangilanadi
python server/server.py       # http://localhost:8000
```
Kalitlar `.env` faylidan o'qiladi (EasyLaw yoki oson_ovoz papkasidagi):
```
GEMINI_API_KEY=...            # https://aistudio.google.com/apikey
ELEVENLABS_API_KEY=sk_...
```
Brauzerda `http://localhost:8000` → Multfilm yasash → **lex.uz dan qidirish**.

## Internetga joylash (Render.com, bepul)

1. `npm run build`, keyin `dist/` ni commit qilib GitHub'ga push qiling (server tayyor `dist/index.html` ni ko'rsatadi).
2. render.com → GitHub bilan kiring → **New → Blueprint** → `Osonqonun` reposi → `render.yaml` topiladi.
3. So'ralganda `GEMINI_API_KEY` va `ELEVENLABS_API_KEY` ni kiriting → **Apply**.
4. 3–5 daqiqada `https://osonqonun.onrender.com` kabi havola tayyor bo'ladi.

Bepul tarifda server 15 daqiqa ishlatilmasa "uxlaydi", keyingi ochilish ~1 daqiqa oladi. Hakamlarga ko'rsatishdan oldin havolani bir marta ochib qo'ying.

## API

| Yo'l | Vazifa |
|---|---|
| `GET /api/holat` | server, AI va ovoz holati |
| `GET /api/qidir?q=...` | Gemini tavsiyasi + lex.uz qidiruvi → hujjatlar ro'yxati |
| `POST /api/multfilm` `{id, q, daraja, moddalar?}` | lex.uz matni → moddalar → Gemini ssenariy (+ ovoz kalitlari) |
| `GET /api/ovoz/<kalit>` | replika mp3 (ElevenLabs, keshlanadi) |

Himoya: ovoz faqat server imzolagan replikalar uchun beriladi (begona matnni o'qitib bo'lmaydi), kunlik ovoz limiti (`MAX_TTS_HARF_KUN`), har IP uchun soatlik multfilm limiti (`MAX_MULTFILM_SOAT`).

## Cheklovlar

- lex.uz ning rasmiy API'si yo'q: server sayt sahifalarini o'qiydi. Sayt tuzilishi o'zgarsa, `server/lex.py` ni moslash kerak bo'ladi.
- lex.uz qidiruvi natijalarni sana bo'yicha beradi, shuning uchun erkin savollarda hujjatni avval Gemini taklif qiladi, keyin u lex.uz da tekshiriladi.
- Ssenariy faqat lex.uz dan olingan moddalarga tayanadi; matnda yo'q modda raqami ekranga chiqmaydi. Baribir videolar yurist tekshiruvidan o'tishi kerak.
