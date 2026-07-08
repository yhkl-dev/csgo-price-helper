# CS2 Price Helper

Compare CS2 item prices (sell orders, buy orders, rental prices) across BUFF, UUYP, Steam, C5, and IGXE trading platforms in one popup.

## Features

- **BUFF page integration:** Automatically detects BUFF item pages and compares prices across all 5 platforms.
- **Item search:** Search for any CS2 item by name when not on a BUFF page — compares prices across 4 platforms (Steam, UUYP, C5, IGXE).
- **Price caching:** Caches prices for 30 seconds to avoid redundant API calls when reopening the popup.
- **One-click navigation:** Click any platform row to jump directly to the item on that platform.

## Platforms

| Platform | Sell | Buy | Rent | Auth |
|----------|------|-----|------|------|
| Steam | ✅ | ✅ | — | Public |
| BUFF | ✅ | ✅ | — | Cookies |
| UUYP | ✅ | ✅ | ✅ | Bearer Token |
| C5 | ✅ | ✅ | — | API Key (OpenAPI) |
| IGXE | ✅ | ✅ | ✅ | Public |

## Installation

[![Chrome Web Store](readme/get-chrome.png)](https://chromewebstore.google.com/detail/csgo-price-helper/gllpkeapfamjcbkacnbmobfkgnhlfkhf)

[Install from Chrome Web Store](https://chromewebstore.google.com/detail/csgo-price-helper/gllpkeapfamjcbkacnbmobfkgnhlfkhf)

## Usage

1. Install the extension in Chrome.
2. **Option A:** Open any CS2 item page on [BUFF](https://buff.163.com). Click the extension icon — prices load automatically.
3. **Option B:** Click the extension icon on any page. Search for an item by name to compare prices across platforms.
4. Click any platform row to open the item on that platform.

## Permissions

| Permission | Justification |
|------------|---------------|
| **Tabs** | Read the current tab URL to detect BUFF.163.com goods pages and extract the item ID. Only the active tab is read — no history or navigation data is accessed. |
| **Cookies** | Access BUFF.163.com and youpin898.com session cookies to authenticate API requests. Only these two domains are touched. |
| **Storage** | Store UUYP device identifiers, C5 API key, and price cache locally. No other data is stored. |
| **Host: buff.163.com** | Read item listing pages and call BUFF market API for sell/buy orders. |
| **Host: youpin898.com** | Inject content script to extract device identifiers; call UUYP API for prices. |
| **Host: steamcommunity.com** | Call Steam Community Market API for item price histograms. |
| **Host: c5game.com** | Call C5 OpenAPI for batch price queries and max buy price. Requires app-key from C5 merchant dashboard. |
| **Host: igxe.cn** | Call IGXE public API for sell listings, purchase orders, and lease prices. |

All host permissions are limited to the API endpoints required for price comparison. No browsing data is collected.

## Contributing

Feedback and suggestions are welcome via [GitHub Issues](https://github.com/visionary-future/csgo-price-helper/issues).
