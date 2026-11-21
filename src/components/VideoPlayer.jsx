/* VideoPlayer — JSON ssenariyni multfilm kabi o'ynaydi.
   play/pause, tezlik 0.75x–2x, subtitr, ovoz, oldinga/orqaga sahna, to'liq ekran, vertikal 9:16 */

const SPEEDS = [0.75, 1, 1.25, 1.5, 2];

function Icon({ name }) {
  const p = {
    play: "M8 5v14l11-7z", pause: "M7 5h4v14H7zM13 5h4v14h-4z",
    prev: "M6 5h2v14H6zM9.5 12 19 5v14z", next: "M16 5h2v14h-2zM5 5l9.5 7L5 19z",
    full: "M4 4h6v2H6v4H4zm10 0h6v6h-2V6h-4zM4 14h2v4h4v2H4zm14 0h2v6h-6v-2h4z",
    replay: "M12 5V2L7 6l5 4V7a5 5 0 1 1-5 5H5a7 7 0 1 0 7-7z",
    phone: "M8 2h8a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zm0 3v13h8V5z",
    sound: "M4 9h4l5-4v14l-5-4H4zM16 8a5 5 0 0 1 0 8l-1.4-1.4a3 3 0 0 0 0-5.2z",
    mute: "M4 9h4l5-4v14l-5-4H4zM16 9l1.4-1.4L19.5 9.7l2.1-2.1L23 9l-2.1 2.1L23 13.2l-1.4 1.4-2.1-2.1-2.1 2.1L16 13.2l2.1-2.1z"
  }[name];
  return <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d={p} fill="currentColor" /></svg>;
}

