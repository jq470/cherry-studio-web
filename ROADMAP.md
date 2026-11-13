# 后续推进计划（自行决定版）

> 当前基线：`7dfef8a`，CI `43377664290` PASS。已完成部分见 `KNOWN-ISSUES.md`。

## 已完成

- P0 仓库与三层补丁骨架。
- P1 静态导出 + sqlite-wasm 启动 + CI 冒烟 PASS。
- P2.0 真机界面：根布局高度修复（KeyboardProvider）、键盘共享值、深链 sqlite 路径、弹窗滚动、遥测拦截。
- P2.1 服务商预设（deepseek 等）可填 Key、保存、启用；registry 经代理 200。

## 下一阶段（按优先级）

### P2.2 修弹出层（阻塞自定义服务商与“不同意”路径）

现象：点击“重命名服务商 / API 地址 / 不同意”后出现全屏透明层，内容不渲染且拦截点击。

计划：
1. 用 `__reactFiber$` 从遮挡 DOM 向上读组件名，定位是 `@cherrystudio/ui` 的 Dialog 还是 Popover。
2. 检查该组件在 web 上是否依赖 `measureInWindow` / `react-native/Libraries/**`（本仓库把这些内部路径统一桩成空模块，可能是根因）。
3. 若依赖测量：给 `measureInWindow/measure` 提供 RNW 实现，而不是空桩。
4. 用 CI 冒烟加一条断言：打开服务商重命名弹窗后，弹窗文本可见且按钮可点。

验收：自定义服务商可以命名、可改 API 地址；隐私“不同意”后无残留遮罩。

### P2.3 真实对话端到端

计划：
1. CI 里启一个假 OpenAI 兼容服务，把 `api.deepseek.com` 映射到它（代理已支持 `PROXY_TARGETS` 的本地实验版，需正式并入 server）。
2. 冒烟脚本走：填 Key → 启用 deepseek → 选模型 → 发“ping” → 断言流式返回出现 `**pong** from fake provider`。
3. 通过后再用真实 Key 手工跑一次。

验收：CI 报告新增 `chat: PASS`，消息气泡渲染 Markdown。

### P2.4 桌面布局

- 隐私弹窗在桌面窗口是手机底部卡片，需滚动才能看到按钮。计划：在宽度 ≥768px 时把 Dialog 居中并限制 `max-height: 90vh`。

### P3 部署

- 首选 Cloudflare Pages（静态）+ Worker（同源代理），`server/cors-worker.js` 已有雏形。
- 备选自托管 Docker（已交付）。

## 不做

- 不改业务代码；只动补丁、桩层、构建与部署。
- 不伪造“对话已跑通”的结论；没有 Key 就只交付到配置页。
