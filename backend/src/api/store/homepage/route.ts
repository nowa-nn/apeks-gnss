import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { getHomepageState } from "../../../lib/homepage-storage"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const state = await getHomepageState(req.scope)
  res.setHeader("Cache-Control", "no-store")
  res.json({
    homepage: state.homepage,
  })
}
