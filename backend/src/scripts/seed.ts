import type { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules, ProductStatus } from "@medusajs/framework/utils"
import { createWorkflow, transform, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import {
  createApiKeysWorkflow,
  createProductCategoriesWorkflow,
  createProductsWorkflow,
  createRegionsWorkflow,
  createSalesChannelsWorkflow,
  createShippingOptionsWorkflow,
  createShippingProfilesWorkflow,
  createStockLocationsWorkflow,
  createTaxRegionsWorkflow,
  linkSalesChannelsToApiKeyWorkflow,
  linkSalesChannelsToStockLocationWorkflow,
  updateStoresStep,
  updateStoresWorkflow,
} from "@medusajs/medusa/core-flows"
import catalog from "./catalog.json"

const updateStoreCurrencies = createWorkflow("apeks-update-store-currencies", (input: {
  store_id: string
  supported_currencies: { currency_code: string; is_default?: boolean }[]
}) => {
  const normalized = transform({ input }, ({ input }) => ({
    selector: { id: input.store_id },
    update: { supported_currencies: input.supported_currencies },
  }))
  return new WorkflowResponse(updateStoresStep(normalized))
})

export default async function seed({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const link = container.resolve(ContainerRegistrationKeys.LINK)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const stores = container.resolve(Modules.STORE)
  const channels = container.resolve(Modules.SALES_CHANNEL)
  const fulfillment = container.resolve(Modules.FULFILLMENT)
  const [store] = await stores.listStores()

  let channel = (await channels.listSalesChannels({ name: "Интернет-магазин" }))[0]
  if (!channel) {
    const { result } = await createSalesChannelsWorkflow(container).run({
      input: { salesChannelsData: [{ name: "Интернет-магазин" }] },
    })
    channel = result[0]
  }

  await updateStoreCurrencies(container).run({
    input: { store_id: store.id, supported_currencies: [{ currency_code: "rub", is_default: true }] },
  })
  await updateStoresWorkflow(container).run({
    input: { selector: { id: store.id }, update: { default_sales_channel_id: channel.id } },
  })

  const { result: regions } = await createRegionsWorkflow(container).run({
    input: { regions: [{
      name: "Россия", currency_code: "rub", countries: ["ru"],
      payment_providers: ["pp_system_default"],
    }] },
  })
  const region = regions[0]
  await createTaxRegionsWorkflow(container).run({
    input: [{ country_code: "ru", provider_id: "tp_system" }],
  })

  const { result: locations } = await createStockLocationsWorkflow(container).run({
    input: { locations: [{
      name: "Склад APEKS", address: { city: "Одинцово", country_code: "RU", address_1: "Западная, 181" },
    }] },
  })
  const location = locations[0]
  await updateStoresWorkflow(container).run({
    input: { selector: { id: store.id }, update: { default_location_id: location.id } },
  })
  await link.create({
    [Modules.STOCK_LOCATION]: { stock_location_id: location.id },
    [Modules.FULFILLMENT]: { fulfillment_provider_id: "manual_manual" },
  })

  let profile = (await fulfillment.listShippingProfiles({ type: "default" }))[0]
  if (!profile) {
    const { result } = await createShippingProfilesWorkflow(container).run({
      input: { data: [{ name: "Оборудование", type: "default" }] },
    })
    profile = result[0]
  }
  const fulfillmentSet = await fulfillment.createFulfillmentSets({
    name: "Доставка по России", type: "shipping",
    service_zones: [{ name: "Россия", geo_zones: [{ country_code: "ru", type: "country" }] }],
  })
  await link.create({
    [Modules.STOCK_LOCATION]: { stock_location_id: location.id },
    [Modules.FULFILLMENT]: { fulfillment_set_id: fulfillmentSet.id },
  })
  await createShippingOptionsWorkflow(container).run({ input: [
    { name: "СДЭК — бесплатно", price_type: "flat", provider_id: "manual_manual",
      service_zone_id: fulfillmentSet.service_zones[0].id, shipping_profile_id: profile.id,
      type: { label: "СДЭК", description: "Доставка после подтверждения заказа", code: "cdek" },
      prices: [{ currency_code: "rub", amount: 0 }, { region_id: region.id, amount: 0 }],
      rules: [{ attribute: "enabled_in_store", value: "true", operator: "eq" },
        { attribute: "is_return", value: "false", operator: "eq" }],
    },
    { name: "Самовывоз — бесплатно", price_type: "flat", provider_id: "manual_manual",
      service_zone_id: fulfillmentSet.service_zones[0].id, shipping_profile_id: profile.id,
      type: { label: "Самовывоз", description: "Из офиса в Одинцово", code: "pickup" },
      prices: [{ currency_code: "rub", amount: 0 }, { region_id: region.id, amount: 0 }],
      rules: [{ attribute: "enabled_in_store", value: "true", operator: "eq" },
        { attribute: "is_return", value: "false", operator: "eq" }],
    },
  ] })
  await linkSalesChannelsToStockLocationWorkflow(container).run({
    input: { id: location.id, add: [channel.id] },
  })

  const { data: existingKeys } = await query.graph({
    entity: "api_key", fields: ["id"], filters: { type: "publishable" },
  })
  let apiKeyId = existingKeys[0]?.id
  if (!apiKeyId) {
    const { result } = await createApiKeysWorkflow(container).run({
      input: { api_keys: [{ title: "Витрина APEKS", type: "publishable", created_by: "" }] },
    })
    apiKeyId = result[0].id
  }
  await linkSalesChannelsToApiKeyWorkflow(container).run({
    input: { id: apiKeyId, add: [channel.id] },
  })

  const categories = [...new Set(catalog.map((p) => p.category))]
  const { result: createdCategories } = await createProductCategoriesWorkflow(container).run({
    input: { product_categories: categories.map((name) => ({ name, is_active: true })) },
  })

  const products = catalog.map((p) => {
    const configurations = [
      { code: "base", label: "Базовая", software: false, controller: false },
      ...(p.kitOptions?.software ? [{ code: "software", label: "С ПО", software: true, controller: false }] : []),
      ...(p.kitOptions?.controller ? [{ code: "controller", label: "С контроллером", software: false, controller: true }] : []),
      ...(p.kitOptions?.software && p.kitOptions?.controller ? [{ code: "full", label: "Полный комплект", software: true, controller: true }] : []),
    ]
    return {
      title: p.title,
      subtitle: p.subtitle,
      description: p.description,
      handle: p.slug.replace(/_/g, "-"),
      status: ProductStatus.PUBLISHED,
      category_ids: [createdCategories.find((c) => c.name === p.category)!.id],
      shipping_profile_id: profile.id,
      thumbnail: `https://nowa-nn.github.io/apeks-gnss/${p.mainImage}`,
      options: [{ title: "Комплектация", values: configurations.map((c) => c.label) }],
      metadata: { apeks_slug: p.slug, article: p.article || "" },
      variants: configurations.map((c) => ({
        title: c.label,
        sku: `${p.article || p.slug}-${c.code}`,
        manage_inventory: false,
        options: { "Комплектация": c.label },
        prices: [{ currency_code: "rub", amount: p.price +
          (c.software ? (p.kitOptions?.software?.price || 0) : 0) +
          (c.controller ? (p.kitOptions?.controller?.price || 0) : 0) }],
      })),
    }
  })
  await createProductsWorkflow(container).run({ input: { products } })
  logger.info(`Создано товаров: ${products.length}; ключ витрины: ${apiKeyId}`)
}
