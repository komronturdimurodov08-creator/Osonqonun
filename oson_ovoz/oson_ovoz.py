"""
oson_ovoz.py — OsonQonun / LexCartoon AI uchun ElevenLabs ovoz moduli
=====================================================================

edge-tts o'rniga ElevenLabs (Eleven v4) bilan professional ovoz beradi.

Imkoniyatlar:
  * 5 personaj (Aqlvoy, Jasur, Nilufar, Bekzod, Afandi) + Hikoyachi — har biriga
    alohida ovoz va sozlama (ovozlar.json)
  * O'zbekcha matnni TTS dan oldin tozalash: raqamlar → so'z, qisqartmalar → to'liq
  * Kesh: bir xil gap qayta yuborilmaydi (kredit tejaladi)
  * Sahna: har bir replika alohida mp3 + butun sahna bitta mp3 + SRT subtitr + timing JSON
  * Xatoda qayta urinish (429/5xx)

Ishlatish (terminal):
  python oson_ovoz.py dizayn                  # 1-QADAM: har personajga o'zbekcha ovoz yaratish (3 tadan variant)
  python oson_ovoz.py dizayn Afandi           #          faqat bitta personaj uchun
  python oson_ovoz.py tanla Afandi 2          # 2-QADAM: yoqqan variantni saqlash (ovozlar.json avtomatik yangilanadi)
  python oson_ovoz.py ilova                   # 3-QADAM: ilovadagi BARCHA multfilmlarni ovozlashtirish -> dist/audio/
  python oson_ovoz.py ilova weekly-sinov      #          faqat bitta video (arzon sinov uchun)
  python oson_ovoz.py voices                  # akkauntingizdagi ovozlar ro'yxati (voice_id)
  python oson_ovoz.py test                    # har bir personajdan namuna ovoz
  python oson_ovoz.py scene namuna_ssenariy.json   # butun sahnani ovozlashtirish

Dasturdan (Streamlit / pipeline):
  from oson_ovoz import OsonOvoz
  ovoz = OsonOvoz()
  ovoz.say("Afandi", "[laughs] Qonunni bilmaslik javobgarlikdan ozod qilmaydi!", "out/afandi.mp3")
  natija = ovoz.scene("namuna_ssenariy.json")      # yoki dict berish mumkin

Talablar: Python 3.9+, `pip install requests`, ffmpeg (sahnani birlashtirish uchun).
API kalit: ELEVENLABS_API_KEY muhit o'zgaruvchisi yoki shu papkadagi .env fayl.
"""

from __future__ import annotations

import hashlib
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile
import time
from pathlib import Path
from typing import Any

import requests

API_BASE = "https://api.elevenlabs.io/v1"
HERE = Path(__file__).resolve().parent


# ─────────────────────────────────────────────────────────────────────────────
# 1. O'zbekcha matnni tayyorlash (raqam → so'z, qisqartmalar)
# ─────────────────────────────────────────────────────────────────────────────

_BIRLAR = ["nol", "bir", "ikki", "uch", "to'rt", "besh", "olti", "yetti", "sakkiz", "to'qqiz"]
_ONLAR = ["", "o'n", "yigirma", "o'ttiz", "qirq", "ellik", "oltmish", "yetmish", "sakson", "to'qson"]
_KATTA = [(10**9, "milliard"), (10**6, "million"), (10**3, "ming")]


def _uchlik(n: int) -> str:
    """0..999 ni so'zga aylantiradi (0 bo'lsa bo'sh)."""
    qism = []
    yuz, qoldiq = divmod(n, 100)
    if yuz:
        qism.append("yuz" if yuz == 1 else f"{_BIRLAR[yuz]} yuz")
    on, bir = divmod(qoldiq, 10)
    if on:
        qism.append(_ONLAR[on])
    if bir:
        qism.append(_BIRLAR[bir])
    return " ".join(qism)


def son_soz(n: int) -> str:
    """Butun sonni o'zbekcha so'z bilan yozadi: 2026 → 'ikki ming yigirma olti'."""
    if n == 0:
        return "nol"
    if n < 0:
        return "minus " + son_soz(-n)
    qism = []
    for qiymat, nom in _KATTA:
        k, n = divmod(n, qiymat)
        if k:
            qism.append(nom if (k == 1 and nom == "ming") else f"{_uchlik(k) if k < 1000 else son_soz(k)} {nom}")
    if n:
        qism.append(_uchlik(n))
    return " ".join(qism)


