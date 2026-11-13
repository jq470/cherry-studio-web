// Static host for the chat E2E workflow.
//
// Serves dist-web and forwards /api.deepseek.com/* to a local fake OpenAI
// endpoint, so the browser never needs a real key or network. The gate in
// index.html is patched at startup to route that host through this server
// (test bundle only; the shipped gate keeps its production allowlist).
'use strict';

const fs = require('fs');
const http = require('http');
const path = require('path');
const { URL } = require('url');

const args = process.argv.slice(2);
const argOf = (flag, fallback) => {
  const index = args.indexOf(flag);
  return index === -1 ? fallback : args[index + 1];
};

const PORT = Number(argOf('--port', 8099));
const STATIC_DIR = argOf('--static', 'dist-web');
const FAKE = new URL(process.env.FAKE_URL || 'http://127.0.0.1:9100');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.wasm': 'application/wasm',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
};

// Patch the test bundle's gate so api.deepseek.com goes through this server.
function patchGate() {
  const file = path.join(STATIC_DIR, 'index.html');
  let html = fs.readFileSync(file, 'utf8');
  if (html.includes("'api.deepseek.com': 1")) return;
  html = html.replace(
    'var PROXIED_HOSTS = {',
    "var PROXIED_HOSTS = {\n    'api.deepseek.com': 1,",
  );
  fs.writeFileSync(file, html);
}

function serveStatic(res, pathname) {
  let filePath = path.join(STATIC_DIR, pathname);
  if (pathname === '/' || !path.extname(pathname)) filePath = path.join(STATIC_DIR, 'index.html');
  fs.stat(filePath, (error, stat) => {
    if (error || !stat.isFile()) {
      filePath = path.join(STATIC_DIR, 'index.html');
      fs.stat(filePath, (fallbackError, fallbackStat) => {
        if (fallbackError) {
          res.writeHead(404);
          res.end('not found');
          return;
        }
        sendFile(res, filePath, fallbackStat);
      });
      return;
    }
    sendFile(res, filePath, stat);
  });
}

function sendFile(res, filePath, stat) {
  res.writeHead(200, {
    'content-type': MIME[path.extname(filePath).toLowerCase()] || 'application/octet-stream',
    'content-length': stat.size,
  });
  fs.createReadStream(filePath).pipe(res);
}

patchGate();

http
  .createServer((req, res) => {
    const url = new URL(req.url, `http://127.0.0.1:${PORT}`);
    if (url.pathname.startsWith('/api.deepseek.com/')) {
      const targetPath = url.pathname.slice('/api.deepseek.com'.length) + url.search;
      const upstream = http.request(
        { hostname: FAKE.hostname, port: FAKE.port, path: targetPath, method: req.method, headers: req.headers },
        (upstreamRes) => {
          res.writeHead(upstreamRes.statusCode || 502, upstreamRes.headers);
          upstreamRes.pipe(res);
        },
      );
      upstream.on('error', (error) => {
        res.writeHead(502, { 'content-type': 'application/json' });
        res.end(JSON.stringify({ error: error.message }));
      });
      req.pipe(upstream);
      return;
    }
    serveStatic(res, url.pathname);
  })
  .listen(PORT, () => console.log(`[e2e-server] :${PORT} static=${STATIC_DIR} fake=${FAKE.href}`));
