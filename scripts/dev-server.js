// Local dev entrypoint that mirrors the production layout (dist/):
//   /            -> app/ (the standalone vanilla-JS "face")
//   /docs/*      -> Docusaurus dev server (hot reload preserved), proxied
//
// `docusaurus start` alone only knows about /docs and never serves app/,
// so we front it with a tiny static+proxy server on the port the user
// actually opens (3000), spawning docusaurus on an internal port.
const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const httpProxy = require('http-proxy');

const APP_PORT = Number(process.env.PORT) || 3000;
const DOCS_PORT = APP_PORT + 1;
const appDir = path.join(__dirname, '..', 'app');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
};

function serveFile(filePath, res) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not found');
      return;
    }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(filePath)] || 'application/octet-stream' });
    res.end(data);
  });
}

const proxy = httpProxy.createProxyServer({ target: `http://localhost:${DOCS_PORT}`, ws: true });
proxy.on('error', (err, req, res) => {
  if (res.writeHead) {
    res.writeHead(502, { 'Content-Type': 'text/plain' });
    res.end('Docusaurus dev server is still starting up, retry in a moment...');
  }
});

const server = http.createServer((req, res) => {
  const urlPath = decodeURIComponent(req.url.split('?')[0]);

  if (urlPath.startsWith('/docs')) {
    proxy.web(req, res);
    return;
  }

  const requested = urlPath === '/' ? '/index.html' : urlPath;
  const filePath = path.join(appDir, requested);
  if (filePath.startsWith(appDir) && fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    serveFile(filePath, res);
    return;
  }

  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not found');
});

server.on('upgrade', (req, socket, head) => {
  if (decodeURIComponent(req.url.split('?')[0]).startsWith('/docs')) {
    proxy.ws(req, socket, head);
  }
});

const docusaurus = spawn(
  process.platform === 'win32' ? 'npx.cmd' : 'npx',
  ['docusaurus', 'start', '--port', String(DOCS_PORT), '--no-open'],
  { stdio: 'inherit' },
);

docusaurus.on('exit', (code) => process.exit(code ?? 0));
process.on('SIGINT', () => { docusaurus.kill('SIGINT'); process.exit(0); });
process.on('SIGTERM', () => { docusaurus.kill('SIGTERM'); process.exit(0); });

server.listen(APP_PORT, () => {
  console.log(`\n  App + Docs dev server running at http://localhost:${APP_PORT}`);
  console.log(`  (docs hot-reload backend on internal port ${DOCS_PORT})\n`);
});
