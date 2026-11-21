/* App — navigatsiya (hash), sozlamalarni qo'llash, pastki 4 tugma, "Orqaga" tugmasi, huquqiy fon */

const ROUTES = ["home", "make", "savol", "learn", "lessons", "recap", "roadmap", "profile"];
const TAB_OF = { home: "home", roadmap: "home", make: "make", savol: "make", learn: "learn", lessons: "learn", recap: "learn", profile: "profile" };

function NavIcon({ name }) {
  const d = {
    home: "M3 11 12 3l9 8v10h-6v-6H9v6H3z",
    make: "M4 5h12a2 2 0 0 1 2 2v1.5l3-2v11l-3-2V17a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2zm4 3v8l6-4z",
    learn: "M12 3 1 9l11 6 9-4.9V17h2V9zM5 13.2V17l7 4 7-4v-3.8L12 17z",
    profile: "M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10zm0 2c-5 0-9 2.5-9 5.5V22h18v-2.5C21 16.5 17 14 12 14z",
    lessons: "M4 4h16v12H4zm6 3v6l5-3zM8 19h8v2H8z",
    roadmap: "M9 3 3 5v16l6-2 6 2 6-2V3l-6 2zm1 2.2 4 1.3v12.3l-4-1.3z",
    savol: "M12 2a10 10 0 0 0-8.7 15l-1.3 5 5-1.3A10 10 0 1 0 12 2zm.1 15.5a1.3 1.3 0 1 1 0-2.6 1.3 1.3 0 0 1 0 2.6zm1.4-5.3c-.6.4-.8.7-.8 1.3v.4h-2.2v-.5c0-1.3.5-2 1.5-2.6.8-.5 1.1-.8 1.1-1.4 0-.7-.6-1.1-1.3-1.1-.8 0-1.4.5-1.5 1.3H8.1c.1-2 1.7-3.3 3.9-3.3 2.2 0 3.6 1.2 3.6 3 0 1.3-.7 2.1-2.1 2.9z"
  }[name];
  return <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true"><path d={d} fill="currentColor" /></svg>;
}

