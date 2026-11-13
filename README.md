# Cherry Studio Web

把官方移动端仓库 [`CherryHQ/cherry-studio-app`](https://github.com/CherryHQ/cherry-studio-app)（Expo + React Native）在**业务代码零改动**的前提下搬到浏览器：只做配置补丁、平台桩层和构建流水线，由 GitHub Actions 产出可部署的静态 SPA。

- 上游基线：`714d071096589a4144e2c4dbbbf2b6e3827b998c`（app 0.5.4 / Expo 58 / RN 0.88.1）
- 当前状态：CI `verdict: PASS`，主界面渲染、onboarding、刷新持久化、SQLite（官方 sqlite-wasm，FTS5 可用）均通过
- 成品包：https://raw.githubusercontent.com/jq470/cherry-studio-web/dist/cherry-studio-web.zip

## 快速开始

```bash
unzip cherry-studio-web.zip
node server/cors-proxy.js --static dist-web --port 8080
# 打开 http://127.0.0.1:8080
```

Docker：

```bash
docker build -t cherry-studio-web .
docker run -p 8080:8080 cherry-studio-web
```

## 结构

```
scripts/            prep / overlay / patches / smoke
overlay/src/web-shims/   10 个平台桩（expo-sqlite、expo-file-system、MMKV、键盘、Sentry…）
overlay/web/       静态服务器
server/            零依赖 CORS 代理（Node）+ Cloudflare Worker 版本
.github/workflows/ web-build.yml（构建+冒烟+报告回写）、publish-dist.yml（公开 zip）
```

## 三层补丁

1. **L1 通用桩** `overlay/src/web-shims/native-stub.js`：Proxy 覆盖原生包，`get` 先查 target 自身属性，`then` 返回 undefined 防 await 挂起。
2. **L2 行为桩**：`expo-sqlite`（官方 `@sqlite.org/sqlite-wasm@3.54.1-build1`，支持 FTS5/rtree）、`expo-file-system`、`react-native-mmkv`、`react-native-keyboard-controller`、`@sentry/react-native`、`expo-image-picker`、`react-native-webview`、`rnw-input-accessory-view`。
3. **L3 resolver** `scripts/patch-metro.js`：仅 web 平台，把 `react-native/Libraries/**`、`react-native/src/**` 和显式模块表（35 条）指向桩；`scripts/patch-rnw.js` 给 RNW 补 `codegenNativeComponent`（fabric 规格模块 import 时必需）。

数据库层用 boot gate（`scripts/patch-index-html.js`）：先初始化 sqlite3 WASM、预载 IndexedDB，再按序注入原 bundle；`openDatabaseSync` 才能在调用时真正同步。

## 部署与安全

静态包需要 HTTPS，且 `sqlite3/sqlite3.wasm` 必须以 `application/wasm` 提供。Provider registry 来自 `raw.githubusercontent.com` / `api.gitcode.com`，它们不给浏览器 CORS 头，所以 gate 把这两个 host 重写到同源 `/<host>/<path>`。

**代理是白名单制**：仅转发 `raw.githubusercontent.com`、`objects.githubusercontent.com`、`api.gitcode.com`，其余路径落到静态页；白名单内的 307/302 由服务端跟随。可用 `PROXY_HOSTS` 覆盖。详见 [DEPLOY.md](DEPLOY.md)。

## 已知限制

- 未配置模型 API Key，真实发消息、流式输出、Markdown/KaTeX 渲染尚未端到端验证
- analytics（`analytics.cherry-ai.com`）在浏览器下 CORS 失败，仅影响匿名遥测，控制台会有报错，功能无影响
- 上游 commit 硬编码，升级需重跑补丁并复核锚点
- 桩层是“假对象”，新原生调用可能静默降级而非报错
- 沙箱无法本地 `expo export`（fd 上限 2048），构建只在 CI runner 完成

## License

上游为 AGPL-3.0，本仓库的补丁层同样遵循该协议；使用/分发请遵守上游许可。
