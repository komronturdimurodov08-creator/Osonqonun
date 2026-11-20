/* SceneRenderer — bitta sahnani chizadi: fon, personajlar, gap pufakchasi, ekrandagi matn, subtitr */

const MemoBackground = React.memo(Background);
const POS = { h: { left: 21, center: 50, right: 79 }, v: { left: 26, center: 50, right: 74 } };

function OnScreen({ o, progress }) {
  if (!o) return null;
  if (o.kind === "title") {
    return (
      <div className="ost ost-title">
        {o.label && <div className="ost-label">{o.label}</div>}
        <div className="ost-big">{o.text}</div>
      </div>
    );
  }
  if (o.kind === "steps") {
    const items = o.items || [];
    const n = Math.max(1, Math.ceil(progress * items.length + 0.15));
    return (
      <div className="ost ost-steps">
        <div className="ost-label">{o.label || "Qadamma-qadam"}</div>
        <ol>{items.slice(0, n).map((it, i) => <li key={i} className="pop-in">{it}</li>)}</ol>
      </div>
    );
  }
  return (
    <div className={cx("ost", "ost-" + (o.kind || "keyword"))}>
      {o.label && <div className="ost-label">{o.kind === "warning" ? "⚠ " : ""}{o.label}</div>}
      {o.text && <div className="ost-text">{o.text}</div>}
    </div>
  );
}

function SceneRenderer({ scene, line, frac, sceneProgress, talking, playing, vertical, subs }) {
  const pos = vertical ? POS.v : POS.h;
  const speaker = line ? line.speaker : null;
  const sp = scene.characters.find((c) => c.id === speaker);
  const shown = line ? line.text.slice(0, Math.ceil(line.text.length * Math.min(1, frac * 1.7 + 0.05))) : "";
  const x = sp ? pos[sp.position] : 50;
  let bubbleStyle = {}, tail = "c";
  if (vertical || !sp || sp.position === "center") bubbleStyle = { left: "50%", transform: "translateX(-50%)" };
  else if (sp.position === "left") { bubbleStyle = { left: Math.max(2, x - 12) + "%" }; tail = "l"; }
  else { bubbleStyle = { right: Math.max(2, 100 - x - 12) + "%" }; tail = "r"; }
  if (vertical && sp) tail = sp.position === "left" ? "l" : sp.position === "right" ? "r" : "c";
  return (
    <div className={cx("scene", vertical && "vertical", subs && "subs-on")}>
      <div className="scene-bg" key={scene.id}><MemoBackground name={scene.background} /></div>
      {scene.characters.map((c) => {
        const ln = speaker === c.id ? line : null;
        return (
          <div key={scene.id + c.id} className={cx("char-slot", "enter-" + c.enter, c.position, speaker === c.id && "speaking")}
            style={{ left: pos[c.position] + "%" }}>
            <Character id={c.id} playing={playing}
              talking={talking && speaker === c.id}
              emotion={ln ? ln.emotion : "neutral"}
              gesture={ln ? ln.gesture : "none"}
              facing={c.position === "right" ? "left" : "right"} />
            <div className="char-name">{charName(c.id)}</div>
          </div>
        );
      })}
      {line && sp && (
        <div className={cx("bubble", "tail-" + tail)} style={bubbleStyle} key={scene.id + line.text.slice(0, 12)}>
          <b>{charName(speaker)}</b>
          <span>{shown}</span>
        </div>
      )}
      <OnScreen o={scene.onScreenText} progress={sceneProgress} />
      {scene.title && <div className="scene-chip">{scene.title}</div>}
      {subs && line && (
        <div className="subtitle" aria-live="polite"><b>{charName(line.speaker)}:</b> {line.text}</div>
      )}
    </div>
  );
}
