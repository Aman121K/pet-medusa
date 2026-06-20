import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Button, Container, Heading, Text } from "@medusajs/ui"
import { FormEvent, useEffect, useState } from "react"

type PageSection = {
  heading: string
  body: string
}

type PageFaq = {
  question: string
  answer: string
}

type PageSeo = {
  title: string
  description: string
  keywords: string
  canonical_url: string
  og_title: string
  og_description: string
  og_image_url: string
  robots: string
}

type ManagedPage = {
  key: string
  title: string
  intro: string
  sections: PageSection[]
  faqs: PageFaq[]
  seo: PageSeo
  is_published: boolean
}

type PageForm = {
  key: string
  title: string
  intro: string
  sectionsText: string
  faqsText: string
  seoText: string
  is_published: boolean
}

const emptyForm: PageForm = {
  key: "",
  title: "",
  intro: "",
  sectionsText: "[]",
  faqsText: "[]",
  seoText: JSON.stringify(
    {
      title: "",
      description: "",
      keywords: "",
      canonical_url: "",
      og_title: "",
      og_description: "",
      og_image_url: "",
      robots: "index,follow",
    },
    null,
    2
  ),
  is_published: true,
}

const inputClass =
  "w-full rounded-md border border-ui-border-base bg-ui-bg-base px-3 py-2 text-sm text-ui-fg-base outline-none transition focus:border-ui-border-interactive"

const labelClass = "mb-1 block text-xs font-medium text-ui-fg-subtle"

const parseJsonArray = <T,>(value: string, field: string): T[] => {
  const parsed = JSON.parse(value || "[]")

  if (!Array.isArray(parsed)) {
    throw new Error(`${field} must be a JSON array`)
  }

  return parsed
}

const parseJsonObject = <T,>(value: string, field: string): T => {
  const parsed = JSON.parse(value || "{}")

  if (!parsed || Array.isArray(parsed) || typeof parsed !== "object") {
    throw new Error(`${field} must be a JSON object`)
  }

  return parsed
}

