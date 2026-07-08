# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Chrome extension built on [Plasmo](https://docs.plasmo.com/) v0.90.5 (React 18 + TypeScript 5.3). Compares CS2 item prices (sell orders, buy orders, rental prices) across five trading platforms: BUFF, UUYP, Steam, C5, and IGXE.

## Commands

```bash
pnpm dev              # Development mode (hot reload)
pnpm build            # Production build → build/chrome-mv3-prod/
pnpm package          # Package as Chrome Web Store zip
pnpm test             # Run Vitest tests once
pnpm test:watch       # Run tests in watch mode
pnpm test:coverage    # Run tests with coverage report
```

Formatting via Prettier (no eslint):

```bash
npx prettier --write .
```

Builds require `SHARP_DIST_BASE_URL=https://npmmirror.com/mirrors/sharp-libvips/v8.14.5/` (set in `package.json` scripts, uses npmmirror for China accessibility).

## Architecture

### Plasmo Structure

**Entry points:**
- `popup.tsx` — Main popup UI. Only functions when the user is on a BUFF item page.
- `background/index.ts` — Service worker entry (empty; message handlers auto-discovered in `background/messages/`).
- `contents/uuyp-device.ts` — Content script injected on `youpin898.com` to extract device identifiers from `localStorage` and persist them to `chrome.storage.local`.

**Popup-to-Background communication:** Uses `@plasmohq/messaging`. Handlers in `background/messages/` are auto-discovered by Plasmo. `popup.tsx` calls them via `sendToBackground()`:
- `get-page-info` — Detects whether the active tab is a BUFF page and extracts the goods ID from the URL.
- `get-cookies` — Reads cookies for a given URL (used for BUFF and UUYP auth).
- `uuyp-fetch` — Proxies POST requests through the background service worker to bypass CORS for UUYP API calls.
- `igxe-fetch` — Proxies GET requests through the background service worker to bypass CORS for IGXE API calls.

### Data Flow

1. User visits a BUFF item page (e.g. `buff.163.com/goods/12345`).
2. Popup extracts `buffGoodsId` from the URL.
3. Fetches BUFF data first (sell price + goods info including `market_hash_name`).
4. Uses `market_hash_name` to look up item IDs via `SteamTradingSite-ID-Mapper` (git submodule) for the other four platforms:
   - **Steam:** `steam/730.json` (`en_name` → `name_id` mapping), then calls Steam Community Market API directly.
   - **UUYP:** `uuyp/730.json` (`market_hash_name` → template ID), then calls UUYP API via background fetch.
   - **C5:** Looks up `market_hash_name` in C5 batch price API response (uses OpenAPI app-key).
   - **IGXE:** `igxe/730.json` (`market_hash_name` → product ID), then calls IGXE public API via background fetch.
5. When not on a BUFF page, a search interface lets users look up items by name across 4 platforms (BUFF excluded — requires goods ID). Search index is built from the Steam mapping data.
6. All platform fetches run in parallel (after BUFF completes as the baseline in BUFF mode). Raw API calls live in `utils/goods.ts`; platform-specific fetch orchestration lives in `utils/fetch-data.ts`.
7. Prices are cached in `chrome.storage.local` for 30 seconds per `market_hash_name` (`utils/cache.ts`).

### Key Files

