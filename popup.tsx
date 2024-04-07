import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import { useEffect, useState } from "react"

import { sendToBackground } from "@plasmohq/messaging"

import {
  getBUFFGoodsInfo,
  getBUFFwantToBuyPrice,
  getC5GoodsInfo,
  getSteamGoodsInfo,
  getUUPriceInfo,
  getUURentPriceInfo,
  getUUwantToBuyPrice,
  getUUYPuserInfo,
  searchForExactNameId
} from "~utils/goods"
import type { BuffGoodsItem, DataType, GoodsInfo } from "~utils/types"

import c5Data from "./c5/string_730.json"
import uuData from "./uuyp/730.json"

import "./style.css"

const construcGoodsURL = (
  platform: string,
  goodsID: string,
  market_hash_name: string
): string => {
  const urls = {
    Steam: `https://steamcommunity.com/market/listings/730/${market_hash_name}`,
    BUFF: `https://buff.163.com/goods/${goodsID}`,
    UUYP: `https://www.youpin898.com/goodInfo?id=${goodsID}`,
    C5: `https://www.c5game.com/csgo/${goodsID}`
  }
  return urls[platform] || ""
}

const columns = [
  {
    title: chrome.i18n.getMessage("platform"),
    key: "Platform"
  },
  {
    title: chrome.i18n.getMessage("sell"),
    key: "Sell"
  },
  {
    title: chrome.i18n.getMessage("rent"),
    key: "Rent"
  },
  {
    title: chrome.i18n.getMessage("wantToBuy"),
    key: "WantToBuy"
  }
]

