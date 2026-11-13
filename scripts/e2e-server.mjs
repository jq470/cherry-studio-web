// Static host for the chat E2E workflow.
//
// Serves dist-web and forwards /api.deepseek.com/* to a local fake OpenAI
// endpoint, so the browser never needs a real key or network. The gate in
// index.html is patched at startup to route that host through this server
// (test bundle only; the shipped gate keeps its production allowlist).
import fs from 'node:fs';
import http from 'node:http';
import https from 'node:https';
import path from 'node:path';

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
  html = html.replace("var PROXIED_HOSTS = {", "var PROXIED_HOSTS = {\n    'api.deepseek.com': 1,");
  fs.writeFileSync(file, html);
}

function sendFile(res, filePath, stat) {
  res.writeHead(200, {
    'content-type': MIME[path.extname(filePath).toLowerCase()] || 'application/octet-stream',
    'content-length': stat.size,
    // sqlite-wasm needs SharedArrayBuffer, which requires a cross-origin
    // isolated page; the production static server sends the same pair.
    'Cross-Origin-Opener-Policy': 'same-origin',
    'Cross-Origin-Embedder-Policy': 'require-corp',
  });
  fs.createReadStream(filePath).pipe(res);
}

function serveStatic(res, pathname) {
  const direct = path.join(STATIC_DIR, pathname);
  fs.stat(direct, (error, stat) => {
    if (!error && stat.isFile()) {
      sendFile(res, direct, stat);
      return;
    }
    const fallback = path.join(STATIC_DIR, 'index.html');
    fs.stat(fallback, (fallbackError, fallbackStat) => {
      if (fallbackError) {
        res.writeHead(404);
        res.end('not found');
        return;
      }
      sendFile(res, fallback, fallbackStat);
    });
  });
}

patchGate();

// Model metadata normally downloads from the registry lane. CI must not depend
// on that network, so the test host answers the same paths from the bundled
// @cherrystudio/provider-registry data (the manifest only has to repeat the
// versions the two files already carry).
const REGISTRY_DIRS = [
  process.env.REGISTRY_DATA_DIR,
  'upstream/node_modules/@cherrystudio/provider-registry/data',
  'node_modules/@cherrystudio/provider-registry/data',
].filter(Boolean);

function registryFile(name) {
  for (const dir of REGISTRY_DIRS) {
    const file = path.join(dir, name);
    if (fs.existsSync(file)) return fs.readFileSync(file, 'utf8');
  }
  return null;
}

function serveRegistry(res, name) {
  if (name === 'manifest.json') {
    const models = JSON.parse(registryFile('models.json') || '{}');
    const providerModels = JSON.parse(registryFile('provider-models.json') || '{}');
    res.writeHead(200, { 'content-type': 'application/json; charset=utf-8' });
    res.end(
      JSON.stringify({
        minAppVersion: '2.1.11',
        sourceAppVersion: '2.2.1',
        revision: 1,
        schemaVersion: 4,
        files: {
          'models.json': models.version,
          'provider-models.json': providerModels.version,
        },
      }),
    );
    return true;
  }
  const body = registryFile(name);
  if (!body) return false;
  res.writeHead(200, { 'content-type': 'application/json; charset=utf-8' });
  res.end(body);
  return true;
}

// Forward registry hosts that the production proxy also serves from the same
// origin, so a live catalog still works if the bundled copy is missing.
function relay(req, res, target, depth = 0) {
  const lib = target.protocol === 'https:' ? https : http;
  const headers = { ...req.headers, host: target.host };
  const upstream = lib.request(
    {
      hostname: target.hostname,
      port: target.port || undefined,
      path: target.pathname + target.search,
      method: req.method,
      headers,
    },
    (upstreamRes) => {
      const status = upstreamRes.statusCode || 502;
      if ([301, 302, 303, 307, 308].includes(status) && upstreamRes.headers.location && depth < 4) {
        upstreamRes.resume();
        relay(req, res, new URL(upstreamRes.headers.location, target), depth + 1);
        return;
      }
      res.writeHead(status, upstreamRes.headers);
      upstreamRes.pipe(res);
    },
  );
  upstream.on('error', (error) => {
    res.writeHead(502, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ error: error.message }));
  });
  req.pipe(upstream);
}

http
  .createServer((req, res) => {
    const url = new URL(req.url, `http://127.0.0.1:${PORT}`);
    const registryMatch = url.pathname.match(/(manifest\.json|models\.json|provider-models\.json)$/);
    const registryHost =
      url.pathname.startsWith('/raw.githubusercontent.com/') ||
      url.pathname.startsWith('/api.gitcode.com/');
    if (registryHost && registryMatch && serveRegistry(res, registryMatch[1])) {
      return;
    }
    if (url.pathname.startsWith('/api.deepseek.com/')) {
      const targetPath = url.pathname.slice('/api.deepseek.com'.length) + url.search;
      const upstream = http.request(
        {
          hostname: FAKE.hostname,
          port: FAKE.port,
          path: targetPath,
          method: req.method,
          headers: req.headers,
        },
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
    const forwarded = ['raw.githubusercontent.com', 'api.gitcode.com'].find((host) =>
      url.pathname.startsWith(`/${host}/`),
    );
    if (forwarded) {
      const rest = url.pathname.slice(forwarded.length + 2);
      relay(req, res, new URL(`https://${forwarded}/${rest}${url.search}`));
      return;
    }
    serveStatic(res, url.pathname);
  })
  .listen(PORT, () => console.log(`[e2e-server] :${PORT} static=${STATIC_DIR} fake=${FAKE.href}`));
