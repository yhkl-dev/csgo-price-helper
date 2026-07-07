import type { DataType } from "./types"

export const PLATFORM_URLS = {
  Steam: (hashName: string) =>
    `https://steamcommunity.com/market/listings/730/${hashName}`,
  BUFF: (goodsId: string) => `https://buff.163.com/goods/${goodsId}`,
  UUYP: (goodsId: string) =>
    `https://www.youpin898.com/market/goods-list?listType=20&templateId=${goodsId}&gameId=730`,
  C5: (goodsId: string) => `https://www.c5game.com/csgo/${goodsId}`,
  IGXE: (goodsId: string) => `https://www.igxe.cn/product/730/${goodsId}`
} as const

export const CNY_PLATFORMS = ["BUFF", "UUYP", "C5", "IGXE"]

export const constructGoodsURL = (
  platform: string,
  goodsID: string,
  hashName: string
): string => {
  const urlBuilder = PLATFORM_URLS[platform as keyof typeof PLATFORM_URLS]
  if (!urlBuilder || !goodsID) return ""
  return platform === "Steam" ? urlBuilder(hashName) : urlBuilder(goodsID)
}

export const createDataType = (
  platform: string,
  goodsId: string,
  hashName: string,
  sellPrice: string,
  wantToBuyPrice: string,
  rentPrice: { LeaseUnitPrice: string; LongLeaseUnitPrice: string } = {
    LeaseUnitPrice: "",
    LongLeaseUnitPrice: ""
  }
): DataType => ({
  Platform: platform,
  GoodsID: goodsId,
  MarkingHashName: hashName,
  Sell: sellPrice,
  Rent: rentPrice,
  WantToBuy: wantToBuyPrice
})

export const parsePrice = (price: string): number | null => {
  if (!price) return null
  const invalidTokens = [
    chrome.i18n.getMessage("notAvailable"),
    chrome.i18n.getMessage("notFound"),
    chrome.i18n.getMessage("dataError"),
    "/"
  ]
  if (invalidTokens.includes(price)) return null
  const clean = price.replace(/,/g, "")
  const match = clean.match(/[\d.]+/)
  return match ? parseFloat(match[0]) : null
}

export const formatPrice = (price: string, platform: string): string => {
  if (!CNY_PLATFORMS.includes(platform)) return price
  const num = parsePrice(price)
  if (num === null) return price
  return `¥ ${num.toLocaleString()}`
}

export const isClickable = (data: DataType): boolean => {
  if (!data.GoodsID) return false
  if (data.Sell === chrome.i18n.getMessage("notFound")) return false
  return true
}
