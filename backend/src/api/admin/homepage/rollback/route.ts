import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { rollbackHomepageState } from "../../../../lib/homepage-storage"

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    const body = (req.body || {}) as { version?: number }
    const version = Number(body.version)
    if (!Number.isFinite(version) || version <= 0) {
      res.status(400).json({ message: "Укажите корректный номер версии" })
      return
    }
    const state = await rollbackHomepageState(req.scope, version)
    res.json(state)
  } catch (error) {
    const message = error instanceof Error ? error.message : "Ошибка отката версии"
    res.status(400).json({ message })
  }
}
