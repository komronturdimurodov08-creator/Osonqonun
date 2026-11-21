/* Sahifalar: Bosh sahifa, Multfilm yasash, Darslar va kazuslar, Profil */

function HomePage({ go }) {
  const store = useStore();
  return (
    <div className="stack-lg">
      <section className="hero">
        <div className="hero-text">
          <h1>Qonunni multfilm tushuntiradi</h1>
          <p>Afandi va Aqlvoy har qanday hujjat, modda yoki kazusni 1–3 daqiqalik multfilmga aylantiradi — subtitr, ovoz va lex.uz manbasi bilan.</p>
        </div>
        <div className="hero-player">
          <div className="label-row"><span className="pill hot">Haftaning multfilmi</span><span className="muted sm">Mehnat huquqi</span></div>
          <VideoPlayer key={WEEKLY.id} script={WEEKLY} onWatched={() => Store.set((s) => ({ ...s, watched: { ...s.watched, [WEEKLY.id]: true } }))} />
        </div>
      </section>
      <div className="big-actions">
        <button className="big-btn b1" onClick={() => go("make")}>
          <b>Hujjatni multfilmga aylantir</b><span>Matn, rasm yoki havola — AI ssenariy yozadi</span>
        </button>
        <button className="big-btn b2" onClick={() => go("learn")}>
          <b>Kazus-multfilmlar</b><span>{CASES.length} ta kazus · 5 bosqichli yechim</span>
        </button>
        <button className="big-btn b3" onClick={() => go("roadmap")}>
          <b>Huquqlar yo'l xaritasi</b><span>Yoshingizga qarab qaysi huquqlar ochiladi</span>
        </button>
      </div>
      <VideoMeta script={WEEKLY} />
      <section className="panel ask-strip">
        <div><b>Savolingiz bormi?</b><p className="muted">Ro'yxatdan o'tmasdan anonim savol bering — javob qisqa multfilm shaklida.</p></div>
        <button className="btn" onClick={() => go("make", "savol")}>Anonim savol berish</button>
      </section>
      {store.saved.length > 0 && <SavedList />}
    </div>
  );
}

const SAMPLE_DOC = "MEHNAT SHARTNOMASI (namuna). 1. Xodim sotuv bo'limiga menejer lavozimiga qabul qilinadi. 2. Xodimga 4 oy muddatga dastlabki sinov belgilanadi. 3. Ish vaqti haftasiga 40 soat. 4. Xodimga har yili 15 ish kuni ta'til beriladi. 5. Xodim ishdan bo'shamoqchi bo'lsa, ish beruvchini 14 kalendar kun oldin yozma ogohlantirishi shart. 6. Mehnat intizomini buzganlik uchun jarima qo'llanilishi mumkin.";
const SAMPLE_Q = "Ish beruvchi 2 oydan beri oylik bermayapti va «shikoyat qilsang bo'shataman» deyapti. Nima qilishim kerak?";

