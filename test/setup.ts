import { vi } from "vitest"

const messages: Record<string, string> = {
  notAvailable: "N/A",
  notFound: "Not Found",
  dataError: "Data Error",
  notLoggedIn: "Not Logged In",
  networkError: "Network Error",
  wrongPageMessage: "Please open a BUFF item page to use this extension.",
  openBuffMarketplace: "Open BUFF Marketplace",
  retry: "Retry",
  currencyNote: "All prices in CNY unless otherwise noted",
  feedback: "Feedback",
  loadFailed: "Failed to load data",
  platform: "Platform",
  sell: "Sell",
  rent: "Rent",
  wantToBuy: "Want to Buy",
  shortTerm: "Short",
  longTerm: "Long"
}

vi.stubGlobal("chrome", {
  i18n: {
    getMessage: (key: string) => messages[key] ?? key,
    getAcceptLanguages: vi.fn().mockResolvedValue(["en-US"])
  },
  storage: {
    local: {
      get: vi.fn().mockResolvedValue({}),
      set: vi.fn().mockResolvedValue(undefined)
    }
  }
})
