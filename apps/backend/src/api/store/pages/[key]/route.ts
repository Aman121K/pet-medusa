import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { getPublishedPage } from "../../../_shared/page-store"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const page = getPublishedPage(req.params.key)

  if (!page) {
    res.status(404).json({ type: "not_found", message: "Page not found" })
    return
  }

  res.json({ page })
}
