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

[Chrome Web Store 安装链接](https://chromewebstore.google.com/detail/csgo-price-helper/gllpkeapfamjcbkacnbmobfkgnhlfkhf)

## 使用方法

1. 在 Chrome 浏览器中安装此扩展。
2. **方式一：** 打开 [BUFF](https://buff.163.com) 浏览任意 CS:GO/CS2 饰品详情页，点击扩展图标自动加载价格。
3. **方式二：** 在任意页面点击扩展图标，通过搜索框输入饰品名称进行比价。
4. 点击任一平台的价格行，可直接跳转到对应平台的商品页面。

## 权限说明

| 权限 | 用途 |
|------|------|
| **Tabs** | 读取当前标签页 URL，检测 BUFF 商品页面并提取商品 ID |
| **Cookies** | 读取 BUFF 和悠悠有品的登录 Cookie，用于 API 认证 |
| **Storage** | 本地存储悠悠有品设备标识、C5 API Key 和价格缓存 |
| **主机: buff.163.com** | 读取商品页面、调用 BUFF 市场 API |
| **主机: youpin898.com** | 注入内容脚本提取设备标识、调用 UUYP API |
| **主机: steamcommunity.com** | 调用 Steam 社区市场 API |
| **主机: c5game.com** | 调用 C5 OpenAPI 批量查询价格 |
| **主机: igxe.cn** | 调用 IGXE 公开 API 查询售价、求购价和租金 |

## 注意事项

- 请确保浏览器允许扩展访问网页数据。
- 各平台 API 可能发生变化，如遇功能异常请提交 Issue。
- 本扩展仅供个人使用，不得用于商业目的。

## 贡献

欢迎通过 [GitHub Issues](https://github.com/visionary-future/csgo-price-helper/issues) 提交建议或反馈。
