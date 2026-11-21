/* Sahifalar: Bosh sahifa, Multfilm yasash, Darslar va kazuslar, Profil */

const TOPICS = [
  { label: "Mehnat huquqi", icon: "gavel", tone: "a", to: "learn" },
  { label: "Konstitutsiya darslari", icon: "book", tone: "b", to: "lessons" },
  { label: "Yoshingizga mos huquqlar", icon: "scales", tone: "c", to: "roadmap" },
  { label: "Hujjatni tushunish", icon: "scroll", tone: "d", to: "make" },
  { label: "Huquqni himoya qilish", icon: "shield", tone: "e", to: "learn" },
  { label: "Sud va nizolar", icon: "court", tone: "f", to: "learn" },
  { label: "Anonim savol", icon: "section", tone: "g", to: "make", mode: "savol" },
  { label: "Imtihonga takrorlash", icon: "pen", tone: "h", to: "recap" }
];

function HomePage({ go }) {
  const store = useStore();
  const [q, setQ] = useState("");
  return (
    <div className="stack-lg">
      <section className="welcome" aria-labelledby="xush">
        <div className="welcome-top">
          <h1 id="xush">Xush kelibsiz!</h1>
          <form className="search" role="search" onSubmit={(e) => { e.preventDefault(); try { sessionStorage.setItem("oq-q", q); } catch (err) {} go("make", "savol"); }}>
            <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true"><circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" strokeWidth="2.2" /><path d="m20 20-4-4" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" /></svg>
            <label htmlFor="q" className="sr">Huquqiy savol</label>
            <input id="q" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Savolingizni yozing, masalan — oylik kechiksa nima qilaman?" />
            <button className="search-go" type="submit">Multfilm olish</button>
          </form>
        </div>
        <div className="topics">
          {TOPICS.map((t) => (
            <button key={t.label} className={"topic t-" + t.tone} onClick={() => go(t.to, t.mode)}>
              <svg className="topic-ico" viewBox="0 0 64 64" aria-hidden="true">{LAW_ICONS[t.icon]}</svg>
              <span>{t.label}</span>
            </button>
          ))}
        </div>
      </section>
      <section className="weekly">
        <div className="weekly-text">
          <span className="eyebrow">Haftaning multfilmi · Mehnat huquqi</span>
          <h2>Qonunni multfilm tushuntiradi</h2>
          <p>Afandi va Aqlvoy har qanday hujjat, modda yoki kazusni 1–3 daqiqalik multfilmga aylantiradi — subtitr, ovoz va lex.uz manbasi bilan.</p>
          <div className="hero-tags"><span>1–3 daqiqa</span><span>Ovoz va subtitr</span><span>lex.uz manbasi</span></div>
        </div>
        <div className="hero-player">
          <VideoPlayer key={WEEKLY.id} script={WEEKLY} onWatched={() => Store.set((s) => ({ ...s, watched: { ...s.watched, [WEEKLY.id]: true } }))} />
        </div>
      </section>
      <section aria-labelledby="xizmatlar">
        <div className="section-head"><h2 id="xizmatlar">Xizmatlar</h2><span className="muted sm">Ro'yxatdan o'tmasdan foydalanish mumkin</span></div>
        <div className="big-actions">
          <button className="big-btn b1" onClick={() => go("make")}>
            <i aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" /><path d="M14 3v5h5M10 12v5l4-2.5z" /></svg></i>
            <b>Hujjatni multfilmga aylantirish</b><span>Matn, rasm yoki havola — AI ssenariy yozadi</span>
          </button>
          <button className="big-btn b2" onClick={() => go("learn")}>
            <i aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m14 4 6 6M10 8l6 6M12 6l3-3 6 6-3 3zM13 11l-8 8a1.5 1.5 0 0 0 2 2l8-8" /></svg></i>
            <b>Kazus-multfilmlar</b><span>{CASES.length} ta kazus · 5 bosqichli yechim</span>
          </button>
          <button className="big-btn b3" onClick={() => go("roadmap")}>
            <i aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2z" /><path d="M9 4v14M15 6v14" /></svg></i>
            <b>Huquqlar yo'l xaritasi</b><span>Yoshingizga qarab qaysi huquqlar ochiladi</span>
          </button>
          <button className="big-btn b4" onClick={() => go("make", "savol")}>
            <i aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z" /><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .8-1 1.5v.2M12 17h.01" /></svg></i>
            <b>Anonim savol berish</b><span>Javob qisqa multfilm shaklida keladi</span>
          </button>
        </div>
      </section>
      <VideoMeta script={WEEKLY} />
      {store.saved.length > 0 && <SavedList />}
    </div>
  );
}

const SAMPLE_DOC = "MEHNAT SHARTNOMASI (namuna). 1. Xodim sotuv bo'limiga menejer lavozimiga qabul qilinadi. 2. Xodimga 4 oy muddatga dastlabki sinov belgilanadi. 3. Ish vaqti haftasiga 40 soat. 4. Xodimga har yili 15 ish kuni ta'til beriladi. 5. Xodim ishdan bo'shamoqchi bo'lsa, ish beruvchini 14 kalendar kun oldin yozma ogohlantirishi shart. 6. Mehnat intizomini buzganlik uchun jarima qo'llanilishi mumkin.";
const SAMPLE_Q = "Ish beruvchi 2 oydan beri oylik bermayapti va «shikoyat qilsang bo'shataman» deyapti. Nima qilishim kerak?";

function MakePage({ initialMode }) {
  const [mode, setMode] = useState(initialMode || "hujjat");
  const [text, setText] = useState(() => { try { const v = sessionStorage.getItem("oq-q") || ""; sessionStorage.removeItem("oq-q"); return v; } catch (e) { return ""; } });
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
  useEffect(() => { setMode(initialMode || "hujjat"); }, [initialMode]);
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
          <button role="tab" aria-selected={mode === "hujjat"} className={cx(mode === "hujjat" && "on")} onClick={() => setMode("hujjat")}>Hujjatni multfilmga aylantir</button>
          <button role="tab" aria-selected={mode === "savol"} className={cx(mode === "savol" && "on")} onClick={() => setMode("savol")}>Anonim savol</button>
        </div>
      </div>
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
          {[["auto", "Avtomatik"], ["claude", "Claude ovozi"], ["browser", "Brauzer ovozi"]].map(([k, l]) => (
            <button key={k} className={cx((s.voiceEngine || "auto") === k && "on")} disabled={k === "claude" && claudeOk === false}
              onClick={() => set("voiceEngine", k)}>{l}</button>
          ))}
        </div>
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
          <span>Til</span>
          <div className="seg notr">
            {LANGS.map((l) => <button key={l.id} className={cx(curLang(store) === l.id && "on")} aria-pressed={curLang(store) === l.id} onClick={() => set("lang", l.id)} lang={l.html}>{l.short} · {l.name}</button>)}
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
