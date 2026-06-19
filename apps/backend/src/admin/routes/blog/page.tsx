import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Button, Container, Heading, Text } from "@medusajs/ui"
import { FormEvent, useEffect, useMemo, useState } from "react"

type BlogPost = {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  category: string
  authorName: string
  featuredImageUrl?: string
  featuredImageAlt?: string
  isPublished: boolean
  publishedAt?: string
  createdAt: string
  updatedAt: string
}

type BlogForm = {
  title: string
  slug: string
  excerpt: string
  content: string
  category: string
  authorName: string
  featuredImageUrl: string
  featuredImageAlt: string
  isPublished: boolean
  publishedAt: string
}

const emptyForm: BlogForm = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  category: "General",
  authorName: "Pet Square Team",
  featuredImageUrl: "",
  featuredImageAlt: "",
  isPublished: false,
  publishedAt: "",
}

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")

const toDateTimeLocal = (value?: string) => {
  if (!value) {
    return ""
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return ""
  }

  return date.toISOString().slice(0, 16)
}

const inputClass =
  "w-full rounded-md border border-ui-border-base bg-ui-bg-base px-3 py-2 text-sm text-ui-fg-base outline-none transition focus:border-ui-border-interactive"

const labelClass = "mb-1 block text-xs font-medium text-ui-fg-subtle"

