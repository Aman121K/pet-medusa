import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { deletePage, getPage, updatePage } from "../../../_shared/page-store"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const page = getPage(req.params.key)

  if (!page) {
    res.status(404).json({ type: "not_found", message: "Page not found" })
    return
  }

  res.json({ page })
}

export async function PUT(req: MedusaRequest, res: MedusaResponse) {
  try {
    const page = updatePage(req.params.key, req.body || {})

    if (!page) {
      res.status(404).json({ type: "not_found", message: "Page not found" })
      return
    }

    res.json({ page })
  } catch (e) {
    res.status(400).json({
      type: "invalid_data",
      message: e instanceof Error ? e.message : "Invalid page data",
    })
  }
}

export async function DELETE(req: MedusaRequest, res: MedusaResponse) {
  const ok = deletePage(req.params.key)

  if (!ok) {
    res.status(404).json({ type: "not_found", message: "Page not found" })
    return
  }

  res.status(204).send()
}
