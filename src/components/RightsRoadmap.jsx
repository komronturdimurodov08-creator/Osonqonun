/* RightsRoadmap — yosh bo'yicha huquq va majburiyatlar vaqt chizig'i, har biri uchun 1 daqiqalik multfilm */

function RightsRoadmap() {
  const [age, setAge] = useState(16);
  const [video, setVideo] = useState(null);
  const top = useRef(null);
  const opened = ROADMAP.filter((m) => m.age <= age).reduce((a, m) => a + m.items.length, 0);
  const next = ROADMAP.find((m) => m.age > age);
  const open = (item, m) => {
    setVideo(rightScript(item, m.label, m.bg));
    setTimeout(() => top.current && top.current.scrollIntoView({ behavior: "smooth", block: "start" }), 30);
  };
  return (
    <div className="stack-lg">
      <div className="road-hero" ref={top}>
        <div>
          <span className="eyebrow">7 yoshdan 70 yoshgacha</span>
          <h2>Huquqlar yo'l xaritasi</h2>
          <p className="muted">7 yoshdan 70 yoshgacha: yoshingizni kiriting — qaysi huquq va majburiyatlar ochilganini ko'rasiz.</p>
          <label className="age-input">
            <span>Yoshingiz</span>
            <input type="number" min="0" max="100" value={age} onChange={(e) => setAge(Math.max(0, Math.min(100, +e.target.value || 0)))} />
          </label>
          <input className="age-range" type="range" min="0" max="70" value={Math.min(age, 70)} onChange={(e) => setAge(+e.target.value)} aria-label="Yosh" />
          <p className="road-stat"><b>{opened}</b> ta huquq va majburiyat ochilgan{next ? <> · keyingisi <b>{next.age - age}</b> yildan keyin ({next.label})</> : " · barcha bosqichlar ochilgan"}</p>
        </div>
        {video && (
          <div className="road-video">
            <VideoPlayer key={video.id} script={video} allowVertical={false} />
            <div className="row between"><span className="muted sm">{video.title}</span><button className="btn ghost sm" onClick={() => setVideo(null)}>Yopish</button></div>
          </div>
        )}
      </div>
      <ol className="timeline">
        {ROADMAP.map((m) => {
          const on = m.age <= age;
          return (
            <li key={m.age} className={cx("tl-item", on ? "on" : "off")}>
              <div className="tl-age">{m.label}</div>
              <div className="tl-dot" />
              <div className="tl-cards">
                {m.items.map((it, i) => (
                  <div key={i} className={cx("tl-card", it.duty && "duty")}>
                    <div className="row between wrap gap-sm"><b>{it.title}</b><span className="ref notr">{it.ref}</span></div>
                    <p>{it.text}</p>
                    <div className="row between wrap gap-sm">
                      <span className={cx("sm", on ? (it.duty ? "tag-duty" : "tag-ok") : "muted")}>{on ? (it.duty ? "Majburiyat" : "Huquq ochilgan ✓") : "Hali ochilmagan: " + (m.age - age) + " yil qoldi"}</span>
                      <button className={cx("btn", "sm", !on && "tonal")} onClick={() => open(it, m)}>▶ 1 daqiqalik multfilm</button>
                    </div>
                  </div>
                ))}
              </div>
            </li>
          );
        })}
      </ol>
      <section className="panel">
        <h3>Har qanday yoshda</h3>
        <div className="grid-2">
          {ALWAYS_RIGHTS.map((it, i) => (
            <div key={i} className="tl-card">
              <div className="row between wrap gap-sm"><b>{it.title}</b><span className="ref notr">{it.ref}</span></div>
              <p>{it.text}</p>
              <button className="btn sm" onClick={() => open(it, { label: "Har qanday yosh", bg: "sud" })}>▶ 1 daqiqalik multfilm</button>
            </div>
          ))}
        </div>
        <p className="disclaimer">Namuna kontent: moddalar lex.uz dagi amaldagi tahrirlar asosida tayyorlangan, yurist tekshiruvidan o'tishi kerak.</p>
      </section>
    </div>
  );
}
