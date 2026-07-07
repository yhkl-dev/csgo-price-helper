# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

基于 Plasmo 框架（React + TypeScript）构建的 Chrome 浏览器扩展程序。帮助 CS:GO 玩家在 BUFF、UUYP（有品）、Steam、C5 四个交易平台上对比同一饰品的价格（售价、租金、求购价）。

## 常用命令

```bash
pnpm dev          # 开发模式（热重载）
pnpm build        # 生产构建
pnpm package      # 打包为 Chrome Web Store 可上传的 zip
```

通过 `.npmrc` 和 `SHARP_DIST_BASE_URL` 环境变量使用 npmmirror（国内 npm 镜像，用于 sharp）。生产构建输出到 `build/chrome-mv3-prod/`。

没有 lint 脚本——通过 `.prettierrc.mjs` 中的 Prettier 进行格式化：
```bash
npx prettier --write .
```

没有现有的测试套件。

## 架构

### Plasmo 框架结构

这是 Chrome 扩展程序的标准 [Plasmo](https://docs.plasmo.com/) v0.90.5 项目。Plasmo 处理 manifest 生成和构建管道。

**入口点：**
- `popup.tsx` — 主弹窗 UI（当用户点击扩展程序图标时显示）。仅在用户打开了 BUFF 商品页面时起作用。
- `background/index.ts` — Service worker 入口点（当前为空；消息处理器在 `background/messages/` 中）。

**Popup 到 Background 通信：** 使用 `@plasmohq/messaging`。消息处理器位于 `background/messages/`——Plasmo 自动发现这些处理器。`popup.tsx` 通过 `sendToBackground()` 调用它们：
- `get-page-info` — 返回当前标签页是否为 BUFF 页面，并提取商品 ID
- `get-cookies` — 读取平台身份验证所需的 cookie

### 核心数据流

1. 用户访问 BUFF 饰品页面（如 `buff.163.com/goods/12345`）
2. 扩展程序弹窗从 URL 中提取 `buffGoodsId`
3. 获取 BUFF 数据（价格 + 商品信息，包括 `market_hash_name`）
4. 使用 `market_hash_name` 在其他三个平台上查找对应数据：
   - **Steam：** `steam/730.json`（en_name → name_id 映射），然后直接调用 Steam 市场 API
   - **UUYP：** `uuyp/730.json`（market_hash_name → 商品 ID 映射），然后调用优品 API
   - **C5：** `c5/string_730.json`（market_hash_name → 商品 ID 映射），然后调用 C5 API
5. 并行获取（BUFF 除外，它在步骤 4 中作为基准先获取）。所有 API 调用均来自 `utils/goods.ts`。

### 关键文件

| 文件 | 作用 |
|------|------|
| `popup.tsx` | 主 UI 组件，编排数据获取，渲染价格对比表格 |
| `utils/goods.ts` | 所有平台 API 调用和商品 ID 查找 |
| `utils/types.ts` | 所有 API 响应和内部数据类型对应的 TypeScript 接口 |
| `background/messages/get-page-info.ts` | 解析当前标签页 URL 以检测 BUFF 页面并提取商品 ID |
| `background/messages/get-cookies.ts` | 获取平台特定 cookie 用于身份认证 |
| `steam/730.json` | Steam 饰品数据（name_id ↔ en_name 映射） |
| `uuyp/730.json` | UUYP 饰品 ID 映射（market_hash_name → 商品 ID） |
| `c5/string_730.json` | C5 饰品 ID 映射（market_hash_name → 商品 ID） |
| `c5/730.json` | C5 完整饰品数据（包含中文名称） |
| `locales/en/messages.json` | 英文 i18n 字符串 |
| `locales/zh_cn/messages.json` | 中文 i18n 字符串 |

### UI 组件

使用 **shadcn/ui**（Table 组件位于 `@/components/ui/table.tsx`）+ **Tailwind CSS** v3，配合 `tailwindcss-animate`。路径别名 `@/` 在 `tsconfig.json` 中映射为 `./@/`，路径别名 `~` 映射为 `./`。

### 身份认证

- **BUFF：** 使用用户浏览器的 cookie 调用 API（通过 `chrome.cookies.getAll()` 获取）
- **UUYP：** 从 cookie 读取 Bearer token，调用 `/api/user/Account/GetUserInfo` 验证登录状态。当 token 缺失或 API 返回 401 时抛出 `UUYP_NOT_LOGIN`
- **Steam / C5：** 无需身份验证（公开端点）

### 平台 API 端点

- **BUFF：** `buff.163.com/api/market/goods/sell_order`（售价），`/buy_order`（求购价）
- **UUYP：** `api.youpin898.com/api/homepage/v2/es/commodity/GetCsGoPagedList`（售价和租金），`/api/youpin/commodity/purchase/find`（求购价）
- **Steam：** `steamcommunity.com/market/itemordershistogram`（售价和求购价）
- **C5：** `c5game.com/napi/trade/steamtrade/sga/sell/v3/list`（仅售价）

## CI/CD

当通过 `workflow_dispatch` 手动触发时，GitHub Actions（`.github/workflows/submit.yml`）在 Node 20 + pnpm 10.30.2 上构建扩展程序，并使用 `PlasmoHQ/bpp` 发布到 Chrome Web Store。

## i18n

使用 Chrome 的 `chrome.i18n` API。翻译位于 `locales/{en,zh_cn}/messages.json`。根据用户的语言偏好，UI 自动适配英文或中文。饰品名称：中文用户看到 `name` 字段，其他用户看到 `market_hash_name`。
