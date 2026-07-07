# CS:GO Price Helper

Compare CS:GO item prices (sell orders, buy orders, rental prices) across BUFF, UUYP, Steam, C5, and IGXE trading platforms in one popup.

## Platforms

| Platform | Sell | Buy | Rent | Auth |
|----------|------|-----|------|------|
| Steam | ✅ | ✅ | — | Public |
| BUFF | ✅ | ✅ | — | Cookies |
| UUYP | ✅ | ✅ | ✅ | Bearer Token |
| C5 | ✅ | ✅ | — | API Key (OpenAPI) |
| IGXE | ✅ | ✅ | ✅ | Public |

## Permissions

| Permission | Justification |
|------------|---------------|
| **Tabs** | Read the current tab URL to detect BUFF.163.com goods pages and extract the item ID. Only the active tab is read — no history or navigation data is accessed. |
| **Cookies** | Access BUFF.163.com and youpin898.com session cookies to authenticate API requests. Only these two domains are touched. |
| **Storage** | Store UUYP device identifiers and C5 API key locally. No other data is stored. |
| **Host: buff.163.com** | Read item listing pages and call BUFF market API for sell/buy orders. |
| **Host: youpin898.com** | Inject content script to extract device identifiers; call UUYP API for prices. |
| **Host: steamcommunity.com** | Call Steam Community Market API for item price histograms. |
| **Host: c5game.com** | Call C5 OpenAPI for batch price queries and max buy price. Requires app-key from C5 merchant dashboard. |
| **Host: igxe.cn** | Call IGXE public API for sell listings, purchase orders, and lease prices. |

All host permissions are limited to the API endpoints required for price comparison. No browsing data is collected.
