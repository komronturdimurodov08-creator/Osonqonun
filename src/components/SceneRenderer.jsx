/* SceneRenderer — bitta sahnani chizadi: kamera (sekin yaqinlashish + gapiruvchiga burilish), fon,
   personajlar (chuqurlik, kontakt soya), gap pufakchasi (dumi gapiruvchi boshiga qaraydi), ekrandagi matn, subtitr */

const MemoBackground = React.memo(Background);
const POS = { h: { left: 21, center: 50, right: 79 }, v: { left: 26, center: 50, right: 74 } };
const clampN = (v, a, b) => Math.max(a, Math.min(b, v));

function OnScreen({ o, progress }) {
  if (!o) return null;
  if (o.kind === "title") {
    return (
      <div className="ost ost-title">
        <div className="ost-title-deco" aria-hidden="true" />
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
        <ol>{items.slice(0, n).map((it, i) => <li key={i} className="pop-in"><span className="ost-n">{i + 1}</span><span>{it}</span></li>)}</ol>
      </div>
    );
  }
  return (
    <div className={cx("ost", "ost-" + (o.kind || "keyword"))}>
      {o.label && <div className="ost-label">{o.kind === "warning" ? <span className="ost-ico" aria-hidden="true">!</span> : o.kind === "article" ? <span className="ost-ico" aria-hidden="true">§</span> : null}{o.label}</div>}
      {o.text && <div className="ost-text">{o.text}</div>}
    </div>
  );
}

/* Pufakchani gapiruvchi boshi ustiga (yoki yoniga) joylaydi, sahna ichida ushlab turadi va ekrandagi matn kartasini to'smaydi */
function placeBubble(root, bub, tail) {
  if (!root || !bub || !tail) return;
  const slot = root.querySelector(".char-slot.speaking");
  if (!slot) return;
  const st = root.getBoundingClientRect();
  if (!st.width) return;
  const sr = slot.getBoundingClientRect();
  const W = st.width, H = st.height;
  const bw = bub.offsetWidth, bh = bub.offsetHeight;
  const pad = W * 0.02, gap = Math.max(14, H * 0.045);
  const hx = sr.left + sr.width / 2 - st.left;
  const headTop = sr.top + sr.height * 0.07 - st.top;
  const mouthY = sr.top + sr.height * 0.26 - st.top;
  const ostEl = root.querySelector(".ost:not(.ost-title)");
  const o = ostEl ? ostEl.getBoundingClientRect() : null;
  const ob = o ? { l: o.left - st.left - pad, r: o.right - st.left + pad, t: o.top - st.top - pad, b: o.bottom - st.top + pad } : null;
  const hits = (l, t) => ob && l < ob.r && l + bw > ob.l && t < ob.b && t + bh > ob.t;
  const rel = hx / W;
  const bias = rel < 0.4 ? 0.3 : rel > 0.6 ? 0.7 : 0.5;

  let mode = "top";
  let left = clampN(hx - bw * bias, pad, W - bw - pad);
  let top = headTop - gap - bh;
  const topLeft = left;
  if (top < pad || hits(left, top)) {
    // yonga: gapiruvchi markazda yoki yuqorida joy yo'q
    mode = rel <= 0.5 ? "side-r" : "side-l";
    const off = sr.width * 0.3;
    left = mode === "side-r" ? hx + off : hx - off - bw;
    if (left + bw > W - pad || left < pad) { mode = mode === "side-r" ? "side-l" : "side-r"; left = mode === "side-r" ? hx + off : hx - off - bw; }
    left = clampN(left, pad, W - bw - pad);
    top = clampN(mouthY - bh * 0.7, pad, H - bh - pad);
    if (hits(left, top)) top = Math.min(H - bh - pad, ob.b);
    if (top < pad) top = pad;
    // yonida joy yetmasa (masalan, tor vertikal kadr) — yuzni to'smay, karta ostiga, bosh ustiga
    if (left < hx + sr.width * 0.22 && left + bw > hx - sr.width * 0.22) {
      mode = "top"; left = topLeft;
      top = clampN(ob ? ob.b : pad, pad, Math.max(pad, headTop - gap - bh * 0.35));
    }
  }
  bub.style.left = left + "px";
  bub.style.top = top + "px";

  // dum: asosi pufakcha chetida, uchi bosh tomonga
  const tipTarget = mode === "top" ? { x: hx - left, y: headTop - top } : { x: hx - left + (mode === "side-r" ? sr.width * 0.12 : -sr.width * 0.12), y: mouthY - sr.height * 0.06 - top };
  let bx, by, nx, ny;
  if (mode === "top") { bx = clampN(tipTarget.x, 22, bw - 22); by = bh - 1.5; nx = 1; ny = 0; }
  else { bx = mode === "side-r" ? 1.5 : bw - 1.5; by = clampN(tipTarget.y, 20, bh - 16); nx = 0; ny = 1; }
  let dx = tipTarget.x - bx, dy = tipTarget.y - by;
  const dist = Math.hypot(dx, dy) || 1;
  const len = clampN(dist - 6, 8, gap * 1.25);
  const tx = bx + (dx / dist) * len, ty = by + (dy / dist) * len;
  const w = 10;
  const a1x = bx - nx * w, a1y = by - ny * w, a2x = bx + nx * w, a2y = by + ny * w;
  tail.setAttribute("width", bw); tail.setAttribute("height", bh);
  tail.querySelector(".tail-fill").setAttribute("d", `M${a1x} ${a1y} Q${(a1x + tx) / 2 + nx * 2} ${(a1y + ty) / 2 + ny * 2} ${tx} ${ty} Q${(a2x + tx) / 2} ${(a2y + ty) / 2} ${a2x} ${a2y} Z`);
  tail.querySelector(".tail-seam").setAttribute("d", `M${a1x + nx * 2} ${a1y + ny * 2} L${a2x - nx * 2} ${a2y - ny * 2}`);
  bub.style.transformOrigin = bx + "px " + by + "px";
}

