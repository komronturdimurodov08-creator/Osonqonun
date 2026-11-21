/* CaseVideo — kazus-multfilm: voqea -> to'xtash -> yechim (5 bosqich) */

function CaseVideo({ cs, onBack }) {
  const save = (patch) => Store.set((s) => ({ ...s, cases: { ...s.cases, [cs.id]: { ...(s.cases[cs.id] || {}), ...patch } } }));
  const renderStop = (resume) => (
    <div className="stop-card">
      <div className="stop-title">Siz qanday hal qilardingiz?</div>
      <p>{cs.question}</p>
      <div className="row gap wrap center">
        <button className="btn" onClick={resume}>Yechimni ko'rsat</button>
      </div>
    </div>
  );
  return (
    <div className="stack-lg">
      <button className="link-back" onClick={onBack}>← Barcha kazuslar</button>
      <div className="case-head">
        <span className="pill">{cs.subject}</span>
        <h2>{cs.title}</h2>
        <p className="muted">{cs.short}</p>
      </div>
      <VideoPlayer key={cs.id} script={cs.script} renderStop={renderStop}
        onWatched={() => Store.set((s) => ({ ...s, watched: { ...s.watched, [cs.id]: true } }))}
        onEnd={() => save({ solved: true })} />
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
            <span>{fmtTime(buildTimeline(c.script).total)} · 5 bosqichli yechim</span>
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
