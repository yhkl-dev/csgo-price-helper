import { sendToBackground } from "@plasmohq/messaging"

import steamData from "../steam/730.json"
import type { C5GoodsResponse, SteamGoodsResponse } from "./types"

export const getC5GoodsInfo = async (goodsID: string) => {
  const myHeaders = new Headers()

  const requestOptions = {
    method: "GET",
    headers: myHeaders
  }

  const response = await fetch(
    `https://www.c5game.com/napi/trade/steamtrade/sga/sell/v3/list?itemId=${goodsID}`,
    requestOptions
  )

  if (!response.ok) {
    throw new Error("Network response was not ok")
  }
  const goodsInfo = (await response.json()) as C5GoodsResponse
  if (goodsInfo.data) {
    return goodsInfo.data.list[0].price
  }
  return ""
}

export const searchForExactNameId = (searchTerm: string): string => {
  for (const key in steamData) {
    if (steamData.hasOwnProperty(key)) {
      const item = steamData[key]
      if (item.en_name === searchTerm) {
        return item.name_id
      }
    }
  }
  return null
}

export const getSteamGoodsInfo = async (
  goodsID: string
): Promise<SteamGoodsResponse> => {
  const myHeaders = new Headers()

  const requestOptions = {
    method: "GET",
    headers: myHeaders
  }

  const response = await fetch(
    `https://steamcommunity.com/market/itemordershistogram?country=CN&currency=23&language=english&item_nameid=${goodsID}&two_factor=0&norender=1`,
    requestOptions
  )

  if (!response.ok) {
    throw new Error("Network response was not ok")
  }
  const goodsInfo = (await response.json()) as SteamGoodsResponse
  return goodsInfo
}

export function convertCookiesToString(
  cookies: chrome.cookies.Cookie[]
): string {
  return cookies.map((cookie) => `${cookie.name}=${cookie.value}`).join("; ")
}

export const getBUFFwantToBuyPrice = async (
  goodsID: string,
  cookies: chrome.cookies.Cookie[]
): Promise<string> => {
  const URL = `https://buff.163.com/api/market/goods/buy_order?game=csgo&goods_id=${goodsID}&page_num=1&_${new Date().getTime()}`
  const headers = {
    Accept: "application/json, text/javascript, */*; q=0.01",
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    Cookie: convertCookiesToString(cookies)
  }
  const goodsResponse = await fetch(URL, { method: "GET", headers: headers })
  if (!goodsResponse.ok) {
    throw new Error("Network response was not ok")
  }
  const goodsInfo = await goodsResponse.json()
  return goodsInfo.data.items.length > 0 ? goodsInfo.data.items[0].price : {}
}

export const getBUFFGoodsInfo = async (
  goodsID: string,
  cookies: chrome.cookies.Cookie[]
) => {
  const URL = `https://buff.163.com/api/market/goods/sell_order?game=csgo&goods_id=${goodsID}&page_num=1&sort_by=default&mode=&allow_tradable_cooldown=1&_=${new Date().getTime()}`
  const headers = {
    Accept: "application/json, text/javascript, */*; q=0.01",
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    Cookie: convertCookiesToString(cookies)
  }

  const goodsResponse = await fetch(URL, { method: "GET", headers: headers })
  if (!goodsResponse.ok) {
    throw new Error("Network response was not ok")
  }

  const goodsInfo = await goodsResponse.json()
  return goodsInfo
}

const UUYP_API_BASE = "https://api.youpin898.com/api/homepage/pc/goods/market"
const UUYP_SELL_URL = `${UUYP_API_BASE}/queryOnSaleCommodityList`
const UUYP_RENT_URL = `${UUYP_API_BASE}/queryOnLeaseCommodityList`
const UUYP_BUY_URL =
  "https://api.youpin898.com/api/youpin/bff/trade/purchase/order/getTemplatePurchaseOrderListPC"

export interface UUYPDeviceInfo {
  deviceId: string
  deviceUk: string
  uk: string
}

const UUYP_COMMON_HEADERS: Record<string, string> = {
  "App-Version": "5.26.0",
  AppVersion: "5.26.0",
  appType: "1",
  platform: "pc",
  "secret-v": "h5_v1",
  "content-type": "application/json",
  "user-agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36"
}

export function decodeJWT(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split(".")
    if (parts.length !== 3) return null
    const payload = parts[1]
    const decoded = atob(payload.replace(/-/g, "+").replace(/_/g, "/"))
    return JSON.parse(decoded)
  } catch {
    return null
  }
}

async function uuypBackgroundFetch(
  url: string,
  headers: Record<string, string>,
  body: string
): Promise<{ ok: boolean; status: number; data: unknown }> {
  return sendToBackground({
    name: "uuyp-fetch",
    body: { url, headers, body }
  })
}

