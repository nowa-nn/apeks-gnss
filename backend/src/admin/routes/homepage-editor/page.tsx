import { defineRouteConfig } from "@medusajs/admin-sdk"
import { ArrowUpRightOnBox, Clock, PencilSquare } from "@medusajs/icons"
import { Badge, Button, Container, Heading, Text } from "@medusajs/ui"
import { useCallback, useEffect, useState } from "react"

type HomepageSnapshot = {
  version: number
  saved_at: string
}

type AdminHomepageResponse = {
  homepage: HomepageSnapshot | null
  history: HomepageSnapshot[]
  storefront_url: string
}

function formatDate(iso?: string) {
  if (!iso) return "—"
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

const HomepageEditorPage = () => {
  const [state, setState] = useState<AdminHomepageResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [rollingBack, setRollingBack] = useState<number | null>(null)

  const loadState = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const res = await fetch("/admin/homepage", { credentials: "include" })
      const json = await res.json()
      if (!res.ok) throw new Error(json.message || "Не удалось загрузить настройки главной")
      setState(json)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка загрузки")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadState()
  }, [loadState])

  const handleRollback = async (version: number) => {
    setRollingBack(version)
    setError("")
    try {
      const res = await fetch("/admin/homepage/rollback", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ version }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.message || "Ошибка отката")
      setState(json)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка отката")
    } finally {
      setRollingBack(null)
    }
  }

  const storefrontBase = (state?.storefront_url || "").replace(/\/$/, "")
  const editorUrl = storefrontBase ? `${storefrontBase}/?edit=1` : ""

  return (
    <div className="flex flex-col gap-y-4">
      <Container className="divide-y p-0">
        <div className="flex flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Heading level="h1">Визуальный редактор главной страницы</Heading>
            <Text size="small" className="text-ui-fg-subtle mt-1">
              Редактируйте слайдер, баннеры, «Лучшие предложения», новости, видео и загрузки прямо на живой витрине кликом по блокам.
            </Text>
          </div>
          {editorUrl ? (
            <Button
              variant="primary"
              onClick={() => window.open(editorUrl, "_blank", "noopener,noreferrer")}
            >
              <ArrowUpRightOnBox />
              Открыть визуальный редактор
            </Button>
          ) : null}
        </div>

        <div className="px-6 py-4 flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Text size="small" weight="plus">Текущая публикация:</Text>
            {loading ? (
              <Badge color="grey">Загрузка...</Badge>
            ) : state?.homepage ? (
              <Badge color="green">
                Версия v{state.homepage.version} от {formatDate(state.homepage.saved_at)}
              </Badge>
            ) : (
              <Badge color="blue">По умолчанию (из шаблона витрины)</Badge>
            )}
          </div>
          {editorUrl ? (
            <Text size="small" className="text-ui-fg-muted">
              Адрес редактора: {editorUrl}
            </Text>
          ) : null}
        </div>

        {error ? (
          <div className="px-6 py-3">
            <Text size="small" className="text-ui-fg-error">{error}</Text>
          </div>
        ) : null}
      </Container>

      <Container className="divide-y p-0">
        <div className="px-6 py-4 flex items-center gap-2">
          <Clock className="text-ui-fg-subtle" />
          <Heading level="h2">История версий и откат</Heading>
        </div>

        <div className="divide-y">
          {!state?.history?.length ? (
            <div className="px-6 py-5">
              <Text size="small" className="text-ui-fg-subtle">
                История версий появится после первых публикаций через визуальный редактор.
              </Text>
            </div>
          ) : (
            state.history.map((item) => (
              <div key={item.version} className="px-6 py-3 flex items-center justify-between gap-4">
                <div>
                  <Text size="small" weight="plus">Версия v{item.version}</Text>
                  <Text size="xsmall" className="text-ui-fg-subtle">
                    Сохранена: {formatDate(item.saved_at)}
                  </Text>
                </div>
                <Button
                  size="small"
                  variant="secondary"
                  disabled={rollingBack !== null}
                  isLoading={rollingBack === item.version}
                  onClick={() => handleRollback(item.version)}
                >
                  Восстановить v{item.version}
                </Button>
              </div>
            ))
          )}
        </div>
      </Container>
    </div>
  )
}

export const config = defineRouteConfig({
  label: "Редактор главной",
  icon: PencilSquare,
})

export default HomepageEditorPage
