// Combines the standalone vanilla-JS app (app/) and the Docusaurus build
// output (build/) into a single static site root (dist/):
//   dist/index.html, dist/simulator.html, ...  <- the app (site "face")
//   dist/docs/...                              <- Docusaurus (baseUrl: /docs/)
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const buildDir = path.join(root, 'build');
const appDir = path.join(root, 'app');
const distDir = path.join(root, 'dist');

fs.rmSync(distDir, { recursive: true, force: true });
fs.mkdirSync(distDir, { recursive: true });

fs.cpSync(buildDir, path.join(distDir, 'docs'), { recursive: true });
fs.cpSync(appDir, distDir, { recursive: true });

console.log('Merged build/ -> dist/docs and app/ -> dist/');
