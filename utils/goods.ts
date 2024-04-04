import type { Dispatch, SetStateAction } from "react"

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
  return goodsInfo.data.list[0].price
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
    `https://steamcommunity.com/market/itemordershistogram?country=HK&currency=23&language=english&item_nameid=${goodsID}&two_factor=0&norender=1`,
    requestOptions
  )

  if (!response.ok) {
    throw new Error("Network response was not ok")
  }
  const goodsInfo = (await response.json()) as SteamGoodsResponse
  return goodsInfo
}

export const isBuffPageURL = async (): Promise<boolean> => {
  const [tab] = await chrome.tabs.query({
    active: true,
    currentWindow: true
  })
  const { host } = new URL(tab.url)
  return host === "buff.163.com"
}

export const getBUFFGoodsID = async (): Promise<string> => {
  const [tab] = await chrome.tabs.query({
    active: true,
    currentWindow: true
  })
  const { pathname } = new URL(tab.url)
  return pathname.split("/")[2]
}

function convertCookiesToString(cookies: chrome.cookies.Cookie[]): string {
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

export const getCookies = async (
  url: string,
  callback: Dispatch<SetStateAction<chrome.cookies.Cookie[]>>
) => {
  chrome.cookies.getAll({ url: url }, function (cookies) {
    callback(cookies)
  })
}

export const getUUYPuserInfo = async (token: {
  value: string
}): Promise<string> => {
  const userInfoResponse = await fetch(
    "https://api.youpin898.com/api/user/Account/GetUserInfo",
    {
      headers: {
        authorization: `Bearer ${token.value}`
      },
      method: "GET"
    }
  )

  if (!userInfoResponse.ok) {
    throw new Error("Network response was not ok")
  }

  const userInfoData = await userInfoResponse.json()
  const userId = userInfoData.Data?.UserId
  return userId
}

export const getUUPriceInfo = async (
  token: { value: string },
  userId: string,
  goodsID: string
): Promise<any> => {
  try {
    const raw = JSON.stringify({
      templateId: goodsID,
      pageSize: 10,
      pageIndex: 1,
      sortType: 1,
      listSortType: 1,
      listType: 10,
      userId: userId,
      stickersIsSort: false,
      stickers: {}
    })

    const commodityListResponse = await fetch(
      "https://api.youpin898.com/api/homepage/v2/es/commodity/GetCsGoPagedList",
      {
        headers: {
          authorization: `Bearer ${token.value}`,
          "content-type": "application/json",
          "user-agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
        },
        body: raw,
        method: "POST",
        redirect: "follow"
      }
    )

    const commodityListData = await commodityListResponse.json()
    return commodityListData.Data.CommodityList[0].Price
  } catch (error) {
    console.error(error)
    return error.message
  }
}

export const getUURentPriceInfo = async (
  token: { value: string },
  userId: string,
  goodsID: string
): Promise<any> => {
  try {
    const raw = JSON.stringify({
      templateId: goodsID,
      pageSize: 10,
      pageIndex: 1,
      sortType: 1,
      listSortType: 2,
      listType: 30,
      userId: userId,
      stickersIsSort: false,
      stickers: {}
    })

    const commodityListResponse = await fetch(
      "https://api.youpin898.com/api/homepage/v2/es/commodity/GetCsGoPagedList",
      {
        headers: {
          authorization: `Bearer ${token.value}`,
          "content-type": "application/json",
          "user-agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
        },
        body: raw,
        method: "POST",
        redirect: "follow"
      }
    )

    const commodityListData = await commodityListResponse.json()
    return commodityListData.Data.CommodityList[0]
  } catch (error) {
    console.error(error)
    return error.message
  }
}

export const getUUwantToBuyPrice = async (
  token: {
    value: string
  },
  goodsID: string
) => {
  try {
    const raw = JSON.stringify({
      templateId: goodsID,
      pageIndex: 1,
      pageSize: 50
    })

    const response = await fetch(
      "https://api.youpin898.com/api/youpin/commodity/purchase/find",
      {
        headers: {
          authorization: `Bearer ${token.value}`,
          "content-type": "application/json",
          "user-agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
        },
        body: raw,
        method: "POST",
        redirect: "follow"
      }
    )

    const res = await response.json()
    return res.data.response[0].unitPrice / 100
  } catch (error) {
    console.error(error)
    return error.message
  }
}

export const getUUGoodsInfo = (
  goodsID: string,
  userId: string,
  token: string,
  callback
) => {
  const raw = JSON.stringify({
    templateId: goodsID,
    pageSize: 10,
    pageIndex: 1,
    sortType: 1,
    listSortType: 1,
    listType: 10,
    userId: Number(userId),
    stickersIsSort: false,
    stickers: {}
  })
  fetch(
    "https://api.youpin898.com/api/homepage/v2/es/commodity/GetCsGoPagedList",
    {
      headers: {
        authorization: `Bearer ${token}`
      },
      body: raw,
      method: "POST"
    }
  )
    .then((response) => {
      return response.json()
    })
    .then((res) => {
      callback(res.Data.CommodityList[0])
    })
}
