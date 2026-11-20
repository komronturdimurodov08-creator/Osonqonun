/* Ssenariy yozishni qisqartiruvchi yordamchilar */
const L = (speaker, text, emotion = "neutral", gesture = "none") => ({ speaker, text, emotion, gesture });
const SC = (title, background, characters, lines, onScreenText, extra) => ({
  title, background,
  characters: characters.map((c) => (typeof c === "string" ? { id: c } : c)),
  lines, onScreenText, ...(extra || {})
});
const ART = (label, text) => ({ kind: "article", label, text });
const TITLE = (label, text) => ({ kind: "title", label, text });
const WARN = (label, text) => ({ kind: "warning", label, text });
const STEPS = (label, items) => ({ kind: "steps", label, items });
const KEY = (label, text) => ({ kind: "keyword", label, text });
