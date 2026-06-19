import fs from "fs"
import path from "path"

export type PageSection = {
  heading: string
  body: string
}

export type PageFaq = {
  question: string
  answer: string
}

export type ManagedPage = {
  id: string
  key: string
  title: string
  intro: string
  sections: PageSection[]
  faqs: PageFaq[]
  is_published: boolean
  created_at: string
  updated_at: string
}

type PageInput = {
  key?: string
  title?: string
  intro?: string
  sections?: PageSection[]
  faqs?: PageFaq[]
  is_published?: boolean
}

type UpdatePageInput = Partial<PageInput>

const dataFile = path.join(process.cwd(), "static", "pages.json")
const pages = new Map<string, ManagedPage>()
let loaded = false

const nowISO = () => new Date().toISOString()

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")

const cleanSections = (sections?: PageSection[]) =>
  (Array.isArray(sections) ? sections : [])
    .map((section) => ({
      heading: String(section.heading || "").trim(),
      body: String(section.body || "").trim(),
    }))
    .filter((section) => section.heading || section.body)

const cleanFaqs = (faqs?: PageFaq[]) =>
  (Array.isArray(faqs) ? faqs : [])
    .map((faq) => ({
      question: String(faq.question || "").trim(),
      answer: String(faq.answer || "").trim(),
    }))
    .filter((faq) => faq.question || faq.answer)

const defaults: Array<Omit<ManagedPage, "id" | "created_at" | "updated_at">> = [
  {
    key: "home",
    title: "Pet Square",
    intro: "Food, care, toys, and accessories organized by pet type and daily routine.",
    sections: [],
    faqs: [
      {
        question: "How can I find the right product for my pet?",
        answer:
          "Start with your pet type, then filter by food, care, toys, or accessories. Product pages include details to help you compare.",
      },
      {
        question: "Can I buy products from different categories together?",
        answer:
          "Yes. Add any items to your cart and checkout together in one order.",
      },
      {
        question: "Are online payments secure?",
        answer:
          "Yes. Checkout uses secure payment flows and your payment details are not stored by the storefront.",
      },
    ],
    is_published: true,
  },
  {
    key: "faq",
    title: "Frequently asked questions",
    intro:
      "Everything you need to know about delivery, returns, product quality, and account support.",
    sections: [],
    faqs: [],
    is_published: true,
  },
  {
    key: "checkout",
    title: "Questions before you pay",
    intro: "Delivery, returns, and payment answers for a smoother checkout.",
    sections: [],
    faqs: [
      {
        question: "When will my order be delivered?",
        answer:
          "Delivery options and estimates are calculated during checkout after your address is entered.",
      },
      {
        question: "Are payments secure?",
        answer:
          "Yes. Payment details are handled through secure checkout fields and are not stored on this website.",
      },
    ],
    is_published: true,
  },
  {
    key: "category",
    title: "Help choosing the right product",
    intro:
      "Quick answers for browsing categories, subcategories, bundles, and pet-specific products.",
    sections: [],
    faqs: [
      {
        question: "How do I choose the right category?",
        answer:
          "Start with your pet type, then use subcategories for food, health, treats, or accessories.",
      },
      {
        question: "Can I mix products from different categories?",
        answer:
          "Yes. Add items from any category to your cart and checkout together in one order.",
      },
    ],
    is_published: true,
  },
  {
    key: "shipping",
    title: "Shipping",
    intro:
      "We process and dispatch orders quickly with careful packaging so your pet essentials arrive safely and on time.",
    sections: [
      {
        heading: "Processing Time",
        body:
          "Orders are processed within 1-2 business days after payment confirmation.",
      },
      {
        heading: "Delivery Time",
        body:
          "Standard delivery typically takes 3-7 business days depending on location.",
      },
      {
        heading: "Shipping Charges",
        body:
          "Shipping charges are calculated at checkout. Free shipping promotions may apply.",
      },
    ],
    faqs: [],
    is_published: true,
  },
  {
    key: "returns",
    title: "Returns",
    intro:
      "If something is not right with your order, we offer a clear return and refund flow to resolve it quickly.",
    sections: [
      {
        heading: "Return Window",
        body:
          "You can request a return within 7 days of delivery for eligible products in original condition.",
      },
      {
        heading: "Refund Timeline",
        body:
          "Once approved and inspected, refunds are processed to the original payment method within 5-10 business days.",
      },
    ],
    faqs: [],
    is_published: true,
  },
  {
    key: "terms",
    title: "Terms & Conditions",
    intro:
      "By using Pet Square, you agree to these terms covering orders, account usage, and general platform policies.",
    sections: [
      {
        heading: "Use of Service",
        body:
          "You agree to use this website lawfully and provide accurate account, shipping, and payment information.",
      },
      {
        heading: "Orders and Pricing",
        body:
          "All orders are subject to availability and confirmation. Prices can change without notice.",
      },
    ],
    faqs: [],
    is_published: true,
  },
  {
    key: "privacy-policy",
    title: "Privacy Policy",
    intro:
      "We value your privacy and handle your data responsibly for order fulfillment, support, and service improvements.",
    sections: [
      {
        heading: "Data We Collect",
        body:
          "We collect basic account details, delivery information, and order history needed to process purchases.",
      },
      {
        heading: "How We Use Data",
        body:
          "Your data is used for order processing, delivery updates, customer support, and service analytics.",
      },
    ],
    faqs: [],
    is_published: true,
  },
]

