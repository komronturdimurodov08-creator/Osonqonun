"""Gemini: so'rovni hujjatga yo'naltirish va lex.uz moddalaridan multfilm ssenariysi yozish."""
from __future__ import annotations

import json
import os
import re

import requests

API = "https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"
# Birinchisi ishlamasa (model nomi eskirgan bo'lsa) keyingisiga o'tamiz
# Lite modellar tez javob beradi (ssenariy uchun yetarli); ular bo'lmasa — kattaroq modellar
MODELLAR = [m for m in [os.getenv("GEMINI_MODEL"), "gemini-flash-lite-latest", "gemini-3.5-flash-lite", "gemini-3.1-flash-lite",
                        "gemini-flash-latest", "gemini-3.5-flash"] if m]

PERSONAJLAR = ["afandi", "aqlvoy", "qoshni", "ishberuvchi", "sotuvchi", "hokim", "sudya", "talabaqiz", "xodima", "inspektor", "bola"]
FONLAR = ["mahalla", "bozor", "idora", "sud", "universitet"]
EMOTSIYA = ["neutral", "happy", "worried", "surprised", "serious"]
IMO = ["none", "point", "wave", "explain", "think", "warn", "shrug"]

DARAJA = {
    "bola": "8-12 yoshli bola uchun: juda sodda so'zlar, maktab va o'yindan misollar, atamalarni izohla.",
    "fuqaro": "Kattalar uchun oddiy so'zlashuv tili: hayotiy misollar, aniq muddat va qadamlar, atamalarni qavsda izohla.",
    "talaba": "Yurist-talaba uchun: aniq huquqiy atamalar, moddalar va qismlar, norma tuzilishi, amaliy tahlil.",
}


# Rejissyorlik ko'rsatmasi (src/lib/ScriptGenerator.js dagi DIRECTION bilan bir xil saqlang)
REJISSYOR = """SAHNALASHTIRISH (haqiqiy qisqa multfilm-drama kabi):
- Mavzuga mos tomonlar va fonni tanla: mehnat -> ishberuvchi va xodima, idora; savdo/iste'molchi -> sotuvchi va qoshni, bozor; sud jarayoni -> sudya (yoki inspektor) va qoshni, sud; oila -> xodima va qoshni, mahalla; ta'lim -> talabaqiz va bola, universitet; uy-joy -> qoshni va talabaqiz, mahalla; yo'l harakati, soliq, jarima -> inspektor va qoshni, idora yoki mahalla.
- 1-sahna: shu tomonlar o'rtasida haqiqiy kichik nizo, FAQAT dialog orqali (hikoyachi yo'q, Afandi yo'q). Bir tomon noto'g'ri talab qiladi yoki qonunni noto'g'ri tushunadi, ikkinchisi hayron bo'ladi, e'tiroz bildiradi.
- ISTISNO: zo'ravonlik, tahdid, jinsiy yoki bolaga qarshi tajovuz kabi jiddiy holatlarda 1-sahnada zo'ravonlikni ko'rsatma va nizo o'ynama: qahramon Aqlvoyga voqeani xotirjam hikoya qiladi, ohang hazilsiz va hamdard bo'ladi, oxirida 102 va bepul yuridik yordamga murojaat tavsiya etiladi.
- 2-sahnada muammoli tomon Aqlvoy va Afandiga keladi va vaziyatni o'z so'zi bilan aytadi.
- Ikki kishi bir-biriga qarab turadi: biri "left", biri "right". Uch kishi bo'lsa, tushuntiruvchi "center"da.
- Har sahnada 3-6 replika, so'zlovchilar navbatma-navbat. Tinglovchi javob qaytaradi: "Nima?!", "Rostdanmi?", "Ha-ya...", "Shoshmang-chi". Bitta personaj ketma-ket 2 tadan ortiq gapirmasin.
- Hissiyot yoyi: boshida worried/serious -> o'rtada surprised -> oxirida happy (yengil tortish, minnatdorlik).

JONLI O'ZBEKCHA:
- Har replika 1-2 qisqa gap, 18 so'zdan oshmasin. Og'zaki til: "-ku", "-da", "-chi", "xo'sh", "qarang", "axir", "nima qilay".
- Qonun matnini so'zma-so'z O'QIMA. Sodda qilib qayta ayt ("Oddiy qilib aytsam, ...", "Qonun bo'yicha ..."); aniq modda havolasi onScreenText kartasida turadi.
- Savollar, gapni bo'lish ("Lekin men... - Shoshmang, oxirigacha eshiting"), qisqa hayratlar bo'lsin. Rasmiy-quruq iboralardan qoch.
- Afandi: dono, xotirjam, xalqona hazilkash - butun videoda ko'pi bilan BITTA qisqa hazil yoki maqol. Aqlvoy: qiziquvchan yosh yurist-talaba - savol beradi va "Demak, ..." deb xulosa qiladi.

EMOTSIYA VA IMO-ISHORA har replikaning ma'nosiga mos bo'lsin:
- savol -> think; raqam, modda, muddat -> point; ogohlantirish -> warn; salom/xayrlashuv -> wave; tushuntirish -> explain; ikkilanish, "bilmadim" -> shrug; oddiy javob va reaksiyalar -> none (replikalarning ko'pi "none" bo'lishi tabiiy).
- Bitta personaj ketma-ket ikki marta bir xil gesture qilmasin. emotion gap ohangiga mos: hayrat -> surprised, xavotir -> worried, qat'iy gap -> serious.
- "pause" (ixtiyoriy, 0-800 ms): muhim savol yoki hayratdan keyingi dramatik jimlik. Ko'p ishlatma.

OHANG NAMUNASI (raqamlari faqat misol, ularni ko'chirma):
YOMON: {"speaker":"afandi","text":"Kodeksning tegishli moddasiga muvofiq dastlabki sinov muddati belgilangan muddatdan ortiq bo'lishi mumkin emas, bundan tashqari ...","emotion":"neutral","gesture":"explain"}
YAXSHI:
{"speaker":"ishberuvchi","text":"Sizni olamiz, lekin olti oy sinov bilan.","emotion":"neutral","gesture":"explain"}
{"speaker":"xodima","text":"Olti oy?! Bu juda ko'p emasmi?","emotion":"surprised","gesture":"none","pause":400}
{"speaker":"afandi","text":"Oddiy qilib aytsam, sinov uch oydan oshmaydi. Olti oy - faqat rahbarlarga.","emotion":"neutral","gesture":"point"}
{"speaker":"aqlvoy","text":"Demak, Malika opaga olti oy noto'g'ri ekan-da!","emotion":"happy","gesture":"none"}"""


