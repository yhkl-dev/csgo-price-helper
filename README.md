# CS:GO Price Helper

Compare CS:GO item prices (sell orders, buy orders, rental prices) across BUFF, UUYP, Steam, and C5 trading platforms in one popup.

## Permissions

| Permission | Justification |
|------------|---------------|
| **Tabs** | Read the current tab URL to detect BUFF.163.com goods pages and extract the item ID. Only the active tab is read —— no history or navigation data is accessed. |
| **Cookies** | Access BUFF.163.com and youpin898.com session cookies to authenticate API requests. Only these two domains are touched. |
| **Storage** | Pass UUYP device identifiers (Web-Device-Id, Web-Device-Uk, Web-Uk) from the content script to the popup via chrome.storage.local. Required by the UUYP purchase-price API for authentication. No other data is stored. |
| **Host: buff.163.com** | Read item listing pages and call BUFF market API for sell/buy orders. |
| **Host: youpin898.com** | Inject content script to extract device identifiers; call UUYP API for prices. |
| **Host: steamcommunity.com** | Call Steam Community Market API for item price histograms. |
| **Host: c5game.com** | Call C5 market API for sell order listings. |

All host permissions are limited to the API endpoints required for price comparison. No browsing data is collected.
