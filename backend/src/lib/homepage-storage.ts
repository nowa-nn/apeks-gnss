import type { MedusaContainer } from "@medusajs/framework/types"
import { getCmsState, rollbackCmsState, saveCmsState } from "./cms-storage"

export async function getHomepageState(container: MedusaContainer) {
  const state = await getCmsState(container, "homepage")
  return {
    homepage: state.current,
    history: state.history,
    storefront_url: state.storefront_url,
  }
}

export async function saveHomepageState(container: MedusaContainer, data: unknown) {
  const state = await saveCmsState(container, "homepage", data)
  return {
    homepage: state.current,
    history: state.history,
    storefront_url: state.storefront_url,
  }
}

export async function rollbackHomepageState(container: MedusaContainer, targetVersion: number) {
  const state = await rollbackCmsState(container, "homepage", targetVersion)
  return {
    homepage: state.current,
    history: state.history,
    storefront_url: state.storefront_url,
  }
}
