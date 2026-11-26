import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { getCmsState } from "../../../../lib/cms-storage"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    const key = req.params.key
    const state = await getCmsState(req.scope, key)
    res.setHeader("Cache-Control", "no-store")
    res.json({ key: state.key, content: state.current })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Ошибка получения раздела"
    res.status(400).json({ message })
  }
}
