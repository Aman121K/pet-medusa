import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"

type ExecArgs = {
  container: any
}

const DEFAULT_REGION = {
  name: "New Zealand",
  currency_code: "nzd",
  countries: ["nz"],
  automatic_taxes: false,
  is_tax_inclusive: false,
}

export default async function ensureStorefrontRegion({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const regionService = container.resolve(Modules.REGION)

  const existingRegions = await regionService.listRegions(
    {},
    {
      select: ["id", "name", "currency_code"],
      take: 10,
    }
  )

  if (existingRegions.length) {
    logger.info(
      `Storefront region already exists: ${existingRegions
        .map((region: any) => `${region.name} (${region.currency_code})`)
        .join(", ")}`
    )
    return
  }

  const [region] = await regionService.createRegions([DEFAULT_REGION])
  logger.info(`Created storefront region: ${region.name} (${region.currency_code})`)
}
