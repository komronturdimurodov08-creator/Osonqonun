/* Sahifalar: Bosh sahifa, Multfilm yasash, Darslar va kazuslar, Profil */

function FeatIcon({ name }) {
  const d = {
    make: "M4 5h12a2 2 0 0 1 2 2v1.5l3-2v11l-3-2V17a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2zm4 3v8l6-4z",
    lessons: "M12 3 1 9l11 6 9-4.9V17h2V9zM5 13.2V17l7 4 7-4v-3.8L12 17z",
    cases: "M12 2 3 6v2h18V6zM5 10v7h3v-7zm5.5 0v7h3v-7zM16 10v7h3v-7zM3 19v3h18v-3z",
    road: "M12 2a7 7 0 0 0-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z"
  }[name];
  return <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true"><path d={d} fill="currentColor" /></svg>;
}

function HomePage({ go }) {
  const store = useStore();
  const feats = [
    ["c1", "make", "Multfilm yasash", "Matn, rasm yoki lex.uz — AI ssenariy yozadi", () => go("make")],
    ["c2", "lessons", "Video darslar", LESSONS.length + " ta dars · test va takrorlash", () => go("lessons")],
    ["c3", "cases", "Kazuslar", CASES.length + " ta kazus · 5 bosqichli yechim", () => go("learn")],
    ["c4", "road", "Yo'l xaritasi", "Yoshingizga qarab qaysi huquqlar ochiladi", () => go("roadmap")]
  ];
  return (
    <div className="stack-lg">
      <section className="hero">
        <div className="hero-text">
          <span className="eyebrow">Huquqiy ta'lim · multfilmda</span>
          <h1>Qonunni <em>multfilm</em> tushuntiradi</h1>
          <p>Afandi va Aqlvoy har qanday hujjat, modda yoki kazusni 1–3 daqiqalik multfilmga aylantiradi — subtitr, ovoz va lex.uz manbasi bilan.</p>
          <div className="hero-ctas">
            <button className="btn accent big" onClick={() => go("make")}>Multfilm yasash</button>
            <button className="btn btn-glass big" onClick={() => go("make", "savol")}>Anonim savol</button>
          </div>
          <div className="hero-facts"><span>Bepul, ro'yxatsiz</span><span>Lotin / Кирилл</span><span>lex.uz manbasi</span></div>
        </div>
        <div className="hero-player">
          <div className="label-row"><span className="pill hot">Haftaning multfilmi</span><span className="muted sm">Mehnat huquqi</span></div>
          <VideoPlayer key={WEEKLY.id} script={WEEKLY} onWatched={() => Store.set((s) => ({ ...s, watched: { ...s.watched, [WEEKLY.id]: true } }))} />
        </div>
      </section>
      <section>
        <div className="section-title"><h2>Nimadan boshlaymiz?</h2></div>
        <div className="features">
          {feats.map(([c, ic, t, d, on]) => (
            <button key={ic} className={cx("feat", c)} onClick={on}>
              <span className="feat-ic"><FeatIcon name={ic} /></span>
              <b>{t}</b><span className="d">{d}</span>
              <span className="go" aria-hidden="true">Ochish <span>→</span></span>
            </button>
          ))}
        </div>
      </section>
      <VideoMeta script={WEEKLY} />
      <section className="panel ask-strip">
        <div className="row gap" style={{ flex: "1 1 260px", alignItems: "flex-start" }}>
          <span className="ask-ic" aria-hidden="true">?</span>
          <div><b>Savolingiz bormi?</b><p className="muted">Ro'yxatdan o'tmasdan anonim savol bering — javob qisqa multfilm shaklida.</p></div>
        </div>
        <button className="btn" onClick={() => go("make", "savol")}>Anonim savol berish</button>
      </section>
      {store.saved.length > 0 && <SavedList />}
    </div>
  );
}

function GenSkeleton({ label }) {
  return (
    <div className="sk-card" aria-hidden="true">
      <div className="sk-cap"><span className="spinner" />{label}</div>
      <div className="sk sk-stage" />
      <div className="sk sk-line w60" /><div className="sk sk-line w80" /><div className="sk sk-line w40" />
    </div>
  );
}

