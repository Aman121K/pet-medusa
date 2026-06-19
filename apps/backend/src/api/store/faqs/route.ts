import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { listFaqs } from "../../_shared/page-store"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const page = typeof req.query.page === "string" ? req.query.page : undefined

  res.json({
    faqs: listFaqs(page),
  })
}
