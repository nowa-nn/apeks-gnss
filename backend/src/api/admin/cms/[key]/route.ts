import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { getCmsState, saveCmsState } from "../../../../lib/cms-storage"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    const state = await getCmsState(req.scope, req.params.key)
    res.setHeader("Cache-Control", "no-store")
    res.json(state)
  } catch (error) {
    const message = error instanceof Error ? error.message : "Ошибка чтения раздела"
    res.status(400).json({ message })
  }
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    const body = (req.body || {}) as { data?: unknown }
    const state = await saveCmsState(req.scope, req.params.key, body.data)
    res.json(state)
  } catch (error) {
    const message = error instanceof Error ? error.message : "Ошибка сохранения раздела"
    res.status(400).json({ message })
  }
}