class AIXato(RuntimeError):
    pass


def bor() -> bool:
    return bool(os.getenv("GEMINI_API_KEY"))


_ishlagan_model = {"nom": None}


def _chaqir(prompt: str, json_javob: bool = True, harorat: float = 0.6, kutish: int = 120) -> str:
    key = os.getenv("GEMINI_API_KEY")
    if not key:
        raise AIXato("GEMINI_API_KEY o'rnatilmagan")
    gc = {"temperature": harorat, "thinkingConfig": {"thinkingLevel": "low"}}  # tezroq javob
    if json_javob:
        gc["responseMimeType"] = "application/json"
    body = {"contents": [{"role": "user", "parts": [{"text": prompt}]}], "generationConfig": gc}
    oxirgi = ""
    modellar = ([_ishlagan_model["nom"]] if _ishlagan_model["nom"] else []) + [m for m in MODELLAR if m != _ishlagan_model["nom"]]
    for model in modellar:
        try:
            r = requests.post(API.format(model=model), params={"key": key}, json=body, timeout=(10, kutish))
            if r.status_code == 400 and "thinking" in r.text.lower():
                gc.pop("thinkingConfig", None)  # eski modellar bu sozlamani bilmaydi
                r = requests.post(API.format(model=model), params={"key": key}, json=body, timeout=(10, kutish))
        except requests.Timeout:
            raise AIXato(f"Gemini {kutish} soniyada javob bermadi ({model})")
        except requests.RequestException as e:
            raise AIXato("Gemini bilan bog'lanib bo'lmadi: " + repr(e)[:150])
        if r.status_code == 404:
            oxirgi = f"{model}: topilmadi"
            continue
        _ishlagan_model["nom"] = model
        if r.status_code == 429:
            raise AIXato("Gemini limiti tugadi, birozdan keyin urinib ko'ring")
        if r.status_code != 200:
            raise AIXato(f"Gemini xatosi {r.status_code}: {r.text[:300]}")
        try:
            parts = r.json()["candidates"][0]["content"]["parts"]
            return "".join(p.get("text", "") for p in parts)
        except (KeyError, IndexError):
            raise AIXato("Gemini bo'sh javob qaytardi (xavfsizlik filtri bo'lishi mumkin)")
    raise AIXato("Gemini modeli topilmadi: " + oxirgi)


