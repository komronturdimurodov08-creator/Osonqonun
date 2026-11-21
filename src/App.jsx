/* App — navigatsiya (hash), sozlamalarni qo'llash, pastki 4 tugma */

const ROUTES = ["home", "make", "savol", "learn", "lessons", "recap", "roadmap", "profile"];
const TAB_OF = { home: "home", roadmap: "home", make: "make", savol: "make", learn: "learn", lessons: "learn", recap: "learn", profile: "profile" };

function NavIcon({ name }) {
  const d = {
    home: "M3 11 12 3l9 8v10h-6v-6H9v6H3z",
    make: "M4 5h12a2 2 0 0 1 2 2v1.5l3-2v11l-3-2V17a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2zm4 3v8l6-4z",
    learn: "M12 3 1 9l11 6 9-4.9V17h2V9zM5 13.2V17l7 4 7-4v-3.8L12 17z",
    profile: "M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10zm0 2c-5 0-9 2.5-9 5.5V22h18v-2.5C21 16.5 17 14 12 14z"
  }[name];
  return <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true"><path d={d} fill="currentColor" /></svg>;
}

function App() {
  const read = () => { const h = (location.hash || "").replace("#", ""); return ROUTES.includes(h) ? h : "home"; };
  const [route, setRoute] = useState(read);
  const store = useStore();
  useEffect(() => {
    const f = () => { setRoute(read()); window.scrollTo(0, 0); };
    window.addEventListener("hashchange", f);
    return () => window.removeEventListener("hashchange", f);
  }, []);
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("big-font", !!store.settings.bigFont);
    root.classList.toggle("hc", !!store.settings.contrast);
    Translit.setMode(store.settings.alphabet, document.body);
  }, [store.settings.bigFont, store.settings.contrast, store.settings.alphabet]);
  const go = (r, mode) => {
    const target = mode === "savol" ? "savol" : r;
    if (location.hash.replace("#", "") === target) { setRoute(target); window.scrollTo(0, 0); }
    else location.hash = target;
  };
  const tab = TAB_OF[route];
  const nav = [["home", "Bosh sahifa"], ["make", "Multfilm yasash"], ["learn", "Darslar va kazuslar"], ["profile", "Profil"]];
  return (
    <div className="app">
      <header className="topbar">
        <a className="logo" href="#home" aria-label="OsonQonun bosh sahifa">
          <svg viewBox="0 0 40 40" width="34" height="34" aria-hidden="true"><rect width="40" height="40" rx="10" fill="#1f4e9c" /><path d="M20 6 L23 17 L34 20 L23 23 L20 34 L17 23 L6 20 L17 17 Z" fill="#f2b134" /><circle cx="20" cy="20" r="4" fill="#fff" /></svg>
          <span className="notr">Oson<b>Qonun</b></span>
        </a>
        <div className="top-actions">
          <button className="chip" onClick={() => Store.set((s) => ({ ...s, settings: { ...s.settings, alphabet: s.settings.alphabet === "lat" ? "cyr" : "lat" } }))}
            aria-label="Alifboni almashtirish"><span className="notr">{store.settings.alphabet === "lat" ? "Lot → Кир" : "Кир → Lot"}</span></button>
          <button className={cx("chip", store.settings.bigFont && "on")} onClick={() => Store.set((s) => ({ ...s, settings: { ...s.settings, bigFont: !s.settings.bigFont } }))} aria-pressed={!!store.settings.bigFont} aria-label="Katta shrift">A+</button>
        </div>
      </header>
      <main className="main">
        {tab === "home" && route === "roadmap" && <><button className="link-back" onClick={() => go("home")}>← Bosh sahifa</button><RightsRoadmap /></>}
        {route === "home" && <HomePage go={go} />}
        {tab === "make" && <MakePage initialMode={route === "savol" ? "savol" : undefined} />}
        {tab === "learn" && <LearnPage sub={route} go={go} />}
        {route === "profile" && <ProfilePage />}
        <footer className="foot"><span className="notr">OsonQonun</span> · Lex hackatoni, 2-yo'nalish: huquqiy ta'lim va targ'ibot · Videolar ta'limiy maqsadda, yuridik maslahat emas · Manba: <a href="https://lex.uz" target="_blank" rel="noopener">lex.uz</a></footer>
      </main>
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
