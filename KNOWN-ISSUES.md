# 验证状态与已知问题

> 更新于 2026-11-13。基线：upstream `714d0710`，CI `43377664290`（commit `0abc4c56`）。

## 已验证可用

- 构建：GitHub Actions 从官方源码导出静态 SPA，`verdict: PASS`，`console errors: 0`，`failed requests: 0`。
- 启动：sqlite-wasm 初始化成功，IndexedDB 预载 2 个数据库 / 9 个文件，刷新后不回到欢迎页。
- 界面（真实 Chrome，1280×960）：侧边栏、会话列表、欢迎页、输入框、发送按钮、设置入口均可见且坐标在视口内（composer y=870，设置按钮 y=876）。
- 导航：`/`、`/settings`、`/settings/provider`、`/settings/provider/catalog`、`/settings/provider/new` 深链可直接打开。
- 服务商：registry 经代理 200；目录页列出 CherryIN / Silicon / ZhiPu / deepseek 等预设；deepseek 预设可填 API Key、保存密钥并启用。
- 隐私弹窗：桌面窗口下可纵向滚动露出“同意并继续 / 不同意”。

## 本轮修掉的 web 特有问题

1. `KeyboardProvider` 裸 `div` 导致根布局高度为 0，整个界面被排到视口上方（截图纯白，但 innerText 正常）。改为 flex 容器后界面真正可见。
2. `useReanimatedKeyboardAnimation()` 返回的假共享值只有 `.value`，`ChatComposerClearance` 调 `.get()` 直接崩溃。改为带 `get/set/modify` 的共享值。
3. gate 用相对路径解析 `sqlite3/`，深链（如 `/settings/provider/new`）下解析到子路由，wasm 模块 MIME 校验失败 → 启动失败页。改为 `location.origin + '/sqlite3/'`。
4. 手机优先的底部弹窗在桌面窗口下超出 body 高度，按钮不可达。gate 注入 `overflow-y:auto`，允许纵向滚动。
5. 匿名遥测 `analytics.cherry-ai.com` 的 CORS 失败在 gate 本地拦截为 204，console 与 failed requests 归零。

## 已知问题（未修）

- **真实对话未端到端验证**：需要有效模型 API Key；CI 与本地均未调用真实模型。
- **服务商高级编辑的弹出层在 web 上不可见**：点“API 地址”“重命名服务商”会打开一个全屏透明层，内容不渲染，且拦截后续点击。预设服务商（deepseek 等）不受影响，自定义服务商命名与自定义 API 地址目前不可用。
- **点“不同意”后可能残留一层透明遮罩**：刷新后恢复；根因与上一条同类（弹出层/遮罩）。
- **桌面布局是手机版拉伸**：隐私弹窗为底部卡片样式，需要滚动才能看到按钮；未做桌面专用布局。
- **公网托管未接入**：GitHub Pages 需要仓库 Settings 权限，连接器无该接口；当前交付自包含包（Node 静态服务 + 代理）。

## 复现

```bash
curl -L -o csw.zip https://raw.githubusercontent.com/jq470/cherry-studio-web/dist/cherry-studio-web.zip
unzip csw.zip -d csw && cd csw
node server/cors-proxy.js --static dist-web --port 8080
# http://127.0.0.1:8080
```
