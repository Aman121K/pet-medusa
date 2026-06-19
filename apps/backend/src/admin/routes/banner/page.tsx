import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Button, Container, Heading, Text } from "@medusajs/ui"
import { FormEvent, useEffect, useState } from "react"

type Banner = {
  id: string
  title: string
  subtitle?: string
  image_url: string
  link_url?: string
  cta_text?: string
  position: string
  is_active: boolean
}

const emptyForm = {
  title: "",
  subtitle: "",
  image_url: "",
  link_url: "/shop",
  cta_text: "Shop now",
  position: "home-hero",
  is_active: true,
}

const inputClass =
  "w-full rounded-md border border-ui-border-base bg-ui-bg-base px-3 py-2 text-sm text-ui-fg-base outline-none transition focus:border-ui-border-interactive"

const labelClass = "mb-1 block text-xs font-medium text-ui-fg-subtle"

const BannerPage = () => {
  const [banners, setBanners] = useState<Banner[]>([])
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState("")

  const loadBanners = async () => {
    setLoading(true)

    try {
      const res = await fetch("/admin/banners")
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data?.message || "Failed to load banners")
      }

      setBanners(data.banners || [])
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Failed to load banners")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadBanners()
  }, [])

  const editBanner = (banner: Banner) => {
    setEditingId(banner.id)
    setForm({
      title: banner.title,
      subtitle: banner.subtitle || "",
      image_url: banner.image_url,
      link_url: banner.link_url || "",
      cta_text: banner.cta_text || "",
      position: banner.position || "home-hero",
      is_active: banner.is_active,
    })
    setMessage("")
  }

  const resetForm = () => {
    setEditingId(null)
    setForm(emptyForm)
    setMessage("")
  }

  const saveBanner = async (event: FormEvent) => {
    event.preventDefault()
    setSaving(true)
    setMessage("")

    try {
      const res = await fetch(editingId ? `/admin/banners/${editingId}` : "/admin/banners", {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        throw new Error(data?.message || "Failed to save banner")
      }

      setMessage(editingId ? "Banner updated." : "Banner created.")
      resetForm()
      await loadBanners()
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Failed to save banner")
    } finally {
      setSaving(false)
    }
  }

  const deleteSelectedBanner = async (banner: Banner) => {
    if (!window.confirm(`Delete "${banner.title}"?`)) {
      return
    }

    try {
      const res = await fetch(`/admin/banners/${banner.id}`, { method: "DELETE" })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data?.message || "Failed to delete banner")
      }

      if (editingId === banner.id) {
        resetForm()
      }

      setMessage("Banner deleted.")
      await loadBanners()
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Failed to delete banner")
    }
  }

  return (
    <Container className="p-6">
      <div className="flex flex-col gap-8">
        <div>
          <Heading level="h1">Banners</Heading>
          <Text className="text-ui-fg-subtle mt-2">
            Manage website banners and hero content.
          </Text>
        </div>

        {message && (
          <div className="rounded-md border border-ui-border-base bg-ui-bg-subtle px-4 py-3 text-sm text-ui-fg-base">
            {message}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <form onSubmit={saveBanner} className="rounded-lg border border-ui-border-base bg-ui-bg-base p-5">
            <div className="mb-5 flex items-center justify-between gap-3">
              <Heading level="h2">{editingId ? "Edit banner" : "New banner"}</Heading>
              {editingId && (
                <Button type="button" variant="secondary" onClick={resetForm}>
                  New banner
                </Button>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label>
                <span className={labelClass}>Title</span>
                <input className={inputClass} value={form.title} onChange={(e) => setForm((c) => ({ ...c, title: e.target.value }))} required />
              </label>
              <label>
                <span className={labelClass}>Subtitle</span>
                <input className={inputClass} value={form.subtitle} onChange={(e) => setForm((c) => ({ ...c, subtitle: e.target.value }))} />
              </label>
              <label>
                <span className={labelClass}>Position</span>
                <input className={inputClass} value={form.position} onChange={(e) => setForm((c) => ({ ...c, position: e.target.value }))} />
              </label>
              <label>
                <span className={labelClass}>CTA text</span>
                <input className={inputClass} value={form.cta_text} onChange={(e) => setForm((c) => ({ ...c, cta_text: e.target.value }))} />
              </label>
              <label className="md:col-span-2">
                <span className={labelClass}>Image URL</span>
                <input className={inputClass} value={form.image_url} onChange={(e) => setForm((c) => ({ ...c, image_url: e.target.value }))} required />
              </label>
              <label className="md:col-span-2">
                <span className={labelClass}>Link URL</span>
                <input className={inputClass} value={form.link_url} onChange={(e) => setForm((c) => ({ ...c, link_url: e.target.value }))} />
              </label>
              <label className="flex items-center gap-2 text-sm text-ui-fg-base">
                <input type="checkbox" checked={form.is_active} onChange={(e) => setForm((c) => ({ ...c, is_active: e.target.checked }))} />
                Active
              </label>
            </div>

            <div className="mt-5 flex justify-end">
              <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : editingId ? "Save changes" : "Create banner"}
              </Button>
            </div>
          </form>

          <div className="rounded-lg border border-ui-border-base bg-ui-bg-base p-5">
            <Heading level="h2">Current banners</Heading>
            {loading && <Text className="text-ui-fg-subtle mt-4">Loading banners...</Text>}
            <div className="mt-4 flex flex-col gap-3">
              {banners.map((banner) => (
                <div key={banner.id} className="rounded-md border border-ui-border-base p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <Text className="font-medium text-ui-fg-base">{banner.title}</Text>
                      <Text className="text-ui-fg-subtle text-xs">{banner.position}</Text>
                    </div>
                    <span className="rounded-full bg-ui-bg-subtle px-2 py-1 text-xs text-ui-fg-subtle">
                      {banner.is_active ? "Active" : "Hidden"}
                    </span>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <Button type="button" size="small" variant="secondary" onClick={() => editBanner(banner)}>
                      Edit
                    </Button>
                    <Button type="button" size="small" variant="danger" onClick={() => deleteSelectedBanner(banner)}>
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
  label: "Banner",
})

export default BannerPage
