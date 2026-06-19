import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { listPublishedBlogs } from "../../_shared/blog-store"

export const AUTHENTICATE = false

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  res.json({
    blogs: listPublishedBlogs(),
  })
}
