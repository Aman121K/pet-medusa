import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { createPage, listPages } from "../../_shared/page-store"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  res.json({ pages: listPages() })
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    const page = createPage(req.body || {})
    res.status(201).json({ page })
  } catch (e) {
    res.status(400).json({
      type: "invalid_data",
      message: e instanceof Error ? e.message : "Invalid page data",
    })
  }
}
