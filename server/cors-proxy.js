// Zero-dependency static host + CORS proxy for the Cherry Studio web build.
//
//   node server/cors-proxy.js --static dist-web --port 8080
//
// Routes:
//   /<host>/<path>  -> https://<host>/<path>   (the boot gate rewrites the two
//                     registry hosts to this shape; they send no CORS headers)
//   everything else -> the static bundle (SPA fallback to index.html)
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
      const responseHeaders = { ...upstreamRes.headers };
      res.writeHead(upstreamRes.statusCode || 502, responseHeaders);
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

  const match = url.pathname.match(/^\/([^/]+)(\/.*)?$/);
  const targetHost = match && match[1];
  const isAsset = /^\.(js|mjs|css|wasm|json|png|jpg|jpeg|svg|ico|woff2?|ttf|html)$/i.test(url.pathname);
  if (!isAsset && targetHost && /^[a-z0-9-]+(\.[a-z0-9-]+)+$/i.test(targetHost)) {
    proxy(req, res, targetHost, (match[2] || '/') + url.search);
    return;
  }

  serveStatic(res, url.pathname);
});

server.listen(PORT, () => {
  console.log(`[cors-proxy] listening on :${PORT} static=${STATIC_DIR || '(none)'}`);
});
