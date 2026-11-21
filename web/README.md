# OsonQonun — veb-interfeys (statik HTML/CSS/JS)

My.gov.uz uslubidagi rasmiy dizayn tizimi va bosh sahifa. Kutubxonasiz, build talab qilmaydi.

## Tuzilma

```
index.html               Bosh sahifa: utility bar, header, hero-qidiruv, yo‘nalishlar, footer
assets/css/tokens.css    Dizayn tokenlari: ranglar, shriftlar, o‘lchamlar (:root)
assets/css/style.css     Asos, tipografiya, komponentlar, bo‘limlar, responsive
assets/js/main.js        Mobil menyu, shrift o‘lchami, qidiruv chiplari
pages/                   Keyingi bosqich: qonunlar, soha, modda o‘qish sahifalari
```

## Ishga tushirish

`index.html` ni brauzerda oching. Yoki lokal server: `python3 -m http.server 8000`.

## Qoidalar

- Rang va o‘lchamlar faqat `tokens.css` dagi o‘zgaruvchilar orqali ishlatiladi.
- `--accent-blue` (#0284C7) va `--accent-gold` (#C59B27) oq fonda matn uchun ishlatilmaydi
  (kontrast 4.1:1 va 2.6:1). Matn uchun `--accent-blue-strong` va `--accent-gold-ink`.
- `--text-muted` faqat oq fonda (`--surface-subtle` ustida 4.4:1 — chegaradan past).
- Qonun matni uchun `.prose` klassi: 18px, line-height 1.7, max-width 72ch.
- Hujjat raqami va modda indeksi uchun `.doc-ref` (JetBrains Mono).
