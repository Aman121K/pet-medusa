import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { deleteBlog, getBlog, updateBlog } from "../../../_shared/blog-store"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const blog = getBlog(req.params.id)

  if (!blog) {
    res.status(404).json({ type: "not_found", message: "Blog not found" })
    return
  }

  res.json({ blog })
}

export async function PUT(req: MedusaRequest, res: MedusaResponse) {
  try {
    const blog = updateBlog(req.params.id, req.body || {})

    if (!blog) {
      res.status(404).json({ type: "not_found", message: "Blog not found" })
      return
    }

    res.json({ blog })
  } catch (e) {
    res.status(400).json({
      type: "invalid_data",
      message: e instanceof Error ? e.message : "Invalid blog data",
    })
  }
}

export async function DELETE(req: MedusaRequest, res: MedusaResponse) {
  const ok = deleteBlog(req.params.id)

  if (!ok) {
    res.status(404).json({ type: "not_found", message: "Blog not found" })
    return
  }

  res.status(204).send()
}
