import type { PlasmoMessaging } from "@plasmohq/messaging"

export type RequestBody = {
  url: string
}

export type RequestResponse = chrome.cookies.Cookie[]

const handler: PlasmoMessaging.MessageHandler<
  RequestBody,
  RequestResponse
> = async (req, res) => {
  chrome.cookies.getAll({ url: req.body.url }, function (cookies) {
    if (chrome.runtime.lastError) {
      res.send([])
      return
    }
    res.send(cookies)
  })
}

export default handler