export function getUUYPAuthHeaders(
  token: string,
  device?: UUYPDeviceInfo
): Record<string, string> {
  return {
    ...UUYP_COMMON_HEADERS,
    authorization: `Bearer ${token}`,
    ...(device?.deviceId ? { deviceId: device.deviceId } : {}),
    ...(device?.deviceUk ? { deviceUk: device.deviceUk } : {}),
    ...(device?.uk ? { uk: device.uk } : {})
  }
}

export const getUUYPuserInfo = async (token: {
  value: string
}): Promise<string> => {
  const jwt = decodeJWT(token.value)

  if (!jwt?.Id) {
    throw new Error("UUYP_NOT_LOGIN")
  }

  if (jwt.exp && typeof jwt.exp === "number") {
    const now = Math.floor(Date.now() / 1000)
    if (jwt.exp < now) {
      throw new Error("UUYP_NOT_LOGIN")
    }
  }

  return String(jwt.Id)
}

export const getUUPriceInfo = async (
  token: { value: string },
  _userId: string,
  goodsID: string,
  device?: UUYPDeviceInfo
): Promise<string> => {
  try {
    const body = JSON.stringify({
      gameId: "730",
      listType: "10",
      templateId: goodsID,
      listSortType: 1,
      sortType: 0,
      pageIndex: 1,
      pageSize: 10
    })

    const result = await uuypBackgroundFetch(
      UUYP_SELL_URL,
      getUUYPAuthHeaders(token.value, device),
      body
    )

    const data = result.data as Record<string, unknown>
    if (data.Code === 401 || data.code === 401) {
      throw new Error("UUYP_NOT_LOGIN")
    }

    const sellList = data.Data
    if (Array.isArray(sellList) && sellList.length > 0) {
      const first = sellList[0] as Record<string, unknown>
      return String(
        first.Price ?? first.price ?? first.unitPrice ?? first.salePrice ?? ""
      )
    }

    return ""
  } catch (error) {
    if (error instanceof Error && error.message === "UUYP_NOT_LOGIN")
      throw error
    return ""
  }
}

export const getUURentPriceInfo = async (
  token: { value: string },
  _userId: string,
  goodsID: string,
  device?: UUYPDeviceInfo
): Promise<{ LeaseUnitPrice: string; LongLeaseUnitPrice: string }> => {
  try {
    const body = JSON.stringify({
      gameId: "730",
      listType: "30",
      templateId: goodsID,
      listSortType: 2,
      sortType: 0,
      pageIndex: 1,
      pageSize: 10
    })

    const result = await uuypBackgroundFetch(
      UUYP_RENT_URL,
      getUUYPAuthHeaders(token.value, device),
      body
    )

    const data = result.data as Record<string, unknown>
    if (data.Code === 401 || data.code === 401) {
      throw new Error("UUYP_NOT_LOGIN")
    }

    const leaseList = data.Data
    if (Array.isArray(leaseList) && leaseList.length > 0) {
      const first = leaseList[0] as Record<string, unknown>
      return {
        LeaseUnitPrice: String(
          first.LeaseUnitPrice || first.leaseUnitPrice || ""
        ),
        LongLeaseUnitPrice: String(
          first.LongLeaseUnitPrice || first.longLeaseUnitPrice || ""
        )
      }
    }

    return { LeaseUnitPrice: "", LongLeaseUnitPrice: "" }
  } catch (error) {
    if (error instanceof Error && error.message === "UUYP_NOT_LOGIN")
      throw error
    return { LeaseUnitPrice: "", LongLeaseUnitPrice: "" }
  }
}

export const getUUwantToBuyPrice = async (
  token: { value: string },
  goodsID: string,
  device?: UUYPDeviceInfo
): Promise<string> => {
  try {
    const body = JSON.stringify({
      templateId: goodsID,
      pageIndex: 1,
      pageSize: 10
    })

    const result = await uuypBackgroundFetch(
      UUYP_BUY_URL,
      getUUYPAuthHeaders(token.value, device),
      body
    )

    const data = result.data as Record<string, unknown>
    if (data.Code === 401 || data.code === 401) {
      throw new Error("UUYP_NOT_LOGIN")
    }

    const dataContainer = (data.data || data.Data) as Record<string, unknown>
    const buyList =
      dataContainer?.purchaseOrderResponseList || dataContainer?.response
    if (Array.isArray(buyList) && buyList.length > 0) {
      const first = buyList[0] as Record<string, unknown>
      const price = first.purchasePrice || first.unitPrice
      if (price) return String(price)
    }

    return ""
  } catch (error) {
    if (error instanceof Error && error.message === "UUYP_NOT_LOGIN")
      throw error
    return ""
  }
}
