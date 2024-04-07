# 商品信息对比插件

这个插件是为了帮助用户在不同的游戏商品交易平台之间对比商品的信息，包括价格、出租信息和求购信息。它主要针对的是CS:GO（反恐精英：全球攻势）的游戏物品，通过集成多个平台的数据，为用户提供一个便捷的比较和查看方式。

## 主要功能

- **平台支持**：目前支持的交易平台包括Steam、BUFF、UUYP和C5。
- **商品信息展示**：展示所选商品在不同平台上的出售价格、出租价格以及求购价格。
- **链接直达**：提供直接链接到各个平台具体商品页面的功能，方便用户快速访问。
- **实时数据**：通过调用各平台的API接口，获取实时的商品数据。
- **用户友好的界面**：简洁明了的界面设计，使用户能够轻松使用本插件。

## 使用方法

1. 在支持的浏览器中安装此插件。
2. 打开BUFF网站（https://buff.163.com）并浏览到特定的CS:GO商品页面。
3. 点击浏览器插件图标，激活插件界面。
4. 插件会自动加载当前商品在其他平台上的信息，并展示在插件界面中。
5. 点击任一平台的链接，可以直接跳转到该平台的商品页面。

## 插件安装地址

您可以通过以下链接在Chrome Web Store安装此插件：[CSGO Price Helper](https://chromewebstore.google.com/detail/csgo-price-helper/gllpkeapfamjcbkacnbmobfkgnhlfkhf)
.

[![Chrome Web Store](readme/get-chrome.png)](https://chromewebstore.google.com/detail/csgo-price-helper/gllpkeapfamjcbkacnbmobfkgnhlfkhf)

## 注意事项

- 请确保您的浏览器允许插件访问网页数据，以便插件能够正常工作。
- 插件的数据更新依赖于各个平台的API，如果某个平台的API发生变化或不可用，可能会影响到插件的部分功能。
- 本插件仅供个人使用，不得用于任何商业目的。

## 开发信息

本插件使用React框架开发，并利用Ant Design组件库进行界面设计。所有数据均通过官方API获取，确保信息的准确性和实时性。

## 贡献

如果您对本插件有任何建议或改进意见，欢迎通过GitHub提交Issue或Pull Request。
