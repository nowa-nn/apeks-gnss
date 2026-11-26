import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { getHomepageState, saveHomepageState } from "../../../lib/homepage-storage"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const state = await getHomepageState(req.scope)
  res.setHeader("Cache-Control", "no-store")
  res.json(state)
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    const body = (req.body || {}) as { data?: unknown }
    const state = await saveHomepageState(req.scope, body.data)
    res.json(state)
  } catch (error) {
    const message = error instanceof Error ? error.message : "Ошибка сохранения главной страницы"
    res.status(400).json({ message })
  }
}