function SceneRenderer({ scene, line, frac, sceneProgress, talking, playing, vertical, subs }) {
  const pos = vertical ? POS.v : POS.h;
  const speaker = line ? line.speaker : null;
  const sp = scene.characters.find((c) => c.id === speaker);
  const typed = line ? Math.ceil(line.text.length * Math.min(1, frac * 1.7 + 0.05)) : 0;
  const shown = line ? line.text.slice(0, typed) : "";
  const typing = line && typed < line.text.length;
  const root = useRef(null), bub = useRef(null), tail = useRef(null);

  // kamera: gapiruvchi tomonga ozgina siljish
  const camX = sp ? (50 - pos[sp.position]) * (vertical ? 0.04 : 0.06) : 0;

  React.useLayoutEffect(() => { placeBubble(root.current, bub.current, tail.current); });
  useEffect(() => {
    if (typeof ResizeObserver === "undefined" || !root.current) return;
    const ro = new ResizeObserver(() => placeBubble(root.current, bub.current, tail.current));
    ro.observe(root.current);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={root} className={cx("scene", vertical && "vertical", subs && "subs-on", !playing && "paused")}>
      <div className="cam" style={{ transform: `translate3d(${camX}%,0,0) scale(1.04)` }}>
        <div className="cam-push" key={scene.id}>
          <div className="scene-bg"><MemoBackground name={scene.background} /></div>
          {scene.characters.map((c, i) => {
            const me = speaker === c.id;
            const ln = me ? line : null;
            const x = pos[c.position];
            const listening = !!sp && !me;
            let lookAt = null;
            if (listening) {
              const sx = pos[sp.position];
              lookAt = sx < x ? "left" : sx > x ? "right" : null;
            } else {
              let best = null;
              scene.characters.forEach((o) => {
                if (o.id === c.id) return;
                const d = pos[o.position] - x;
                if (d !== 0 && (best === null || Math.abs(d) < Math.abs(best))) best = d;
              });
              lookAt = best === null ? null : best < 0 ? "left" : "right";
            }
            return (
              <div key={scene.id + c.id}
                className={cx("char-slot", "enter-" + (c.enter || "fade"), c.position, me && "speaking", me && talking && "talking", listening && "listening")}
                style={{ left: x + "%", zIndex: me ? 4 : 2 + (c.position === "center" ? 0 : 1), animationDelay: i * 0.18 + "s" }}>
                <div className="char-shadow" aria-hidden="true" />
                <div className="char-act">
                  <div className="char-talk">
                    <Character id={c.id} playing={playing}
                      talking={talking && me}
                      emotion={ln ? ln.emotion : "neutral"}
                      gesture={ln ? ln.gesture : "none"}
                      facing={c.position === "right" ? "left" : "right"}
                      listening={listening}
                      lookAt={lookAt} />
                  </div>
                </div>
                <div className="char-name">{charName(c.id)}</div>
              </div>
            );
          })}
        </div>
      </div>
      {line && sp && (
        <div ref={bub} className="bubble" key={scene.id + "|" + line.text.slice(0, 16)}>
          <svg ref={tail} className="bubble-tail" aria-hidden="true"><path className="tail-fill" /><path className="tail-seam" /></svg>
          <b>{charName(speaker)}</b>
          <span className="bubble-text">{shown}{typing && <i className="caret" aria-hidden="true" />}</span>
        </div>
      )}
      <OnScreen o={scene.onScreenText} progress={sceneProgress} />
      {scene.title && <div className="scene-chip">{scene.title}</div>}
      {subs && line && (
        <div className="subtitle" aria-live="polite"><b>{charName(line.speaker)}</b> {line.text}</div>
      )}
    </div>
  );
}