def _json(t: str) -> dict:
    a, b = t.find("{"), t.rfind("}")
    if a < 0 or b <= a:
        raise AIXato("AI javobida JSON yo'q")
    return json.loads(t[a:b + 1])


def yonaltir(sorov: str) -> list[dict]:
    """Erkin savol -> [{nomi, qidiruv, moddalar}] (taxmin; matn baribir lex.uz dan tekshiriladi)."""
    prompt = f"""Sen O'zbekiston qonunchiligi bo'yicha ma'lumotnoma yordamchisisan.
Foydalanuvchi so'rovi: "{sorov}"
Shu so'rovga javob beradigan, hozir amalda bo'lgan 1-3 ta asosiy normativ hujjatni ayt (avvalo kodeks yoki qonun).
Har biri uchun: rasmiy nomi, lex.uz qidiruvi uchun qisqa nomi va eng tegishli modda raqamlari (faqat aniq bilsang, aks holda bo'sh ro'yxat).
FAQAT JSON: {{"hujjatlar":[{{"nomi":"O'zbekiston Respublikasining Mehnat kodeksi","qidiruv":"Mehnat kodeksi","moddalar":[129,130]}}]}}"""
    try:
        d = _json(_chaqir(prompt, harorat=0.2, kutish=20))
        out = []
        for h in d.get("hujjatlar", [])[:3]:
            nom = str(h.get("qidiruv") or h.get("nomi") or "").strip()
            if nom:
                out.append({"nomi": str(h.get("nomi") or nom), "qidiruv": nom,
                            "moddalar": [str(int(x)) for x in h.get("moddalar", []) if str(x).isdigit()][:5]})
        return out
    except Exception as e:  # noqa: BLE001 — yo'naltirish ixtiyoriy: xato bo'lsa faqat lex.uz qidiruvi ishlaydi
        print("Gemini yo'naltirish xatosi:", repr(e)[:300])
        return []


