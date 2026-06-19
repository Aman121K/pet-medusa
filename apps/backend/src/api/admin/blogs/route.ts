import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { createBlog, listBlogs } from "../../_shared/blog-store"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  res.json({
    blogs: listBlogs(),
  })
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    const blog = createBlog(req.body || {})
    res.status(201).json({ blog })
  } catch (e) {
    res.status(400).json({
      type: "invalid_data",
      message: e instanceof Error ? e.message : "Invalid blog data",
    })
  }
}
