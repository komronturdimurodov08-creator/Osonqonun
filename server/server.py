"""OsonQonun server: lex.uz qidiruvi -> Gemini ssenariy -> ElevenLabs ovoz + ilovani (dist/) ko'rsatish.

Ishga tushirish (EasyLaw papkasidan):
    pip install requests
    python server/server.py            # http://localhost:8000
Muhit o'zgaruvchilari (.env ham o'qiladi): GEMINI_API_KEY, ELEVENLABS_API_KEY, OQ_SECRET,
    PORT (8000), MAX_TTS_HARF_KUN (40000), MAX_MULTFILM_SOAT (30)
"""
from __future__ import annotations

import base64
import hashlib
import hmac
import json
import mimetypes
import os
import re
import sys
import threading
import time
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs, unquote, urlparse

ROOT = Path(__file__).resolve().parent.parent
DIST = ROOT / "dist"
sys.path.insert(0, str(ROOT / "oson_ovoz"))
sys.path.insert(0, str(Path(__file__).resolve().parent))


def _env_yukla():
    for p in (ROOT / ".env", ROOT / "server" / ".env", ROOT / "oson_ovoz" / ".env"):
        if p.exists():
            for q in p.read_text(encoding="utf-8-sig").splitlines():
                q = q.strip()
                if q and not q.startswith("#") and "=" in q:
                    k, v = q.split("=", 1)
                    os.environ.setdefault(k.strip(), v.strip().strip('"').strip("'"))


_env_yukla()

import ai  # noqa: E402
import lex  # noqa: E402

SECRET = (os.getenv("OQ_SECRET") or hashlib.sha256(os.urandom(32)).hexdigest()).encode()
KESH = Path(os.getenv("OQ_KESH", ROOT / "server" / ".kesh"))
KESH.mkdir(parents=True, exist_ok=True)
MAX_TTS = int(os.getenv("MAX_TTS_HARF_KUN", "40000"))
MAX_MF = int(os.getenv("MAX_MULTFILM_SOAT", "30"))

# ─────────────────────────── Ovoz (ElevenLabs) ───────────────────────────

_ovoz = None
_ovoz_lock = threading.Lock()
_band: dict[str, threading.Lock] = {}
_kunlik = {"kun": "", "harf": 0}


def ovoz_bor() -> bool:
    return bool(os.getenv("ELEVENLABS_API_KEY"))


def _ovoz_obj():
    global _ovoz
    with _ovoz_lock:
        if _ovoz is None:
            from oson_ovoz import OsonOvoz
            _ovoz = OsonOvoz(config=ROOT / "oson_ovoz" / "ovozlar.json", kesh_papka=KESH / "ovoz")
        return _ovoz


def token(speaker: str, text: str, emotion: str) -> str:
    raw = json.dumps([speaker, text, emotion], ensure_ascii=False, separators=(",", ":")).encode()
    b = base64.urlsafe_b64encode(raw).decode().rstrip("=")
    sig = hmac.new(SECRET, raw, hashlib.sha256).hexdigest()[:20]
    return f"{b}.{sig}"


def token_och(t: str):
    try:
        b, sig = t.rsplit(".", 1)
        raw = base64.urlsafe_b64decode(b + "=" * (-len(b) % 4))
        if not hmac.compare_digest(sig, hmac.new(SECRET, raw, hashlib.sha256).hexdigest()[:20]):
            return None
        return json.loads(raw)
    except Exception:
        return None


def ovoz_fayl(speaker: str, text: str, emotion: str) -> Path:
    """Replika mp3 si (keshdan yoki ElevenLabs dan)."""
    h = hashlib.sha256(f"{speaker}|{emotion}|{text}".encode()).hexdigest()[:24]
    f = KESH / "mp3" / f"{h}.mp3"
    if f.exists():
        return f
    lock = _band.setdefault(h, threading.Lock())
    with lock:
        if f.exists():
            return f
        kun = time.strftime("%Y-%m-%d")
        if _kunlik["kun"] != kun:
            _kunlik.update(kun=kun, harf=0)
        if _kunlik["harf"] + len(text) > MAX_TTS:
            raise RuntimeError("Bugungi ovoz limiti tugadi")
        o = _ovoz_obj()
        xarita = o.cfg.get("ilova_personajlar", {})
        teg = o.cfg.get("emotsiya_teglari", {}).get(emotion, "")
        personaj = o._ilova_personaj(speaker, xarita)
        f.parent.mkdir(parents=True, exist_ok=True)
        o.say(personaj, (teg + " " + text).strip(), f, til="uz")
        _kunlik["harf"] += len(text)
        return f


def oldindan_yarat(ssen: dict):
    """Ssenariy qaytgach, barcha replikalar ovozini fonda tayyorlaymiz (pleyer kutib qolmasin)."""
    def ish():
        for sc in ssen.get("scenes", []):
            for ln in sc.get("lines", []):
                try:
                    ovoz_fayl(ln["speaker"], ln["text"], ln.get("emotion", "neutral"))
                except Exception as e:  # noqa: BLE001
                    print("ovoz xatosi:", e)
                    return
    if ovoz_bor():
        threading.Thread(target=ish, daemon=True).start()


# ─────────────────────────── Limitlar ───────────────────────────

_ip_log: dict[str, list[float]] = {}


def limit_ok(ip: str) -> bool:
    now = time.time()
    lst = [t for t in _ip_log.get(ip, []) if now - t < 3600]
    if len(lst) >= MAX_MF:
        _ip_log[ip] = lst
        return False
    lst.append(now)
    _ip_log[ip] = lst
    return True


# ─────────────────────────── API ───────────────────────────

