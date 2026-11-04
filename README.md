# 迅树 MD 官网 · VitePress + Vue 源码

本项目依据对话中确认的官网结构，实现可编辑、可部署的 VitePress 网站。它不是 ChatGPT 内置组件的直接代码导出，而是用真实 Vue 单文件组件重新实现该布局。

## 视觉风格 · 黑白玻璃拟态

本版本已统一改成**浅色背景 + 黑白玻璃拟态**：银灰层次渐变、半透明磨砂导航与侧边栏、白色玻璃卡片、黑色主按钮、细边框和柔和阴影。下载卡片、Web Mock 占位页、截图页、教程正文、更新日志及关于页面都使用同一套 CSS 变量；不是只给首页换背景。

- 默认浅色；保留完整的黑白深色变量，VitePress 原生外观切换仍可使用。
- 为阅读提供清晰对比度；代码块和教程正文不做过度透明。
- 支持较小屏幕和系统减少动画设置；不改变页面路径、文章目录、版本导航和搜索。
- 样式集中在 `docs/.vitepress/theme/custom.css`，详细规则见 `DESIGN-GLASS.md`。

## 设计与边界

- **顶部导航**：首页、下载、使用文档、在线体验、更新日志、关于（包含开源致谢和第三方许可证）。
- **独立侧边栏**：使用文档显示教程目录；更新日志显示按年份和版本整理的版本导航。首页、下载、在线体验、关于等页面不显示左侧栏。
- **没有网站级 Footer**，也不开发自定义页脚。教程上一篇／下一篇属于文档阅读导航。
- **首页三个重点**：局域网 P2P 同步；首页文件树；Super MarkDown（手写/音视频/Office/PDF，Office 仅渲染）。
- **唯一下载来源**：GitHub Releases。没有 123 云盘备用下载或公开分享。
- **123 云盘**：仅作为软件内云端同步的未来规划，未实现时不宣传为已支持。
- **Web Mock**：当前只保留 `/demo/` 的待接入说明页，既不包含 React 应用，也不执行 Tauri/Rust 功能。后续可以通过独立构建把真实 Web Mock 产物覆盖进 `/demo/`。
- **真实截图**：首页的应用画面是排版示意，已明确标注，正式版需替换。不同操作系统的下载状态默认“未开放”。

## 本地启动

需要 Node.js 20 及以上。进入本目录运行：

```bash
npm install --no-audit --no-fund
npm run dev
```

默认开发地址通常为 `http://localhost:5173`。随后可执行：

```bash
npm run build
npm run preview
```

静态产物在 `docs/.vitepress/dist/`。

## 配置下载地址

打开 `docs/.vitepress/theme/data/releases.ts`，填写**自己实际上传**的 GitHub Release 资产 URL、版本号，并将相应平台的 `status` 改为 `已发布`。

URL 空缺时按钮保持禁用，不会生成假的下载链接。iOS/iPadOS 的实际分发方式需要遵守 Apple 平台要求。

## 配置 GitHub Pages

本仓库自带 `.github/workflows/deploy.yml`。推送到 `main` 后，在 GitHub 仓库 Settings → Pages → Build and deployment 中选择 **GitHub Actions**。

- 项目地址 `https://USER.github.io/REPO/`：默认使用 `/${REPO}/` 作为 VitePress `base`。
- 自定义根域名 `https://docs.example.com/`：在仓库 Settings → Secrets and variables → Actions → Variables 设置 `SITE_BASE=/`，并正确配置 DNS / Pages 自定义域名。
- `SITE_URL` 为可选的最终完整站点地址，用于生成 sitemap；没配置时不会写入虚构地址。

本项目当前没有随包提供 `package-lock.json`（执行环境无法连接 npm 包仓库生成锁文件）。工作流已关闭依赖锁文件的 `setup-node` npm 缓存功能，避免首次构建因此直接失败。首次在可联网电脑上运行 `npm install --no-audit --no-fund` 会生成锁文件；建议提交锁文件，并将工作流安装命令改为 `npm ci`、再启用 npm 缓存，以确保可复现构建。