def tartib_son(n: int) -> str:
    """Tartib son: 1 → 'birinchi', 2026 → 'ikki ming yigirma oltinchi'."""
    soz = son_soz(n)
    return soz + ("nchi" if soz[-1] in "aeiou" else "inchi")


# Qisqartmalar — o'zingiz qo'shishingiz mumkin (ovozlar.json → "qisqartmalar")
QISQARTMALAR_DEFAULT = {
    "O'zR": "O'zbekiston Respublikasi",
    "JK": "Jinoyat kodeksi",
    "JPK": "Jinoyat-protsessual kodeksi",
    "FK": "Fuqarolik kodeksi",
    "MK": "Mehnat kodeksi",
    "MJtK": "Ma'muriy javobgarlik to'g'risidagi kodeks",
    "IIV": "Ichki ishlar vazirligi",
    "IIB": "Ichki ishlar boshqarmasi",
    "BHM": "bazaviy hisoblash miqdori",
    "AQSh": "Amerika Qo'shma Shtatlari",
    "va h.k.": "va hokazo",
}

# Tartib son bilan keladigan so'zlar: "25-modda" → "yigirma beshinchi modda"
_TARTIB_SOZLAR = r"(yil|yilda|yildan|yilgi|modda|moddasi|moddasiga|moddasida|band|bandi|bandida|qism|qismi|qismida|sinf|sinfda|bob|bobi|son|soni|sonli|kun|kuni|oy|asr|asrda|o'rin|o'rinni|qavat|xona|maktab)"


def _apostrof(matn: str) -> str:
    # o‘ g‘ ʻ ’ ` kabi turli belgilarni bitta oddiy apostrofga keltiradi
    return re.sub(r"[‘’ʻʼ`´]", "'", matn)


def matnni_tayyorla(matn: str, til: str = "uz", qisqartmalar: dict[str, str] | None = None) -> str:
    """TTS ga yuborishdan oldin matnni tozalaydi. [audio teglar] ga tegmaydi."""
    matn = _apostrof(matn)
    if til != "uz":
        return re.sub(r"\s+", " ", matn).strip()

    q = dict(QISQARTMALAR_DEFAULT)
    if qisqartmalar:
        q.update(qisqartmalar)
    # Uzunlari birinchi almashtiriladi (masalan "JPK" "JK" dan oldin)
    for qisqa in sorted(q, key=len, reverse=True):
        toliq = q[qisqa]
        if qisqa.endswith("."):
            matn = re.sub(rf"(?<=\d)\s*{re.escape(qisqa)}|(?<!\w){re.escape(qisqa)}(?=\s)", " " + toliq, matn)
        else:
            matn = re.sub(rf"(?<![\w']){re.escape(qisqa)}(?![\w'])", toliq, matn)

    # 25-modda / 2026-yil → tartib son
    matn = re.sub(
        rf"(\d+)\s*-\s*{_TARTIB_SOZLAR}\b",
        lambda m: f"{tartib_son(int(m.group(1)))} {m.group(2)}",
        matn,
    )
    # Ordinal yolg'iz: "3-" → "uchinchi"
    matn = re.sub(r"\b(\d+)-(?=\s)", lambda m: tartib_son(int(m.group(1))), matn)
    # O'nli kasr: 2,5 yoki 2.5 → "ikki butun o'ndan besh"
    def _kasr(m: re.Match) -> str:
        butun, kasr = m.group(1), m.group(2)
        maxraj = {1: "o'ndan", 2: "yuzdan", 3: "mingdan"}.get(len(kasr))
        if not maxraj:
            return m.group(0)
        return f"{son_soz(int(butun))} butun {maxraj} {son_soz(int(kasr))}"
    matn = re.sub(r"\b(\d+)[.,](\d{1,3})\b", _kasr, matn)
    # Foiz: 15% → "o'n besh foiz"
    matn = re.sub(r"(\d+)\s*%", lambda m: f"{son_soz(int(m.group(1)))} foiz", matn)
    # Ming ajratgichli sonlar: 1 200 000 yoki 1.200.000
    matn = re.sub(r"\b\d{1,3}(?:[ .]\d{3})+\b", lambda m: son_soz(int(re.sub(r"[ .]", "", m.group(0)))), matn)
    # Qolgan butun sonlar
    matn = re.sub(r"\b\d+\b", lambda m: son_soz(int(m.group(0))), matn)
    # FHDYo kabi harflab o'qiladiganlar
    matn = matn.replace("FHDYo", "Fe-Ha-De-Yo")
    return re.sub(r"\s+", " ", matn).strip()


