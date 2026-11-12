#!/usr/bin/env node
// Zero-dependency static server for the exported bundle.
//
//  * serves dist-web with `application/wasm` for .wasm (WASM streams refuse a
//    wrong MIME type),
//  * sends COOP/COEP/CORP so SharedArrayBuffer stays available for any leftover
//    isolated code path (sql.js itself does not need it),
//  * falls back to index.html for client-side routes (SPA),
//  * `Cache-Control: no-store` so a redeploy is visible immediately.
'use strict';

const fs = require('fs');
const http = require('http');
const path = require('path');

const root = path.resolve(process.argv[2] || 'dist-web');
const port = Number(process.argv[3] || 8099);
const isolated = process.env.NO_ISOLATION !== '1';

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.wasm': 'application/wasm',
  '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.otf': 'font/otf',
  '.bin': 'application/octet-stream',
  '.mp4': 'video/mp4',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.pdf': 'application/pdf',
};

function headersFor(filePath) {
  const headers = {
    'Content-Type': MIME[path.extname(filePath).toLowerCase()] || 'application/octet-stream',
    'Cache-Control': 'no-store',
    'Cross-Origin-Resource-Policy': 'same-origin',
  };
  if (isolated) {
    headers['Cross-Origin-Opener-Policy'] = 'same-origin';
    headers['Cross-Origin-Embedder-Policy'] = 'require-corp';
  }
  return headers;
}

const server = http.createServer((request, response) => {
  const url = new URL(request.url, `http://${request.headers.host || 'localhost'}`);
  let filePath = path.join(root, decodeURIComponent(url.pathname));

  if (!filePath.startsWith(root)) {
    response.writeHead(403).end('forbidden');
    return;
  }
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    const nested = path.join(filePath, 'index.html');
    filePath = fs.existsSync(nested) ? nested : path.join(root, 'index.html');
  }
  if (!fs.existsSync(filePath)) {
    response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }).end('not found');
    return;
  }

  const headers = headersFor(filePath);
  if (filePath.endsWith('.html')) headers['Content-Type'] = MIME['.html'];
  response.writeHead(200, headers);
  if (request.method === 'HEAD') {
    response.end();
    return;
  }
  fs.createReadStream(filePath).pipe(response);
});

server.listen(port, '127.0.0.1', () => {
  console.log(`serving ${root} at http://127.0.0.1:${port} (isolation=${isolated})`);
});
