# Deploying the web build

The bundle is a self-contained static SPA (`upstream/dist-web`, artifact
`cherry-studio-web`). It needs two things from the host:

1. **HTTPS + correct MIME types** – `sqlite3/sqlite3.wasm` must be served as
   `application/wasm`, otherwise WASM streaming compilation fails.
2. **A same-origin proxy for GitHub-hosted JSON** – provider registry manifests
   live on `raw.githubusercontent.com` / `api.gitcode.com`, which send no CORS
   headers to browser origins. The boot gate rewrites those two hosts to
   `/<host>/<path>`, so the proxy must forward that shape.

## Option A — one container (recommended)

```bash
docker build -t cherry-studio-web .
docker run -p 8080:8080 cherry-studio-web
```

`server/cors-proxy.js` is zero-dependency: it serves `dist-web` and forwards
`/<host>/<path>` to `https://<host>/<path>` (strips `Origin`/`Referer`/`Cookie`,
keeps `Authorization`).

Without Docker:

```bash
node server/cors-proxy.js --static dist-web --port 8080
```

## Option B — static host + Cloudflare Worker

Host `dist-web` on any static host (Pages, Netlify, S3), and deploy
`server/cors-worker.js` as a Worker on the same origin so `/<host>/<path>`
reaches the Worker. Point the site's `/api/...` routes at the Worker.

## Notes

- Analytics (`analytics.cherry-ai.com`) is blocked by CORS in the browser; it is
  non-fatal and only affects anonymous telemetry.
- The SQLite database lives in IndexedDB; clearing site data resets the app.
- No server-side model proxying is required: providers are called directly from
  the browser with the user's key.
