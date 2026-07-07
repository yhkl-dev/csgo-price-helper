import type { PlasmoMessaging } from "@plasmohq/messaging"

export type RequestBody = {
  url: string
  headers: Record<string, string>
  body: string
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
      method: "POST",
      headers: req.body.headers,
      body: req.body.body,
      redirect: "follow"
    })

    const data = await response.json()
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
