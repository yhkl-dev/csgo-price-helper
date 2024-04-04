import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import { useEffect, useState } from "react"

import { Button } from "~@/components/ui/button"
import {
  getBUFFGoodsID,
  getBUFFGoodsInfo,
  getBUFFwantToBuyPrice,
  getC5GoodsInfo,
  getCookies,
  getSteamGoodsInfo,
  getUUPriceInfo,
  getUURentPriceInfo,
  getUUwantToBuyPrice,
  getUUYPuserInfo,
  isBuffPageURL,
  searchForExactNameId
} from "~utils/goods"
import type { BuffGoodsItem, DataType, GoodsInfo } from "~utils/types"

import c5Data from "./c5/string_730.json"
import uuData from "./uuyp/730.json"

import "./style.css"

const construcGoodsURL = (
  plaform: string,
  goodsID: string,
  market_hash_name: string
): string => {
  switch (plaform) {
    case "Steam":
      return `https://steamcommunity.com/market/listings/730/${market_hash_name}`
    case "BUFF":
      return `https://buff.163.com/goods/${goodsID}`
    case "UUYP":
      return `https://www.youpin898.com/goodInfo?id=${goodsID}`
    case "C5":
      return `https://www.c5game.com/csgo/${goodsID}`
    default:
      return ""
  }
}

const columns = [
  {
    title: "平台",
    key: "Platform"
  },
  {
    title: "出售",
    key: "Sell"
  },
  {
    title: "出租",
    key: "Rent"
  },
  {
    title: "求购",
    key: "WantToBuy"
  }
]

function IndexPopup() {
  const [loading, setLoading] = useState<boolean>(false)
  const [goodsID, setBUFFGoodsID] = useState<string>("")
  const [tableData, setTableData] = useState<DataType[]>([])

  const [buffCookies, setBuffCookies] = useState<chrome.cookies.Cookie[]>([])
  const [uuCookies, setUUCookies] = useState<chrome.cookies.Cookie[]>([])
  const [goodsInfo, setGoodsInfo] = useState<GoodsInfo>({})
  const [buffGoodsItem, setBuffGoodsItem] = useState<BuffGoodsItem>({})

  const [isBuffPage, setIsBuffPage] = useState<boolean>(false)

  useEffect(() => {
    isBuffPageURL().then((res) => {
      setIsBuffPage(res)
      if (!res) {
        return
      }
    })

    getBUFFGoodsID().then((res) => {
      setBUFFGoodsID(res)
      getCookies("https://buff.163.com", setBuffCookies).then(() => {
        getBUFFGoodsInfo(res, buffCookies).then((goods) => {
          setGoodsInfo(goods.data.goods_infos[res])
          setBuffGoodsItem(goods.data.items[0])
        })
      })
      getCookies("https://www.youpin898.com/", setUUCookies)
      if (goodsID) {
        LoadData()
      }
    })
  }, [])

  const dealUUGoods = async (): Promise<DataType> => {
    const tokenSting = JSON.stringify(
      uuCookies.find((cookie) => cookie.name === "token")
    )
    if (!tokenSting) {
      return {
        MarkingHashName: goodsInfo.market_hash_name,
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
    const uugoodsID = uuData[goodsInfo.market_hash_name]
    const uuuserId = await getUUYPuserInfo(parsedToken)
    const uuLowestPriceData = await getUUPriceInfo(
      parsedToken,
      uuuserId,
      uugoodsID
    )

    const rentPrice = await getUURentPriceInfo(parsedToken, uuuserId, uugoodsID)
    const wantToBuy = await getUUwantToBuyPrice(parsedToken, uugoodsID)
    return {
      MarkingHashName: goodsInfo.market_hash_name,
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

  const dealSteamGoodsInfo = async () => {
    const nameId = searchForExactNameId(goodsInfo.market_hash_name)
    try {
      const res = await getSteamGoodsInfo(nameId)
      return {
        MarkingHashName: goodsInfo.market_hash_name,
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
        MarkingHashName: goodsInfo.market_hash_name,
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

  const dealBuffGoods = async (goodsID: string) => {
    const wantToBuyPrice = await getBUFFwantToBuyPrice(goodsID, buffCookies)
    return {
      GoodsID: goodsID,
      MarkingHashName: goodsInfo.market_hash_name,

      Platform: "BUFF",
      Sell: buffGoodsItem.price,
      Rent: {
        LeaseUnitPrice: "",
        LongLeaseUnitPrice: ""
      },
      WantToBuy: wantToBuyPrice
    }
  }

  const dealC5Goods = async () => {
    const c5GoodsID = c5Data[goodsInfo.market_hash_name]
    const price = await getC5GoodsInfo(c5GoodsID)
    return {
      GoodsID: c5GoodsID,
      MarkingHashName: goodsInfo.market_hash_name,
      Platform: "C5",
      Sell: price,
      Rent: {
        LeaseUnitPrice: "",
        LongLeaseUnitPrice: ""
      },
      WantToBuy: "/"
    }
  }

  const LoadData = async () => {
    setLoading(true)
    const uuGoodsInfo = await dealUUGoods()
    const buffGoodsInfo = await dealBuffGoods(goodsID)
    const steamGoodsInfo = await dealSteamGoodsInfo()
    const c5GoodsInfo = await dealC5Goods()
    setTableData([steamGoodsInfo, buffGoodsInfo, uuGoodsInfo, c5GoodsInfo])
    setLoading(false)
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
    <div className="flex flex-col p-4 justify-center items-center">
      <div className="flex space-x-4 items-center">
        <img
          src={goodsInfo.icon_url}
          alt={goodsInfo.name}
          className="w-12 h-12 rounded-full"
        />
        <h3 className="text-lg font-semibold text-gray-800">
          {goodsInfo.name}
        </h3>
        <Button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded text-sm transition duration-150 ease-in-out"
          onClick={LoadData}>
          点击加载
        </Button>
      </div>
      {loading ? (
        <div className="flex justify-center items-center">
          <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <Table className="min-w-full leading-normal">
          <TableCaption className="text-xs p-5 text-center">
            各个平台实时价格
          </TableCaption>
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
                        短租: {data.Rent.LeaseUnitPrice} 天
                      </div>
                      <div className="text-blue-600">
                        长租: {data.Rent.LongLeaseUnitPrice} 天
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
