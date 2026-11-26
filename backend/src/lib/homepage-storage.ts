import type { MedusaContainer } from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"

const HOMEPAGE_KEY = "apeks_homepage"
const HISTORY_KEY = "apeks_homepage_history"
const MAX_HISTORY = 10
const MAX_PAYLOAD_BYTES = 512 * 1024

export interface HomepageSnapshot {
  version: number
  saved_at: string
  data: Record<string, unknown>
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value)
}

async function resolveDefaultStore(container: MedusaContainer) {
  const storeService = container.resolve(Modules.STORE)
  const stores = await storeService.listStores()
  const store = stores[0]
  if (!store) {
    throw new Error("Магазин в Medusa не найден")
  }
  return { storeService, store }
}

function readSnapshot(raw: unknown): HomepageSnapshot | null {
  if (!isPlainObject(raw) || !isPlainObject(raw.data)) {
    return null
  }
  return {
    version: typeof raw.version === "number" ? raw.version : 1,
    saved_at: typeof raw.saved_at === "string" ? raw.saved_at : new Date().toISOString(),
    data: raw.data,
  }
}

function readHistory(raw: unknown): HomepageSnapshot[] {
  if (!Array.isArray(raw)) {
    return []
  }
  return raw
    .map((entry) => readSnapshot(entry))
    .filter((entry): entry is HomepageSnapshot => entry !== null)
    .slice(0, MAX_HISTORY)
}

export async function getHomepageState(container: MedusaContainer) {
  const { store } = await resolveDefaultStore(container)
  const metadata = isPlainObject(store.metadata) ? store.metadata : {}
  const homepage = readSnapshot(metadata[HOMEPAGE_KEY])
  const history = readHistory(metadata[HISTORY_KEY])
  return {
    homepage,
    history,
    storefront_url: process.env.STOREFRONT_URL || "",
  }
}

export async function saveHomepageState(
  container: MedusaContainer,
  data: unknown
) {
  if (!isPlainObject(data)) {
    throw new Error("Некорректный формат данных главной страницы")
  }
  const serializedSize = Buffer.byteLength(JSON.stringify(data), "utf8")
  if (serializedSize > MAX_PAYLOAD_BYTES) {
    throw new Error("Превышен допустимый размер конфигурации главной страницы")
  }

  const { storeService, store } = await resolveDefaultStore(container)
  const metadata = isPlainObject(store.metadata) ? store.metadata : {}
  const current = readSnapshot(metadata[HOMEPAGE_KEY])
  const prevHistory = readHistory(metadata[HISTORY_KEY])

  const nextHistory = current
    ? [current, ...prevHistory].slice(0, MAX_HISTORY)
    : prevHistory

  const nextVersion = (current?.version || 0) + 1
  const nextSnapshot: HomepageSnapshot = {
    version: nextVersion,
    saved_at: new Date().toISOString(),
    data,
  }

  await storeService.updateStores(store.id, {
    metadata: {
      ...metadata,
      [HOMEPAGE_KEY]: nextSnapshot,
      [HISTORY_KEY]: nextHistory,
    },
  })

  return {
    homepage: nextSnapshot,
    history: nextHistory,
    storefront_url: process.env.STOREFRONT_URL || "",
  }
}

export async function rollbackHomepageState(
  container: MedusaContainer,
  targetVersion: number
) {
  const { storeService, store } = await resolveDefaultStore(container)
  const metadata = isPlainObject(store.metadata) ? store.metadata : {}
  const current = readSnapshot(metadata[HOMEPAGE_KEY])
  const prevHistory = readHistory(metadata[HISTORY_KEY])

  const target = prevHistory.find((entry) => entry.version === targetVersion)
  if (!target) {
    throw new Error(`Версия v${targetVersion} не найдена в истории`)
  }

  const nextHistory = [
    ...(current ? [current] : []),
    ...prevHistory.filter((entry) => entry.version !== targetVersion),
  ].slice(0, MAX_HISTORY)

  const nextVersion = Math.max(
    current?.version || 0,
    ...prevHistory.map((h) => h.version)
  ) + 1

  const restored: HomepageSnapshot = {
    version: nextVersion,
    saved_at: new Date().toISOString(),
    data: target.data,
  }

  await storeService.updateStores(store.id, {
    metadata: {
      ...metadata,
      [HOMEPAGE_KEY]: restored,
      [HISTORY_KEY]: nextHistory,
    },
  })

  return {
    homepage: restored,
    history: nextHistory,
    storefront_url: process.env.STOREFRONT_URL || "",
  }
}