function VideoPlayer({ script, onEnd, onWatched, seek, renderStop, allowVertical = true, endExtra }) {
  const settings = useStore().settings;
  const tl = useMemo(() => buildTimeline(script), [script]);
  const S = useRef({ idx: 0, elapsed: 0, speechDone: true, playing: false, unlocked: {}, speed: 1, voice: settings.voice, last: 0, raf: 0, lastRender: 0, watched: false });
  const [, setFrame] = useState(0);
  const render = () => setFrame((f) => (f + 1) % 1e6);
  const [started, setStarted] = useState(false);
  const [ended, setEnded] = useState(false);
  const [stopOpen, setStopOpen] = useState(false);
  const [subs, setSubs] = useState(true);
  const [vertical, setVertical] = useState(false);
  const [pseudoFs, setPseudoFs] = useState(false);
  const [isFs, setIsFs] = useState(false);
  const wrap = useRef(null);

  const tts = useRef(null);
  const pid = useRef("p" + uid());
  useEffect(() => {
    let on = true, offs = [];
    Voice.engine().then((e) => { if (on) S.current.engine = e; });
    Voice.claude().then((t) => {
      if (!on || !t) return;
      tts.current = t;
      offs.push(t.onLine(({ id }) => {
        const st = S.current;
        if (!st.reading || !id || id.indexOf(pid.current + ":") !== 0) return;
        const k = +id.split(":")[1];
        st.lastLineAt = performance.now();
        if (k !== st.idx && k >= st.reading.from && k <= st.reading.to) { st.idx = k; st.elapsed = 0; render(); }
      }));
    });
    return () => { on = false; offs.forEach((f) => { try { f(); } catch (e) {} }); };
  }, [settings.voiceEngine]);

  const stopReading = () => {
    const st = S.current;
    if (st.reading) { st.reading = null; st.token = (st.token || 0) + 1; if (tts.current) tts.current.stop().catch(() => {}); }
  };
  const silenceAll = () => { Speech.cancel(); ElevenAudio.stop(); stopReading(); };
  const pauseLocal = () => { const st = S.current; st.playing = false; cancelAnimationFrame(st.raf); render(); };
  const advance = (k) => (k < tl.items.length ? begin(k) : finish());

  // Claude ovozi: bir nechta replikani bitta "o'qish" qilib beramiz, sahna replikalar boshlanishiga qarab almashadi
  const startReading = (i) => {
    const st = S.current, t = tts.current;
    const lines = [];
    let k = i;
    while (k < tl.items.length && lines.length < 60) {
      const it = tl.items[k];
      if (!it.text) break;
      if (k > i && it.first && script.scenes[it.s].stop && !st.unlocked[it.s]) break;
      const ln = Voice.lineFor(it.text, it.speaker, k);
      ln.id = pid.current + ":" + k;
      lines.push(ln); k++;
    }
    const token = (st.token = (st.token || 0) + 1);
    st.reading = { from: i, to: k - 1, token };
    st.speechDone = false; st.lastLineAt = performance.now();
    const opts = { rate: Voice.clampRate(st.speed) };
    if (Voice.lang()) opts.language = Voice.lang();
    t.speak(lines, opts).then(() => {
      if (st.token !== token) return;
      st.reading = null; st.speechDone = true;
      if (st.playing) advance(k);
    }).catch((e) => {
      if (st.token !== token) return;
      st.reading = null; st.speechDone = true;
      const why = (e && (e.reason || e.code)) || "";
      if (["replaced", "viewer_stopped", "interrupted", "hidden", "stopped", "time_limit"].includes(why)) { pauseLocal(); return; }
      if (e && e.code === "not_granted") { st.voice = false; render(); return; } // tomoshabin o'chirgan: faqat subtitr
      st.engine = "browser"; // xizmat ishlamasa — brauzer ovoziga o'tamiz
      if (st.playing) begin(st.idx);
    });
  };

  const begin = (i) => {
    const st = S.current, it = tl.items[i];
    st.idx = i; st.elapsed = 0; st.speechDone = true; st.studio = false;
    const sc = script.scenes[it.s];
    if (it.first && sc.stop && !st.unlocked[it.s]) {
      st.playing = false; silenceAll(); setStopOpen(true); render(); return;
    }
    const au = it.l >= 0 ? script.scenes[it.s].lines[it.l].audio : undefined;
    if (au) [1, 2].forEach((d) => { const n = tl.items[i + d]; if (n && n.l >= 0) ElevenAudio.prefetch(script.scenes[n.s].lines[n.l].audio); });
    if (st.playing && st.voice && it.text && ElevenAudio.has(it.speaker, it.text, au)) {
      // Studiya ovozi (ElevenLabs): tayyor mp3 — replika tugagach keyingisiga o'tamiz
      stopReading(); Speech.cancel();
      st.studio = true; st.speechDone = false;
      ElevenAudio.play(it.speaker, it.text, st.speed,
        () => { const s = S.current; if (s.idx === i) { s.speechDone = true; s.doneAt = performance.now(); } },
        () => { const s = S.current; if (s.idx === i) { s.studio = false; if (s.playing) begin(i); } }, au);
    } else if (st.playing && st.voice && it.text) {
      ElevenAudio.stop();
      if (st.engine === "claude" && tts.current) {
        if (!(st.reading && i >= st.reading.from && i <= st.reading.to)) { stopReading(); startReading(i); }
        else st.speechDone = false;
      } else {
        stopReading();
        st.speechDone = false;
        Speech.speak(it.text, it.speaker, st.speed, () => { if (S.current.idx === i) S.current.speechDone = true; });
      }
    } else if (!it.text) { stopReading(); ElevenAudio.stop(); }
    render();
  };
  const finish = () => {
    const st = S.current;
    st.playing = false; silenceAll(); setEnded(true); render();
    if (!st.watched) { st.watched = true; onWatched && onWatched(); }
    onEnd && onEnd();
  };
  const loop = (ts) => {
    const st = S.current;
    if (!st.playing) return;
    const dt = Math.min(250, ts - (st.last || ts));
    st.last = ts;
    st.elapsed += dt * st.speed;
    const it = tl.items[st.idx];
    let done;
    if (st.studio && it.text) {
      // audio tugagach qisqa pauza; fayl "osilib" qolsa — xavfsizlik chegarasi
      done = (st.speechDone && performance.now() - (st.doneAt || 0) > 220) || st.elapsed >= it.dur * 4 + 4000;
    } else if (st.reading && it.text) {
      done = false; // Claude ovozi o'zi keyingi replikaga o'tkazadi
      if (performance.now() - st.lastLineAt > it.dur * 3 + 6000) { stopReading(); st.engine = "browser"; begin(st.idx); }
    } else {
      const spoken = st.voice && it.text && Speech.ok;
      done = spoken ? (st.speechDone && st.elapsed >= it.dur * 0.5 + 250) || st.elapsed >= it.dur * 2.6 : st.elapsed >= it.dur;
    }
    if (done) {
      if (st.idx + 1 < tl.items.length) begin(st.idx + 1); else { finish(); return; }
    } else if (ts - st.lastRender > 60) { st.lastRender = ts; render(); }
    if (!st.watched && (it.start + st.elapsed) / tl.total > 0.85) { st.watched = true; onWatched && onWatched(); }
    if (st.playing) st.raf = requestAnimationFrame(loop);
  };
  const play = () => {
    const st = S.current;
    if (stopOpen) return;
    setStarted(true);
    if (ended) { setEnded(false); st.idx = 0; }
    st.playing = true; st.last = 0;
    cancelAnimationFrame(st.raf);
    if (st.reading && tts.current) tts.current.resume().catch(() => { st.reading = null; begin(st.idx); });
    else if (st.studio && !st.speechDone && ElevenAudio.resume()) { /* to'xtagan joyidan davom */ }
    else begin(st.idx);
    if (st.playing) st.raf = requestAnimationFrame(loop);
  };
  const pause = () => {
    const st = S.current; st.playing = false; cancelAnimationFrame(st.raf);
    if (st.reading && tts.current) tts.current.pause().catch(() => stopReading());
    ElevenAudio.pause();
    Speech.cancel(); render();
  };
  const toggle = () => (S.current.playing ? pause() : play());
  const seekItem = (i, autoplay) => {
    const st = S.current;
    silenceAll(); setEnded(false); setStopOpen(false); setStarted(true);
    cancelAnimationFrame(st.raf);
    st.playing = autoplay === undefined ? st.playing : autoplay;
    st.last = 0;
    begin(Math.max(0, Math.min(tl.items.length - 1, i)));
    if (S.current.playing) st.raf = requestAnimationFrame(loop);
  };
  const seekScene = (s, autoplay) => seekItem(tl.items.findIndex((it) => it.s === s), autoplay);
  const curScene = () => tl.items[S.current.idx].s;
  const resume = () => {
    const st = S.current;
    const sc = curScene();
    st.unlocked[sc] = true; setStopOpen(false);
    st.playing = true; st.last = 0;
    const nxt = tl.items.findIndex((x) => x.s === sc + 1);
    if (nxt < 0) { finish(); return; }
    begin(nxt);
    st.raf = requestAnimationFrame(loop);
  };
  const setSpeed = (v) => { const st = S.current; st.speed = v; ElevenAudio.setRate(v); if (tts.current && tts.current.setRate) tts.current.setRate(Voice.clampRate(v)).catch(() => {}); render(); };

  useEffect(() => () => { cancelAnimationFrame(S.current.raf); silenceAll(); }, []);
  useEffect(() => { S.current.voice = settings.voice; if (!settings.voice) { silenceAll(); S.current.speechDone = true; } }, [settings.voice]);
  useEffect(() => { if (seek && seek.n) seekScene(seek.scene, true); }, [seek && seek.n]);
  useEffect(() => {
    const f = () => setIsFs(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", f);
    return () => document.removeEventListener("fullscreenchange", f);
  }, []);

  const fullscreen = () => {
    if (isFs || pseudoFs) {
      if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
      setPseudoFs(false); return;
    }
    const el = wrap.current;
    try {
      const p = el.requestFullscreen ? el.requestFullscreen() : null;
      if (p && p.catch) p.catch(() => setPseudoFs(true)); else if (!p) setPseudoFs(true);
    } catch (e) { setPseudoFs(true); }
  };
  const onKey = (e) => {
    if (e.target.closest("textarea,input,select")) return;
    if (e.key === " ") { e.preventDefault(); toggle(); }
    else if (e.key === "ArrowRight") seekScene(Math.min(script.scenes.length - 1, curScene() + 1));
    else if (e.key === "ArrowLeft") seekScene(Math.max(0, curScene() - 1));
    else if (e.key === "Escape" && pseudoFs) { e.preventDefault(); setPseudoFs(false); }
  };

  const st = S.current;
  const it = tl.items[st.idx];
  const scene = script.scenes[it.s];
  const line = it.l >= 0 ? scene.lines[it.l] : null;
  const frac = Math.min(1, st.elapsed / it.dur);
  const sceneItems = tl.items.filter((x) => x.s === it.s);
  const sceneProgress = (sceneItems.indexOf(it) + frac) / sceneItems.length;
  const now = it.start + Math.min(st.elapsed, it.dur);
  const talking = st.playing && !!line && (st.studio ? !st.speechDone : st.reading ? true : st.voice && Speech.ok ? !st.speechDone : frac < 0.9);

  return (
    <div ref={wrap} className={cx("player", vertical && "is-vertical", pseudoFs && "pseudo-fs", isFs && "is-fs")} tabIndex={0} onKeyDown={onKey}
      role="region" aria-label={"Multfilm: " + script.title}>
      <div className="stage-wrap">
        <div className="stage">
          <SceneRenderer scene={scene} line={line} frac={frac} sceneProgress={sceneProgress}
            talking={talking} playing={st.playing} vertical={vertical} subs={subs} />
          {script.verified && <div className="verified">Tekshirilgan ✓</div>}
          {!started && !ended && (
            <button className="poster" onClick={play} aria-label="Ijro etish">
              <span className="poster-play"><Icon name="play" /></span>
              <span className="poster-title">{script.title}</span>
              <span className="poster-meta">{fmtTime(tl.total)} · {script.scenes.length} sahna{script.level ? " · " + ({ bola: "Bolaga", fuqaro: "Fuqaroga", talaba: "Talabaga" }[script.level] || "") : ""}</span>
            </button>
          )}
          {stopOpen && renderStop && <div className="stop-layer">{renderStop(resume)}</div>}
          {ended && (
            <div className="endcard">
              <div className="end-title">{script.title}</div>
              <p>Bu video ta'limiy maqsadda, yuridik maslahat emas.</p>
              <p className="end-src">Manba: <a href={script.source.url} target="_blank" rel="noopener">{script.source.title}</a></p>
              {endExtra}
              <button className="btn btn-light" onClick={() => seekItem(0, true)}><Icon name="replay" /> Qayta ko'rish</button>
            </div>
          )}
        </div>
      </div>
      <div className="controls">
        <button className="cbtn" onClick={() => seekScene(Math.max(0, it.s - 1))} aria-label="Oldingi sahna" title="Oldingi sahna"><Icon name="prev" /></button>
        <button className="cbtn cbtn-main" onClick={toggle} aria-label={st.playing ? "Pauza" : "Ijro etish"}><Icon name={st.playing ? "pause" : "play"} /></button>
        <button className="cbtn" onClick={() => seekScene(Math.min(script.scenes.length - 1, it.s + 1))} aria-label="Keyingi sahna" title="Keyingi sahna"><Icon name="next" /></button>
        <div className="seek">
          <input type="range" min="0" max={tl.total} step="100" value={now} aria-label="Video vaqti"
            onChange={(e) => { const t = +e.target.value; let k = tl.items.findIndex((x) => x.start + x.dur > t); seekItem(k < 0 ? tl.items.length - 1 : k); }} />
          <div className="ticks">{script.scenes.map((_, s) => <i key={s} style={{ left: (sceneStart(tl, s) / tl.total) * 100 + "%" }} />)}</div>
        </div>
        <span className="time">{fmtTime(now)} / {fmtTime(tl.total)}</span>
        <select className="speed" value={st.speed} aria-label="Tezlik"
          onChange={(e) => setSpeed(+e.target.value)}>
          {SPEEDS.map((v) => <option key={v} value={v}>{v}x</option>)}
        </select>
        <button className={cx("cbtn", "cc", subs && "on")} onClick={() => setSubs(!subs)} aria-pressed={subs} title="Subtitr">CC</button>
        <button className="cbtn" onClick={() => Store.set((s) => ({ ...s, settings: { ...s.settings, voice: !s.settings.voice } }))}
          aria-label={settings.voice ? "Ovozni o'chirish" : "Ovozni yoqish"} title="Ovoz"><Icon name={settings.voice ? "sound" : "mute"} /></button>
        {allowVertical && <button className={cx("cbtn", vertical && "on")} onClick={() => setVertical(!vertical)} aria-pressed={vertical} title="Vertikal 9:16"><Icon name="phone" /></button>}
        <button className="cbtn" onClick={fullscreen} aria-label="To'liq ekran" title="To'liq ekran"><Icon name="full" /></button>
      </div>
    </div>
  );
}

/* Video ostidagi blok: konspekt, manba, yuklab olish, ulashish */
function VideoMeta({ script, extra }) {
  const [msg, setMsg] = useState("");
  const share = "https://t.me/share/url?url=" + encodeURIComponent(script.source.url) + "&text=" + encodeURIComponent("OsonQonun multfilmi: " + script.title);
  const flash = (m) => { setMsg(m); setTimeout(() => setMsg(""), 2600); };
  return (
    <div className="vmeta">
      <div className="vmeta-head">
        <h3>Qisqa konspekt</h3>
        <span className={cx("badge", script.verified ? "ok" : "warn")}>{script.verified ? "Tekshirilgan ✓" : "Yurist tekshiruvi kutilmoqda"}</span>
      </div>
      <ul className="konspekt">{script.summary.map((x, i) => <li key={i}>{x}</li>)}</ul>
      <p className="src">Manba: <a href={script.source.url} target="_blank" rel="noopener">{script.source.title}</a> <span className="muted notr">({script.source.url.replace("https://", "")})</span></p>
      <div className="row wrap gap">
        <button className="btn" onClick={async () => { const r = await downloadKonspekt(script); flash(r === "ok" ? "Konspekt PDF tayyor" : "Yuklab olish bekor qilindi"); }}>Konspekt (PDF)</button>
        <button className="btn ghost" onClick={() => { Store.set((s) => ({ ...s, saved: [script, ...s.saved.filter((x) => x.id !== script.id)].slice(0, 20) })); flash("Offline ko'rish uchun saqlandi"); }}>Offline saqlash</button>
        <a className="btn ghost" href={share} target="_blank" rel="noopener">Telegramda ulashish</a>
        <button className="btn ghost" onClick={async () => flash((await copyText(script.title + "\n\n" + script.summary.map((x) => "• " + x).join("\n") + "\n\nManba: " + script.source.url + "\n#OsonQonun")) ? "Reels/Shorts uchun matn nusxalandi" : "Nusxalab bo'lmadi")}>Reels/Shorts matni</button>
        {extra}
      </div>
      {msg && <div className="toast" role="status">{msg}</div>}
      <ExternalVideo script={script} />
      <p className="disclaimer">Bu video ta'limiy maqsadda, yuridik maslahat emas. Vertikal (9:16) ko'rinish uchun pleyerdagi telefon tugmasini bosing.</p>
    </div>
  );
}

/* NotebookLM / YouTube bilan ishlash: batafsil video tayyorlash va havolasini biriktirish */
const LEVEL_AUD = { bola: "8-12 yoshli bolalar", fuqaro: "oddiy fuqarolar", talaba: "yuridik fakultet talabalari" };
function providerOf(url) {
  const h = (url.match(/^https:\/\/([^/]+)/i) || [])[1] || "";
  if (/notebooklm\.google/i.test(h)) return "NotebookLM";
  if (/youtube\.com|youtu\.be/i.test(h)) return "YouTube";
  if (/^t\.me$|telegram/i.test(h)) return "Telegram";
  if (/drive\.google|docs\.google/i.test(h)) return "Google Drive";
  return "Video";
}
function notebookPrompt(script) {
  const arts = script.scenes.map((s) => s.onScreenText).filter((o) => o && o.kind === "article").map((o) => o.label);
  return "Ushbu manba asosida o'zbek tilida (lotin yozuvida) 3-5 daqiqalik Video Overview tayyorla.\n" +
    "Auditoriya: " + (LEVEL_AUD[script.level] || "oddiy fuqarolar") + ".\n" +
    "Tuzilma: 1) hayotiy vaziyat; 2) qonun nima deydi — modda raqamlari bilan" + (arts.length ? " (" + [...new Set(arts)].join("; ") + ")" : "") + "; 3) ehtiyot bo'ling — xavfli joylar; 4) endi nima qilish kerak — qadamma-qadam.\n" +
    "Faqat manbadagi moddalarga tayan, yangi modda yoki raqam o'ylab topma. Bilmagan joyingda \"aniq emas, lex.uz dan tekshiring\" de.\n" +
    "Sodda, hurmatli va qiziqarli ohangda gapir. Oxirida ayt: \"Bu video ta'limiy maqsadda, yuridik maslahat emas.\"";
}
function notebookSource(script) {
  return [
    "OSONQONUN — NotebookLM UCHUN MANBA",
    "Mavzu: " + script.title,
    "Rasmiy manba: " + script.source.title + " — " + script.source.url,
    "",
    "QISQA KONSPEKT:",
    ...script.summary.map((x) => "- " + x),
    "",
    "MULTFILM SSENARIYSI (personajlar: Afandi — ustoz, Aqlvoy — yosh yurist-talaba):",
    ...script.scenes.map((sc, i) => [
      "", (i + 1) + ". " + (sc.title || "Sahna") + (sc.onScreenText && sc.onScreenText.label ? " [" + sc.onScreenText.label + (sc.onScreenText.text ? ": " + sc.onScreenText.text : "") + "]" : ""),
      ...(sc.onScreenText && sc.onScreenText.items ? sc.onScreenText.items.map((x, k) => "   " + (k + 1) + ") " + x) : []),
      ...sc.lines.map((l) => "   " + charName(l.speaker) + ": " + l.text)
    ].join("\n")),
    "",
    "Eslatma: material ta'limiy maqsadda, yuridik maslahat emas."
  ].join("\n");
}

function ExternalVideo({ script }) {
  const store = useStore();
  const saved = (store.externalVideos || {})[script.id];
  const [url, setUrl] = useState("");
  const [open, setOpen] = useState(false);
  const [msg, setMsg] = useState("");
  const flash = (m) => { setMsg(m); setTimeout(() => setMsg(""), 3000); };
  const save = () => {
    const u = url.trim();
    if (!/^https:\/\/[^\s]+\.[^\s]+/i.test(u)) { flash("To'liq havola kiriting (https:// bilan boshlanadi)."); return; }
    Store.set((s) => ({ ...s, externalVideos: { ...(s.externalVideos || {}), [script.id]: { url: u, provider: providerOf(u), addedAt: Date.now() } } }));
    setUrl(""); flash("Havola saqlandi.");
  };
  const remove = () => Store.set((s) => { const ev = { ...(s.externalVideos || {}) }; delete ev[script.id]; return { ...s, externalVideos: ev }; });
  const fileName = "notebooklm-" + normApos(script.title).toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 40) + ".txt";
  return (
    <div className="extvid">
      <div className="row between wrap gap">
        <h4>Batafsil video</h4>
        <button className="btn ghost sm" onClick={() => setOpen(!open)} aria-expanded={open}>{open ? "Yopish" : "NotebookLM uchun tayyorlash"}</button>
      </div>
      {saved ? (
        <div className="ext-card">
          <span className="ext-badge">{saved.provider}</span>
          <a className="btn" href={saved.url} target="_blank" rel="noopener">Batafsil videoni ochish ↗</a>
          <button className="btn ghost sm" onClick={remove}>Havolani o'chirish</button>
        </div>
      ) : (
        <div className="row gap wrap ext-form">
          <input type="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="NotebookLM, YouTube yoki Telegram video havolasi" aria-label="Video havolasi" />
          <button className="btn sm" onClick={save}>Biriktirish</button>
        </div>
      )}
      {open && (
        <div className="ext-steps">
          <ol>
            <li><b>Manba faylini yuklab oling</b> — ssenariy, konspekt, moddalar va lex.uz havolasi bitta faylda.
              <div className="row gap wrap"><button className="btn sm" onClick={async () => flash((await saveFile(fileName, new TextEncoder().encode(notebookSource(script)), "text/plain")) === "ok" ? "Fayl tayyor" : "Yuklab olish bekor qilindi")}>Manba (.txt)</button>
              <button className="btn ghost sm" onClick={async () => flash((await copyText(notebookSource(script))) ? "Manba matni nusxalandi" : "Nusxalab bo'lmadi")}>Matnni nusxalash</button></div></li>
            <li><b>notebooklm.google.com</b> da yangi daftar oching va faylni manba sifatida qo'shing. Iloji bo'lsa, lex.uz dagi asl qonun sahifasini ham qo'shing.</li>
            <li>Sozlamalarda chiqish tilini <b>o'zbekcha</b> qilib qo'ying, Studio panelida <b>Video Overview</b> ni tanlang va quyidagi promptni yo'naltiruvchi prompt maydoniga joylang.
              <pre className="notr prompt">{notebookPrompt(script)}</pre>
              <button className="btn ghost sm" onClick={async () => flash((await copyText(notebookPrompt(script))) ? "Prompt nusxalandi" : "Nusxalab bo'lmadi")}>Promptni nusxalash</button></li>
            <li>Video tayyor bo'lgach, uni <b>ko'rib chiqing</b>: moddalar to'g'riligini lex.uz bilan solishtiring.</li>
            <li>Videoni yuklab olib YouTube yoki Telegram kanalga joylang (yoki NotebookLM havolasini ulashing) va havolani yuqoridagi maydonga biriktiring.</li>
          </ol>
        </div>
      )}
      {msg && <div className="toast" role="status">{msg}</div>}
    </div>
  );
}
