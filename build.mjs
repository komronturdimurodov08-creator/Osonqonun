// OsonQonun build: JSX -> JS (esbuild), React'ni ichiga joylab, bitta oflayn ishlaydigan dist/index.html yasaydi.
// Ishga tushirish: npm install && npm run build   (natija: dist/index.html — ikki marta bosib ochiladi)
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const root = dirname(fileURLToPath(import.meta.url));
const esbuild = require("esbuild");

// Tartib muhim: fayllar bitta umumiy ko'lamda ketma-ket ulanadi
const ORDER = [
  "lib/core.js",
  "components/Character.jsx",
  "lib/director.js",
  "components/Backgrounds.jsx",
  "lib/scriptTools.js",
  "data/helpers.js",
  "components/SceneRenderer.jsx",
  "components/VideoPlayer.jsx",
  "lib/ScriptGenerator.js",
  "data/weekly.js",
  "data/cases.js",
  "data/lessons.js",
  "data/roadmap.js",
  "components/CaseVideo.jsx",
  "components/LessonPlaylist.jsx",
  "components/RightsRoadmap.jsx",
  "pages/Pages.jsx",
  "App.jsx"
];

const app = ORDER.map((f) => {
  const src = readFileSync(join(root, "src", f), "utf8");
  const out = esbuild.transformSync(src, { loader: f.endsWith(".jsx") ? "jsx" : "js", jsx: "transform", jsxFactory: "React.createElement", jsxFragment: "React.Fragment", target: "es2020", sourcefile: f });
  return "/* ---- " + f + " ---- */\n" + out.code;
}).join("\n");

// "exports" maydoni cjs fayllarni yopadi — paket papkasini package.json orqali topamiz
const pkgFile = (path) => {
  const [pkg, ...rest] = path.split("/");
  return join(dirname(require.resolve(pkg + "/package.json")), ...rest);
};
const mod = (name, path) => `defs[${JSON.stringify(name)}]=function(module,exports,require){\n${readFileSync(pkgFile(path), "utf8")}\n};`;
const vendor = `(function(){var process={env:{NODE_ENV:"production"}};var defs={},cache={};
function req(n){if(cache[n])return cache[n].exports;var m={exports:{}};cache[n]=m;defs[n](m,m.exports,req);return m.exports;}
${mod("react", "react/cjs/react.production.js")}
${mod("scheduler", "scheduler/cjs/scheduler.production.js")}
${mod("react-dom", "react-dom/cjs/react-dom.production.js")}
${mod("react-dom/client", "react-dom/cjs/react-dom-client.production.js")}
window.React=req("react");window.ReactDOM=req("react-dom/client");})();`;

// Studiya ovozi: dist/audio/*.mp3 (oson_ovoz.py ilova) — kalitlar ro'yxatini sahifaga yozamiz
const audioDir = join(root, "dist", "audio");
const audioKeys = existsSync(audioDir) ? readdirSync(audioDir).filter((f) => /^[0-9a-f]{8}\.mp3$/.test(f)).map((f) => f.slice(0, 8)).sort() : [];

const css = ["styles.css", "scene.css", "character.css"].map((f) => readFileSync(join(root, "src", f), "utf8")).join("\n");
const html = `<!DOCTYPE html>
<html lang="uz">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="description" content="OsonQonun — qonunlarni multfilm orqali tushuntiruvchi platforma">
<title>OsonQonun</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Nunito:wght@600;700;800;900&display=swap" rel="stylesheet">
<style>
${css}
</style>
</head>
<body>
<div id="root"></div>
<noscript>OsonQonun ishlashi uchun JavaScript yoqilgan bo'lishi kerak.</noscript>
<script>window.OQ_AUDIO_KEYS=${JSON.stringify(audioKeys)};</script>
<script>${vendor}</script>
<script>
(function(){"use strict";
try{
${app}
}catch(e){document.getElementById("root").innerHTML='<p style="padding:2rem;font:16px sans-serif">Ilovani ishga tushirishda xato: '+String(e&&e.message||e)+'</p>';console.error(e);}
})();
</script>
</body>
</html>`;
mkdirSync(join(root, "dist"), { recursive: true });
writeFileSync(join(root, "dist/index.html"), html);
console.log("dist/index.html", (html.length / 1024).toFixed(0) + " KB", "· studiya ovozi:", audioKeys.length, "ta replika");
