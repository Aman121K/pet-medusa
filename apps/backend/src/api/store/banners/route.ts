import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { listActiveBanners } from "../../_shared/banner-store"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const position =
    typeof req.query.position === "string" ? req.query.position : undefined

  res.json({
    banners: listActiveBanners(position),
  })
}
