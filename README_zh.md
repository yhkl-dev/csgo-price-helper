# CS2 Price Helper - 饰品比价助手

在 BUFF、悠悠有品（UUYP）、Steam、C5、IGXE 五大交易平台之间一键对比 CS:GO/CS2 饰品价格（售价、求购价、租金）。

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
2. 打开 BUFF 网站（https://buff.163.com）浏览任意 CS:GO/CS2 饰品详情页。
3. 点击浏览器工具栏中的扩展图标，打开弹窗。
4. 扩展会自动加载该饰品在其他平台的售价、求购价和租金信息。
5. 点击任一平台的价格，可直接跳转到对应平台的商品页面。

## 权限说明

| 权限 | 用途 |
|------|------|
| **Tabs** | 读取当前标签页 URL，检测 BUFF 商品页面并提取商品 ID |
| **Cookies** | 读取 BUFF 和悠悠有品的登录 Cookie，用于 API 认证 |
| **Storage** | 本地存储悠悠有品设备标识和 C5 API Key |
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