const SAMPLE_DOC = "MEHNAT SHARTNOMASI (namuna). 1. Xodim sotuv bo'limiga menejer lavozimiga qabul qilinadi. 2. Xodimga 4 oy muddatga dastlabki sinov belgilanadi. 3. Ish vaqti haftasiga 40 soat. 4. Xodimga har yili 15 ish kuni ta'til beriladi. 5. Xodim ishdan bo'shamoqchi bo'lsa, ish beruvchini 14 kalendar kun oldin yozma ogohlantirishi shart. 6. Mehnat intizomini buzganlik uchun jarima qo'llanilishi mumkin.";
const SAMPLE_RENT = "IJARA SHARTNOMASI (namuna). 1. Ijarachi kvartirani 11 oy muddatga ijaraga oladi. 2. Ijara haqi har oyning 5-sanasigacha to'lanadi. 3. Garov sifatida bir oylik ijara haqi olinadi va shartnoma tugaganda qaytarilmaydi. 4. Ijaraga beruvchi kvartiraga istalgan vaqtda ogohlantirmasdan kira oladi. 5. Shartnomani muddatidan oldin bekor qilish uchun 1 oy oldin yozma ogohlantirish kerak.";
const SAMPLE_Q = "Ish beruvchi 2 oydan beri oylik bermayapti va «shikoyat qilsang bo'shataman» deyapti. Nima qilishim kerak?";

/* lex.uz dan jonli qidirish: so'rov -> hujjatlar -> tanlangan hujjat moddalaridan multfilm (server orqali) */
const LEX_NAMUNA = ["Ishga kirsam sinov muddati qancha bo'ladi?", "Iste'molchi sifatida sifatsiz tovarni qaytarish", "Mehnat kodeksi 130-modda", "Ota-onaning bola oldidagi majburiyatlari"];

/* Manba turlari: 1-qadam */
const MAKE_MODES = {
  lex: {
    t: "lex.uz dan qidirish", ic: "M10 3a7 7 0 0 1 5.6 11.2l5.1 5.1-1.4 1.4-5.1-5.1A7 7 0 1 1 10 3zm0 2a5 5 0 1 0 0 10 5 5 0 0 0 0-10z",
    d: "Hujjat nomi yoki savol yozing — rasmiy matn lex.uz dan olinadi"
  },
  hujjat: {
    t: "Matn yoki rasm", ic: "M6 2h8l6 6v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zm7 1.5V9h5.5zM8 13v2h8v-2zm0 4v2h5v-2z",
    d: "Shartnoma, rasmiy xat yoki moddani joylang yoki rasmini yuklang",
    ex: [["Mehnat shartnomasi", SAMPLE_DOC], ["Ijara shartnomasi", SAMPLE_RENT]]
  },
  savol: {
    t: "Anonim savol", ic: "M12 2a10 10 0 1 1 0 20 10 10 0 0 1 0-20zm0 14a1.3 1.3 0 1 0 0 2.6 1.3 1.3 0 0 0 0-2.6zm.1-10C9.8 6 8.3 7.4 8.2 9.4h2.2c.1-.9.7-1.5 1.6-1.5.9 0 1.6.6 1.6 1.4 0 .7-.3 1.1-1.3 1.7-1.1.7-1.6 1.4-1.5 2.7v.5h2.1v-.4c0-.8.3-1.1 1.3-1.7 1.1-.7 1.8-1.5 1.8-2.9C16 7.3 14.4 6 12.1 6z",
    d: "Vaziyatingizni yozing — ism va shaxsiy ma'lumot shart emas",
    ex: [["Oylik berilmayapti", SAMPLE_Q], ["Sifatsiz telefon", "Do'kondan olgan telefonim 5 kunda buzildi, sotuvchi qaytarib olmayapti. Nima qilay?"], ["Qo'shni devori", "Qo'shnim hovlim chegarasiga ruxsatsiz devor qurdi. Qayerga murojaat qilaman?"]]
  }
};

/* Bo'sh holat: tez boshlash uchun namunalar (mode, matn) */
const MAKE_IDEAS = [
  ["savol", "Ish beruvchi oylik bermayapti", SAMPLE_Q],
  ["lex", "Sinov muddati qancha?", "Ishga kirsam sinov muddati qancha bo'ladi?"],
  ["hujjat", "Ijara shartnomasini tekshir", SAMPLE_RENT],
  ["savol", "Sifatsiz tovarni qaytarish", "Do'kondan olgan telefonim 5 kunda buzildi, sotuvchi qaytarib olmayapti. Nima qilay?"]
];

function StepIc({ d }) {
  return <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d={d} fill="currentColor" /></svg>;
}

