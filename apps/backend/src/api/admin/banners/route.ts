import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { createBanner, listBanners } from "../../_shared/banner-store"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  res.json({
    banners: listBanners(),
  })
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    const banner = createBanner(req.body || {})
    res.status(201).json({ banner })
  } catch (e) {
    res.status(400).json({
      type: "invalid_data",
      message: e instanceof Error ? e.message : "Invalid banner data",
    })
  }
}
