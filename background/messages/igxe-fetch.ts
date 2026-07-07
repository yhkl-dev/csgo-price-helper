import type { PlasmoMessaging } from "@plasmohq/messaging"

export type RequestBody = {
  url: string
}

export type RequestResponse = {
  ok: boolean
  status: number
  data: unknown
}

const handler: PlasmoMessaging.MessageHandler<
  RequestBody,
  RequestResponse
> = async (req, res) => {
  try {
    const response = await fetch(req.body.url, {
      headers: {
        "x-requested-with": "XMLHttpRequest",
        accept: "*/*"
      }
    })

    const text = await response.text()
    let data: unknown
    try {
      data = JSON.parse(text)
    } catch {
      data = text.slice(0, 500)
    }

    res.send({
      ok: response.ok,
      status: response.status,
      data
    })
  } catch (error) {
    res.send({
      ok: false,
      status: 0,
      data: { error: String(error) }
    })
  }
}

export default handler
