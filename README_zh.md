# CS2 Price Helper - 饰品比价助手

在 BUFF、悠悠有品（UUYP）、Steam、C5、IGXE 五大交易平台之间一键对比 CS:GO/CS2 饰品价格（售价、求购价、租金）。

## 功能特性

- **BUFF 页面集成：** 自动识别 BUFF 饰品页面，一键对比 5 个平台价格。
- **饰品搜索：** 不在 BUFF 页面时，可通过名称搜索任意 CS2 饰品，跨 4 个平台比价（Steam、UUYP、C5、IGXE）。
- **价格缓存：** 30 秒缓存，重复打开弹窗无需重新请求。
- **一键跳转：** 点击任一平台行可直接跳转到对应平台的商品页面。

## 支持平台

| 平台 | 售价 | 求购价 | 租金 | 认证方式 |
|------|------|--------|------|----------|
| Steam | ✅ | ✅ | — | 公开 |
| BUFF | ✅ | ✅ | — | Cookie |
| UUYP | ✅ | ✅ | ✅ | Bearer Token |
| C5 | ✅ | ✅ | — | API Key（OpenAPI） |
| IGXE | ✅ | ✅ | ✅ | 公开 |

## 安装

[![Chrome Web Store](readme/get-chrome.png)](https://chromewebstore.google.com/detail/csgo-price-helper/gllpkeapfamjcbkacnbmobfkgnhlfkhf)

[![Get it from Microsoft Edge](readme/get-edge.png)](https://microsoftedge.microsoft.com/addons/detail/cs2-price-helper-%E9%A5%B0%E5%93%81%E6%AF%94%E4%BB%B7%E5%8A%A9%E6%89%8B/jknncfckflfacgfaajdnapihpaiedjbi)

## 使用方法

1. 从 Chrome Web Store 或 Microsoft Edge 加载项安装此扩展。
2. **方式一：** 打开 [BUFF](https://buff.163.com) 浏览任意 CS:GO/CS2 饰品详情页，点击扩展图标自动加载价格。
3. **方式二：** 在任意页面点击扩展图标，通过搜索框输入饰品名称进行比价。
4. 点击任一平台的价格行，可直接跳转到对应平台的商品页面。

## 权限说明

| 权限 | 用途 |
|------|------|
| **Tabs** | 读取当前标签页 URL，检测 BUFF.163.com 商品页面并提取商品 ID。仅读取活跃标签页，不访问浏览历史或导航数据。 |
| **Cookies** | 读取 BUFF.163.com 和 youpin898.com 的登录 Cookie，用于 API 认证。仅触及这两个域名。 |
| **Storage** | 本地存储悠悠有品设备标识、C5 API Key 和价格缓存。不存储其他数据。 |
| **主机: buff.163.com** | 读取商品详情页、调用 BUFF 市场 API 获取出售/求购订单。 |
| **主机: youpin898.com** | 注入内容脚本提取设备标识符、调用 UUYP API 获取价格信息。 |
| **主机: steamcommunity.com** | 调用 Steam 社区市场 API 获取物品价格直方图。 |
| **主机: c5game.com** | 调用 C5 OpenAPI 批量查询价格和最高求购价。需 C5 商户后台申请 app-key。 |
| **主机: igxe.cn** | 调用 IGXE 公开 API 查询出售列表、求购订单和租赁价格。 |

所有主机权限仅限于价格比较所需的 API 接口，不会收集任何浏览数据。

## 注意事项

- 请确保浏览器允许扩展访问网页数据。
- 各平台 API 可能发生变化，如遇功能异常请提交 Issue。
- 本扩展仅供个人使用，不得用于商业目的。

## 技术栈

- [Plasmo](https://docs.plasmo.com/) v0.90.5 — 浏览器扩展框架
- React 18 + TypeScript 5.3
- Tailwind CSS v3 + shadcn/ui
- Vitest + happy-dom

## 本地开发

```bash
pnpm install          # 安装依赖
pnpm dev              # 开发模式（热更新，Chrome 目标）
pnpm build            # 生产构建 → build/chrome-mv3-prod/
pnpm build:edge       # Edge 生产构建 → build/edge-mv3-prod/
pnpm test             # 运行测试
pnpm test:coverage    # 运行测试并生成覆盖率报告
```

构建需设置 `SHARP_DIST_BASE_URL=https://npmmirror.com/mirrors/sharp-libvips/v8.14.5/`（已配置在 `package.json` 中）。

## 贡献

欢迎通过 [GitHub Issues](https://github.com/visionary-future/csgo-price-helper/issues) 提交建议或反馈。
