// OsonQonun build: JSX -> JS (esbuild), React'ni ichiga joylab, bitta oflayn ishlaydigan dist/index.html yasaydi.
// Ishga tushirish: npm install && npm run build   (natija: dist/index.html — ikki marta bosib ochiladi)
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const root = dirname(fileURLToPath(import.meta.url));
const esbuild = require("esbuild");

// Tartib muhim: fayllar bitta umumiy ko'lamda ketma-ket ulanadi
const ORDER = [
  "assets/logo.js",
  "lib/core.js",
  "data/i18n-ui.js",
  "data/i18n-lessons.js",
  "data/i18n-cases.js",
  "lib/i18n.js",
  "components/Character.jsx",
  "components/Backgrounds.jsx",
  "components/LawBackground.jsx",
  "lib/scriptTools.js",
  "data/helpers.js",
  "components/SceneRenderer.jsx",
  "components/VideoPlayer.jsx",
  "lib/ScriptGenerator.js",
  "data/lexbase.js",
  "lib/lexsearch.js",
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

const css = readFileSync(join(root, "src/styles.css"), "utf8");
const html = `<!DOCTYPE html>
<html lang="uz">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="description" content="OsonQonun — qonunlarni multfilm orqali tushuntiruvchi platforma">
<title>OsonQonun</title>
<link rel="icon" type="image/png" href="data:image/png;base64,${readFileSync(join(root, "src/assets/logo-64.png")).toString("base64")}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@500;700;800&family=Nunito:wght@600;700;800;900&display=swap" rel="stylesheet">
<style>
${css}
</style>
</head>
<body>
<div id="root"></div>
<noscript>OsonQonun ishlashi uchun JavaScript yoqilgan bo'lishi kerak.</noscript>
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
console.log("dist/index.html", (html.length / 1024).toFixed(0) + " KB");