本项目生成普通 `.html` 文档路径，避免在 GitHub Pages 上依赖服务器 URL Rewrite。所有首页按钮均为真实站内链接；文档侧边栏链接对应实际文件。

## 将现有 Web Mock 接入 `/demo/`

根据迅树 MD 原有设计，React + Vditor UI 使用构建期选定的内存 Mock API；**不可直接把 Native 版本打包成 Web 演示**。现有应用尚无公开 `build:demo` 入口，必须由应用工程单独添加并验证。

接入步骤：

1. 在**真正的应用仓库**基于当前工作树新增公开演示专用构建，保留 `dev:web` 与 Native 构建含义。
2. 设置演示应用的 Vite `base` 为网站实际 `base` 后加 `demo/`（例如 `/REPO/demo/`）；验证字体、图片、Worker/WASM 等资源路径。
3. 将演示应用构建成静态文件，确保内部路径和刷新行为可用。
4. 在官网仓库执行 `DEMO_DIST=/path/to/real/mock/dist npm run build:with-demo`。脚本会以真实 Web Mock 静态产物覆盖 `docs/.vitepress/dist/demo/`，不再显示占位页。
5. 若需在 GitHub Actions 中自动构建演示应用，请先确定仓库结构、依赖和授权访问方式，再增设真实源码构建步骤；当前工作流仅构建官网，**不会假装已经构建 Web Mock**。

`/demo/` 的演示环境应明确提示内存 Mock、刷新重置、设备同步仅模拟，不接入账号认证服务器、文件系统和真实局域网同步。

## 更新日志的独立侧边栏

`/changelog/` 和 `/guide/` 现在分别使用自己的 VitePress 侧边栏：教程侧栏不变；更新日志左侧始终显示「全部更新」，正式发布过的版本会按年份分组，按日期倒序排列。

**目前没有填写真实的发布记录**，所以左栏先显示「暂无已发布版本」，不会虚构版本号。今后每次发布可按以下步骤维护：

1. 确认对应版本已经在 GitHub Releases 实际发布。
2. 将 `templates/changelog-release.md` 复制到 `docs/changelog/releases/`，按 `YYYY-MM-DD-v版本号.md` 命名（例如 `2026-11-02-v1.0.0.md` 只是文件名格式示例）。
3. 将模板中的版本号、日期、新增、改进、修复替换为实际信息。
4. 重新构建或部署，侧栏自动识别新文件，不需要在 `config.ts` 手动添加链接。

版本说明页面使用默认右侧文章目录；更新日志首页保留 `aside: false`，只显示左侧版本导航。官网依旧不显示网站级 Footer。

## 内容维护

| 内容 | 位置 |
|---|---|
| 首页布局与三大亮点 | `docs/.vitepress/theme/components/HomeLanding.vue` |
| 样式与响应式 | `docs/.vitepress/theme/custom.css` |
| 下载卡片 | `docs/.vitepress/theme/components/DownloadCards.vue` |
| Release 下载地址和状态 | `docs/.vitepress/theme/data/releases.ts` |
| 顶部导航、文档目录、搜索 | `docs/.vitepress/config.ts` |
| 使用文档 | `docs/guide/*.md` |
| 更新日志首页 | `docs/changelog/index.md` |
| 版本发布说明 | `docs/changelog/releases/YYYY-MM-DD-v版本号.md` |
| 更新日志侧边栏（自动生成） | `docs/.vitepress/changelogSidebar.ts` |
| 发布说明模板 | `templates/changelog-release.md` |
| 开源致谢与许可证 | `docs/acknowledgements/` 与 `docs/licenses/` |

正式上线前，还需要核对实际发布版本、准确截图、第三方许可证、项目正式 GitHub 仓库名、DNS 及所有平台下载链接。

## 本版检查情况

本次已完成 CSS 规则解析、仓库内部文件与相对链接检查、GitHub Pages 工作流静态检查和 ZIP 校验。由于当前环境访问 npm registry 时出现 DNS 错误，**未执行 `vitepress build` 或浏览器中的真实 Vue 页面联调**；请在可联网的开发机执行 `npm install && npm run build`，再用 `npm run dev` 检查实际界面和手机宽度。