const PagesPage = () => {
  const [pages, setPages] = useState<ManagedPage[]>([])
  const [form, setForm] = useState<PageForm>(emptyForm)
  const [editingKey, setEditingKey] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState("")

  const loadPages = async () => {
    setLoading(true)

    try {
      const res = await fetch("/admin/pages")
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data?.message || "Failed to load pages")
      }

      setPages(data.pages || [])
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Failed to load pages")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPages()
  }, [])

  const editPage = (page: ManagedPage) => {
    setEditingKey(page.key)
    setForm({
      key: page.key,
      title: page.title,
      intro: page.intro,
      sectionsText: JSON.stringify(page.sections || [], null, 2),
      faqsText: JSON.stringify(page.faqs || [], null, 2),
      seoText: JSON.stringify(page.seo || {}, null, 2),
      is_published: page.is_published,
    })
    setMessage("")
  }

  const resetForm = () => {
    setEditingKey(null)
    setForm(emptyForm)
    setMessage("")
  }

  const savePage = async (event: FormEvent) => {
    event.preventDefault()
    setSaving(true)
    setMessage("")

    try {
      const body = {
        key: form.key,
        title: form.title,
        intro: form.intro,
        sections: parseJsonArray<PageSection>(form.sectionsText, "Sections"),
        faqs: parseJsonArray<PageFaq>(form.faqsText, "FAQs"),
        seo: parseJsonObject<PageSeo>(form.seoText, "SEO"),
        is_published: form.is_published,
      }

      const res = await fetch(editingKey ? `/admin/pages/${editingKey}` : "/admin/pages", {
        method: editingKey ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        throw new Error(data?.message || "Failed to save page")
      }

      setMessage(editingKey ? "Page updated." : "Page created.")
      setEditingKey(data?.page?.key || null)
      await loadPages()
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Failed to save page")
    } finally {
      setSaving(false)
    }
  }

  const deleteSelectedPage = async (page: ManagedPage) => {
    if (!window.confirm(`Delete "${page.title}"?`)) {
      return
    }

    try {
      const res = await fetch(`/admin/pages/${page.key}`, { method: "DELETE" })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data?.message || "Failed to delete page")
      }

      if (editingKey === page.key) {
        resetForm()
      }

      setMessage("Page deleted.")
      await loadPages()
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Failed to delete page")
    }
  }

  return (
    <Container className="p-6">
      <div className="flex flex-col gap-8">
        <div>
          <Heading level="h1">Pages</Heading>
          <Text className="text-ui-fg-subtle mt-2">
            Manage website page copy and page-specific FAQ blocks.
          </Text>
        </div>

        {message && (
          <div className="rounded-md border border-ui-border-base bg-ui-bg-subtle px-4 py-3 text-sm text-ui-fg-base">
            {message}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <form
            onSubmit={savePage}
            className="rounded-lg border border-ui-border-base bg-ui-bg-base p-5"
          >
            <div className="mb-5 flex items-center justify-between gap-3">
              <Heading level="h2">{editingKey ? `Edit ${editingKey}` : "New page"}</Heading>
              {editingKey && (
                <Button type="button" variant="secondary" onClick={resetForm}>
                  New page
                </Button>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label>
                <span className={labelClass}>Page key</span>
                <input
                  className={inputClass}
                  value={form.key}
                  onChange={(e) => setForm((current) => ({ ...current, key: e.target.value }))}
                  placeholder="checkout"
                  required
                />
              </label>

              <label>
                <span className={labelClass}>Title</span>
                <input
                  className={inputClass}
                  value={form.title}
                  onChange={(e) => setForm((current) => ({ ...current, title: e.target.value }))}
                  required
                />
              </label>

              <label className="md:col-span-2">
                <span className={labelClass}>Intro</span>
                <textarea
                  className={`${inputClass} min-h-[80px]`}
                  value={form.intro}
                  onChange={(e) => setForm((current) => ({ ...current, intro: e.target.value }))}
                />
              </label>

              <label className="md:col-span-2">
                <span className={labelClass}>SEO JSON</span>
                <textarea
                  className={`${inputClass} min-h-[220px] font-mono`}
                  value={form.seoText}
                  onChange={(e) =>
                    setForm((current) => ({ ...current, seoText: e.target.value }))
                  }
                />
              </label>

              <label className="md:col-span-2">
                <span className={labelClass}>Sections JSON</span>
                <textarea
                  className={`${inputClass} min-h-[180px] font-mono`}
                  value={form.sectionsText}
                  onChange={(e) =>
                    setForm((current) => ({ ...current, sectionsText: e.target.value }))
                  }
                />
              </label>

              <label className="md:col-span-2">
                <span className={labelClass}>FAQs JSON</span>
                <textarea
                  className={`${inputClass} min-h-[220px] font-mono`}
                  value={form.faqsText}
                  onChange={(e) =>
                    setForm((current) => ({ ...current, faqsText: e.target.value }))
                  }
                />
              </label>

              <label className="flex items-center gap-2 text-sm text-ui-fg-base">
                <input
                  type="checkbox"
                  checked={form.is_published}
                  onChange={(e) =>
                    setForm((current) => ({
                      ...current,
                      is_published: e.target.checked,
                    }))
                  }
                />
                Published
              </label>
            </div>

            <div className="mt-5 flex justify-end">
              <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : editingKey ? "Save changes" : "Create page"}
              </Button>
            </div>
          </form>

          <div className="rounded-lg border border-ui-border-base bg-ui-bg-base p-5">
            <Heading level="h2">Website pages</Heading>

            {loading && (
              <Text className="text-ui-fg-subtle mt-4">Loading pages...</Text>
            )}

            <div className="mt-4 flex flex-col gap-3">
              {pages.map((page) => (
                <div key={page.key} className="rounded-md border border-ui-border-base p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <Text className="font-medium text-ui-fg-base">{page.title}</Text>
                      <Text className="text-ui-fg-subtle text-xs">{page.key}</Text>
                    </div>
                    <span className="rounded-full bg-ui-bg-subtle px-2 py-1 text-xs text-ui-fg-subtle">
                      {page.is_published ? "Published" : "Draft"}
                    </span>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <Button type="button" size="small" variant="secondary" onClick={() => editPage(page)}>
                      Edit
                    </Button>
                    <Button type="button" size="small" variant="danger" onClick={() => deleteSelectedPage(page)}>
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
  label: "Pages",
})

export default PagesPage
