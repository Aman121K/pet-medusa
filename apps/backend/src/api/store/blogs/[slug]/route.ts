import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { getPublishedBlogBySlug } from "../../../_shared/blog-store"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const blog = getPublishedBlogBySlug(req.params.slug)

  if (!blog) {
    res.status(404).json({ type: "not_found", message: "Blog not found" })
    return
  }

  res.json(blog)
}
