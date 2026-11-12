# Web 适配说明

本文件说明「为什么每处都要改」，方便上游升级后快速判断是否需要调整。

## 1. 配置层（2 个补丁，幂等）

| 目标文件 | 改动 | 原因 |
|---|---|---|
| `app.json` | `expo.web = { bundler: "metro", output: "single" }` | `output: "static"` 会让 `expo export` 走 Node 预渲染；上游大量模块在顶层访问 `window`/`document`/`localStorage`，预渲染阶段直接崩，连 bundle 都不会产出 |
| `metro.config.js` | 注入 `resolveRequest` web 分支 | 见下 |

`metro.config.js` 只做三件事，且全部限定 `platform === 'web'`：

1. `react-native/Libraries/**`、`react-native/src/**` → 空桩。这些内部路径会把原生 RN 核心（`NativeUIManager` → `TurboModuleRegistry` → `__fbBatchedBridgeConfig`）拉进 web 包并抛错。
2. `./exports/InputAccessoryView`（仅当 origin 是 `react-native-web`）→ 组件桩。RNW 0.21.4 的目录式导出在 pnpm 布局下 Metro 解析不到。
3. 显式模块表 → 桩文件（见 §2）。

## 2. 桩层（9 个文件）

### 2.1 行为桩（返回值会被消费）

| 模块 | 关键契约 |
|---|---|
| `expo-sqlite` | `openDatabaseSync/Async`、`prepareSync` → `executeSync`(`changes`/`lastInsertRowId`)、`executeForRawResultSync` → `getAllSync()`(数组行)、`finalizeSync`；异步变体；`backupDatabaseAsync({sourceDatabase,destDatabase})`；字节落 IndexedDB |
| `expo-file-system` | `Directory`/`File`/`Paths`/`FileMode` 同步类 API + legacy Promise API；虚拟盘落 IndexedDB；**构造不登记**，否则 `.exists` 恒真 → `BackupError: unavailable` |
| `react-native-mmkv` | `createMMKV()`、`getString/getNumber/getBoolean/getBuffer/contains/getAllKeys/delete/clearAll`，localStorage 后端 |
| `react-native-keyboard-controller` | `KeyboardProvider` 可渲染；hooks 返回 `{height:{value:0}}` 等可读对象；`KeyboardController` 全 no-op |
| `@sentry/react-native` | `wrap` 必须恒等透传（bootstrap 无条件调用） |
| `expo-image-picker` | `launch*Async` → `{canceled:true, assets:null}`；权限 → `granted` |
| `react-native-webview` | `<iframe>` 承载 `source.uri` / `source.html`，`onMessage` 走 `window.message` |

### 2.2 通用桩（`native-stub.js`）

给「web 路径上不会被真正执行，但 Metro 仍会打包静态依赖边」的原生包：`expo-camera`、`expo-media-library`、`expo-notifications`、`expo-widgets`、`expo-audio`、`expo-speech`、`expo-speech-recognition`、`expo-glass-effect`、`expo-calendar`、`expo-observe`、`expo-paste-input`、`expo-intent-launcher`、`react-native-quick-crypto`、`react-native-nitro-theme-transition`、`react-native-reserved-regions`、`react-native-share`、`react-native-view-shot`、`react-native-background-actions`、`react-native-anydoc`、`react-native-enriched-markdown`、`@magrinj/expo-quick-look`、`@preeternal/react-native-file-hash`、`@siteed/sherpa-onnx.rn`、`@shopify/react-native-skia`。

设计要点：

- `then` 返回 `undefined`，避免 `await stub` 永久挂起；
- 任意属性读取返回下一层桩，`X.foo.bar()` 不会抛；
- 调用参数长得像 React props 时返回 `null`，让 `<X />` 渲染为空而不是让 React 抛「objects are not valid as a child」。

## 3. 运行时资产

- `sqljs/sql-wasm.js`、`sqljs/sql-wasm.wasm`：CI 从 jsDelivr 拉到 `dist-web/sqljs/`；运行时优先本地，缺失才回退 CDN。
- `static-server.js`：`.wasm` MIME、COOP/COEP、SPA 回退。

## 4. 上游升级检查清单

1. `metro.config.js` 是否仍存在 `config.resolver.resolveRequest = (context, moduleName, platform) => {`（补丁锚点，缺失即 CI 失败）。
2. `app.json` 的 `expo.web` 是否被 `app.config.ts` 覆盖（当前 `app.config.ts` 只 spread `config`，不碰 `web`）。
3. 新增依赖里是否有原生包 → 按 §2.1/§2.2 归类补桩。
4. `expo-sqlite` 若修改了 drizzle 适配器契约（`session.js`），同步更新 `expo-sqlite.web.js`。
