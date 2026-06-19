import fs from "fs"
import path from "path"

export type Banner = {
  id: string
  title: string
  subtitle?: string
  image_url: string
  link_url?: string
  cta_text?: string
  position: string
  is_active: boolean
  created_at: string
  updated_at: string
}

type CreateBannerInput = {
  title?: string
  subtitle?: string
  image_url?: string
  link_url?: string
  cta_text?: string
  position?: string
  is_active?: boolean
}

type UpdateBannerInput = Partial<CreateBannerInput>

const dataFile = path.join(process.cwd(), "static", "banners.json")

let loaded = false
const banners = new Map<string, Banner>()
const nowISO = () => new Date().toISOString()

const seedDefaultBanner = () => {
  if (banners.size > 0) {
    return
  }

  const created = nowISO()
  banners.set("banner_default", {
    id: "banner_default",
    title: "Discover the best for",
    subtitle: "your pets at Pet Square.",
    image_url:
      "https://picsum.photos/seed/pet-square-home/1200/700",
    link_url: "/shop",
    cta_text: "Shop now",
    position: "home-hero",
    is_active: true,
    created_at: created,
    updated_at: created,
  })
}

const ensureLoaded = () => {
  if (loaded) {
    return
  }

  loaded = true

  try {
    if (!fs.existsSync(dataFile)) {
      seedDefaultBanner()
      persist()
      return
    }

    const rows = JSON.parse(fs.readFileSync(dataFile, "utf8")) as Banner[]
    rows.forEach((banner) => {
      if (banner.id) {
        banners.set(banner.id, {
          ...banner,
          position: banner.position || "home-hero",
        })
      }
    })
  } catch {
    banners.clear()
    seedDefaultBanner()
  }
}

const persist = () => {
  fs.mkdirSync(path.dirname(dataFile), { recursive: true })
  fs.writeFileSync(
    dataFile,
    JSON.stringify(Array.from(banners.values()), null, 2)
  )
}

export const listBanners = () => {
  ensureLoaded()
  return Array.from(banners.values())
}

export const listActiveBanners = (position?: string) => {
  ensureLoaded()
  return Array.from(banners.values()).filter((b) => {
    if (!b.is_active) {
      return false
    }

    return position ? b.position === position : true
  })
}

export const getBanner = (id: string) => {
  ensureLoaded()
  return banners.get(id)
}

export const createBanner = (input: CreateBannerInput): Banner => {
  ensureLoaded()

  if (!input.title?.trim() || !input.image_url?.trim()) {
    throw new Error("title and image_url are required")
  }

  const id = `banner_${Math.random().toString(36).slice(2, 10)}`
  const created = nowISO()

  const banner: Banner = {
    id,
    title: input.title.trim(),
    subtitle: input.subtitle?.trim() || undefined,
    image_url: input.image_url.trim(),
    link_url: input.link_url?.trim() || undefined,
    cta_text: input.cta_text?.trim() || undefined,
    position: input.position?.trim() || "home-hero",
    is_active: input.is_active ?? true,
    created_at: created,
    updated_at: created,
  }

  banners.set(id, banner)
  persist()

  return banner
}

export const updateBanner = (id: string, input: UpdateBannerInput) => {
  ensureLoaded()
  const current = banners.get(id)

  if (!current) {
    return undefined
  }

  const updated: Banner = {
    ...current,
    title: input.title?.trim() ?? current.title,
    subtitle:
      input.subtitle === undefined ? current.subtitle : input.subtitle.trim(),
    image_url: input.image_url?.trim() ?? current.image_url,
    link_url:
      input.link_url === undefined ? current.link_url : input.link_url.trim(),
    cta_text:
      input.cta_text === undefined ? current.cta_text : input.cta_text.trim(),
    position: input.position?.trim() || current.position,
    is_active: input.is_active ?? current.is_active,
    updated_at: nowISO(),
  }

  banners.set(id, updated)
  persist()

  return updated
}

export const deleteBanner = (id: string) => {
  ensureLoaded()
  const ok = banners.delete(id)

  if (ok) {
    persist()
  }

  return ok
}