# ─────────────────────────────────────────────────────────────────────────────
# 2. ElevenLabs bilan ishlash
# ─────────────────────────────────────────────────────────────────────────────

def _env_yukla() -> None:
    """Shu papkadagi .env faylni o'qiydi (python-dotenv shart emas)."""
    for yol in (Path.cwd() / ".env", HERE / ".env"):
        if yol.exists():
            for qator in yol.read_text(encoding="utf-8").splitlines():
                qator = qator.strip()
                if qator and not qator.startswith("#") and "=" in qator:
                    k, v = qator.split("=", 1)
                    os.environ.setdefault(k.strip(), v.strip().strip('"').strip("'"))
            break


def _bor_voice(p: dict) -> bool:
    vid = p.get("voice_id") or ""
    return bool(vid) and not vid.startswith("SHU_YERGA")


def audio_kalit(speaker: str, matn: str) -> str:
    """Ilova bilan bir xil kalit (FNV-1a 32-bit, UTF-8): core.js dagi ElevenAudio.key bilan mos."""
    h = 0x811C9DC5
    for b in (speaker + "|" + matn).encode("utf-8"):
        h ^= b
        h = (h * 0x01000193) & 0xFFFFFFFF
    return f"{h:08x}"


class OvozXatosi(RuntimeError):
    pass


