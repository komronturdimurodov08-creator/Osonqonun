/* LessonPlaylist — fan bo'yicha video darslar, tekshiruv savollari, takrorlash va oraliq nazoratga tayyorlik */

function shuffled(arr, seed) {
  const idx = arr.map((_, i) => i);
  let x = seed * 9301 + 49297;
  for (let i = idx.length - 1; i > 0; i--) { x = (x * 9301 + 49297) % 233280; const j = Math.floor((x / 233280) * (i + 1)); [idx[i], idx[j]] = [idx[j], idx[i]]; }
  return idx;
}

function readiness(store) {
  const done = LESSONS.filter((l) => store.quiz[l.id]);
  const correct = done.reduce((a, l) => a + store.quiz[l.id].correct, 0);
  const total = done.reduce((a, l) => a + store.quiz[l.id].total, 0);
  const pct = total ? Math.round((correct / total) * 100) : 0;
  const watched = LESSONS.filter((l) => store.watched[l.id]).length;
  const weak = LESSONS.filter((l) => store.quiz[l.id] && (store.quiz[l.id].correct / store.quiz[l.id].total) * 100 < store.threshold);
  const ready = watched === LESSONS.length && done.length === LESSONS.length && pct >= store.threshold;
  return { pct, watched, quizzes: done.length, weak, ready };
}

function Quiz({ lesson, tl, onSeek }) {
  const [ans, setAns] = useState({});
  const finished = Object.keys(ans).length === lesson.quiz.length;
  useEffect(() => {
    if (!finished) return;
    const correct = lesson.quiz.filter((q, i) => ans[i] === q.answer).length;
    Store.set((s) => ({ ...s, quiz: { ...s.quiz, [lesson.id]: { correct, total: lesson.quiz.length } } }));
  }, [finished]);
  return (
    <section className="panel">
      <div className="panel-head"><h3>Tekshiruv savollari</h3><span className="muted sm">{Object.keys(ans).length}/{lesson.quiz.length}</span></div>
      <div className="quiz-progress" aria-hidden="true"><div className="meter"><i style={{ width: (Object.keys(ans).length / lesson.quiz.length) * 100 + "%" }} /></div></div>
      {lesson.quiz.map((q, qi) => {
        const order = shuffled(q.options, qi + lesson.id.length * 7);
        const picked = ans[qi];
        return (
          <div key={qi} className="quiz-q">
            <p className="q"><b>{qi + 1}.</b> {q.q}</p>
            <div className="opts">
              {order.map((oi) => (
                <button key={oi} disabled={picked !== undefined}
                  className={cx("opt", picked !== undefined && oi === q.answer && "right", picked === oi && oi !== q.answer && "wrong")}
                  onClick={() => setAns({ ...ans, [qi]: oi })}>{q.options[oi]}</button>
              ))}
            </div>
            {picked !== undefined && (
              <div className={cx("explain", picked === q.answer ? "good" : "bad")}>
                <span>{picked === q.answer ? "To'g'ri. " : "Noto'g'ri. "}{q.why}</span>
                <button className="link" onClick={() => onSeek(q.ref)}>Bu javob {fmtTime(sceneStart(tl, q.ref))} da tushuntirilgan →</button>
              </div>
            )}
          </div>
        );
      })}
      {finished && (
        <div className="quiz-result">
          <p className="overall">Natija: {lesson.quiz.filter((q, i) => ans[i] === q.answer).length} / {lesson.quiz.length}</p>
          <button className="btn ghost sm" onClick={() => setAns({})}>Qayta yechish</button>
        </div>
      )}
    </section>
  );
}

