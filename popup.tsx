import type { TableProps } from "antd"
import { Space, Table } from "antd"
import Button from "antd/es/button"
import { useEffect, useState } from "react"

import { ThemeProvider } from "~theme"
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
  searchForExactNameId
} from "~utils/goods"

import c5Data from "./c5/string_730.json"
import uuData from "./uuyp/730.json"

import "./popup.css"

import type { BuffGoodsItem, DataType, GoodsInfo } from "~utils/types"

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

const columns: TableProps<DataType>["columns"] = [
  {
    title: "平台",
    dataIndex: "Platform",
    key: "Platform",
    render: (text: string, record: DataType) => {
      const url = construcGoodsURL(
        record.Platform,
        record.GoodsID,
        record.MarkingHashName
      )
      return <a href={url}>{record.Platform}</a>
    }
  },
  {
    title: "出售",
    dataIndex: "Sell",
    key: "Sell"
  },
  {
    title: "出租",
    dataIndex: "Rent",
    key: "Rent",
    render: (text: string, record: DataType) =>
      record.Rent.LeaseUnitPrice !== "" ? (
        <>
          <div>短租: {record.Rent.LeaseUnitPrice} 天</div>
          <div>长租: {record.Rent.LongLeaseUnitPrice} 天</div>
        </>
      ) : (
        <>/</>
      )
  },
  {
    title: "求购",
    dataIndex: "WantToBuy",
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

  useEffect(() => {
    getBUFFGoodsID().then((res) => {
      setBUFFGoodsID(res)
      getCookies("https://buff.163.com", setBuffCookies).then(() => {
        getBUFFGoodsInfo(res, buffCookies).then((goods) => {
          setGoodsInfo(goods.data.goods_infos[res])
          setBuffGoodsItem(goods.data.items[0])
        })
      })
      getCookies("https://www.youpin898.com/", setUUCookies)
    })
  }, [chrome])

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

  return (
    <ThemeProvider>
      <div
        style={{
          flexDirection: "column",
          padding: 16
        }}>
        <Space>
          <img
            src={goodsInfo.icon_url}
            alt={goodsInfo.name}
            width="35"
            height="35"></img>
          <h3>
            {goodsInfo.name}
            {/* <br /> {goodsInfo.market_hash_name} */}
          </h3>
          <Button onClick={LoadData} type="primary">
            Click To Load
          </Button>
        </Space>
        <Table
          style={{ width: "100%" }}
          columns={columns}
          dataSource={tableData}
          pagination={false}
          loading={loading}
        />
      </div>
    </ThemeProvider>
  )
}

export default IndexPopup