class OsonOvoz:
    def __init__(
        self,
        config: str | Path | dict | None = None,
        api_key: str | None = None,
        kesh_papka: str | Path | None = None,
    ):
        _env_yukla()
        self.api_key = api_key or os.getenv("ELEVENLABS_API_KEY")
        if not self.api_key:
            raise OvozXatosi("ELEVENLABS_API_KEY topilmadi. .env faylga yozing: ELEVENLABS_API_KEY=sk_...")

        if config is None:
            config = HERE / "ovozlar.json"
        if isinstance(config, (str, Path)):
            config = json.loads(Path(config).read_text(encoding="utf-8"))
        self.cfg: dict[str, Any] = config

        self.model = self.cfg.get("model", "eleven_v4")
        self.format = self.cfg.get("output_format", "mp3_44100_192")
        self.personajlar: dict[str, dict] = self.cfg["personajlar"]
        self.qisqartmalar = self.cfg.get("qisqartmalar", {})
        self.kesh = Path(kesh_papka or self.cfg.get("kesh_papka", HERE / ".ovoz_kesh"))
        self.kesh.mkdir(parents=True, exist_ok=True)
        self._oddiy = False
        self.s = requests.Session()
        self.s.headers.update({"xi-api-key": self.api_key})

    # — yordamchi —
    def _personaj(self, nom: str) -> dict:
        for k, v in self.personajlar.items():
            if k.lower() == nom.lower() or nom.lower() in [a.lower() for a in v.get("aliases", [])]:
                return v
        raise OvozXatosi(f"'{nom}' personaji ovozlar.json da yo'q. Bor personajlar: {', '.join(self.personajlar)}")

    def _voice_id(self, p: dict, til: str) -> str:
        vid = p.get(f"voice_id_{til}") or p.get("voice_id")
        if not vid or not _bor_voice({"voice_id": vid}):
            raise OvozXatosi("Personaj uchun voice_id kiritilmagan (ovozlar.json).")
        return vid

    def _post(self, url: str, body: dict, urinish: int = 4) -> bytes:
        for i in range(urinish):
            r = self.s.post(url, params={"output_format": self.format}, json=body, timeout=120)
            if r.status_code == 200:
                return r.content
            if r.status_code in (429, 500, 502, 503, 504) and i < urinish - 1:
                time.sleep(2 ** i * 2)
                continue
            raise OvozXatosi(f"ElevenLabs xatosi {r.status_code}: {r.text[:400]}")
        raise OvozXatosi("ElevenLabs javob bermadi")

    # — asosiy funksiya: bitta gap —
    def say(self, personaj: str, matn: str, chiqish: str | Path, til: str = "uz", **sozlama) -> Path:
        """Bitta replikani ovozlashtiradi va mp3 saqlaydi."""
        p = self._personaj(personaj)
        vid = self._voice_id(p, til)
        tayyor = matnni_tayyorla(matn, til, self.qisqartmalar)

        vs = dict(self.cfg.get("default_settings", {}))
        vs.update(p.get("settings", {}))
        vs.update(sozlama)

        if self._oddiy:
            vs = {k: v for k, v in vs.items() if k in ("stability", "similarity_boost")}
        body: dict[str, Any] = {"text": tayyor, "model_id": self.model, "voice_settings": vs}
        if self.cfg.get("language_code", True) and not self._oddiy:
            body["language_code"] = til

        kalit = hashlib.sha256(json.dumps([vid, body, self.format], sort_keys=True, ensure_ascii=False).encode()).hexdigest()[:20]
        kesh_fayl = self.kesh / f"{kalit}.mp3"
        chiqish = Path(chiqish)
        chiqish.parent.mkdir(parents=True, exist_ok=True)

        if not kesh_fayl.exists():
            url = f"{API_BASE}/text-to-speech/{vid}"
            try:
                audio = self._post(url, body)
            except OvozXatosi as e:
                # Model ba'zi parametrlarni qabul qilmasa — soddaroq so'rov bilan qayta urinish
                if " 400" in str(e) or " 422" in str(e):
                    body.pop("language_code", None)
                    body["voice_settings"] = {k: v for k, v in vs.items() if k in ("stability", "similarity_boost")}
                    audio = self._post(url, body)
                    self._oddiy = True  # keyingi so'rovlar darhol soddaroq yuboriladi
                    print("  ! Model qo'shimcha sozlamalarni qabul qilmadi — oddiy rejimga o'tildi")
                else:
                    raise
            kesh_fayl.write_bytes(audio)
        shutil.copyfile(kesh_fayl, chiqish)
        return chiqish

    # — sahna: ko'p replika —
    def scene(self, ssenariy: str | Path | dict, chiqish_papka: str | Path | None = None) -> dict:
        """
        Ssenariy formati (JSON):
        {
          "nomi": "1-sahna",
          "til": "uz",
          "orqa_pauza": 0.35,
          "replikalar": [
            {"personaj": "Afandi", "matn": "[laughs] Assalomu alaykum!", "pauza": 0.5},
            ...
          ]
        }
        Natija: {"audio": sahna.mp3, "srt": ..., "timing": ..., "replikalar": [...]}
        """
        if isinstance(ssenariy, (str, Path)):
            ssenariy = json.loads(Path(ssenariy).read_text(encoding="utf-8"))
        nomi = re.sub(r"[^\w\-]+", "_", ssenariy.get("nomi", "sahna"))
        til = ssenariy.get("til", "uz")
        default_pauza = float(ssenariy.get("orqa_pauza", 0.35))
        papka = Path(chiqish_papka or Path("ovoz_natija") / nomi)
        papka.mkdir(parents=True, exist_ok=True)

        fayllar, timing, vaqt = [], [], 0.0
        for i, r in enumerate(ssenariy["replikalar"], 1):
            r_til = r.get("til", til)
            fayl = papka / f"{i:03d}_{r['personaj']}.mp3"
            print(f"  [{i}/{len(ssenariy['replikalar'])}] {r['personaj']}: {r['matn'][:60]}")
            self.say(r["personaj"], r["matn"], fayl, til=r_til, **r.get("settings", {}))
            dav = _davomiylik(fayl)
            timing.append({
                "n": i, "personaj": r["personaj"], "matn": _teglarsiz(r["matn"]),
                "fayl": str(fayl), "boshlanish": round(vaqt, 3), "tugash": round(vaqt + dav, 3),
            })
            pauza = float(r.get("pauza", default_pauza))
            fayllar.append((fayl, pauza))
            vaqt += dav + pauza

        sahna_mp3 = papka / f"{nomi}.mp3"
        _birlashtir(fayllar, sahna_mp3)
        srt = papka / f"{nomi}.srt"
        srt.write_text(_srt(timing), encoding="utf-8")
        tjson = papka / f"{nomi}_timing.json"
        tjson.write_text(json.dumps(timing, ensure_ascii=False, indent=2), encoding="utf-8")
        print(f"✓ Tayyor: {sahna_mp3}  ({vaqt:.1f} s)")
        return {"audio": str(sahna_mp3), "srt": str(srt), "timing": str(tjson), "replikalar": timing}

    # — Voice Design: prompt bo'yicha yangi ovoz yaratish —
    def dizayn(self, faqat: str | None = None, papka: str | Path = "ovoz_dizayn") -> None:
        """Har bir personaj uchun promptdan 3 ta ovoz varianti yaratadi va mp3 qilib saqlaydi."""
        import base64
        papka = Path(papka)
        papka.mkdir(parents=True, exist_ok=True)
        natija_fayl = papka / "dizayn_natija.json"
        natija = json.loads(natija_fayl.read_text(encoding="utf-8")) if natija_fayl.exists() else {}

        for nom, p in self.personajlar.items():
            if faqat and nom.lower() != faqat.lower():
                continue
            if not faqat and _bor_voice(p):
                print(f"  - {nom}: ovozi allaqachon bor, o'tkazib yuborildi (qayta yaratish: dizayn {nom})")
                continue
            if not p.get("prompt"):
                print(f"  - {nom}: ovozlar.json da 'prompt' yo'q, o'tkazib yuborildi")
                continue
            matn = matnni_tayyorla(p.get("dizayn_matn") or p.get("namuna", ""), "uz", self.qisqartmalar)
            if len(matn) < 100:  # API kamida 100 harf talab qiladi
                matn = (matn + " " + "Assalomu alaykum, aziz tomoshabinlar! Bugun siz bilan qonun haqida oddiy tilda gaplashamiz.")[:1000]
            body = {"voice_description": p["prompt"], "model_id": self.cfg.get("dizayn_model", "eleven_ttv_v3"), "text": matn}
            print(f"  ... {nom}: ovoz yaratilmoqda")
            try:
                r = self.s.post(f"{API_BASE}/text-to-voice/design", json=body, timeout=180)
                if r.status_code == 422 and body["model_id"] != "eleven_multilingual_ttv_v2":
                    body["model_id"] = "eleven_multilingual_ttv_v2"
                    r = self.s.post(f"{API_BASE}/text-to-voice/design", json=body, timeout=180)
                if r.status_code != 200:
                    raise OvozXatosi(f"{r.status_code}: {r.text[:300]}")
            except (OvozXatosi, requests.RequestException) as e:
                print(f"  ✗ {nom}: {e}")
                continue
            variantlar = []
            for i, pv in enumerate(r.json().get("previews", []), 1):
                ext = "wav" if "wav" in (pv.get("media_type") or "") else "mp3"
                f = papka / f"{nom}_{i}.{ext}"
                f.write_bytes(base64.b64decode(pv["audio_base_64"]))
                variantlar.append({"n": i, "generated_voice_id": pv["generated_voice_id"], "fayl": str(f)})
                print(f"  ✓ {nom} variant {i} → {f}")
            natija[nom] = {"prompt": p["prompt"], "variantlar": variantlar}
            natija_fayl.write_text(json.dumps(natija, ensure_ascii=False, indent=2), encoding="utf-8")
        print(f"\nVariantlarni tinglang ({papka}/), keyin: python oson_ovoz.py tanla <Personaj> <raqam>")

    def tanla(self, nom: str, raqam: int, papka: str | Path = "ovoz_dizayn", config_fayl: str | Path | None = None) -> str:
        """Tanlangan variantni akkauntga ovoz sifatida saqlaydi va ovozlar.json ga voice_id ni yozadi."""
        natija = json.loads((Path(papka) / "dizayn_natija.json").read_text(encoding="utf-8"))
        kalit = next((k for k in natija if k.lower() == nom.lower()), None)
        if not kalit:
            raise OvozXatosi(f"{nom} uchun dizayn topilmadi. Avval: python oson_ovoz.py dizayn {nom}")
        v = next((x for x in natija[kalit]["variantlar"] if x["n"] == raqam), None)
        if not v:
            raise OvozXatosi(f"{kalit} uchun {raqam}-variant yo'q")
        body = {
            "voice_name": f"OQ_{kalit}",
            "voice_description": natija[kalit]["prompt"][:1000],
            "generated_voice_id": v["generated_voice_id"],
            "labels": {"loyiha": "OsonQonun", "personaj": kalit},
        }
        r = self.s.post(f"{API_BASE}/text-to-voice", json=body, timeout=120)
        if r.status_code != 200:
            raise OvozXatosi(f"Ovozni saqlashda xato {r.status_code}: {r.text[:300]}")
        vid = r.json()["voice_id"]
        # ovozlar.json ni yangilash
        cfg_yol = Path(config_fayl or HERE / "ovozlar.json")
        cfg = json.loads(cfg_yol.read_text(encoding="utf-8"))
        cfg["personajlar"][kalit]["voice_id"] = vid
        cfg_yol.write_text(json.dumps(cfg, ensure_ascii=False, indent=2), encoding="utf-8")
        self.personajlar[kalit]["voice_id"] = vid
        print(f"✓ OQ_{kalit} saqlandi (voice_id: {vid}) va ovozlar.json yangilandi")
        return vid

    # — Ilova (EasyLaw) uchun: barcha multfilm replikalarini ovozlashtirish —
    def ilova(self, faqat: str | None = None, replikalar: str | Path | None = None,
              chiqish: str | Path | None = None, tasdiq: bool = True) -> None:
        """replikalar.json dagi har bir replikani personajiga mos ovoz bilan dist/audio/<kalit>.mp3 ga yozadi."""
        rep_yol = Path(replikalar or HERE / "replikalar.json")
        if not rep_yol.exists():
            raise OvozXatosi("replikalar.json yo'q. Avval EasyLaw papkasida: node oson_ovoz/eksport_replikalar.mjs")
        data = json.loads(rep_yol.read_text(encoding="utf-8"))
        papka = Path(chiqish or HERE.parent / "dist" / "audio")
        papka.mkdir(parents=True, exist_ok=True)
        xarita = self.cfg.get("ilova_personajlar", {})
        teglar = self.cfg.get("emotsiya_teglari", {})

        ish = []
        for ln in data["lines"]:
            if faqat and ln["script"] != faqat:
                continue
            f = papka / f"{audio_kalit(ln['speaker'], ln['text'])}.mp3"
            if not f.exists():
                ish.append((ln, f))
        if not ish:
            print("✓ Hammasi allaqachon tayyor, yangi ovoz kerak emas.")
            return
        harf = sum(len(ln["speakable"]) for ln, _ in ish)
        print(f"Ovozlashtiriladi: {len(ish)} ta replika, ≈{harf} harf (≈{int(harf * 1.2)} kredit).")
        if tasdiq and input("Davom etamizmi? (ha/yo'q): ").strip().lower() not in ("ha", "h", "y", "yes"):
            print("Bekor qilindi.")
            return
        for i, (ln, f) in enumerate(ish, 1):
            personaj = self._ilova_personaj(ln["speaker"], xarita)
            matn = (teglar.get(ln.get("emotion", ""), "") + " " + ln["speakable"]).strip()
            print(f"  [{i}/{len(ish)}] {ln['speaker']} → {personaj}: {ln['speakable'][:55]}")
            self.say(personaj, matn, f, til="uz")
        print(f"✓ Tayyor: {papka}. Endi EasyLaw papkasida: npm run build")

    def _ilova_personaj(self, speaker: str, xarita: dict) -> str:
        """Ilova personaji (afandi, qoshni...) uchun ovozi bor birinchi personajni tanlaydi."""
        nomzodlar = xarita.get(speaker) or ["Hikoyachi"]
        if isinstance(nomzodlar, str):
            nomzodlar = [nomzodlar]
        for nom in nomzodlar:
            p = self.personajlar.get(nom)
            if p and _bor_voice(p):
                return nom
        raise OvozXatosi(f"'{speaker}' uchun ovoz topilmadi (ovozlar.json → ilova_personajlar)")

    # — akkauntdagi ovozlar —
    def voices(self) -> list[dict]:
        r = self.s.get(f"{API_BASE}/voices", timeout=60)
        if r.status_code != 200:
            raise OvozXatosi(f"Ovozlarni olishda xato {r.status_code}: {r.text[:300]}")
        return r.json().get("voices", [])

    def test(self, papka: str | Path = "ovoz_test") -> None:
        for nom, p in self.personajlar.items():
            namuna = p.get("namuna", "Assalomu alaykum! Bugun siz bilan qonun haqida gaplashamiz.")
            for til in p.get("tillar", ["uz"]):
                try:
                    f = self.say(nom, namuna if til == "uz" else p.get("namuna_ru", namuna), Path(papka) / f"{nom}_{til}.mp3", til=til)
                    print(f"  ✓ {nom} ({til}) → {f}")
                except OvozXatosi as e:
                    print(f"  ✗ {nom} ({til}): {e}")