function LessonPlaylist({ mode }) {
  const store = useStore();
  const [cur, setCur] = useState(0);
  const [seek, setSeek] = useState(null);
  const [recap, setRecap] = useState(mode === "recap");
  const topRef = useRef(null);
  useEffect(() => setRecap(mode === "recap"), [mode]);
  const les = LESSONS[cur];
  const tl = useMemo(() => buildTimeline(les.script), [les]);
  const r = readiness(store);
  const watch = (id) => () => Store.set((s) => ({ ...s, watched: { ...s.watched, [id]: true } }));
  const pick = (i) => { setRecap(false); setCur(i); setSeek(null); topRef.current && topRef.current.scrollIntoView({ behavior: "smooth", block: "start" }); };
  return (
    <div className="lesson-layout">
      <div className="lesson-main stack-lg" ref={topRef}>
        {recap ? (
          <>
            <div className="case-head"><span className="pill tq">Takrorlash rejimi</span><h2>{RECAP.title}</h2><p className="muted">Har mavzu bo'yicha qisqa xulosa — ketma-ket, taxminan bir daqiqada.</p></div>
            <VideoPlayer key="recap" script={RECAP} />
            <VideoMeta script={RECAP} />
          </>
        ) : (
          <>
            <div className="case-head"><span className="pill">{(cur + 1) + "-dars · Konstitutsiyaviy huquq"}</span><h2>{les.title}</h2></div>
            <VideoPlayer key={les.id} script={les.script} seek={seek} onWatched={watch(les.id)}
              endExtra={cur + 1 < LESSONS.length && <button className="btn" onClick={() => pick(cur + 1)}>Keyingi dars →</button>} />
            <Quiz key={les.id + "-q"} lesson={les} tl={tl} onSeek={(s) => { setSeek({ scene: s, n: Date.now() }); topRef.current && topRef.current.scrollIntoView({ behavior: "smooth" }); }} />
            <VideoMeta script={les.script} />
          </>
        )}
      </div>
      <aside className="lesson-side stack">
        <section className={cx("panel", "ready-card", r.ready && "is-ready")}>
          <div className="ready-top">
            <div className="ring" style={{ "--p": Math.min(100, r.pct) }}><span className="ready-pct">{r.pct}%</span></div>
            <div>
              <b>{r.ready ? "Nazoratga tayyor ✓" : "Oraliq nazoratga tayyorlik"}</b>
              <div className="muted sm">O'tish chegarasi: {store.threshold}% · darslar {r.watched}/{LESSONS.length} · testlar {r.quizzes}/{LESSONS.length}</div>
            </div>
          </div>
          <div className="meter"><i style={{ width: Math.min(100, r.pct) + "%" }} /><b style={{ left: store.threshold + "%" }} /></div>
          {r.weak.length > 0 && <p className="sm">Takrorlash kerak: {r.weak.map((l) => l.title).join("; ")}</p>}
          <details className="teacher">
            <summary>O'qituvchi paneli</summary>
            <label className="sm">O'tish foizi: <b>{store.threshold}%</b>
              <input type="range" min="50" max="100" step="5" value={store.threshold} onChange={(e) => Store.set({ threshold: +e.target.value })} />
            </label>
          </details>
        </section>
        <section className="panel">
          <div className="panel-head"><h3>Pleylist</h3><span className="muted sm">{r.watched}/{LESSONS.length} ko'rildi</span></div>
          <ol className="playlist">
            {LESSONS.map((l, i) => {
              const q = store.quiz[l.id];
              return (
                <li key={l.id}>
                  <button className={cx("pl-item", !recap && i === cur && "active", store.watched[l.id] && "seen")} onClick={() => pick(i)} aria-current={!recap && i === cur ? "true" : undefined}>
                    <span className="pl-n">{store.watched[l.id] && (recap || i !== cur) ? "✓" : i + 1}</span>
                    <span className="pl-t">{l.title}<small>{fmtTime(buildTimeline(l.script).total)}{store.watched[l.id] ? " · ko'rildi" : ""}{q ? " · test " + q.correct + "/" + q.total : ""}</small></span>
                  </button>
                </li>
              );
            })}
          </ol>
          <button className={cx("btn", "full", recap ? "" : "ghost")} onClick={() => setRecap(true)}>Imtihondan oldin takrorlash (1 daqiqa)</button>
        </section>
      </aside>
    </div>
  );
}
