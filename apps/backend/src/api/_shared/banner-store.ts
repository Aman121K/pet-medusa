export type Banner = {
  id: string
  title: string
  image_url: string
  link_url?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

type CreateBannerInput = {
  title?: string
  image_url?: string
  link_url?: string
  is_active?: boolean
}

type UpdateBannerInput = Partial<CreateBannerInput>

const banners = new Map<string, Banner>()

const nowISO = () => new Date().toISOString()

const seedDefaultBanner = () => {
  if (banners.size > 0) {
    return
  }

  const created = nowISO()
  banners.set("banner_default", {
    id: "banner_default",
    title: "Welcome Banner",
    image_url: "https://picsum.photos/1200/400",
    link_url: "/",
    is_active: true,
    created_at: created,
    updated_at: created,
  })
}

seedDefaultBanner()

export const listBanners = () => Array.from(banners.values())

export const listActiveBanners = () =>
  Array.from(banners.values()).filter((b) => b.is_active)

export const getBanner = (id: string) => banners.get(id)

export const createBanner = (input: CreateBannerInput): Banner => {
  if (!input.title?.trim() || !input.image_url?.trim()) {
    throw new Error("title and image_url are required")
  }

  const id = `banner_${Math.random().toString(36).slice(2, 10)}`
  const created = nowISO()

  const banner: Banner = {
    id,
    title: input.title.trim(),
    image_url: input.image_url.trim(),
    link_url: input.link_url?.trim() || undefined,
    is_active: input.is_active ?? true,
    created_at: created,
    updated_at: created,
  }

  banners.set(id, banner)

  return banner
}

export const updateBanner = (id: string, input: UpdateBannerInput) => {
  const current = banners.get(id)

  if (!current) {
    return undefined
  }

  const updated: Banner = {
    ...current,
    title: input.title?.trim() ?? current.title,
    image_url: input.image_url?.trim() ?? current.image_url,
    link_url:
      input.link_url === undefined ? current.link_url : input.link_url.trim(),
    is_active: input.is_active ?? current.is_active,
    updated_at: nowISO(),
  }

  banners.set(id, updated)

  return updated
}

export const deleteBanner = (id: string) => banners.delete(id)
