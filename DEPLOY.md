# 部署

产物是一个纯静态 SPA（`dist-web/`）。模型 API 需要 CORS 代理，所以有两条路线：

| 路线 | 静态站 | CORS 代理 | 备注 |
|---|---|---|---|
| 一体化自托管（推荐） | `server/cors-proxy.js` | 同一个进程 | 一个端口搞定，provider 基址指向 `/api.openai.com/v1` |
| GitHub Pages + Worker | Pages | Cloudflare Worker | Pages 必须手动在 Settings 里启用一次 |

## 1. 拿到产物

CI 每次推送 `main` 都会在 artifact `cherry-studio-web` 里放 `dist-web/`（保留 14 天）。

```
Actions -> web-build -> 最近一次运行 -> Artifacts -> cherry-studio-web
```

## 2. 一体化自托管

```bash
docker build -t cherry-studio-web .
docker run -p 8080:8080 cherry-studio-web
# 打开 http://<host>:8080
```

不用 Docker 也行：

```bash
node server/cors-proxy.js --static dist-web --port 8080
```

**在应用里配置 provider**（设置 → 模型服务 → 选中某个 provider → API 地址）：

```
原地址:   https://api.openai.com/v1
改成:     http://<host>:8080/api.openai.com/v1
```

规则是 `/<目标域名>/<原路径>`。本机服务自动走 http，其余走 https：

```
http://<host>:8080/localhost:11434/v1     -> http://localhost:11434/v1   (Ollama)
http://<host>:8080/api.deepseek.com/v1   -> https://api.deepseek.com/v1
```

API Key 照常填在应用内，代理只转发 `Authorization` 头，不落盘、不记日志。

## 3. GitHub Pages + Cloudflare Worker

1. 仓库 Settings → Pages → Source 选 **GitHub Actions**（连接器没有这个权限，只能手点一次）。
2. 手动跑 workflow `pages`（只在 `workflow_dispatch` 触发，避免未启用时刷红）。
3. 部署 Worker：

```bash
npx wrangler deploy server/cors-worker.js --name cherry-proxy
```

4. 应用里的 provider 基址填 `https://cherry-proxy.<你的子域>.workers.dev/api.openai.com/v1`。

## 静态托管的硬要求

- **必须部署在站点根路径**：bundle 用绝对路径引用 `/assets/...`、`/sqlite3/...`，子路径部署会 404。
- **SPA 回退**：未知路由返回 `index.html`。
- **`sqlite3/index.mjs` + `sqlite3/sqlite3.wasm`** 必须在位（CI 已自动放入）。
- `.wasm` 的 MIME 必须是 `application/wasm`，`.mjs` 必须是 JS 类型。
- 可选：`Cross-Origin-Opener-Policy: same-origin` + `Cross-Origin-Embedder-Policy: credentialless`，给可能用上 `SharedArrayBuffer` 的依赖留余地（当前 SQLite 走主线程，不需要）。

## 数据在哪

- 数据库字节、应用文件都在浏览器 **IndexedDB**（`cherry-studio-sqlite` / `cherry-studio-fs`）。
- 清站点数据 = 清空全部本地会话与文件；换浏览器/换设备不会同步。
- 备份：应用内的数据库备份会导出到虚拟盘，需要沿用应用自身的导出功能。
