"""lex.uz bilan ishlash: qidiruv, hujjat matnini olish, moddalarga ajratish, mos moddalarni tanlash."""
from __future__ import annotations

import html
import re
import threading
import time

import requests

BASE = "https://lex.uz"
UA = {"User-Agent": "Mozilla/5.0 (OsonQonun; huquqiy ta'lim loyihasi)", "Accept-Language": "uz,ru;q=0.8,en;q=0.5"}

# Tekshirilgan asosiy hujjatlar (tez topish uchun). Qolganlari lex.uz qidiruvidan topiladi.
ASOSIY = [
    {"id": "-6445145", "title": "O'zbekiston Respublikasi Konstitutsiyasi", "kalit": ["konstitutsiya", "asosiy qonun"]},
    {"id": "-6257288", "title": "O'zbekiston Respublikasining Mehnat kodeksi", "kalit": ["mehnat kodeksi", "mehnat kodeks"]},
    {"id": "-104720", "title": "O'zbekiston Respublikasining Oila kodeksi", "kalit": ["oila kodeksi", "oila kodeks"]},
]

_APOS = re.compile(r"[ʻʼ‘’`´]")


def norm(s: str) -> str:
    return _APOS.sub("'", s or "")


def doc_url(doc_id: str) -> str:
    return f"{BASE}/uz/docs/{doc_id}"


_kesh: dict[str, tuple[float, object]] = {}
_kesh_lock = threading.Lock()


def _keshli(kalit: str, muddat: int, fn):
    now = time.time()
    with _kesh_lock:
        v = _kesh.get(kalit)
        if v and now - v[0] < muddat:
            return v[1]
    natija = fn()
    with _kesh_lock:
        if len(_kesh) > 200:
            _kesh.clear()
        _kesh[kalit] = (now, natija)
    return natija


def _get(url: str, **params) -> str:
    r = requests.get(url, params=params or None, headers=UA, timeout=40)
    r.raise_for_status()
    r.encoding = r.encoding if r.encoding and r.encoding.lower() != "iso-8859-1" else "utf-8"
    return r.text


# ─────────────────────────────── Qidiruv ───────────────────────────────

_LINK = re.compile(r'<a[^>]+href="(?:https?://lex\.uz)?/(?:uz/)?docs/(-?\d+)[^"]*"[^>]*>(.*?)</a>', re.S | re.I)
_TAG = re.compile(r"<[^>]+>")


def qidir(soz: str, sahifa: int = 1) -> list[dict]:
    """lex.uz qidiruvi: [{id, title}] (sana bo'yicha tartiblangan)."""
    def ish():
        h = _get(f"{BASE}/uz/search/nat", query=soz, page=sahifa)
        out, seen = [], set()
        for did, inner in _LINK.findall(h):
            t = re.sub(r"\s+", " ", html.unescape(_TAG.sub(" ", inner))).strip()
            if did in seen or len(t) < 15:
                continue
            seen.add(did)
            out.append({"id": did, "title": norm(t)})
        return out
    return _keshli(f"q:{soz}:{sahifa}", 3600, ish)


_SHOVQIN = ("o'zgartirish", "qo'shimcha", "kiritish to'g'risida", "qarori", "kun bayram", "senat", "palatasi")


def moslik(title: str, soz: str) -> float:
    """Hujjat nomi so'rovga qanchalik mos: so'zlar ustma-ustligi, kodeks/qonun afzal, o'zgartirishlar jarima."""
    t = norm(title).lower()
    q = [w for w in re.findall(r"[a-z'ʻ]+", norm(soz).lower()) if len(w) >= 3]
    if not q:
        return 0.0
    hit = sum(1 for w in q if w[:6] in t)
    s = hit / len(q) * 10
    if re.search(r"\b(kodeksi|konstitutsiyasi|qonuni)\b", t):
        s += 3
    if t.startswith("o'zbekiston respublikasining") and len(t) < 90:
        s += 2
    s -= sum(4 for w in _SHOVQIN if w in t and w not in norm(soz).lower())
    return s


def topish(soz: str, limit: int = 8) -> list[dict]:
    """So'rov bo'yicha eng mos hujjatlar: avval asosiy ro'yxat, keyin lex.uz qidiruvi (2 sahifa)."""
    q = norm(soz).lower()
    natija = [dict(d, ball=100) for d in ASOSIY if any(k in q for k in d["kalit"])]
    try:
        topilgan = qidir(soz, 1) + qidir(soz, 2)
    except requests.RequestException:
        topilgan = []
    for d in topilgan:
        if any(x["id"] == d["id"] for x in natija):
            continue
        natija.append(dict(d, ball=moslik(d["title"], soz)))
    natija.sort(key=lambda d: -d["ball"])
    return natija[:limit]


