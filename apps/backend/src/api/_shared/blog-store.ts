import fs from "fs"
import path from "path"

export type BlogPost = {
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

type CreateBlogInput = {
  title?: string
  slug?: string
  excerpt?: string
  content?: string
  category?: string
  authorName?: string
  featuredImageUrl?: string
  featuredImageAlt?: string
  isPublished?: boolean
  publishedAt?: string
}

type UpdateBlogInput = Partial<CreateBlogInput>

const dataFile = path.join(process.cwd(), "static", "blogs.json")

let loaded = false
const blogs = new Map<string, BlogPost>()

const nowISO = () => new Date().toISOString()

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")

const normalizeOptional = (value?: string) => {
  const trimmed = value?.trim()
  return trimmed || undefined
}

const normalizeString = (value?: string, fallback = "") =>
  value?.trim() || fallback

const ensureLoaded = () => {
  if (loaded) {
    return
  }

  loaded = true

  try {
    if (!fs.existsSync(dataFile)) {
      seedDefaultBlog()
      persist()
      return
    }

    const rows = JSON.parse(fs.readFileSync(dataFile, "utf8")) as BlogPost[]
    rows.forEach((blog) => {
      if (blog.id) {
        blogs.set(blog.id, blog)
      }
    })
  } catch {
    blogs.clear()
    seedDefaultBlog()
  }
}

const persist = () => {
  fs.mkdirSync(path.dirname(dataFile), { recursive: true })
  fs.writeFileSync(dataFile, JSON.stringify(Array.from(blogs.values()), null, 2))
}

const assertUniqueSlug = (slug: string, currentId?: string) => {
  const existing = Array.from(blogs.values()).find(
    (blog) => blog.slug === slug && blog.id !== currentId
  )

  if (existing) {
    throw new Error("slug must be unique")
  }
}

const seedDefaultBlog = () => {
  const created = nowISO()

  blogs.set("blog_default", {
    id: "blog_default",
    title: "Pet Nutrition 101",
    slug: "pet-nutrition-101",
    excerpt:
      "A simple guide to balanced meals, reading labels, and choosing the right food for your pet.",
    content:
      "<p>Good nutrition starts with consistent meals, clean water, and food that matches your pet's age, weight, and activity level.</p><p>Use this blog section to publish care guides, product education, announcements, and seasonal advice from your admin panel.</p>",
    category: "Nutrition",
    authorName: "Pet Square Team",
    featuredImageUrl: "https://picsum.photos/seed/pet-nutrition/1200/800",
    featuredImageAlt: "Dog eating from a bowl",
    isPublished: true,
    publishedAt: created,
    createdAt: created,
    updatedAt: created,
  })
}

const sortNewestFirst = (rows: BlogPost[]) =>
  rows.sort((a, b) => {
    const aDate = a.publishedAt || a.createdAt
    const bDate = b.publishedAt || b.createdAt
    return new Date(bDate).getTime() - new Date(aDate).getTime()
  })

export const listBlogs = () => {
  ensureLoaded()
  return sortNewestFirst(Array.from(blogs.values()))
}

export const listPublishedBlogs = () => {
  ensureLoaded()
  return sortNewestFirst(
    Array.from(blogs.values()).filter((blog) => blog.isPublished)
  )
}

export const getBlog = (id: string) => {
  ensureLoaded()
  return blogs.get(id)
}

export const getPublishedBlogBySlug = (slug: string) => {
  ensureLoaded()
  return Array.from(blogs.values()).find(
    (blog) => blog.slug === slug && blog.isPublished
  )
}

export const createBlog = (input: CreateBlogInput): BlogPost => {
  ensureLoaded()

  const title = normalizeString(input.title)
  const slug = slugify(input.slug || title)

  if (!title || !slug) {
    throw new Error("title and slug are required")
  }

  assertUniqueSlug(slug)

  const created = nowISO()
  const isPublished = input.isPublished ?? false

  const blog: BlogPost = {
    id: `blog_${Math.random().toString(36).slice(2, 10)}`,
    title,
    slug,
    excerpt: normalizeString(input.excerpt),
    content: normalizeString(input.content),
    category: normalizeString(input.category, "General"),
    authorName: normalizeString(input.authorName, "Pet Square Team"),
    featuredImageUrl: normalizeOptional(input.featuredImageUrl),
    featuredImageAlt: normalizeOptional(input.featuredImageAlt) || title,
    isPublished,
    publishedAt: isPublished ? normalizeOptional(input.publishedAt) || created : undefined,
    createdAt: created,
    updatedAt: created,
  }

  blogs.set(blog.id, blog)
  persist()

  return blog
}

export const updateBlog = (id: string, input: UpdateBlogInput) => {
  ensureLoaded()

  const current = blogs.get(id)

  if (!current) {
    return undefined
  }

  const nextSlug =
    input.slug === undefined ? current.slug : slugify(input.slug || current.title)

  if (!nextSlug) {
    throw new Error("slug is required")
  }

  assertUniqueSlug(nextSlug, id)

  const isPublished = input.isPublished ?? current.isPublished
  const publishedAt =
    input.publishedAt !== undefined
      ? normalizeOptional(input.publishedAt)
      : current.publishedAt

  const updated: BlogPost = {
    ...current,
    title: input.title === undefined ? current.title : normalizeString(input.title),
    slug: nextSlug,
    excerpt:
      input.excerpt === undefined ? current.excerpt : normalizeString(input.excerpt),
    content:
      input.content === undefined ? current.content : normalizeString(input.content),
    category:
      input.category === undefined
        ? current.category
        : normalizeString(input.category, "General"),
    authorName:
      input.authorName === undefined
        ? current.authorName
        : normalizeString(input.authorName, "Pet Square Team"),
    featuredImageUrl:
      input.featuredImageUrl === undefined
        ? current.featuredImageUrl
        : normalizeOptional(input.featuredImageUrl),
    featuredImageAlt:
      input.featuredImageAlt === undefined
        ? current.featuredImageAlt
        : normalizeOptional(input.featuredImageAlt) || current.title,
    isPublished,
    publishedAt: isPublished ? publishedAt || nowISO() : undefined,
    updatedAt: nowISO(),
  }

  blogs.set(id, updated)
  persist()

  return updated
}

export const deleteBlog = (id: string) => {
  ensureLoaded()
  const ok = blogs.delete(id)

  if (ok) {
    persist()
  }

  return ok
}
