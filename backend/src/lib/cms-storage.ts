import type { MedusaContainer } from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"

const KEY_REGEX = /^[a-z0-9_-]{2,40}$/
const MAX_HISTORY = 10
const MAX_PAYLOAD_BYTES = 512 * 1024

export interface CmsSnapshot {
  version: number
  saved_at: string
  data: Record<string, unknown>
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value)
}

export function assertValidCmsKey(key: string): string {
  const clean = String(key || "").trim().toLowerCase()
  if (!KEY_REGEX.test(clean)) {
    throw new Error(`Недопустимый ключ раздела CMS: "${key}"`)
  }
  return clean
}

function storageKeys(key: string) {
  if (key === "homepage") {
    return { currentKey: "apeks_homepage", historyKey: "apeks_homepage_history" }
  }
  return { currentKey: `apeks_cms_${key}`, historyKey: `apeks_cms_${key}_history` }
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

function readSnapshot(raw: unknown): CmsSnapshot | null {
  if (!isPlainObject(raw) || !isPlainObject(raw.data)) {
    return null
  }
  return {
    version: typeof raw.version === "number" ? raw.version : 1,
    saved_at: typeof raw.saved_at === "string" ? raw.saved_at : new Date().toISOString(),
    data: raw.data,
  }
}

function readHistory(raw: unknown): CmsSnapshot[] {
  if (!Array.isArray(raw)) {
    return []
  }
  return raw
    .map((entry) => readSnapshot(entry))
    .filter((entry): entry is CmsSnapshot => entry !== null)
    .slice(0, MAX_HISTORY)
}

export async function getCmsState(container: MedusaContainer, rawKey: string) {
  const key = assertValidCmsKey(rawKey)
  const { currentKey, historyKey } = storageKeys(key)
  const { store } = await resolveDefaultStore(container)
  const metadata = isPlainObject(store.metadata) ? store.metadata : {}
  return {
    key,
    current: readSnapshot(metadata[currentKey]),
    history: readHistory(metadata[historyKey]),
    storefront_url: process.env.STOREFRONT_URL || "",
  }
}

export async function saveCmsState(
  container: MedusaContainer,
  rawKey: string,
  data: unknown
) {
  const key = assertValidCmsKey(rawKey)
  if (!isPlainObject(data)) {
    throw new Error("Некорректный формат данных раздела")
  }
  const serializedSize = Buffer.byteLength(JSON.stringify(data), "utf8")
  if (serializedSize > MAX_PAYLOAD_BYTES) {
    throw new Error("Превышен допустимый размер конфигурации раздела")
  }

  const { currentKey, historyKey } = storageKeys(key)
  const { storeService, store } = await resolveDefaultStore(container)
  const metadata = isPlainObject(store.metadata) ? store.metadata : {}
  const current = readSnapshot(metadata[currentKey])
  const prevHistory = readHistory(metadata[historyKey])

  const nextHistory = current
    ? [current, ...prevHistory].slice(0, MAX_HISTORY)
    : prevHistory

  const nextVersion = (current?.version || 0) + 1
  const nextSnapshot: CmsSnapshot = {
    version: nextVersion,
    saved_at: new Date().toISOString(),
    data,
  }

  await storeService.updateStores(store.id, {
    metadata: {
      ...metadata,
      [currentKey]: nextSnapshot,
      [historyKey]: nextHistory,
    },
  })

  return {
    key,
    current: nextSnapshot,
    history: nextHistory,
    storefront_url: process.env.STOREFRONT_URL || "",
  }
}

export async function rollbackCmsState(
  container: MedusaContainer,
  rawKey: string,
  targetVersion: number
) {
  const key = assertValidCmsKey(rawKey)
  const { currentKey, historyKey } = storageKeys(key)
  const { storeService, store } = await resolveDefaultStore(container)
  const metadata = isPlainObject(store.metadata) ? store.metadata : {}
  const current = readSnapshot(metadata[currentKey])
  const prevHistory = readHistory(metadata[historyKey])

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

  const restored: CmsSnapshot = {
    version: nextVersion,
    saved_at: new Date().toISOString(),
    data: target.data,
  }

  await storeService.updateStores(store.id, {
    metadata: {
      ...metadata,
      [currentKey]: restored,
      [historyKey]: nextHistory,
    },
  })

  return {
    key,
    current: restored,
    history: nextHistory,
    storefront_url: process.env.STOREFRONT_URL || "",
  }
}