def api_qidir(q: str) -> dict:
    q = q.strip()[:300]
    if len(q) < 3:
        return {"natijalar": []}
    takliflar = ai.yonaltir(q) if ai.bor() else []
    natija, seen = [], set()
    for t in takliflar:
        for d in lex.topish(t["qidiruv"], limit=3)[:1]:
            if d["id"] not in seen and d["ball"] > 3:
                seen.add(d["id"])
                natija.append({"id": d["id"], "title": d["title"], "url": lex.doc_url(d["id"]),
                               "moddalar": t["moddalar"], "sabab": "AI tavsiyasi"})
    for d in lex.topish(q):
        if d["id"] not in seen:
            seen.add(d["id"])
            natija.append({"id": d["id"], "title": d["title"], "url": lex.doc_url(d["id"]), "moddalar": [], "sabab": "lex.uz qidiruvi"})
    return {"natijalar": natija[:10]}


def api_multfilm(body: dict) -> dict:
    doc_id = str(body.get("id", ""))
    q = str(body.get("q", ""))[:300]
    daraja = body.get("daraja") if body.get("daraja") in ai.DARAJA else "fuqaro"
    h = lex.hujjat(doc_id)
    if not h["moddalar"]:
        raise RuntimeError("Hujjatdan moddalar ajratib bo'lmadi (lex.uz sahifa tuzilishi boshqacha bo'lishi mumkin)")
    tanlangan = lex.tanlash(h, q, [str(x) for x in body.get("moddalar") or []])
    nom = lex.norm(body.get("title") or h["title"] or "lex.uz hujjati")
    s = ai.ssenariy(nom, h["url"], tanlangan, q, daraja)
    s.update(id="lex-" + hashlib.sha1(f"{doc_id}|{q}|{daraja}|{time.time()}".encode()).hexdigest()[:10],
             level=daraja, verified=False, aiMade=True,
             manbaModdalar=[{"n": m["n"], "sarlavha": m["sarlavha"]} for m in tanlangan])
    if ovoz_bor():
        for sc in s["scenes"]:
            for ln in sc["lines"]:
                ln["audio"] = token(ln["speaker"], ln["text"], ln["emotion"])
        oldindan_yarat(s)
    return s


class H(BaseHTTPRequestHandler):
    server_version = "OsonQonun/1.0"

    def log_message(self, fmt, *args):
        sys.stderr.write("%s %s\n" % (self.address_string(), fmt % args))

    def _ip(self):
        return (self.headers.get("X-Forwarded-For") or self.client_address[0]).split(",")[0].strip()

    def _json(self, code: int, data):
        b = json.dumps(data, ensure_ascii=False).encode()
        self.send_response(code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(b)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(b)

    def _fayl(self, f: Path, cache="public, max-age=86400"):
        data = f.read_bytes()
        self.send_response(200)
        self.send_header("Content-Type", mimetypes.guess_type(f.name)[0] or "application/octet-stream")
        self.send_header("Content-Length", str(len(data)))
        self.send_header("Cache-Control", cache)
        self.end_headers()
        self.wfile.write(data)

    def do_GET(self):
        u = urlparse(self.path)
        p = unquote(u.path)
        try:
            if p == "/api/holat":
                return self._json(200, {"server": True, "ai": ai.bor(), "ovoz": ovoz_bor()})
            if p == "/api/qidir":
                q = parse_qs(u.query).get("q", [""])[0]
                return self._json(200, api_qidir(q))
            if p.startswith("/api/ovoz/"):
                d = token_och(p[len("/api/ovoz/"):])
                if not d or not ovoz_bor():
                    return self._json(404, {"xato": "ovoz topilmadi"})
                return self._fayl(ovoz_fayl(*d), cache="public, max-age=604800, immutable")
            # Statik: dist/
            rel = p.lstrip("/") or "index.html"
            f = (DIST / rel).resolve()
            if DIST.resolve() in f.parents or f == DIST.resolve():
                if f.is_dir():
                    f = f / "index.html"
                if f.is_file():
                    return self._fayl(f, cache="no-cache" if f.suffix == ".html" else "public, max-age=604800")
            return self._json(404, {"xato": "topilmadi"})
        except Exception as e:  # noqa: BLE001
            return self._json(502, {"xato": str(e)[:300]})

    def do_POST(self):
        u = urlparse(self.path)
        try:
            n = min(int(self.headers.get("Content-Length") or 0), 20000)
            body = json.loads(self.rfile.read(n) or b"{}")
        except (ValueError, json.JSONDecodeError):
            return self._json(400, {"xato": "noto'g'ri so'rov"})
        try:
            if u.path == "/api/multfilm":
                if not ai.bor():
                    return self._json(503, {"xato": "Serverda GEMINI_API_KEY o'rnatilmagan"})
                if not limit_ok(self._ip()):
                    return self._json(429, {"xato": "Juda ko'p so'rov. Bir soatdan keyin urinib ko'ring."})
                return self._json(200, api_multfilm(body))
            return self._json(404, {"xato": "topilmadi"})
        except (ai.AIXato, RuntimeError, ValueError) as e:
            return self._json(502, {"xato": str(e)[:300]})
        except Exception as e:  # noqa: BLE001
            return self._json(502, {"xato": "lex.uz yoki AI bilan bog'lanib bo'lmadi: " + str(e)[:200]})


def main():
    port = int(os.getenv("PORT", "8000"))
    print(f"OsonQonun server: http://localhost:{port}  (AI: {'ha' if ai.bor() else 'yoq'}, ovoz: {'ha' if ovoz_bor() else 'yoq'})")
    ThreadingHTTPServer(("0.0.0.0", port), H).serve_forever()


if __name__ == "__main__":
    main()