/* lex.uz dan jonli qidirish: so'rov -> hujjatlar -> tanlangan hujjat moddalaridan multfilm (server orqali) */
const LEX_NAMUNA = ["Ishga kirsam sinov muddati qancha bo'ladi?", "Iste'molchi sifatida sifatsiz tovarni qaytarish", "Mehnat kodeksi 130-modda", "Ota-onaning bola oldidagi majburiyatlari"];
function LexSearch({ level, onScript }) {
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState("");
  const [res, setRes] = useState(null);
  const [err, setErr] = useState("");
  const [srv, setSrv] = useState(undefined);
  const ctrl = useRef(null);
  useEffect(() => { let on = true; Api.holat().then((h) => on && setSrv(h)); return () => { on = false; }; }, []);
  const search = async (text) => {
    const t = (text != null ? text : q).trim();
    if (t.length < 3) { setErr("Hujjat nomi yoki savolingizni yozing."); return; }
    setQ(t); setErr(""); setRes(null); setBusy("Qidirilmoqda: lex.uz…");
    try { const d = await Api.qidir(t); setRes(d.natijalar || []); if (!(d.natijalar || []).length) setErr("Hech narsa topilmadi. Boshqacha yozib ko'ring: masalan, hujjat nomi bilan."); }
    catch (e) { setErr(e.message || "Qidiruvda xato"); }
    setBusy("");
  };
  const make = async (d) => {
    setErr(""); setBusy("«" + d.title.slice(0, 50) + "» — lex.uz dan matn olinmoqda va ssenariy yozilmoqda… (20-40 soniya)");
    ctrl.current = new AbortController();
    try {
      const raw = await Api.multfilm({ id: d.id, q, moddalar: d.moddalar, daraja: level, title: d.title }, ctrl.current.signal);
      const s = normalizeScript(raw);
      const arts = (raw.manbaModdalar || []).map((m) => m.n + "-modda").join(", ");
      onScript(s, "Ssenariy lex.uz dagi rasmiy matn asosida yozildi" + (arts ? " (" + arts + ")" : "") + ". Baribir yurist tekshiruvidan o'tkazing.");
    } catch (e) { if (!(e && e.name === "AbortError")) setErr(e.message || "Multfilm yasab bo'lmadi"); }
    setBusy("");
  };
  if (srv === undefined) return <p className="sm muted">Server tekshirilmoqda…</p>;
  if (!srv) return (
    <div className="note">lex.uz dan qidirish uchun ilova <b>OsonQonun serveri</b> orqali ochilishi kerak (masalan, <span className="notr">http://localhost:8000</span> yoki internetdagi havola). Fayl sifatida ochilganda bu bo'lim ishlamaydi — «Hujjatni multfilmga aylantir» bo'limidan foydalaning.</div>
  );
  return (
    <div className="stack">
      <label className="field">
        <span>Qaysi hujjat yoki qanday savol? (lex.uz dan qidiriladi)</span>
        <div className="row gap">
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === "Enter" && search()}
            placeholder="Masalan: Mehnat kodeksi sinov muddati" style={{ flex: 1 }} />
          <button className="btn" onClick={() => search()} disabled={!!busy}>Qidirish</button>
        </div>
      </label>
      <div className="row gap wrap">{LEX_NAMUNA.map((x) => <button key={x} className="btn ghost sm" onClick={() => search(x)} disabled={!!busy}>{x}</button>)}</div>
      {!srv.ai && <p className="note">Serverda Gemini kaliti yo'q: qidiruv ishlaydi, lekin multfilm yozilmaydi.</p>}
      {busy && <p className="note">{busy} {ctrl.current && busy.indexOf("ssenariy") > 0 && <button className="btn ghost sm" onClick={() => ctrl.current.abort()}>To'xtatish</button>}</p>}
      {err && <p className="note">{err}</p>}
      {res && res.length > 0 && (
        <div className="lex-results stack">
          {res.map((d) => (
            <div key={d.id} className="panel lex-item row between gap wrap">
              <div style={{ flex: 1, minWidth: 220 }}>
                <b>{d.title}</b>
                <div className="sm muted">{d.sabab}{d.moddalar && d.moddalar.length ? " · moddalar: " + d.moddalar.join(", ") : ""} · <a href={d.url} target="_blank" rel="noopener">lex.uz da ochish ↗</a></div>
              </div>
              <button className="btn sm" onClick={() => make(d)} disabled={!!busy || !srv.ai}>Multfilm yasash</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function MakePage({ initialMode }) {
  const [mode, setMode] = useState(initialMode || "hujjat");
  const [text, setText] = useState("");
  const [url, setUrl] = useState("");
  const [level, setLevel] = useState("fuqaro");
  const [image, setImage] = useState(null);
  const [fileNote, setFileNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [note, setNote] = useState("");
  const [script, setScript] = useState(null);
  const [ai, setAi] = useState(null);
  const ctrl = useRef(null);
  const out = useRef(null);
  // Server bo'lsa — standart bo'lim "lex.uz dan qidirish", aks holda "Hujjatni multfilmga aylantir"
  useEffect(() => {
    let on = true;
    if (initialMode) setMode(initialMode);
    else Api.holat().then((h) => on && setMode(h && h.server ? "lex" : "hujjat"));
    return () => { on = false; };
  }, [initialMode]);
  const showScript = (s, n) => { setScript(s); setNote(n || ""); setTimeout(() => out.current && out.current.scrollIntoView({ behavior: "smooth", block: "start" }), 50); };
  useEffect(() => { let on = true; Bridge.sample().then((s) => on && setAi(!!s)); return () => { on = false; }; }, []);

  const onFile = async (e) => {
    const f = e.target.files && e.target.files[0];
    setImage(null); setFileNote("");
    if (!f) return;
    if (f.type.startsWith("image/")) { setImage(f); setFileNote("Rasm qo'shildi: " + f.name + (ai ? " — AI rasmdagi matnni o'qiydi." : " — rasmni o'qish uchun AI ulanishi kerak.")); }
    else if (f.type === "text/plain" || /\.txt$/i.test(f.name)) { setText((await f.text()).slice(0, 20000)); setFileNote("Matn fayldan olindi: " + f.name); }
    else if (/pdf$/i.test(f.type) || /\.pdf$/i.test(f.name)) setFileNote("PDF dan matn ajratish keyingi bosqichda (pdf.js). Hozircha PDF matnini nusxalab joylang.");
    else setFileNote("Bu fayl turi qo'llab-quvvatlanmaydi. Matn (.txt) yoki rasm yuklang.");
  };
  const generate = async () => {
    const t = text.trim();
    if (!t && !image) { setNote("Avval matn kiriting yoki rasm yuklang."); return; }
    setBusy(true); setNote(""); setProgress(0); setScript(null);
    ctrl.current = new AbortController();
    let s = null;
    try {
      s = await generateWithAI({ text: t, level, mode, image, onProgress: setProgress, signal: ctrl.current.signal });
      setNote("Ssenariyni AI yozdi. Moddalarni lex.uz bilan solishtirib tekshiring.");
    } catch (e) {
      if (e && e.code === "unavailable") setNote("AI ulanmagan — ssenariy oflayn shablon bilan tuzildi (matndagi modda, muddat va ogohlantirishlar asosida).");
      else if (e && e.code === "rate_limited") setNote("AI hozir band — oflayn shablon ishlatildi. Birozdan keyin qayta urinib ko'ring.");
      else if (e && e.code === "not_granted") setNote("AI'ga ruxsat berilmadi — oflayn shablon ishlatildi.");
      else setNote("AI javobini o'qib bo'lmadi — oflayn shablon ishlatildi.");
      if (t) s = templateScript(t, level, mode);
    }
    if (s && /^https?:\/\/(www\.)?lex\.uz/i.test(url.trim())) s.source = { title: s.source && s.source.url !== LEX.lex.url ? s.source.title : "lex.uz dagi hujjat", url: url.trim() };
    setBusy(false);
    if (s) { setScript(s); setTimeout(() => out.current && out.current.scrollIntoView({ behavior: "smooth", block: "start" }), 50); }
  };
  const serious = mode === "savol" && SERIOUS.test(normApos(text));
  return (
    <div className="stack-lg">
      <div className="page-head">
        <h2>Multfilm yasash</h2>
        <div className="seg" role="tablist">
          <button role="tab" aria-selected={mode === "lex"} className={cx(mode === "lex" && "on")} onClick={() => setMode("lex")}>lex.uz dan qidirish</button>
          <button role="tab" aria-selected={mode === "hujjat"} className={cx(mode === "hujjat" && "on")} onClick={() => setMode("hujjat")}>Hujjatni multfilmga aylantir</button>
          <button role="tab" aria-selected={mode === "savol"} className={cx(mode === "savol" && "on")} onClick={() => setMode("savol")}>Anonim savol</button>
        </div>
      </div>
      {mode === "lex" ? (
      <section className="panel make-form">
        <LexSearch level={level} onScript={showScript} />
        <div className="field">
          <span>Kimga tushuntiramiz?</span>
          <div className="seg levels">
            {Object.entries(LEVELS).map(([k, v]) => <button key={k} className={cx(level === k && "on")} aria-pressed={level === k} onClick={() => setLevel(k)}>{v.label}</button>)}
          </div>
        </div>
        {note && <p className="note">{note}</p>}
      </section>
      ) : (
      <section className="panel make-form">
        <label className="field">
          <span>{mode === "savol" ? "Savolingiz (ro'yxatdan o'tish shart emas, ism yozmang)" : "Hujjat, modda yoki kazus matni"}</span>
          <textarea rows={7} value={text} onChange={(e) => setText(e.target.value)}
            placeholder={mode === "savol" ? "Masalan: Ish beruvchi oylik bermayapti..." : "Shartnoma, rasmiy xat yoki qonun moddasini shu yerga joylang"} />
        </label>
        <div className="row gap wrap">
          <button className="btn ghost sm" onClick={() => setText(mode === "savol" ? SAMPLE_Q : SAMPLE_DOC)}>Namuna matn</button>
          {mode === "hujjat" && <label className="btn ghost sm file-btn">Rasm yoki .txt yuklash<input type="file" accept="image/*,.txt,.pdf,text/plain,application/pdf" onChange={onFile} /></label>}
        </div>
        {fileNote && <p className="sm muted">{fileNote}</p>}
        {mode === "hujjat" && (
          <label className="field">
            <span>lex.uz havolasi (ixtiyoriy — videoda manba sifatida ko'rsatiladi)</span>
            <input type="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://lex.uz/docs/..." />
          </label>
        )}
        <div className="field">
          <span>Kimga tushuntiramiz?</span>
          <div className="seg levels">
            {Object.entries(LEVELS).map(([k, v]) => <button key={k} className={cx(level === k && "on")} aria-pressed={level === k} onClick={() => setLevel(k)}>{v.label}</button>)}
          </div>
        </div>
        {serious && (
          <div className="alert">
            <b>Jiddiy holatga o'xshaydi.</b> Hayot yoki sog'liqqa xavf bo'lsa, darhol 102 (militsiya) yoki 103 (tez yordam) raqamiga qo'ng'iroq qiling. Huquqiy masalada adliya organlaridagi bepul yuridik yordamga yoki advokatga murojaat qiling.
          </div>
        )}
        <div className="row gap wrap center-y">
          <button className="btn big" onClick={generate} disabled={busy}>{busy ? "Ssenariy yozilmoqda… " + (progress ? progress + " belgi" : "") : "Multfilm yaratish"}</button>
          {busy && <button className="btn ghost" onClick={() => ctrl.current && ctrl.current.abort()}>To'xtatish</button>}
          <span className="sm muted">{ai === null ? "" : ai ? "AI rejimi: Claude ulangan" : "AI ulanmagan: oflayn shablon ishlaydi"}</span>
        </div>
        {note && <p className="note">{note}</p>}
      </section>
      )}
      {script && (
        <div className="stack-lg" ref={out}>
          <div className="case-head"><span className="pill">{LEVELS[script.level] ? LEVELS[script.level].label : "Multfilm"}</span><h2>{script.title}</h2></div>
          <VideoPlayer key={script.id} script={script} />
          <VideoMeta script={script} />
          <details className="panel json">
            <summary>Ssenariy JSON (pleyer shu faylni o'ynaydi)</summary>
            <button className="btn ghost sm" onClick={() => copyText(JSON.stringify(script, null, 2))}>Nusxalash</button>
            <pre className="notr">{JSON.stringify(script, null, 2)}</pre>
          </details>
        </div>
      )}
    </div>
  );
}

function LearnPage({ sub, go }) {
  const [caseId, setCaseId] = useState(null);
  const tab = sub === "lessons" || sub === "recap" ? "lessons" : "cases";
  const cs = CASES.find((c) => c.id === caseId);
  return (
    <div className="stack-lg">
      <div className="page-head">
        <h2>Darslar va kazuslar</h2>
        <div className="seg" role="tablist">
          <button role="tab" aria-selected={tab === "cases"} className={cx(tab === "cases" && "on")} onClick={() => { setCaseId(null); go("learn"); }}>Kazus-multfilmlar</button>
          <button role="tab" aria-selected={tab === "lessons"} className={cx(tab === "lessons" && "on")} onClick={() => go("lessons")}>Video darslar</button>
        </div>
      </div>
      {tab === "cases" ? (cs ? <CaseVideo cs={cs} onBack={() => setCaseId(null)} /> : (
        <>
          <p className="muted">Har bir kazus: voqea multfilmi → «Siz qanday hal qilardingiz?» → Afandi va Aqlvoy bilan 5 bosqichli yechim → ko'p uchraydigan xatolar. Javobingizni yozsangiz, u yechim bilan solishtiriladi.</p>
          <CaseList onOpen={setCaseId} />
          <p className="sm muted">Fanlar: Konstitutsiyaviy va Mehnat huquqi (MVP). Keyingi bosqich: Fuqarolik, Jinoyat, Ma'muriy, Oila va protsessual huquq.</p>
        </>
      )) : <LessonPlaylist mode={sub} />}
    </div>
  );
}

function SavedList() {
  const store = useStore();
  const [open, setOpen] = useState(null);
  const s = store.saved.find((x) => x.id === open);
  return (
    <section className="panel">
      <h3>Offline saqlangan videolar</h3>
      <ul className="saved">
        {store.saved.map((x) => (
          <li key={x.id}>
            <button className="link" onClick={() => setOpen(open === x.id ? null : x.id)}>{x.title}</button>
            <button className="btn ghost sm" onClick={() => Store.set((st) => ({ ...st, saved: st.saved.filter((y) => y.id !== x.id) }))}>O'chirish</button>
          </li>
        ))}
      </ul>
      {s && <VideoPlayer key={s.id} script={s} />}
    </section>
  );
}

const VOICE_TESTS = {
  afandi: "Assalomu alaykum! Men Afandiman. Konstitutsiyaning 31-moddasi uy-joy daxlsizligini kafolatlaydi.",
  xodima: "Men 2023-yil 30-aprelda ishga kirdim. Sinov muddati 3 oydan oshmasligi kerak, to'g'rimi?"
};
function VoiceSettings() {
  const s = useStore().settings;
  const set = (k, v) => Store.set((st) => ({ ...st, settings: { ...st.settings, [k]: v } }));
  const [voices, setVoices] = useState(Speech.usable());
  const [claudeOk, setClaudeOk] = useState(null);
  const [engine, setEngine] = useState("");
  const [msg, setMsg] = useState("");
  useEffect(() => {
    const f = () => setVoices(Speech.usable());
    const id = setInterval(f, 700); const t = setTimeout(() => clearInterval(id), 5000);
    Voice.claude().then((x) => setClaudeOk(!!x));
    return () => { clearInterval(id); clearTimeout(t); };
  }, []);
  useEffect(() => { Voice.engine().then(setEngine); }, [s.voiceEngine, voices.length, claudeOk]);
  const test = async (who) => {
    setMsg("");
    const text = VOICE_TESTS[who];
    if ((await Voice.engine()) === "claude") {
      const t = await Voice.claude();
      const o = {}; if (Voice.lang()) o.language = Voice.lang();
      t.speak([Voice.lineFor(text, who, "test")], o).catch((e) => {
        if (e && e.code === "not_granted") setMsg("Ovoz bu sahifa uchun o'chirilgan (sahifaning Ruxsatlar menyusida yoqiladi).");
        else { setMsg("Claude ovozi hozir ishlamadi — brauzer ovozi bilan eshittirildi."); Speech.speak(text, who, 1); }
      });
    } else Speech.speak(text, who, 1);
  };
  const opt = (v) => <option key={v.name} value={v.name}>{v.name} — {v.lang}</option>;
  return (
    <section className="panel settings">
      <h3>Ovoz</h3>
      <label className="toggle">
        <input type="checkbox" checked={!!s.voice} onChange={(e) => set("voice", e.target.checked)} />
        <span className="tg" aria-hidden="true" />
        <span><b>Personajlar ovozi</b><small>O'chirilsa, faqat subtitr va gap pufakchalari qoladi</small></span>
      </label>
      <div className="field">
        <span>Ovoz manbai</span>
        <div className="seg">
          {[["auto", "Avtomatik"], ["studio", "Studiya ovozi"], ["claude", "Claude ovozi"], ["browser", "Brauzer ovozi"]].map(([k, l]) => (
            <button key={k} className={cx((s.voiceEngine || "auto") === k && "on")} disabled={(k === "claude" && claudeOk === false) || (k === "studio" && !ElevenAudio.count())}
              onClick={() => set("voiceEngine", k)}>{l}</button>
          ))}
        </div>
        {ElevenAudio.count() > 0 && ["auto", "studio"].includes(s.voiceEngine || "auto") && (
          <p className="sm muted voice-now"><b>Studiya ovozi (ElevenLabs)</b> — {ElevenAudio.count()} ta replika professional ovozda tayyor. Qolgan (masalan, AI yasagan) videolar uchun:</p>
        )}
        <p className="sm muted voice-now">Hozir: <b>{engine === "claude" ? "Claude ovozi (yuqori sifatli, tabiiy)" + (Voice.lang() ? " · til: " + Voice.lang() : "") : "Brauzer — " + Speech.voiceName("afandi")}</b>
          {claudeOk === false && " · Claude ovozi bu ko'rinishda mavjud emas (Claude.ai ichida Chrome yoki Edge'da ochilganda ishlaydi)."}</p>
      </div>
      {engine !== "claude" && (
        <div className="voice-grid">
          <label className="field"><span>Erkak personajlar ovozi</span>
            <select value={s.maleVoice} onChange={(e) => set("maleVoice", e.target.value)}>
              <option value="">Avtomatik (eng yaxshisi)</option>{voices.map(opt)}
            </select></label>
          <label className="field"><span>Ayol va bola personajlar ovozi</span>
            <select value={s.femaleVoice} onChange={(e) => set("femaleVoice", e.target.value)}>
              <option value="">Avtomatik (eng yaxshisi)</option>{voices.map(opt)}
            </select></label>
        </div>
      )}
      <div className="row gap wrap">
        <button className="btn ghost sm" onClick={() => test("afandi")}>Afandini eshitish</button>
        <button className="btn ghost sm" onClick={() => test("xodima")}>Malikani eshitish</button>
      </div>
      {msg && <p className="note">{msg}</p>}
      {engine !== "claude" && !Speech.hasUzbek() && (
        <p className="note">Brauzeringizda o'zbekcha ovoz topilmadi, shuning uchun turkcha yoki ruscha ovoz o'zbekcha matnni o'z talaffuziga moslab o'qiydi. Eng tabiiy o'zbekcha ovoz uchun sahifani <b>Microsoft Edge</b>'da oching — unda bepul «Madina» va «Sardor» o'zbekcha ovozlari bor, platforma ularni avtomatik tanlaydi.</p>
      )}
    </section>
  );
}

function ProfilePage() {
  const store = useStore();
  const set = (k, v) => Store.set((s) => ({ ...s, settings: { ...s.settings, [k]: v } }));
  const r = readiness(store);
  const watched = Object.keys(store.watched).length;
  const solved = Object.values(store.cases).filter((c) => c.solved).length;
  const Toggle = ({ k, label, desc }) => (
    <label className="toggle">
      <input type="checkbox" checked={!!store.settings[k]} onChange={(e) => set(k, e.target.checked)} />
      <span className="tg" aria-hidden="true" />
      <span><b>{label}</b><small>{desc}</small></span>
    </label>
  );
  return (
    <div className="stack-lg">
      <h2>Profil</h2>
      <div className="stats">
        <div className="stat"><b>{watched}</b><span>ko'rilgan video</span></div>
        <div className="stat"><b>{solved}/{CASES.length}</b><span>yechilgan kazus</span></div>
        <div className="stat"><b>{r.pct}%</b><span>test natijasi</span></div>
        <div className="stat"><b>{r.weak.length}</b><span>takrorlash kerak</span></div>
      </div>
      {r.weak.length > 0 && <p className="sm">Takrorlash kerak bo'lgan mavzular: {r.weak.map((l) => l.title).join("; ")}</p>}
      <section className="panel settings">
        <h3>Qulaylik</h3>
        <div className="field">
          <span>Alifbo</span>
          <div className="seg">
            <button className={cx(store.settings.alphabet === "lat" && "on")} onClick={() => set("alphabet", "lat")}>Lotin</button>
            <button className={cx(store.settings.alphabet === "cyr" && "on")} onClick={() => set("alphabet", "cyr")}>Кирилл</button>
          </div>
        </div>
        <Toggle k="bigFont" label="Katta shrift" desc="Barcha matnlar kattaroq" />
        <Toggle k="contrast" label="Yuqori kontrast" desc="Ko'rishi zaif foydalanuvchilar uchun" />
      </section>
      <VoiceSettings />
      <section className="panel">
        <h3>Progress qayerda saqlanadi?</h3>
        <p className="muted">Kirish talab qilinmaydi. Progress faqat shu qurilmada saqlanadi; ro'yxatdan o'tish (bir nechta qurilmada progress) keyingi bosqichda qo'shiladi. Yuklangan hujjatlar saqlanmaydi.</p>
        <button className="btn ghost sm" onClick={() => Store.reset()}>Progressni tozalash</button>
      </section>
      <section className="panel">
        <h3>Ishonchlilik</h3>
        <ul className="konspekt">
          <li>Ssenariylar lex.uz dagi rasmiy matnlarga tayanadi, har videoda modda va manba ko'rsatiladi.</li>
          <li>Manba topilmasa, Afandi «aniq bilmayman» deydi.</li>
          <li>Yurist tekshirgan videolarga «Tekshirilgan ✓» belgisi qo'yiladi. Ushbu MVP dagi namunalar hali tekshiruvdan o'tmagan.</li>
          <li>Videolar ta'limiy maqsadda, yuridik maslahat emas.</li>
        </ul>
      </section>
    </div>
  );
}