# ─────────────────────────────────────────────────────────────────────────────
# 3. Audio yordamchilar (ffmpeg)
# ─────────────────────────────────────────────────────────────────────────────

def _teglarsiz(matn: str) -> str:
    """Subtitr uchun [laughs] kabi audio teglarni olib tashlaydi."""
    return re.sub(r"\s+", " ", re.sub(r"\[[^\]]*\]", "", matn)).strip()


def _davomiylik(fayl: Path) -> float:
    out = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "default=nw=1:nk=1", str(fayl)],
        capture_output=True, text=True, check=True,
    )
    return float(out.stdout.strip())


def _birlashtir(fayllar: list[tuple[Path, float]], chiqish: Path) -> None:
    """Replikalarni pauzalar bilan bitta faylga yig'adi va ovoz balandligini tekislaydi."""
    if not shutil.which("ffmpeg"):
        raise OvozXatosi("ffmpeg topilmadi — o'rnating (https://ffmpeg.org)")
    with tempfile.TemporaryDirectory() as td:
        royxat = Path(td) / "list.txt"
        qatorlar = []
        for i, (f, pauza) in enumerate(fayllar):
            qatorlar.append(f"file '{Path(f).resolve().as_posix()}'")
            if pauza > 0 and i < len(fayllar) - 1:
                jim = Path(td) / f"jim_{i}.mp3"
                subprocess.run(
                    ["ffmpeg", "-y", "-loglevel", "error", "-f", "lavfi", "-i", "anullsrc=r=44100:cl=mono",
                     "-t", f"{pauza:.3f}", "-c:a", "libmp3lame", "-b:a", "192k", str(jim)],
                    check=True,
                )
                qatorlar.append(f"file '{jim.as_posix()}'")
        royxat.write_text("\n".join(qatorlar), encoding="utf-8")
        subprocess.run(
            ["ffmpeg", "-y", "-loglevel", "error", "-f", "concat", "-safe", "0", "-i", str(royxat),
             "-af", "aresample=44100,loudnorm=I=-16:TP=-1.5:LRA=11",  # YouTube/Instagram standarti
             "-ac", "1", "-c:a", "libmp3lame", "-b:a", "192k", str(chiqish)],
            check=True,
        )