const seed = () => {
  const created = nowISO()
  defaults.forEach((page) => {
    pages.set(page.key, {
      id: `page_${page.key}`,
      ...page,
      created_at: created,
      updated_at: created,
    })
  })
}

const persist = () => {
  fs.mkdirSync(path.dirname(dataFile), { recursive: true })
  fs.writeFileSync(dataFile, JSON.stringify(Array.from(pages.values()), null, 2))
}

const ensureLoaded = () => {
  if (loaded) {
    return
  }

  loaded = true

  try {
    if (!fs.existsSync(dataFile)) {
      seed()
      persist()
      return
    }

    const rows = JSON.parse(fs.readFileSync(dataFile, "utf8")) as ManagedPage[]
    rows.forEach((page) => {
      if (page.key) {
        pages.set(page.key, page)
      }
    })

    defaults.forEach((page) => {
      if (!pages.has(page.key)) {
        const created = nowISO()
        pages.set(page.key, {
          id: `page_${page.key}`,
          ...page,
          created_at: created,
          updated_at: created,
        })
      }
    })
  } catch {
    pages.clear()
    seed()
  }
}

export const listPages = () => {
  ensureLoaded()
  return Array.from(pages.values()).sort((a, b) => a.key.localeCompare(b.key))
}

export const getPage = (key: string) => {
  ensureLoaded()
  return pages.get(key)
}

export const getPublishedPage = (key: string) => {
  const page = getPage(key)
  return page?.is_published ? page : undefined
}

export const listFaqs = (pageKey?: string) => {
  ensureLoaded()

  if (pageKey) {
    return pages.get(pageKey)?.faqs || []
  }

  return Array.from(pages.values()).flatMap((page) => page.faqs)
}

export const createPage = (input: PageInput): ManagedPage => {
  ensureLoaded()

  const key = slugify(input.key || input.title || "")

  if (!key || !input.title?.trim()) {
    throw new Error("key and title are required")
  }

  if (pages.has(key)) {
    throw new Error("page key must be unique")
  }

  const created = nowISO()
  const page: ManagedPage = {
    id: `page_${key}`,
    key,
    title: input.title.trim(),
    intro: input.intro?.trim() || "",
    sections: cleanSections(input.sections),
    faqs: cleanFaqs(input.faqs),
    is_published: input.is_published ?? true,
    created_at: created,
    updated_at: created,
  }

  pages.set(key, page)
  persist()

  return page
}

export const updatePage = (key: string, input: UpdatePageInput) => {
  ensureLoaded()

  const current = pages.get(key)

  if (!current) {
    return undefined
  }

  const nextKey = input.key === undefined ? current.key : slugify(input.key)

  if (!nextKey) {
    throw new Error("key is required")
  }

  if (nextKey !== key && pages.has(nextKey)) {
    throw new Error("page key must be unique")
  }

  const updated: ManagedPage = {
    ...current,
    key: nextKey,
    title:
      input.title === undefined ? current.title : input.title.trim() || current.title,
    intro: input.intro === undefined ? current.intro : input.intro.trim(),
    sections:
      input.sections === undefined
        ? current.sections
        : cleanSections(input.sections),
    faqs: input.faqs === undefined ? current.faqs : cleanFaqs(input.faqs),
    is_published: input.is_published ?? current.is_published,
    updated_at: nowISO(),
  }

  pages.delete(key)
  pages.set(nextKey, updated)
  persist()

  return updated
}

export const deletePage = (key: string) => {
  ensureLoaded()
  const ok = pages.delete(key)

  if (ok) {
    persist()
  }

  return ok
}