function App() {
  const read = () => { const h = (location.hash || "").replace("#", ""); return ROUTES.includes(h) ? h : "home"; };
  const [route, setRoute] = useState(read);
  const store = useStore();
  const steps = useRef(0); // ilova ichida nechta sahifa ochildi — "Orqaga" saytdan chiqib ketmasligi uchun
  useEffect(() => {
    const f = () => { steps.current += 1; setRoute(read()); window.scrollTo(0, 0); };
    window.addEventListener("hashchange", f);
    return () => window.removeEventListener("hashchange", f);
  }, []);
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("big-font", !!store.settings.bigFont);
    root.classList.toggle("hc", !!store.settings.contrast);
    I18n.setLang(curLang(store), document.body);
  }, [store.settings.bigFont, store.settings.contrast, store.settings.lang, store.settings.alphabet]);
  // Til menyusi: tashqariga bosilganda yoki Esc bilan yopiladi
  const [langOpen, setLangOpen] = useState(false);
  const langRef = useRef(null);
  useEffect(() => {
    if (!langOpen) return;
    const onDoc = (e) => { if (langRef.current && !langRef.current.contains(e.target)) setLangOpen(false); };
    const onKey = (e) => { if (e.key === "Escape") setLangOpen(false); };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onDoc); document.removeEventListener("keydown", onKey); };
  }, [langOpen]);
  const chooseLang = (id) => { Store.set((s) => ({ ...s, settings: { ...s.settings, lang: id, alphabet: id === "uzc" ? "cyr" : "lat" } })); setLangOpen(false); };
  const go = (r, mode) => {
    const target = mode === "savol" ? "savol" : r;
    if (location.hash.replace("#", "") === target) { setRoute(target); window.scrollTo(0, 0); }
    else location.hash = target;
  };
  const back = () => {
    if (steps.current > 0) { steps.current -= 2; history.back(); }
    else go(route === "lessons" || route === "recap" ? "learn" : "home");
  };
  const tab = TAB_OF[route];
  const nav = [["home", "Bosh sahifa"], ["make", "Multfilm yasash"], ["learn", "Darslar va kazuslar"], ["profile", "Profil"]];
  const CRUMB = { make: "Multfilm yasash", savol: "Anonim savol", learn: "Darslar va kazuslar", lessons: "Video darslar", recap: "Takrorlash", roadmap: "Huquqlar yo'l xaritasi", profile: "Profil" };
  const toggleBig = () => Store.set((s) => ({ ...s, settings: { ...s.settings, bigFont: !s.settings.bigFont } }));
  const toggleHc = () => Store.set((s) => ({ ...s, settings: { ...s.settings, contrast: !s.settings.contrast } }));
  const side = [["home", "Bosh sahifa"], ["make", "Multfilm yasash"], ["learn", "Kazus-multfilmlar"], ["lessons", "Video darslar"], ["roadmap", "Huquqlar yo'l xaritasi"], ["savol", "Anonim savol"], ["profile", "Profil"]];
  return (
    <div className="app">
      <LawBackground />
      <aside className="sidebar" aria-label="Bo'limlar">
        <a className="logo" href="#home" aria-label="OsonQonun bosh sahifa">
          <img className="logo-img" src={LOGO_SRC} alt="" width="48" height="48" />
          <span className="notr">Oson<b>Qonun</b></span>
        </a>
        <p className="side-label">Xizmatlar</p>
        <nav className="side-nav">
          {side.map(([k, label]) => (
            <a key={k} href={"#" + k} className={cx(route === k && "on")} aria-current={route === k ? "page" : undefined}>
              <NavIcon name={k} /><span>{label}</span>
            </a>
          ))}
        </nav>
        <div className="side-help">
          <b>Yordam kerakmi?</b>
          <span>Savolingizni anonim yozing — javob multfilm bo'lib keladi.</span>
          <a href="#savol">Savol berish</a>
        </div>
      </aside>
      <div className="content">
        <header className="topbar">
          <a className="mob-logo" href="#home" aria-label="OsonQonun bosh sahifa">
            <img className="logo-img" src={LOGO_SRC} alt="" width="38" height="38" />
            <span className="notr">Oson<b>Qonun</b></span>
          </a>
          <div className="portal-title">Huquqiy ta'lim va targ'ibot<br />interaktiv platformasi</div>
          <div className="top-actions">
            <div className="lang-wrap" ref={langRef}>
              <button className="round-act" onClick={() => setLangOpen((o) => !o)} aria-haspopup="menu" aria-expanded={langOpen} aria-label="Tilni tanlash" title="Tilni tanlash">
                <i className="ra-ico ra-emblem" aria-hidden="true">
                  <svg viewBox="0 0 100 100" width="52" height="52">
                    <circle cx="47" cy="47" r="42" fill="currentColor" />
                    <path d="M64 80 84 88a2.5 2.5 0 0 0 3.2-3.4L78 65z" fill="currentColor" />
                    <g fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round">
                      <circle cx="47" cy="47" r="25" />
                      <ellipse cx="47" cy="47" rx="10" ry="25" />
                      <path d="M22 47h50M27 33q20 9 40 0M27 61q20-9 40 0" />
                    </g>
                  </svg>
                </i>
                <span className="ra-txt"><b>Til</b><small className="notr">{LANGS.find((l) => l.id === curLang(store)).short} · {LANGS.find((l) => l.id === curLang(store)).name}</small></span>
              </button>
              {langOpen && (
                <ul className="lang-menu notr" role="menu">
                  {LANGS.map((l) => (
                    <li key={l.id} role="none">
                      <button role="menuitemradio" aria-checked={curLang(store) === l.id} className={cx("lang-item", curLang(store) === l.id && "on")} onClick={() => chooseLang(l.id)} lang={l.html}>
                        <b>{l.short}</b><span>{l.name}</span>
                        {curLang(store) === l.id && <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M5 12.5 10 17l9-10" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <button className={cx("round-act", store.settings.bigFont && "on")} onClick={toggleBig} aria-pressed={!!store.settings.bigFont}>
              <i className="ra-ico ra-blue" aria-hidden="true">A+</i>
              <span className="ra-txt"><b>Shrift</b><small>Kattaroq matn</small></span>
            </button>
            <button className={cx("icon-act", store.settings.contrast && "on")} onClick={toggleHc} aria-pressed={!!store.settings.contrast} aria-label="Ko'zi ojizlar uchun (yuqori kontrast)" title="Ko'zi ojizlar uchun">
              <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true"><circle cx="12" cy="4" r="2" fill="currentColor" /><path d="M4 8h16M12 8v6m0 0-3 7m3-7 3 7" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" /></svg>
            </button>
            <a className="glow-btn" href="#make">
              <i aria-hidden="true"><svg viewBox="0 0 24 24" width="20" height="20"><path d="M8 5v14l11-7z" fill="currentColor" /></svg></i>
              Multfilm yasash
            </a>
          </div>
        </header>
        <main className="main">
          {route !== "home" && (
            <div className="page-nav">
              <button className="back-btn" onClick={back}>
                <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M15 5 8 12l7 7" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
                Orqaga
              </button>
              <nav className="crumbs" aria-label="Siz shu yerdasiz">
                <a href="#home">Bosh sahifa</a><span aria-hidden="true">/</span>
                {(route === "lessons" || route === "recap") && <><a href="#learn">Darslar va kazuslar</a><span aria-hidden="true">/</span></>}
                <span aria-current="page">{CRUMB[route]}</span>
              </nav>
            </div>
          )}
          {tab === "home" && route === "roadmap" && <RightsRoadmap />}
          {route === "home" && <HomePage go={go} />}
          {tab === "make" && <MakePage initialMode={route === "savol" ? "savol" : "hujjat"} />}
          {tab === "learn" && <LearnPage sub={route} go={go} />}
          {route === "profile" && <ProfilePage />}
        </main>
        <footer className="site-foot">
          <div className="foot-grid">
            <div>
              <div className="foot-logo notr">Oson<b>Qonun</b></div>
              <p>Qonunlarni multfilm orqali tushuntiruvchi huquqiy ta'lim platformasi. Lex hackatoni, 2-yo'nalish: huquqiy ta'lim va targ'ibot.</p>
            </div>
            <div>
              <h3>Bo'limlar</h3>
              <a href="#make">Multfilm yasash</a><a href="#learn">Kazus-multfilmlar</a><a href="#lessons">Video darslar</a><a href="#roadmap">Huquqlar yo'l xaritasi</a>
            </div>
            <div>
              <h3>Manbalar</h3>
              <a href="https://lex.uz" target="_blank" rel="noopener">lex.uz — qonun hujjatlari bazasi</a>
              <p className="foot-note">Videolar ta'limiy maqsadda tayyorlangan va yuridik maslahat hisoblanmaydi. Bu platforma davlat organining rasmiy sayti emas.</p>
            </div>
          </div>
        </footer>
      </div>
      <nav className="bottom-nav" aria-label="Asosiy menyu">
        {nav.map(([k, label]) => (
          <a key={k} href={"#" + k} className={cx(tab === k && "on")} aria-current={tab === k ? "page" : undefined}>
            <NavIcon name={k} /><span>{label}</span>
          </a>
        ))}
      </nav>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