def _srt_vaqt(s: float) -> str:
    ms = int(round(s * 1000))
    h, ms = divmod(ms, 3_600_000)
    m, ms = divmod(ms, 60_000)
    sec, ms = divmod(ms, 1000)
    return f"{h:02d}:{m:02d}:{sec:02d},{ms:03d}"


def _srt(timing: list[dict]) -> str:
    bloklar = []
    for t in timing:
        bloklar.append(f"{t['n']}\n{_srt_vaqt(t['boshlanish'])} --> {_srt_vaqt(t['tugash'])}\n{t['personaj']}: {t['matn']}\n")
    return "\n".join(bloklar)


# ─────────────────────────────────────────────────────────────────────────────
# 4. Terminal
# ─────────────────────────────────────────────────────────────────────────────

def main(argv: list[str]) -> int:
    if len(argv) < 2 or argv[1] not in ("voices", "test", "scene", "matn", "dizayn", "tanla", "ilova"):
        print(__doc__)
        return 1
    buyruq = argv[1]
    if buyruq == "matn":  # API siz: matn qanday tayyorlanishini ko'rish
        print(matnni_tayyorla(" ".join(argv[2:])))
        return 0
    ovoz = OsonOvoz()
    if buyruq == "voices":
        for v in ovoz.voices():
            labels = v.get("labels") or {}
            print(f"{v['voice_id']}  |  {v['name']:<28} | {v.get('category', ''):<12} | "
                  f"{labels.get('gender', '')} {labels.get('age', '')} {labels.get('accent', '')} {labels.get('language', '')}")
    elif buyruq == "test":
        ovoz.test()
    elif buyruq == "ilova":
        ovoz.ilova(argv[2] if len(argv) > 2 and not argv[2].startswith("-") else None, tasdiq="--ha" not in argv)
    elif buyruq == "dizayn":
        ovoz.dizayn(argv[2] if len(argv) > 2 else None)
    elif buyruq == "tanla":
        if len(argv) < 4:
            print("Masalan: python oson_ovoz.py tanla Afandi 2")
            return 1
        ovoz.tanla(argv[2], int(argv[3]))
    elif buyruq == "scene":
        if len(argv) < 3:
            print("Ssenariy faylini bering: python oson_ovoz.py scene namuna_ssenariy.json")
            return 1
        ovoz.scene(argv[2])
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
