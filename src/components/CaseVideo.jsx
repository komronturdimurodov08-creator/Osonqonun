/* CaseVideo — kazus-multfilm: voqea -> to'xtash -> yechim (5 bosqich) -> xatolar -> javobni solishtirish */

function CaseVideo({ cs, onBack }) {
  const store = useStore();
  const prev = store.cases[cs.id] || {};
  const [answer, setAnswer] = useState(prev.answer || "");
  const [result, setResult] = useState(prev.result || null);
  const [checking, setChecking] = useState(false);
  const [seek, setSeek] = useState(null);
  const resumeRef = useRef(null);
  const boxRef = useRef(null);
  const stopIdx = cs.script.scenes.findIndex((s) => s.stop);
  const save = (patch) => Store.set((s) => ({ ...s, cases: { ...s.cases, [cs.id]: { ...(s.cases[cs.id] || {}), ...patch } } }));

  const continueVideo = () => {
    if (resumeRef.current) { const r = resumeRef.current; resumeRef.current = null; r(); }
    else setSeek({ scene: stopIdx + 1, n: Date.now() });
  };
  const submit = async () => {
    save({ answer });
    continueVideo();
    if (answer.trim().length < 15) { setResult(null); return; }
    setChecking(true);
    const r = await compareAnswer(cs, answer);
    setChecking(false); setResult(r); save({ result: r, solved: true });
  };
  const renderStop = (resume) => {
    resumeRef.current = resume;
    return (
      <div className="stop-card">
        <div className="stop-title">Siz qanday hal qilardingiz?</div>
        <p>{cs.question}</p>
        <div className="row gap wrap center">
          <button className="btn btn-light" onClick={() => boxRef.current && boxRef.current.focus()}>Javob yozaman</button>
          <button className="btn" onClick={() => { resumeRef.current = null; resume(); }}>Yechimni ko'rsat</button>
        </div>
      </div>
    );
  };
  const st = { ok: "✓", partial: "~", miss: "✗" };
  const flow = [
    ["Voqeani ko'ring", !!(store.watched[cs.id] || prev.answer || result || prev.solved)],
    ["Javob yozing", !!(prev.answer || result)],
    ["5 bosqichli yechim", !!prev.solved],
    ["Taqqoslash", !!result]
  ];
  const curStep = flow.findIndex((f) => !f[1]);
  return (
    <div className="stack-lg">
      <button className="link-back" onClick={onBack}><span aria-hidden="true">←</span> Barcha kazuslar</button>
      <div className="case-head">
        <span className="pill">{cs.subject}</span>
        <h2>{cs.title}</h2>
        <p className="muted">{cs.short}</p>
      </div>
      <ol className="stepper" aria-label="Kazus bosqichlari">
        {flow.map(([t, ok], i) => <li key={i} className={cx(ok && "done", i === curStep && "cur")} aria-current={i === curStep ? "step" : undefined}>{t}</li>)}
      </ol>
      <VideoPlayer key={cs.id} script={cs.script} seek={seek} renderStop={renderStop}
        onWatched={() => Store.set((s) => ({ ...s, watched: { ...s.watched, [cs.id]: true } }))}
        onEnd={() => save({ solved: true })} />
      <section className="panel">
        <h3>Sizning yechimingiz</h3>
        <p className="muted">Video to'xtaganda javobingizni shu yerga yozing — faktlar, masala, qoida, tahlil va xulosa tartibida. Yuborgach, yechim davom etadi va javobingiz 5 bosqich bo'yicha solishtiriladi.</p>
        <textarea ref={boxRef} rows={5} value={answer} onChange={(e) => setAnswer(e.target.value)}
          placeholder="Masalan: Faktlar - ... Masala - ... Qoida - ...-modda ... Xulosa - ..." />
        <div className="row gap wrap answer-actions">
          <button className="btn" onClick={submit} disabled={checking}>{checking && <span className="spinner" />}{checking ? "Solishtirilmoqda…" : "Javobni yuborish va yechimni ko'rish"}</button>
          <button className="btn ghost" onClick={continueVideo}>Javobsiz yechimni ko'rsat</button>
        </div>
        {result && (
          <div className="compare">
            <div className="compare-head">Javobingiz tahlili <span className="muted">({result.by === "ai" ? "AI tahlili" : "kalit so'zlar bo'yicha tekshiruv"})</span></div>
            {result.stages.map((r, i) => (
              <div key={i} className={cx("cmp-row", r.status)}>
                <span className="cmp-mark">{st[r.status] || "?"}</span>
                <div><b>{i + 1}. {STAGE_NAMES[i]}</b><div className="muted">{r.comment}</div></div>
                <button className="btn ghost sm" onClick={() => setSeek({ scene: stopIdx + 1 + i, n: Date.now() })}>Videoda ko'rish</button>
              </div>
            ))}
            <p className="overall">{result.overall}</p>
          </div>
        )}
      </section>
      <section className="panel">
        <div className="panel-head"><h3>Yechim xaritasi</h3><span className="muted sm">Bosqichni bosing — video shu joydan boshlanadi</span></div>
        <div className="stages">
          {cs.stages.map((s, i) => (
            <button key={i} className="stage-card" onClick={() => setSeek({ scene: stopIdx + 1 + i, n: Date.now() })}>
              <span className="stage-n">{i + 1}</span>
              <b>{STAGE_NAMES[i]}</b>
              <span className="muted sm">{STAGE_Q[i]}</span>
            </button>
          ))}
        </div>
        <h4>Ko'p uchraydigan xatolar</h4>
        <ul className="mistakes">{cs.mistakes.map((m, i) => <li key={i}>{m.short}</li>)}</ul>
      </section>
      <VideoMeta script={cs.script} />
    </div>
  );
}

function CaseList({ onOpen }) {
  const store = useStore();
  return (
    <div className="grid-cards">
      {CASES.map((c) => (
        <button key={c.id} className="case-card" onClick={() => onOpen(c.id)}>
          <span className="pill">{c.subject}</span>
          <b>{c.title}</b>
          <span className="muted">{c.short}</span>
          <span className="case-foot">
            <span className="case-play">{fmtTime(buildTimeline(c.script).total)} · 5 bosqich</span>
            {store.cases[c.id] && store.cases[c.id].solved && <span className="done">Yechilgan ✓</span>}
          </span>
        </button>
      ))}
      <div className="case-card muted-card">
        <b>O'z kazusingiz</b>
        <span className="muted">Kazus matnini "Multfilm yasash" bo'limiga joylang va "Yurist-talabaga" darajasini tanlang — AI undan ham multfilm yasaydi.</span>
        <a className="btn ghost sm" href="#make">Kazus kiritish</a>
      </div>
    </div>
  );
}