const BlogPage = () => {
  const [blogs, setBlogs] = useState<BlogPost[]>([])
  const [form, setForm] = useState<BlogForm>(emptyForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState("")

  const editingBlog = useMemo(
    () => blogs.find((blog) => blog.id === editingId),
    [blogs, editingId]
  )

  const loadBlogs = async () => {
    setLoading(true)

    try {
      const res = await fetch("/admin/blogs")
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data?.message || "Failed to load blogs")
      }

      setBlogs(data.blogs || [])
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Failed to load blogs")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadBlogs()
  }, [])

  const updateForm = (key: keyof BlogForm, value: string | boolean) => {
    setForm((current) => ({
      ...current,
      [key]: value,
      ...(key === "title" && !editingId
        ? { slug: slugify(String(value)) }
        : {}),
    }))
  }

  const resetForm = () => {
    setForm(emptyForm)
    setEditingId(null)
    setMessage("")
  }

  const editBlog = (blog: BlogPost) => {
    setEditingId(blog.id)
    setForm({
      title: blog.title,
      slug: blog.slug,
      excerpt: blog.excerpt,
      content: blog.content,
      category: blog.category,
      authorName: blog.authorName,
      featuredImageUrl: blog.featuredImageUrl || "",
      featuredImageAlt: blog.featuredImageAlt || "",
      isPublished: blog.isPublished,
      publishedAt: toDateTimeLocal(blog.publishedAt),
    })
    setMessage("")
  }

  const saveBlog = async (event: FormEvent) => {
    event.preventDefault()
    setSaving(true)
    setMessage("")

    try {
      const res = await fetch(editingId ? `/admin/blogs/${editingId}` : "/admin/blogs", {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          slug: form.slug || slugify(form.title),
          publishedAt: form.publishedAt
            ? new Date(form.publishedAt).toISOString()
            : undefined,
        }),
      })
      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        throw new Error(data?.message || "Failed to save blog")
      }

      setMessage(editingId ? "Blog updated." : "Blog created.")
      resetForm()
      await loadBlogs()
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Failed to save blog")
    } finally {
      setSaving(false)
    }
  }

  const deleteSelectedBlog = async (blog: BlogPost) => {
    if (!window.confirm(`Delete "${blog.title}"?`)) {
      return
    }

    try {
      const res = await fetch(`/admin/blogs/${blog.id}`, { method: "DELETE" })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data?.message || "Failed to delete blog")
      }

      if (editingId === blog.id) {
        resetForm()
      }

      setMessage("Blog deleted.")
      await loadBlogs()
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Failed to delete blog")
    }
  }

  return (
    <Container className="p-6">
      <div className="flex flex-col gap-8">
        <div>
          <Heading level="h1">Blogs</Heading>
          <Text className="text-ui-fg-subtle mt-2">
            Create blog posts here and publish them to the pet website.
          </Text>
        </div>

        {message && (
          <div className="rounded-md border border-ui-border-base bg-ui-bg-subtle px-4 py-3 text-sm text-ui-fg-base">
            {message}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
          <form
            onSubmit={saveBlog}
            className="rounded-lg border border-ui-border-base bg-ui-bg-base p-5"
          >
            <div className="mb-5 flex items-center justify-between gap-3">
              <Heading level="h2">
                {editingBlog ? `Edit ${editingBlog.title}` : "New blog post"}
              </Heading>
              {editingId && (
                <Button type="button" variant="secondary" onClick={resetForm}>
                  New post
                </Button>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label>
                <span className={labelClass}>Title</span>
                <input
                  className={inputClass}
                  value={form.title}
                  onChange={(e) => updateForm("title", e.target.value)}
                  required
                />
              </label>

              <label>
                <span className={labelClass}>Slug</span>
                <input
                  className={inputClass}
                  value={form.slug}
                  onChange={(e) => updateForm("slug", slugify(e.target.value))}
                  required
                />
              </label>

              <label>
                <span className={labelClass}>Category</span>
                <input
                  className={inputClass}
                  value={form.category}
                  onChange={(e) => updateForm("category", e.target.value)}
                />
              </label>

              <label>
                <span className={labelClass}>Author</span>
                <input
                  className={inputClass}
                  value={form.authorName}
                  onChange={(e) => updateForm("authorName", e.target.value)}
                />
              </label>

              <label className="md:col-span-2">
                <span className={labelClass}>Featured image URL</span>
                <input
                  className={inputClass}
                  value={form.featuredImageUrl}
                  onChange={(e) => updateForm("featuredImageUrl", e.target.value)}
                  placeholder="https://..."
                />
              </label>

              <label className="md:col-span-2">
                <span className={labelClass}>Featured image alt text</span>
                <input
                  className={inputClass}
                  value={form.featuredImageAlt}
                  onChange={(e) => updateForm("featuredImageAlt", e.target.value)}
                />
              </label>

              <label className="md:col-span-2">
                <span className={labelClass}>Excerpt</span>
                <textarea
                  className={`${inputClass} min-h-[84px]`}
                  value={form.excerpt}
                  onChange={(e) => updateForm("excerpt", e.target.value)}
                />
              </label>

              <label className="md:col-span-2">
                <span className={labelClass}>Content HTML</span>
                <textarea
                  className={`${inputClass} min-h-[220px] font-mono`}
                  value={form.content}
                  onChange={(e) => updateForm("content", e.target.value)}
                  placeholder="<p>Write your blog content here...</p>"
                />
              </label>

              <label>
                <span className={labelClass}>Published date</span>
                <input
                  className={inputClass}
                  type="datetime-local"
                  value={form.publishedAt}
                  onChange={(e) => updateForm("publishedAt", e.target.value)}
                />
              </label>

              <label className="flex items-center gap-2 pt-6 text-sm text-ui-fg-base">
                <input
                  type="checkbox"
                  checked={form.isPublished}
                  onChange={(e) => updateForm("isPublished", e.target.checked)}
                />
                Published
              </label>
            </div>

            <div className="mt-5 flex justify-end">
              <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : editingId ? "Save changes" : "Create blog"}
              </Button>
            </div>
          </form>

          <div className="rounded-lg border border-ui-border-base bg-ui-bg-base p-5">
            <Heading level="h2">Posts</Heading>

            {loading && (
              <Text className="text-ui-fg-subtle mt-4">Loading blog posts...</Text>
            )}

            {!loading && blogs.length === 0 && (
              <Text className="text-ui-fg-subtle mt-4">No blog posts yet.</Text>
            )}

            <div className="mt-4 flex flex-col gap-3">
              {blogs.map((blog) => (
                <div
                  key={blog.id}
                  className="rounded-md border border-ui-border-base p-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <Text className="font-medium text-ui-fg-base">{blog.title}</Text>
                      <Text className="text-ui-fg-subtle text-xs">/{blog.slug}</Text>
                    </div>
                    <span className="rounded-full bg-ui-bg-subtle px-2 py-1 text-xs text-ui-fg-subtle">
                      {blog.isPublished ? "Published" : "Draft"}
                    </span>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <Button
                      type="button"
                      size="small"
                      variant="secondary"
                      onClick={() => editBlog(blog)}
                    >
                      Edit
                    </Button>
                    <Button
                      type="button"
                      size="small"
                      variant="danger"
                      onClick={() => deleteSelectedBlog(blog)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Container>
  )
}

export const config = defineRouteConfig({
  label: "Blogs",
})

export default BlogPage
