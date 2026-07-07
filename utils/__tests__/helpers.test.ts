import { describe, expect, it } from "vitest"

import {
  CNY_PLATFORMS,
  constructGoodsURL,
  createDataType,
  formatPrice,
  isClickable,
  parsePrice
} from "../helpers"
import type { DataType } from "../types"

// ---- parsePrice ----

describe("parsePrice", () => {
  it("returns null for empty string", () => {
    expect(parsePrice("")).toBeNull()
  })

  it('returns null for "N/A" (notAvailable)', () => {
    expect(parsePrice("N/A")).toBeNull()
  })

  it('returns null for "Not Found" (notFound)', () => {
    expect(parsePrice("Not Found")).toBeNull()
  })

  it('returns null for "Data Error" (dataError)', () => {
    expect(parsePrice("Data Error")).toBeNull()
  })

  it('returns null for "/"', () => {
    expect(parsePrice("/")).toBeNull()
  })

  it("parses comma-separated number", () => {
    expect(parsePrice("1,234.56")).toBe(1234.56)
  })

  it("parses plain number without commas", () => {
    expect(parsePrice("1234.56")).toBe(1234.56)
  })

  it("extracts number from CNY price string", () => {
    expect(parsePrice("¥ 1,000")).toBe(1000)
  })

  it("returns null for non-numeric string", () => {
    expect(parsePrice("abc")).toBeNull()
  })

  it("parses integer price", () => {
    expect(parsePrice("500")).toBe(500)
  })
})

// ---- formatPrice ----

describe("formatPrice", () => {
  it("formats BUFF price with ¥ prefix", () => {
    expect(formatPrice("1500", "BUFF")).toBe("¥ 1,500")
  })

  it("formats UUYP price with ¥ prefix", () => {
    expect(formatPrice("888", "UUYP")).toBe("¥ 888")
  })

  it("formats C5 price with ¥ prefix", () => {
    expect(formatPrice("2500", "C5")).toBe("¥ 2,500")
  })

  it("returns Steam price unchanged", () => {
    expect(formatPrice("$12.34 USD", "Steam")).toBe("$12.34 USD")
  })

  it("returns original string when parsePrice returns null", () => {
    expect(formatPrice("N/A", "BUFF")).toBe("N/A")
  })

  it("returns original for unknown platform", () => {
    expect(formatPrice("100", "Unknown")).toBe("100")
  })
})

// ---- constructGoodsURL ----

describe("constructGoodsURL", () => {
  it("builds Steam URL using hashName", () => {
    expect(constructGoodsURL("Steam", "176116429", "AK-47 | Redline")).toBe(
      "https://steamcommunity.com/market/listings/730/AK-47 | Redline"
    )
  })

  it("builds BUFF URL using goodsID", () => {
    expect(constructGoodsURL("BUFF", "12345", "AK-47 | Redline")).toBe(
      "https://buff.163.com/goods/12345"
    )
  })

  it("builds UUYP URL using goodsID", () => {
    expect(constructGoodsURL("UUYP", "67890", "AK-47 | Redline")).toBe(
      "https://www.youpin898.com/market/goods-list?listType=20&templateId=67890&gameId=730"
    )
  })

  it("builds C5 URL using goodsID", () => {
    expect(constructGoodsURL("C5", "11111", "AK-47 | Redline")).toBe(
      "https://www.c5game.com/csgo/11111"
    )
  })

  it("returns empty string for unknown platform", () => {
    expect(constructGoodsURL("Unknown", "123", "hash")).toBe("")
  })

  it("returns empty string when goodsID is empty", () => {
    expect(constructGoodsURL("BUFF", "", "hash")).toBe("")
  })
})

// ---- createDataType ----

describe("createDataType", () => {
  it("creates DataType with all fields", () => {
    const result = createDataType("BUFF", "123", "AK-47", "¥ 100", "¥ 90", {
      LeaseUnitPrice: "10",
      LongLeaseUnitPrice: "80"
    })
    expect(result).toEqual({
      Platform: "BUFF",
      GoodsID: "123",
      MarkingHashName: "AK-47",
      Sell: "¥ 100",
      WantToBuy: "¥ 90",
      Rent: { LeaseUnitPrice: "10", LongLeaseUnitPrice: "80" }
    })
  })

  it("uses default empty rent when not provided", () => {
    const result = createDataType("Steam", "456", "AWP", "$50", "$45")
    expect(result.Rent).toEqual({
      LeaseUnitPrice: "",
      LongLeaseUnitPrice: ""
    })
  })

  it("handles empty sell and buy prices", () => {
    const result = createDataType("C5", "789", "M4A4", "", "")
    expect(result.Sell).toBe("")
    expect(result.WantToBuy).toBe("")
  })
})

// ---- isClickable ----

describe("isClickable", () => {
  const makeData = (overrides: Partial<DataType> = {}): DataType => ({
    Platform: "BUFF",
    GoodsID: "123",
    MarkingHashName: "AK-47",
    Sell: "¥ 100",
    WantToBuy: "¥ 90",
    Rent: { LeaseUnitPrice: "", LongLeaseUnitPrice: "" },
    ...overrides
  })

  it("returns false when GoodsID is empty", () => {
    expect(isClickable(makeData({ GoodsID: "" }))).toBe(false)
  })

  it('returns false when Sell is "Not Found"', () => {
    expect(isClickable(makeData({ Sell: "Not Found" }))).toBe(false)
  })

  it("returns true when GoodsID is set and Sell is a valid price", () => {
    expect(isClickable(makeData())).toBe(true)
  })

  it('returns true when Sell is "N/A" (still has valid GoodsID)', () => {
    expect(isClickable(makeData({ Sell: "N/A" }))).toBe(true)
  })
})

// ---- CNY_PLATFORMS ----

describe("CNY_PLATFORMS", () => {
  it("includes BUFF, UUYP, C5, IGXE", () => {
    expect(CNY_PLATFORMS).toEqual(["BUFF", "UUYP", "C5", "IGXE"])
  })

  it("does not include Steam", () => {
    expect(CNY_PLATFORMS).not.toContain("Steam")
  })
})