function IndexPopup() {
  const [loading, setLoading] = useState<boolean>(false)
  const [isBuffPage, setIsBuffPage] = useState<boolean>(false)
  const [tableData, setTableData] = useState<DataType[]>([])
  const [goodsInfo, setGoodsInfo] = useState<GoodsInfo>({})
  const [lang, setLang] = useState([])

  const fetchCookies = async (
    url: string
  ): Promise<chrome.cookies.Cookie[]> => {
    const cookies = await sendToBackground({
      name: "get-cookies",
      body: {
        url
      }
    })
    return cookies as chrome.cookies.Cookie[]
  }

  const getGoodsInfo = async (buffGoodsId: string) => {
    const buffCookies = await fetchCookies("https://buff.163.com")
    const buffGoods = await getBUFFGoodsInfo(buffGoodsId, buffCookies)
    const wantToBuyPrice = await getBUFFwantToBuyPrice(buffGoodsId, buffCookies)
    return {
      goodsInfo: buffGoods.data.goods_infos[buffGoodsId],
      sellPrice: buffGoods.data.items[0].price,
      wantToBuyPrice: wantToBuyPrice
    }
  }

  const load = async () => {
    const res = await sendToBackground({
      name: "get-page-info"
    })
    const isBuffPage = res.isBuffPage
    setIsBuffPage(isBuffPage)
    setLoading(true)
    if (isBuffPage) {
      const buffres = await getGoodsInfo(res.buffGoodsId)
      setGoodsInfo(buffres.goodsInfo)
      const tableData = await Promise.all([
        dealBuffGoods(
          res.buffGoodsId,
          buffres.goodsInfo.market_hash_name,
          buffres.sellPrice,
          buffres.wantToBuyPrice
        ),
        dealUUGoods(buffres.goodsInfo.market_hash_name),
        dealSteamGoodsInfo(buffres.goodsInfo.market_hash_name),
        dealC5Goods(buffres.goodsInfo.market_hash_name)
      ])
      setTableData(tableData)
    }
    setLoading(false)
  }

  useEffect(() => {
    langG()
    load()
  }, [])

  const dealUUGoods = async (market_hash_name: string): Promise<DataType> => {
    const uuCookies = await fetchCookies("https://www.youpin898.com/")
    const tokenSting = JSON.stringify(
      uuCookies.find((cookie) => cookie.name === "token")
    )
    if (!tokenSting) {
      return {
        MarkingHashName: market_hash_name,
        GoodsID: "",
        Platform: "UUYP",
        Sell: "Please Login",
        Rent: {
          LeaseUnitPrice: "",
          LongLeaseUnitPrice: ""
        },
        WantToBuy: ""
      }
    }
    const parsedToken = JSON.parse(tokenSting)
    const uugoodsID = uuData[market_hash_name]
    const uuuserId = await getUUYPuserInfo(parsedToken)
    const uuLowestPriceData = await getUUPriceInfo(
      parsedToken,
      uuuserId,
      uugoodsID
    )

    const rentPrice = await getUURentPriceInfo(parsedToken, uuuserId, uugoodsID)
    const wantToBuy = await getUUwantToBuyPrice(parsedToken, uugoodsID)
    return {
      MarkingHashName: market_hash_name,
      GoodsID: uugoodsID,
      Platform: "UUYP",
      Sell: uuLowestPriceData,
      Rent: {
        LeaseUnitPrice: rentPrice.LeaseUnitPrice,
        LongLeaseUnitPrice: rentPrice.LongLeaseUnitPrice
      },
      WantToBuy: wantToBuy
    }
  }

  const dealSteamGoodsInfo = async (market_hash_name: string) => {
    const nameId = searchForExactNameId(market_hash_name)
    try {
      const res = await getSteamGoodsInfo(nameId)
      return {
        MarkingHashName: market_hash_name,
        GoodsID: nameId,
        Platform: "Steam",
        Sell: res.sell_order_price.split(" ")[1],
        Rent: {
          LeaseUnitPrice: "",
          LongLeaseUnitPrice: ""
        },
        WantToBuy: res.buy_order_price.split(" ")[1]
      }
    } catch (error) {
      return {
        MarkingHashName: market_hash_name,
        GoodsID: nameId,
        Platform: "Steam",
        Sell: "network error",
        Rent: {
          LeaseUnitPrice: "",
          LongLeaseUnitPrice: ""
        },
        WantToBuy: "/"
      }
    }
  }

  const dealBuffGoods = async (
    goodsId: string,
    market_hash_name: string,
    sellPrice: string,
    wantToBuyPrice: string
  ) => {
    return {
      GoodsID: goodsId,
      MarkingHashName: market_hash_name,
      Platform: "BUFF",
      Sell: sellPrice,
      Rent: {
        LeaseUnitPrice: "",
        LongLeaseUnitPrice: ""
      },
      WantToBuy: wantToBuyPrice
    }
  }

  const dealC5Goods = async (market_hash_name: string) => {
    const c5GoodsID = c5Data[market_hash_name]
    const price = await getC5GoodsInfo(c5GoodsID)
    return {
      GoodsID: c5GoodsID,
      MarkingHashName: market_hash_name,
      Platform: "C5",
      Sell: price,
      Rent: {
        LeaseUnitPrice: "",
        LongLeaseUnitPrice: ""
      },
      WantToBuy: "/"
    }
  }
  const langG = async () => {
    const res = await chrome.i18n.getAcceptLanguages()
    setLang(res)
  }

  if (!isBuffPage) {
    return (
      <div className="flex justify-center items-center h-screen">
        Please open this extension with &nbsp;
        <a
          href="https://buff.163.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:text-blue-700">
          BUFF
        </a>
        &nbsp;page
      </div>
    )
  }

  return (
    <div className="flex flex-col p-4 justify-center items-center w-[500px]">
      <div className="flex space-x-4 items-center">
        <img
          src={goodsInfo.icon_url}
          alt={goodsInfo.name}
          className="w-12 h-12 rounded-full"
        />
        <h3 className="text-lg font-semibold text-gray-800">
          {lang.indexOf("zh") !== -1
            ? goodsInfo.name
            : goodsInfo.market_hash_name}
        </h3>
      </div>
      {loading ? (
        <div className="flex justify-center items-center">
          <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <Table className="min-w-full leading-normal">
          <TableHeader>
            <TableRow>
              {columns.map((column, key) => (
                <TableHead
                  key={key}
                  className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">
                  {column.title}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {tableData.map((data, index) => (
              <TableRow key={index} className="hover:bg-gray-100">
                <TableCell className="px-5 py-3 border-b border-gray-200 bg-white text-sm">
                  <a
                    href={construcGoodsURL(
                      data.Platform,
                      data.GoodsID,
                      data.MarkingHashName
                    )}
                    className="text-blue-500 hover:text-blue-800">
                    {data.Platform}
                  </a>
                </TableCell>
                <TableCell className="px-5 py-3 border-b border-gray-200 bg-white text-sm">
                  {data.Sell}
                </TableCell>
                <TableCell className="px-5 py-3 border-b border-gray-200 bg-white text-sm">
                  {data.Rent.LeaseUnitPrice !== "" ? (
                    <>
                      <div className="text-green-600">
                        {chrome.i18n.getMessage("longTerm")}:{" "}
                        {data.Rent.LeaseUnitPrice}{" "}
                        {chrome.i18n.getMessage("day")}
                      </div>
                      <div className="text-blue-600">
                        {chrome.i18n.getMessage("shortTerm")}:{" "}
                        {data.Rent.LongLeaseUnitPrice}{" "}
                        {chrome.i18n.getMessage("day")}
                      </div>
                    </>
                  ) : (
                    <span className="text-gray-500">/</span>
                  )}
                </TableCell>
                <TableCell className="px-5 py-3 border-b border-gray-200 bg-white text-sm">
                  {data.WantToBuy}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}

export default IndexPopup
