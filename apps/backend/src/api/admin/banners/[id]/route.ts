import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import {
  deleteBanner,
  getBanner,
  updateBanner,
} from "../../../_shared/banner-store"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const banner = getBanner(req.params.id)

  if (!banner) {
    res.status(404).json({ type: "not_found", message: "Banner not found" })
    return
  }

  res.json({ banner })
}

export async function PUT(req: MedusaRequest, res: MedusaResponse) {
  const banner = updateBanner(req.params.id, req.body || {})

  if (!banner) {
    res.status(404).json({ type: "not_found", message: "Banner not found" })
    return
  }

  res.json({ banner })
}

export async function DELETE(req: MedusaRequest, res: MedusaResponse) {
  const ok = deleteBanner(req.params.id)

  if (!ok) {
    res.status(404).json({ type: "not_found", message: "Banner not found" })
    return
  }

  res.status(204).send()
}
