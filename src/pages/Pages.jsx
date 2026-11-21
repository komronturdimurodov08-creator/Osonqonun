/* Sahifalar: Bosh sahifa, Multfilm yasash, Darslar va kazuslar, Profil */

const TOPICS = [
  { label: "Mehnat huquqi", icon: "gavel", tone: "a", to: "learn" },
  { label: "Konstitutsiya darslari", icon: "book", tone: "b", to: "lessons" },
  { label: "Yoshingizga mos huquqlar", icon: "scales", tone: "c", to: "roadmap" },
  { label: "Hujjatni tushunish", icon: "scroll", tone: "d", to: "make" },
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
        <div className="hero-player">
          <VideoPlayer key={WEEKLY.id} script={WEEKLY} onWatched={() => Store.set((s) => ({ ...s, watched: { ...s.watched, [WEEKLY.id]: true } }))} />
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
  const [lex, setLex] = useState(null); // anonim savol: lex.uz bazasidan topilgan moddalar
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
    // Anonim savol: javob faqat LexBase moddalariga tayanadi. Mos modda bo'lmasa — taxmin qilmaymiz.
    if (mode === "savol") {
      const matches = LexSearch.search(t);
      setLex({ q: t, matches });
      if (!matches.length) { setBusy(false); setTimeout(() => out.current && out.current.scrollIntoView({ behavior: "smooth", block: "start" }), 50); return; }
      try {
        s = await generateWithAI({ text: t, level, mode, onProgress: setProgress, signal: ctrl.current.signal, context: LexSearch.context(matches) });
        s.lexBased = true;
      } catch (e) {
        s = lexTemplateScript(t, matches, level);
      }
      setBusy(false); setScript(s);
      setTimeout(() => out.current && out.current.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
      return;
    }
    try {
      s = await generateWithAI({ text: t, level, mode, image, onProgress: setProgress, signal: ctrl.current.signal });
    } catch (e) {
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
          <button className="btn big" onClick={generate} disabled={busy}>{busy ? "Ssenariy yozilmoqda… " + (progress ? progress + " belgi" : "") : mode === "savol" ? "Javob olish" : "Multfilm yaratish"}</button>
          {busy && <button className="btn ghost" onClick={() => ctrl.current && ctrl.current.abort()}>To'xtatish</button>}
        </div>
        {note && <p className="note">{note}</p>}
      </section>
      {mode === "savol" && lex && <LexAnswer data={lex} refEl={script ? null : out} />}
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

/* Anonim savolga javob: lex.uz bilan solishtirilgan bazadan topilgan moddalar */
function LexAnswer({ data, refEl }) {
  const P = LexSearch.pick;
  const d = LEXBASE_CHECKED.split("-").reverse().join(".");
  return (
    <section className="panel lex-answer" ref={refEl} aria-live="polite">
      <div className="lex-head">
        <span className="lex-badge">lex.uz asosida</span>
        <h3>Qonun nima deydi</h3>
      </div>
      <p className="sm muted">Javob faqat platformadagi huquqiy bazaga tayanadi: <span className="notr">{LEXBASE.length}</span> ta modda. lex.uz bilan solishtirilgan sana: <span className="notr">{d}</span></p>
      {data.matches.length ? (
        <div className="lex-list">
          {data.matches.map(({ entry: e }, i) => (
            <article key={e.id} className={cx("lex-card", i === 0 && "top")}>
              <div className="lex-ref notr">{LexSearch.ref(e)}</div>
              <h4>{P(e.title)}</h4>
              <p>{P(e.text)}</p>
              <div className="lex-foot">
                <a href={LexSearch.url(e)} target="_blank" rel="noopener">lex.uz'da rasmiy matnni ochish ↗</a>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="lex-none">
          <b>Bazada bu savolga mos modda topilmadi.</b>
          <p>Taxmin qilib javob bermaymiz — noto'g'ri huquqiy ma'lumot zarar keltirishi mumkin. Savolni boshqacha so'zlar bilan yozib ko'ring yoki rasmiy manbadan qidiring.</p>
          <div className="row gap wrap">
            <a className="btn ghost sm" href="https://lex.uz" target="_blank" rel="noopener">lex.uz'da qidirish ↗</a>
          </div>
          <p className="sm muted">Murakkab holatda bepul yuridik yordam yoki advokatga murojaat qiling (Konstitutsiya, 29-modda).</p>
        </div>
      )}
    </section>
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
