// Combines the standalone vanilla-JS app (app/) and the Docusaurus build
// output (build/) into a single static site root (dist/):
//   dist/index.html, dist/simulator.html, ...  <- the app (site "face")
//   dist/docs/...                              <- Docusaurus (baseUrl: /docs/)
//
// DEPLOY_TARGET=gh-pages (set by `npm run build:gh-pages`) means Docusaurus
// was built with baseUrl /traefik/docs/ (GitHub Pages project-site path), so
// the app's hardcoded /docs/... links and asset paths (nav links, favicon,
// logo) need the same /traefik/ prefix.
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const buildDir = path.join(root, 'build');
const appDir = path.join(root, 'app');
const distDir = path.join(root, 'dist');
const isGhPages = process.env.DEPLOY_TARGET === 'gh-pages';

fs.rmSync(distDir, { recursive: true, force: true });
fs.mkdirSync(distDir, { recursive: true });

fs.cpSync(buildDir, path.join(distDir, 'docs'), { recursive: true });
fs.cpSync(appDir, distDir, { recursive: true });

if (isGhPages) {
  for (const file of fs.readdirSync(distDir)) {
    const filePath = path.join(distDir, file);
    if (file.endsWith('.html') && fs.statSync(filePath).isFile()) {
      const rewritten = fs
        .readFileSync(filePath, 'utf8')
        .replaceAll('href="/docs/', 'href="/traefik/docs/')
        .replaceAll('src="/docs/', 'src="/traefik/docs/');
      fs.writeFileSync(filePath, rewritten);
    }
  }
  console.log('Merged build/ -> dist/docs and app/ -> dist/ (rewrote /docs/ links and asset paths -> /traefik/docs/ for GitHub Pages)');
} else {
  console.log('Merged build/ -> dist/docs and app/ -> dist/');
}
