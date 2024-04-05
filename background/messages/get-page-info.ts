import type { PlasmoMessaging } from "@plasmohq/messaging"

const BUFFURL = "buff.163.com"

export type RequestBody = {}

export type RequestResponse = {
  isBuffPage: boolean
  buffGoodsId: string
}

const handler: PlasmoMessaging.MessageHandler<
  RequestBody,
  RequestResponse
> = async (req, res) => {
  const [currentTab] = await chrome.tabs.query({
    active: true,
    currentWindow: true
  })
  const { host, pathname } = new URL(currentTab.url)
  console.log(host, pathname)
  const isBuffPage = host === BUFFURL
  if (isBuffPage) {
    res.send({ isBuffPage: isBuffPage, buffGoodsId: pathname.split("/")[2] })
  } else {
    res.send({ isBuffPage: isBuffPage, buffGoodsId: "" })
  }
}

export default handler