| File | Purpose |
|------|---------|
| `popup.tsx` | Main UI component, orchestrates data fetching, renders price comparison table with skeleton/error/empty/search states |
| `utils/goods.ts` | Raw API calls for all five platforms, item ID lookups, JWT decoding |
| `utils/fetch-data.ts` | Platform-specific fetch orchestration (fetchBuffData, fetchUUYPData, etc.), auth header construction |
| `utils/helpers.ts` | Pure utility functions: price parsing/formatting, URL construction, `createDataType` factory |
| `utils/types.ts` | TypeScript interfaces for API responses and internal data types |
| `utils/cache.ts` | Price cache layer: 30-second TTL via `chrome.storage.local`, keyed by `market_hash_name` |
| `utils/search.ts` | Item search: builds in-memory index from Steam mapping data, filters by name substring |
| `hooks/useC5ApiKey.ts` | React hook for C5 API key state management (read/write/edit from `chrome.storage.local`) |
| `background/messages/get-page-info.ts` | Parses active tab URL to detect BUFF pages and extract goods ID |
| `background/messages/get-cookies.ts` | Reads platform cookies via `chrome.cookies.getAll()` |
| `background/messages/uuyp-fetch.ts` | CORS proxy for UUYP POST API calls |
| `background/messages/igxe-fetch.ts` | CORS proxy for IGXE GET API calls |
| `contents/uuyp-device.ts` | Content script that extracts UUYP device identifiers from `localStorage` |
| `SteamTradingSite-ID-Mapper/` | Git submodule with JSON mapping files for Steam, UUYP, C5, and IGXE |
| `test/setup.ts` | Vitest global setup: mocks `chrome.i18n` and `chrome.storage` APIs |
| `locales/en/messages.json` | English i18n strings |
| `locales/zh_cn/messages.json` | Chinese i18n strings |

### UI Components

Uses **shadcn/ui** (Table component in `@/components/ui/table.tsx`) + **Tailwind CSS v3** with `tailwindcss-animate`. Path aliases: `@/` → `./@/`, `~` → `./` (configured in `tsconfig.json`).

Platform color dots: BUFF (orange), UUYP (purple), Steam (blue), C5 (green), IGXE (cyan). Sell prices are color-coded (green = lowest, red = highest) when multiple platforms have comparable prices.

### Authentication

- **BUFF:** Requires user's browser cookies for `buff.163.com` (fetched via `chrome.cookies.getAll()`).
- **UUYP:** Reads Bearer token from cookies (`uu_token`, `token`, `access_token`, `auth_token`, `jwt`, or `authorization`). Token is JWT-decoded client-side to check expiry and extract user ID. Also requires device identifiers (`deviceId`, `deviceUk`, `uk`) extracted from UUYP's `localStorage` by the content script. Throws `UUYP_NOT_LOGIN` when token is missing, expired, or API returns 401.
- **Steam:** Public endpoints, no auth required.
- **C5:** Uses OpenAPI app-key stored in `chrome.storage.local`. Popup includes an inline editor for setting/editing the key. API calls fail gracefully when key is not configured.
- **IGXE:** Public endpoints, no auth required.

### Platform API Endpoints

- **BUFF:** `buff.163.com/api/market/goods/sell_order` (sell), `/buy_order` (buy)
- **UUYP:** `api.youpin898.com/api/homepage/pc/goods/market/queryOnSaleCommodityList` (sell), `/queryOnLeaseCommodityList` (rent), `/api/youpin/bff/trade/purchase/order/getTemplatePurchaseOrderListPC` (buy)
- **Steam:** `steamcommunity.com/market/itemordershistogram` (sell + buy in one call)
- **C5:** `openapi.c5game.com/merchant/product/price/batch` (sell, batch by `marketHashNames`), `/merchant/purchase/v1/max-price` (buy, by `itemId`)
- **IGXE:** `www.igxe.cn/product/trade/730/{productId}` (sell), `/purchase/get_product_purchases` (buy), `/api/v2/lease/trade-list/730/{productId}` (rent)

### i18n

Uses Chrome's `chrome.i18n` API. Translations in `locales/{en,zh_cn}/messages.json`. UI adapts automatically to the user's language preference. Item names: Chinese users see `name` field, others see `market_hash_name`.

## Testing

Vitest with `happy-dom` environment. Tests live in `utils/__tests__/`. The test setup (`test/setup.ts`) mocks `chrome.i18n.getMessage` and `chrome.storage` APIs.

Coverage is configured for `utils/**/*.ts` files. All pure utility functions in `utils/helpers.ts` should have test coverage.

## CI/CD

GitHub Actions (`.github/workflows/submit.yml`) triggers on `workflow_dispatch`. Builds with Node 20 + pnpm 10.30.2, creates a GitHub Release with the packaged zip, and publishes to Chrome Web Store via `PlasmoHQ/bpp`. The repo uses git submodules — CI must checkout with `submodules: true`.