/* Yaratish jarayoni: faqat haqiqiy bosqichlar, foizsiz (har bosqich — noaniq holat) */
function useElapsed(on) {
  const [s, setS] = useState(0);
  useEffect(() => {
    if (!on) { setS(0); return; }
    const t0 = Date.now(); setS(0);
    const id = setInterval(() => setS(Math.round((Date.now() - t0) / 1000)), 1000);
    return () => clearInterval(id);
  }, [on]);
  return s;
}
function GenProgress({ job, onCancel }) {
  const sec = useElapsed(!!job);
  if (!job) return null;
  return (
    <section className="panel mk-progress" role="status" aria-live="polite">
      <div className="mk-prog-head">
        <div className="mk-prog-art" aria-hidden="true"><span className="spinner" /></div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <b>Multfilm tayyorlanmoqda</b>
          <div className="sm muted mk-prog-title">{job.title}</div>
        </div>
        <span className="mk-time notr" aria-label={sec + " soniya"}>{sec} s</span>
      </div>
      <ol className="mk-stages">
        {job.steps.map((st, i) => {
          const state = i < job.cur ? "done" : i === job.cur || (st.grp && job.steps[job.cur] && job.steps[job.cur].grp) ? "cur" : "wait";
          return (
            <li key={i} className={cx("mk-stage", state, st.grp && "grp")}>
              <span className="mk-dot" aria-hidden="true" />
              <span className="mk-st-t">{st.t}{state === "cur" && st.live ? <span className="muted"> · {st.live}</span> : null}</span>
              <span className="sr-only">{state === "done" ? " — bajarildi" : state === "cur" ? " — jarayonda" : " — navbatda"}</span>
            </li>
          );
        })}
      </ol>
      {job.hint && <p className="sm muted" style={{ margin: 0 }}>{job.hint}</p>}
      {onCancel && <div className="row gap wrap"><button className="btn ghost" onClick={onCancel}>To'xtatish</button></div>}
    </section>
  );
}

/* Xato holati: tushunarli matn, qayta urinish va oflayn yo'l */
function GenError({ err, onClose }) {
  if (!err) return null;
  return (
    <section className="panel mk-error" role="alert">
      <div className="mk-err-ic" aria-hidden="true">!</div>
      <div style={{ minWidth: 0, flex: 1 }}>
        <b>{err.title || "Multfilm yasab bo'lmadi"}</b>
        <p className="muted">{err.msg}</p>
        {err.tip && <p className="sm muted">{err.tip}</p>}
        <div className="row gap wrap">
          {err.retry && <button className="btn" onClick={err.retry}>Qayta urinish</button>}
          {err.alt && <button className="btn ghost" onClick={err.alt[1]}>{err.alt[0]}</button>}
          <button className="btn ghost" onClick={onClose}>Yopish</button>
        </div>
      </div>
    </section>
  );
}

/* Natija: pleyer markazda, sahnalar, amallar */
function MakeResult({ script, note, offline, busy, onRedo, onReset, outRef }) {
  const [seek, setSeek] = useState(null);
  const lv = LEVELS[script.level];
  const src = script.source || {};
  return (
    <section className="stack mk-result" ref={outRef} tabIndex={-1} aria-label="Tayyor multfilm">
      <div className="mk-res-head">
        <div className="row gap-sm wrap">
          <span className="pill tq">{lv ? lv.label : "Multfilm"}</span>
          {script.aiMade && <span className="pill">AI ssenariysi</span>}
          {offline && <span className="badge warn">Oflayn shablon</span>}
          {src.url && <a className="mk-src" href={src.url} target="_blank" rel="noopener" title={src.url}>
            <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path d="M14 3h7v7h-2V6.4l-9.3 9.3-1.4-1.4L17.6 5H14zM5 5h6v2H5v12h12v-6h2v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z" fill="currentColor" /></svg>
            <span>{src.title || "Manba"}</span></a>}
        </div>
        <h2>{script.title}</h2>
        {note && <p className={cx("note", offline && "warn")} style={{ marginTop: 0 }}>{note}</p>}
      </div>
      <VideoPlayer key={script.id} script={script} seek={seek} />
      {script.scenes && script.scenes.length > 1 && (
        <nav className="mk-scenes" aria-label="Sahnalar">
          <span className="sm muted">Sahnaga o'tish:</span>
          <div className="mk-scene-row">
            {script.scenes.map((sc, i) => (
              <button key={i} className="mk-scene" onClick={() => setSeek({ scene: i, n: Date.now() })}>
                <span className="mk-scene-n notr">{i + 1}</span>{sc.title || "Sahna " + (i + 1)}
              </button>
            ))}
          </div>
        </nav>
      )}
      <div className="panel mk-actions">
        <div className="row gap wrap">
          <button className="btn" onClick={() => onRedo(script.level)} disabled={busy}>Qayta yaratish</button>
          <button className="btn ghost" onClick={onReset} disabled={busy}>Yangi multfilm</button>
        </div>
        <div className="mk-other">
          <span className="sm muted">Boshqa darajada yaratish:</span>
          <div className="row gap-sm wrap">
            {Object.entries(LEVELS).filter(([k]) => k !== script.level).map(([k, v]) => (
              <button key={k} className="btn tonal sm" onClick={() => onRedo(k)} disabled={busy}>{v.label}</button>
            ))}
          </div>
        </div>
      </div>
      <VideoMeta script={script} />
      <details className="panel json">
        <summary>Ssenariy JSON (pleyer shu faylni o'ynaydi)</summary>
        <button className="btn ghost sm" onClick={() => copyText(JSON.stringify(script, null, 2))}>Nusxalash</button>
        <pre className="notr">{JSON.stringify(script, null, 2)}</pre>
      </details>
    </section>
  );
}

function MakeEmpty({ onIdea }) {
  return (
    <section className="panel mk-empty">
      <div className="mk-empty-char" aria-hidden="true">
        <Character id="afandi" playing={true} emotion="happy" gesture="wave" facing="right" />
      </div>
      <div style={{ minWidth: 0, flex: 1 }}>
        <b className="mk-empty-t">Multfilm shu yerda paydo bo'ladi</b>
        <p className="muted">Afandi va Aqlvoy matnni 4–6 sahnali multfilmga aylantiradi: vaziyat, qonun nima deydi, ehtiyot bo'ling va nima qilish kerak. Namunadan boshlab ko'ring:</p>
        <div className="mk-ideas">
          {MAKE_IDEAS.map(([m, t, v]) => (
            <button key={t} className="mk-idea" onClick={() => onIdea(m, v)}>
              <span className="mk-idea-m">{MAKE_MODES[m].t}</span>
              <span>{t}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

function MakePage({ initialMode }) {
  const [mode, setMode] = useState(initialMode || "hujjat");
  const [text, setText] = useState("");
  const [url, setUrl] = useState("");
  const [level, setLevel] = useState("fuqaro");
  const [image, setImage] = useState(null);
  const [fileNote, setFileNote] = useState("");
  const [formNote, setFormNote] = useState("");
  const [job, setJob] = useState(null);
  const [err, setErr] = useState(null);
  const [res, setRes] = useState(null); // { script, note, offline }
  const [ai, setAi] = useState(null);
  const [srv, setSrv] = useState(undefined);
  // lex.uz qidiruvi
  const [q, setQ] = useState("");
  const [found, setFound] = useState(null);
  const [searching, setSearching] = useState(false);
  const [searchErr, setSearchErr] = useState("");
  const ctrl = useRef(null);
  const out = useRef(null);
  const last = useRef(null);
  const top = useRef(null);
  const prog = useRef(null);
  const busy = !!job;

  useEffect(() => {
    let on = true;
    Api.holat().then((h) => { if (!on) return; setSrv(h); if (!initialMode) setMode(h && h.server ? "lex" : "hujjat"); });
    if (initialMode) setMode(initialMode);
    return () => { on = false; };
  }, [initialMode]);
  useEffect(() => { let on = true; Bridge.sample().then((s) => on && setAi(!!s)); return () => { on = false; }; }, []);

  const scrollTo = (r) => setTimeout(() => r.current && r.current.scrollIntoView({ behavior: "smooth", block: "start" }), 60);
  const finish = (script, note, offline) => { setJob(null); setRes({ script, note, offline }); scrollTo(out); };
  const cancel = () => { if (ctrl.current) ctrl.current.abort(); };

  /* --- lex.uz --- */
  const search = async (raw) => {
    const t = (raw != null ? raw : q).trim();
    if (t.length < 3) { setSearchErr("Hujjat nomi yoki savolingizni yozing (kamida 3 harf)."); return; }
    setQ(t); setSearchErr(""); setFound(null); setSearching(true);
    try {
      const d = await Api.qidir(t);
      setFound(d.natijalar || []);
      if (!(d.natijalar || []).length) setSearchErr("Hech narsa topilmadi. Boshqacha yozib ko'ring: masalan, hujjat nomi bilan («Mehnat kodeksi», «Iste'molchilar huquqlari»).");
    } catch (e) { setSearchErr((e && e.message) || "Qidiruvda xato"); }
    setSearching(false);
  };
  const runLex = async (d, lvl, query) => {
    const qq = query || q;
    last.current = (l) => runLex(d, l, qq);
    setErr(null); setRes(null);
    const steps = [
      { t: "lex.uz dan hujjat topildi" },
      { t: "Hujjat matni olinmoqda", grp: 1 },
      { t: "Mos moddalar tanlanmoqda", grp: 1 },
      { t: "Ssenariy yozilmoqda", grp: 1 },
      ...(srv && srv.ovoz ? [{ t: "Ovoz tayyorlanmoqda", grp: 1 }] : []),
      { t: "Sahnalashtirilmoqda" }
    ];
    const J = { title: d.title, steps, cur: 1, hint: "Server bu bosqichlarni ketma-ket bajaradi — odatda 20–40 soniya. " + (LEVELS[lvl] ? "Daraja: " + LEVELS[lvl].label + "." : "") };
    setJob(J); scrollTo(prog);
    ctrl.current = new AbortController();
    try {
      const raw = await Api.multfilm({ id: d.id, q: qq, moddalar: d.moddalar, daraja: lvl, title: d.title }, ctrl.current.signal);
      setJob({ ...J, cur: steps.length - 1 });
      await new Promise((r) => setTimeout(r, 0));
      const s = normalizeScript(raw, { direct: true, text: qq, mode: "savol" });
      if (!s.level) s.level = lvl;
      const arts = (raw.manbaModdalar || []).map((m) => m.n + "-modda").join(", ");
      finish(s, "Ssenariy lex.uz dagi rasmiy matn asosida yozildi" + (arts ? " (" + arts + ")" : "") + ". Baribir yurist tekshiruvidan o'tkazing.", false);
    } catch (e) {
      setJob(null);
      if (e && e.name === "AbortError") { setFormNote("To'xtatildi. Istalgan vaqtda qayta boshlashingiz mumkin."); return; }
      const rate = e && e.code === "rate_limited";
      setErr({
        title: rate ? "Server hozir band" : "Multfilm yasab bo'lmadi",
        msg: (e && e.message) || "lex.uz yoki AI bilan bog'lanib bo'lmadi.",
        tip: "Muqobil yo'l: hujjat matnini lex.uz dan nusxalab «Matn yoki rasm» bo'limiga joylang — AI ulanmagan bo'lsa ham ilova oflayn shablon bilan multfilm tuzadi.",
        retry: rate ? null : () => runLex(d, lvl, qq),
        alt: ["Matnni o'zim joylayman", () => { setErr(null); setMode("hujjat"); scrollTo(top); }]
      });
    }
  };

  /* --- matn / rasm / savol (Claude AI yoki oflayn shablon) --- */
  const onFile = async (e) => {
    const f = e.target.files && e.target.files[0];
    setImage(null); setFileNote("");
    if (!f) return;
    if (f.type.startsWith("image/")) { setImage(f); setFileNote("Rasm qo'shildi: " + f.name + (ai ? " — AI rasmdagi matnni o'qiydi." : " — rasmni o'qish uchun AI ulanishi kerak.")); }
    else if (f.type === "text/plain" || /\.txt$/i.test(f.name)) { setText((await f.text()).slice(0, 20000)); setFileNote("Matn fayldan olindi: " + f.name); }
    else if (/pdf$/i.test(f.type) || /\.pdf$/i.test(f.name)) setFileNote("PDF dan matn ajratish keyingi bosqichda (pdf.js). Hozircha PDF matnini nusxalab joylang.");
    else setFileNote("Bu fayl turi qo'llab-quvvatlanmaydi. Matn (.txt) yoki rasm yuklang.");
  };
  const runAI = async (input, lvl) => {
    const { t, img, md, link } = input;
    last.current = (l) => runAI(input, l);
    setErr(null); setRes(null); setFormNote("");
    const steps = [
      { t: "AI bilan bog'lanilmoqda" },
      { t: "Ssenariy yozilmoqda" },
      { t: "Sahnalashtirilmoqda" }
    ];
    const title = img && !t ? "Rasmdagi hujjat" : (t.length > 70 ? t.slice(0, 70) + "…" : t);
    const J = { title, steps, cur: 0, hint: ai === false ? "AI ulanmagan — oflayn shablon ishlatiladi." : "AI javobni bo'laklab yozadi — belgilar soni real vaqtda o'sadi." };
    setJob(J); scrollTo(prog);
    ctrl.current = new AbortController();
    const sig = ctrl.current.signal;
    let s = null, note = "", offline = false;
    try {
      s = await generateWithAI({
        text: t, level: lvl, mode: md, image: img, signal: sig,
        onProgress: (n) => setJob((j) => j && { ...j, cur: 1, steps: j.steps.map((x, i) => (i === 1 ? { ...x, live: n + " belgi" } : x)) })
      });
      note = "Ssenariyni AI yozdi. Moddalarni lex.uz bilan solishtirib tekshiring.";
    } catch (e) {
      if (sig.aborted || (e && e.name === "AbortError")) { setJob(null); setFormNote("To'xtatildi. Istalgan vaqtda qayta boshlashingiz mumkin."); return; }
      offline = true;
      if (e && e.code === "unavailable") note = "AI ulanmagan — ssenariy oflayn shablon bilan tuzildi (matndagi modda, muddat va ogohlantirishlar asosida).";
      else if (e && e.code === "rate_limited") note = "AI hozir band — oflayn shablon ishlatildi. Birozdan keyin «Qayta yaratish» ni bosing.";
      else if (e && e.code === "not_granted") note = "AI'ga ruxsat berilmadi — oflayn shablon ishlatildi.";
      else note = "AI javobini o'qib bo'lmadi — oflayn shablon ishlatildi.";
      if (t) { setJob((j) => j && { ...j, cur: 2 }); s = templateScript(t, lvl, md); }
    }
    if (s && /^https?:\/\/(www\.)?lex\.uz/i.test(link)) s.source = { title: s.source && s.source.url !== LEX.lex.url ? s.source.title : "lex.uz dagi hujjat", url: link };
    if (s) finish(s, note, offline);
    else {
      setJob(null);
      setErr({ msg: note.replace(" — oflayn shablon ishlatildi.", "."), tip: "Rasmni faqat AI o'qiy oladi. Oflayn shablon uchun hujjat matnini yozib yoki nusxalab joylang.", retry: () => runAI(input, lvl) });
    }
  };
  const generate = () => {
    const t = text.trim();
    if (!t && !image) { setFormNote(mode === "savol" ? "Avval savolingizni yozing." : "Avval matn kiriting yoki rasm yuklang."); return; }
    runAI({ t, img: image, md: mode, link: url.trim() }, level);
  };
  const redo = (lvl) => { if (lvl !== level) setLevel(lvl); if (last.current) last.current(lvl); };
  const reset = () => { setRes(null); setErr(null); setText(""); setImage(null); setFileNote(""); setFound(null); setQ(""); scrollTo(top); };
  const idea = (m, v) => {
    setMode(m); setErr(null); setFormNote("");
    if (m === "lex") { setQ(v); if (srv) search(v); }
    else setText(v);
    scrollTo(top);
  };

  const serious = mode === "savol" && SERIOUS.test(normApos(text));
  const M = MAKE_MODES[mode];
  const hasSource = mode === "lex" ? !!(found && found.length) : !!(text.trim() || image);
  const stepState = (n) => (n === 1 ? (hasSource ? "done" : "cur") : n === 2 ? (hasSource ? "done" : "") : busy ? "cur" : res ? "done" : hasSource ? "cur" : "");
  const lexOk = srv && srv.ai;

  return (
    <div className="stack-lg mk-page">
      <div className="page-head" ref={top}>
        <div><h2>Multfilm yasash</h2><p className="muted">Manbani tanlang, kimga tushuntirishni belgilang — Afandi va Aqlvoy uni qisqa multfilmga aylantiradi.</p></div>
      </div>
      <ol className="mk-steps" aria-label="Bosqichlar">
        {["Manba", "Kimga", "Yaratish"].map((t, i) => <li key={t} className={stepState(i + 1)}><span className="mk-steps-n">{i + 1}</span>{t}</li>)}
      </ol>

      <section className="panel mk-form">
        {/* 1. Manba */}
        <div className="mk-sec">
          <h3 className="mk-sec-t"><span className="mk-num">1</span>Manba</h3>
          <div className="mk-modes" role="tablist" aria-label="Manba turi">
            {Object.entries(MAKE_MODES).map(([k, v]) => (
              <button key={k} role="tab" aria-selected={mode === k} className={cx("mk-mode", mode === k && "on")} onClick={() => { setMode(k); setFormNote(""); }} disabled={busy}>
                <span className="mk-mode-ic"><StepIc d={v.ic} /></span>
                <span className="mk-mode-tx"><b>{v.t}</b><small>{v.d}</small></span>
              </button>
            ))}
          </div>

          {mode === "lex" ? (
            srv === undefined ? <p className="note loading"><span className="spinner" />Server tekshirilmoqda…</p> :
            !srv ? (
              <div className="note warn">lex.uz dan qidirish uchun ilova <b>OsonQonun serveri</b> orqali ochilishi kerak (masalan, <span className="notr">http://localhost:8000</span> yoki internetdagi havola). Fayl sifatida ochilganda bu bo'lim ishlamaydi.
                <button className="btn ghost sm" onClick={() => setMode("hujjat")}>«Matn yoki rasm» ga o'tish</button></div>
            ) : (
              <div className="stack">
                <label className="field">
                  <span>Qaysi hujjat yoki qanday savol?</span>
                  <div className="search-row">
                    <div className="search-box">
                      <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d={MAKE_MODES.lex.ic} fill="currentColor" /></svg>
                      <input type="search" value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === "Enter" && search()}
                        placeholder="Masalan: Mehnat kodeksi sinov muddati" enterKeyHint="search" />
                    </div>
                    <button className="btn" onClick={() => search()} disabled={searching || busy}>{searching && <span className="spinner" />}Qidirish</button>
                  </div>
                </label>
                <div className="mk-ex"><span className="sm muted">Masalan:</span>
                  <div className="chips">{LEX_NAMUNA.map((x) => <button key={x} className="btn ghost sm" onClick={() => search(x)} disabled={searching || busy}>{x}</button>)}</div>
                </div>
                {!srv.ai && <p className="note warn">Serverda Gemini kaliti yo'q: qidiruv ishlaydi, lekin multfilm yozilmaydi. Topilgan hujjat matnini «Matn yoki rasm» bo'limiga joylashingiz mumkin.</p>}
                {searchErr && <p className="note bad">{searchErr} {found === null && !searching && <button className="btn ghost sm" onClick={() => search()}>Qayta urinish</button>}</p>}
              </div>
            )
          ) : (
            <div className="stack">
              <label className="field">
                <span>{mode === "savol" ? "Savolingiz (ism yozmang)" : "Hujjat, modda yoki kazus matni"}</span>
                <textarea rows={6} value={text} onChange={(e) => setText(e.target.value)} disabled={busy}
                  placeholder={mode === "savol" ? "Masalan: Ish beruvchi oylik bermayapti..." : "Shartnoma, rasmiy xat yoki qonun moddasini shu yerga joylang"} />
              </label>
              <div className="mk-ex">
                <span className="sm muted">Namuna:</span>
                <div className="chips">
                  {M.ex.map(([l, v]) => <button key={l} className="btn ghost sm" onClick={() => setText(v)} disabled={busy}>{l}</button>)}
                  {mode === "hujjat" && <label className="btn tonal sm file-btn">Rasm yoki .txt yuklash<input type="file" accept="image/*,.txt,.pdf,text/plain,application/pdf" onChange={onFile} disabled={busy} /></label>}
                </div>
              </div>
              {fileNote && <p className="sm muted" style={{ margin: 0 }}>{fileNote}</p>}
              {mode === "hujjat" && (
                <details className="mk-more">
                  <summary>lex.uz havolasini qo'shish (ixtiyoriy)</summary>
                  <label className="field">
                    <span className="sm muted">Videoda manba sifatida ko'rsatiladi</span>
                    <input type="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://lex.uz/docs/..." />
                  </label>
                </details>
              )}
              {serious && (
                <div className="alert">
                  <b>Jiddiy holatga o'xshaydi.</b> Hayot yoki sog'liqqa xavf bo'lsa, darhol 102 (militsiya) yoki 103 (tez yordam) raqamiga qo'ng'iroq qiling. Huquqiy masalada adliya organlaridagi bepul yuridik yordamga yoki advokatga murojaat qiling.
                </div>
              )}
            </div>
          )}
        </div>

        {/* 2. Kimga */}
        <div className="mk-sec">
          <h3 className="mk-sec-t"><span className="mk-num">2</span>Kimga tushuntiramiz?</h3>
          <div className="seg levels" role="radiogroup" aria-label="Daraja">
            {Object.entries(LEVELS).map(([k, v]) => <button key={k} role="radio" className={cx(level === k && "on")} aria-checked={level === k} onClick={() => setLevel(k)} disabled={busy}>{v.label}</button>)}
          </div>
          {LEVELS[level] && <p className="sm muted mk-hint">{LEVELS[level].hint}</p>}
        </div>

        {/* 3. Yaratish */}
        <div className="mk-sec">
          <h3 className="mk-sec-t"><span className="mk-num">3</span>Yaratish</h3>
          {mode === "lex" ? (
            <>
              {searching && <div className="lex-results" aria-hidden="true">{[0, 1, 2].map((i) => <div key={i} className="sk-card"><div className="sk sk-line w60" /><div className="sk sk-line w80" /></div>)}</div>}
              {!searching && found && found.length > 0 && (
                <div className="lex-results">
                  <p className="sm muted" style={{ margin: 0 }}>Topildi: {found.length} ta hujjat. Mosini tanlang:</p>
                  {found.map((d) => (
                    <div key={d.id} className="panel lex-item">
                      <div className="lex-item-tx">
                        <b>{d.title}</b>
                        <div className="sm muted">{d.sabab}{d.moddalar && d.moddalar.length ? " · moddalar: " + d.moddalar.join(", ") : ""} · <a href={d.url} target="_blank" rel="noopener">lex.uz da ochish ↗</a></div>
                      </div>
                      <button className="btn" onClick={() => runLex(d, level)} disabled={busy || !lexOk}>Multfilm yasash</button>
                    </div>
                  ))}
                </div>
              )}
              {!searching && !(found && found.length) && <p className="sm muted" style={{ margin: 0 }}>Avval qidiring — topilgan hujjatlar shu yerda chiqadi, keyin «Multfilm yasash» ni bosasiz.</p>}
            </>
          ) : (
            <div className="gen-bar mk-gen">
              <button className="btn big" onClick={generate} disabled={busy}>{busy && <span className="spinner" />}{busy ? "Tayyorlanmoqda…" : "Multfilm yaratish"}</button>
              {ai !== null && <span className={cx("ai-state", ai && "on")}>{ai ? "AI rejimi: Claude ulangan" : "AI ulanmagan: oflayn shablon ishlaydi"}</span>}
            </div>
          )}
          {formNote && <p className="note">{formNote}</p>}
        </div>
      </section>

      <div ref={prog} className="mk-anchor"><GenProgress job={job} onCancel={cancel} /></div>
      {busy && <GenSkeleton label="Multfilm tayyorlanmoqda" />}
      <GenError err={err} onClose={() => setErr(null)} />
      {res && !busy && <MakeResult script={res.script} note={res.note} offline={res.offline} busy={busy} onRedo={redo} onReset={reset} outRef={out} />}
      {!res && !busy && !err && <MakeEmpty onIdea={idea} />}
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
        <div><h2>Darslar va kazuslar</h2><p className="muted">Multfilm ko'ring, test yeching, kazusni o'zingiz hal qiling.</p></div>
        <div className="seg" role="tablist">
          <button role="tab" aria-selected={tab === "cases"} className={cx(tab === "cases" && "on")} onClick={() => { setCaseId(null); go("learn"); }}>Kazus-multfilmlar</button>
          <button role="tab" aria-selected={tab === "lessons"} className={cx(tab === "lessons" && "on")} onClick={() => go("lessons")}>Video darslar</button>
        </div>
      </div>
      {tab === "cases" ? (cs ? <CaseVideo cs={cs} onBack={() => setCaseId(null)} /> : (
        <>
          <p className="muted intro">Har bir kazus: voqea multfilmi → «Siz qanday hal qilardingiz?» → Afandi va Aqlvoy bilan 5 bosqichli yechim → ko'p uchraydigan xatolar. Javobingizni yozsangiz, u yechim bilan solishtiriladi.</p>
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
      <div className="panel-head"><h3>Offline saqlangan videolar</h3><span className="pill">{store.saved.length}</span></div>
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
      <div className="profile-head">
        <span className="avatar"><svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true"><path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10zm0 2c-5 0-9 2.5-9 5.5V22h18v-2.5C21 16.5 17 14 12 14z" fill="currentColor" /></svg></span>
        <div><h2 style={{ margin: 0 }}>Profil</h2><p className="muted sm" style={{ margin: 0 }}>Progress va qulaylik sozlamalari</p></div>
      </div>
      <div className="stats">
        <div className="stat"><b>{watched}</b><span>ko'rilgan video</span></div>
        <div className="stat"><b>{solved}/{CASES.length}</b><span>yechilgan kazus</span></div>
        <div className="stat"><b>{r.pct}%</b><span>test natijasi</span></div>
        <div className="stat"><b>{r.weak.length}</b><span>takrorlash kerak</span></div>
      </div>
      {r.weak.length > 0 && <div className="weak sm"><b>Takrorlash kerak:</b>{r.weak.map((l) => <span key={l.id} className="pill">{l.title}</span>)}</div>}
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