# ─────────────────────────────── Hujjat ───────────────────────────────

_BLOK = re.compile(r"</(p|div|h\d|li|tr|td|table|section|article)>|<br\s*/?>", re.I)
_MODDA = re.compile(r"^(\d+(?:[-–]\d+)?)[-–]\s?modda(?:\.|$)\s*(.*)$", re.I)
_BOB = re.compile(r"^\d+[-–]\s?(bob|bo'lim|paragraf)\b", re.I)
_IZOH = re.compile(r"(tahririda|tahrirga qarang|bilan o'zgartirilgan|bilan qo'shilgan|bilan chiqarilgan|kuchini yo'qotgan deb topilgan)", re.I)


def matnga(h: str) -> list[str]:
    h = re.sub(r"<(script|style|noscript)[^>]*>.*?</\1>", " ", h, flags=re.S | re.I)
    h = _BLOK.sub("\n", h)
    t = html.unescape(_TAG.sub(" ", h))
    qatorlar = []
    for q in t.split("\n"):
        q = norm(re.sub(r"[ \t\xa0]+", " ", q)).strip()
        if q:
            qatorlar.append(q)
    return qatorlar


def hujjat(doc_id: str) -> dict:
    """{id, url, title, moddalar: [{n, sarlavha, matn}]} — lex.uz dan jonli."""
    if not re.fullmatch(r"-?\d{1,9}", doc_id or ""):
        raise ValueError("Noto'g'ri hujjat raqami")

    def ish():
        qatorlar = matnga(_get(doc_url(doc_id)))
        title = ""
        for q in qatorlar[:400]:
            if re.search(r"(kodeksi|konstitutsiyasi|qonuni|qarori|farmoni|nizom)", q, re.I) and 15 < len(q) < 300:
                title = q
                break
        moddalar: dict[str, dict] = {}
        joriy = None
        for q in qatorlar:
            m = _MODDA.match(q)
            if m:
                joriy = {"n": m.group(1).replace("–", "-"), "sarlavha": m.group(2).strip(), "qism": []}
                old = moddalar.get(joriy["n"])
                if old is None or not old["qism"]:
                    moddalar[joriy["n"]] = joriy  # mundarijadagi bo'sh nusxa o'rniga matnlisini olamiz
                else:
                    joriy = {"n": joriy["n"], "sarlavha": joriy["sarlavha"], "qism": []}  # takror — tashlab yuboriladi
                continue
            if _BOB.match(q):
                joriy = None
                continue
            if joriy is not None and not _IZOH.search(q) and len(joriy["qism"]) < 60:
                joriy["qism"].append(q)
        royxat = [{"n": m["n"], "sarlavha": m["sarlavha"], "matn": "\n".join(m["qism"]).strip()}
                  for m in moddalar.values() if m["qism"]]
        return {"id": doc_id, "url": doc_url(doc_id), "title": title, "moddalar": royxat}

    return _keshli(f"d:{doc_id}", 6 * 3600, ish)


def _ildiz(w: str) -> str:
    return w[:5] if len(w) > 5 else w


_STOP = set("va bilan uchun haqida qanday qaysi nima bu shu bo'lsa bo'ladi kerak mumkin ham yoki agar men meni mening kim".split())


def tanlash(h: dict, soz: str, raqamlar: list[str] | None = None, maks_harf: int = 7000) -> list[dict]:
    """So'rovga eng mos moddalar. Aniq raqam berilgan bo'lsa — ular, aks holda so'zlar bo'yicha."""
    mod = h["moddalar"]
    if not mod:
        return []
    soz_n = norm(soz).lower()
    aniq = [r for r in re.findall(r"(\d+)\s*[-–]\s*modda", soz_n)]
    kerak = [str(r) for r in (raqamlar or [])] + aniq
    tanlangan = [m for m in mod if m["n"] in kerak]
    if not tanlangan:
        sozlar = {_ildiz(w) for w in re.findall(r"[a-z']+", soz_n) if len(w) >= 3 and w not in _STOP}
        def ball(m):
            sar = m["sarlavha"].lower()
            mat = m["matn"].lower()
            return sum(4 * (w in sar) + min(3, mat.count(w)) for w in sozlar)
        tanlangan = [m for m in sorted(mod, key=ball, reverse=True)[:4] if ball(m) > 0] or mod[:3]
    out, jami = [], 0
    for m in tanlangan[:5]:
        if jami + len(m["matn"]) > maks_harf and out:
            break
        out.append(m)
        jami += len(m["matn"])
    return out
