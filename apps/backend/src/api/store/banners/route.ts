import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { listActiveBanners } from "../../_shared/banner-store"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  res.json({
    banners: listActiveBanners(),
  })
}