def ssenariy(hujjat_nomi: str, url: str, moddalar: list[dict], sorov: str, daraja: str) -> dict:
    """lex.uz moddalaridan 5 sahnali multfilm ssenariysi (ilova JSON formatida)."""
    matn = "\n\n".join(f"{m['n']}-modda. {m['sarlavha']}\n{m['matn']}" for m in moddalar)
    raqamlar = ", ".join(m["n"] for m in moddalar)
    qisqa_nom = hujjat_nomi.replace("O'zbekiston Respublikasining ", "")
    prompt = f"""Sen "OsonQonun" platformasining ssenariy yozuvchisi va rejissyorisan. Qonunni o'zbek milliy personajlari ishtirokidagi 1-3 daqiqalik jonli multfilmga aylantirasan: tirik odamlar, haqiqiy nizo, tabiiy suhbat.

HUQUQIY ANIQLIK (eng muhim qoida):
- FAQAT quyidagi lex.uz matniga tayan. Bu hujjat: "{hujjat_nomi}". Faqat shu moddalarni tilga ol: {raqamlar}. Boshqa modda raqamini yoki matnda yo'q raqam, muddat, summani o'ylab topma.
- Foydalanuvchi so'rovi: "{sorov}". Ssenariy shu savolga javob bersin; 1-sahnadagi nizo aynan shu vaziyatni ko'rsatsin.
- Hazil bo'lishi mumkin, lekin huquqiy mazmun buzilmaydi; hech kimni kamsitma. Jiddiy holatda (zo'ravonlik, hibs, hayotga xavf) hazil qilma va 5-sahnada bepul yuridik yordam hamda tegishli davlat organiga murojaatni maslahat ber.
- Til: o'zbek tili, lotin yozuvi (o', g' uchun oddiy apostrof). Raqamlarni raqam bilan yozsang bo'ladi.
- Daraja: {DARAJA.get(daraja, DARAJA['fuqaro'])}
- Personajlar: afandi (dono hazilkash ustoz, tushuntiradi), aqlvoy (zukko yosh yurist-talaba, savol beradi, xulosa qiladi), yordamchilar: {", ".join(PERSONAJLAR[2:])}.
- Fonlar: {", ".join(FONLAR)}. emotion: {"|".join(EMOTSIYA)}. gesture: {"|".join(IMO)}.
- onScreenText.kind: title|article|keyword|warning|steps (steps uchun items massivi).

{REJISSYOR}

TUZILMA (aynan 5 sahna):
1. "Hayotiy vaziyat" - mavzu tomonlari o'rtasidagi kichik nizo (3-5 replika, faqat dialog).
2. "Savol" - muammoli tomon Aqlvoy va Afandiga keladi; Aqlvoy so'raydi: "Bu holatda qonun nima deydi?"
3. "Tushuntirish" - Afandi sodda tilda qayta aytadi, Aqlvoy yoki qahramon savol berib, hayron bo'lib turadi; onScreenText kind=article, label: "{qisqa_nom}, N-modda".
4. "Ehtiyot bo'ling!" - xavfli joylar, qahramon reaksiyasi bilan (kind=warning).
5. "Endi nima qilish kerak?" - 3-5 qadam (kind=steps); oxirida qahramon yengil tortadi, minnatdorchilik bildiradi.

FAQAT JSON:
{{"title":"...","summary":["3-6 ta qisqa konspekt bandi, modda raqami bilan"],
 "scenes":[{{"title":"...","background":"...","characters":[{{"id":"...","position":"left|center|right"}}],
 "lines":[{{"speaker":"...","text":"...","emotion":"...","gesture":"...","pause":0}}],
 "onScreenText":{{"kind":"...","label":"...","text":"...","items":[]}}}}]}}

LEX.UZ MATNI ({url}):
\"\"\"
{matn[:9000]}
\"\"\""""
    s = _json(_chaqir(prompt))
    return tozala(s, hujjat_nomi, url, {m["n"] for m in moddalar})


def tozala(s: dict, hujjat_nomi: str, url: str, ruxsat: set[str]) -> dict:
    """Ilova normalizeScript bilan mos tozalash + matnda yo'q modda raqamlarini olib tashlash."""
    s = dict(s or {})
    s["title"] = str(s.get("title") or hujjat_nomi)[:140]
    scenes = []
    for sc in (s.get("scenes") or [])[:7]:
        if not isinstance(sc, dict):
            continue
        lines = []
        for ln in sc.get("lines") or []:
            if not isinstance(ln, dict) or not str(ln.get("text", "")).strip():
                continue
            qator = {
                "speaker": ln.get("speaker") if ln.get("speaker") in PERSONAJLAR else "afandi",
                "text": str(ln["text"]).strip()[:400],
                "emotion": ln.get("emotion") if ln.get("emotion") in EMOTSIYA else "neutral",
                "gesture": ln.get("gesture") if ln.get("gesture") in IMO else "none",
            }
            pauza = ln.get("pause")  # ixtiyoriy dramatik jimlik (ms)
            if isinstance(pauza, (int, float)) and not isinstance(pauza, bool) and pauza == pauza and pauza > 0:
                qator["pause"] = int(min(1200, pauza))
            lines.append(qator)
        ost = sc.get("onScreenText") if isinstance(sc.get("onScreenText"), dict) else None
        if ost and ost.get("kind") == "article":
            nums = set(re.findall(r"(\d+)\s*[-–]\s*modda", str(ost.get("label", "")) + " " + str(ost.get("text", ""))))
            if nums and not nums <= ruxsat:
                ost["label"] = hujjat_nomi.replace("O'zbekiston Respublikasining ", "")
        scenes.append({
            "title": str(sc.get("title") or "Sahna"),
            "background": sc.get("background") if sc.get("background") in FONLAR else "mahalla",
            "characters": [c for c in (sc.get("characters") or []) if isinstance(c, dict) and c.get("id") in PERSONAJLAR][:3],
            "lines": lines, "onScreenText": ost,
        })
    s["scenes"] = scenes
    s["summary"] = [str(x) for x in (s.get("summary") or []) if x][:6]
    s["source"] = {"title": hujjat_nomi, "url": url}
    return s
