// Zero-dependency static host + allowlisted CORS proxy for the web build.
//
//   node server/cors-proxy.js --static dist-web --port 8080
//
// Routes:
//   /<allowlisted-host>/<path> -> https://<allowlisted-host>/<path>
//   everything else            -> the static bundle (SPA fallback to index.html)
//
// This is deliberately NOT an open proxy: only hosts in ALLOW_HOSTS are
// forwarded, so a public deployment cannot be used as an SSRF relay.
// Override with PROXY_HOSTS="a.com,b.com" when a new registry host appears.
'use strict';

const fs = require('fs');
const http = require('http');
const https = require('https');
const path = require('path');
const { URL } = require('url');

const args = process.argv.slice(2);
const argOf = (flag, fallback) => {
  const index = args.indexOf(flag);
  return index === -1 ? fallback : args[index + 1];
};

const PORT = Number(argOf('--port', process.env.PORT || 8080));
const STATIC_DIR = argOf('--static', process.env.STATIC_DIR || '');
const ALLOW_ORIGIN = process.env.ALLOW_ORIGIN || '*';
const DEFAULT_HOSTS = ['raw.githubusercontent.com', 'objects.githubusercontent.com', 'api.gitcode.com'];
const ALLOW_HOSTS = new Set(
  (process.env.PROXY_HOSTS ? process.env.PROXY_HOSTS.split(',') : DEFAULT_HOSTS)
    .map((host) => host.trim().toLowerCase())
    .filter(Boolean),
);

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.wasm': 'application/wasm',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
};

function cors(res) {
  res.setHeader('Access-Control-Allow-Origin', ALLOW_ORIGIN);
  res.setHeader('Access-Control-Allow-Headers', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Max-Age', '86400');
}

function serveStatic(res, pathname) {
  if (!STATIC_DIR) {
    res.writeHead(404, { 'content-type': 'text/plain' });
    res.end('not found');
    return;
  }
  const root = path.resolve(STATIC_DIR);
  const relative = decodeURIComponent(pathname).replace(/^\//, '') || 'index.html';
  const filePath = path.resolve(root, relative);
  if (!filePath.startsWith(root)) {
    res.writeHead(403);
    res.end();
    return;
  }
  fs.stat(filePath, (error, stat) => {
    if (error || !stat.isFile()) {
      fs.readFile(path.join(root, 'index.html'), (fallbackError, content) => {
        if (fallbackError) {
          res.writeHead(404, { 'content-type': 'text/plain' });
          res.end('not found');
          return;
        }
        res.writeHead(200, { 'content-type': MIME['.html'] });
        res.end(content);
      });
      return;
    }
    res.writeHead(200, {
      'content-type': MIME[path.extname(filePath).toLowerCase()] || 'application/octet-stream',
      'content-length': stat.size,
    });
    fs.createReadStream(filePath).pipe(res);
  });
}

function proxy(req, res, targetHost, targetPath) {
  const target = new URL(`https://${targetHost}${targetPath}`);
  const headers = { ...req.headers };
  delete headers.host;
  delete headers.origin;
  delete headers.referer;
  delete headers.cookie;
  headers.host = target.host;

  const upstream = https.request(
    { method: req.method, hostname: target.hostname, path: target.pathname + target.search, headers },
    (upstreamRes) => {
      cors(res);
      res.writeHead(upstreamRes.statusCode || 502, { ...upstreamRes.headers });
      upstreamRes.pipe(res);
    },
  );

  upstream.on('error', (error) => {
    cors(res);
    res.writeHead(502, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ error: 'upstream failed', detail: error.message }));
  });

  req.pipe(upstream);
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);

  if (req.method === 'OPTIONS') {
    cors(res);
    res.writeHead(204);
    res.end();
    return;
  }

  const segment = url.pathname.split('/')[1] || '';
  if (ALLOW_HOSTS.has(segment.toLowerCase())) {
    proxy(req, res, segment, url.pathname.slice(segment.length + 1) + url.search || '/');
    return;
  }

  serveStatic(res, url.pathname);
});

server.listen(PORT, () => {
  console.log(`[cors-proxy] :${PORT} static=${STATIC_DIR || '(none)'} hosts=${[...ALLOW_HOSTS].join(',')}`);
});
