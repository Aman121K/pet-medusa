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

export type PageSeo = {
  title: string
  description: string
  keywords: string
  canonical_url: string
  og_title: string
  og_description: string
  og_image_url: string
  robots: string
}

export type ManagedPage = {
  id: string
  key: string
  title: string
  intro: string
  sections: PageSection[]
  faqs: PageFaq[]
  seo: PageSeo
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
  seo?: Partial<PageSeo>
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

const cleanSeo = (seo: Partial<PageSeo> | undefined, page: { key: string; title: string; intro: string }): PageSeo => ({
  title: String(seo?.title || `${page.title} | Pet Square`).trim(),
  description: String(seo?.description || page.intro || `${page.title} from Pet Square`).trim(),
  keywords: String(seo?.keywords || "pet supplies, pet food, pet care, pet accessories, Pet Square").trim(),
  canonical_url: String(seo?.canonical_url || "").trim(),
  og_title: String(seo?.og_title || seo?.title || `${page.title} | Pet Square`).trim(),
  og_description: String(seo?.og_description || seo?.description || page.intro || "").trim(),
  og_image_url: String(seo?.og_image_url || "").trim(),
  robots: String(seo?.robots || "index,follow").trim(),
})

const normalizePage = (page: ManagedPage): ManagedPage => ({
  ...page,
  sections: cleanSections(page.sections),
  faqs: cleanFaqs(page.faqs),
  seo: cleanSeo(page.seo, page),
})

const defaults: Array<Omit<ManagedPage, "id" | "created_at" | "updated_at">> = [
  {
    key: "home",
    title: "Pet Square",
    intro: "Curated food, care, toys, and accessories for dogs, cats, birds, fish, and small pets.",
    sections: [
      {
        heading: "Curated by Pet Type",
        body: "Browse essentials organized around real pet routines, from daily meals to grooming, comfort, and play.",
      },
      {
        heading: "Trusted Everyday Staples",
        body: "Highlight food, treats, bedding, toys, and care products your customers can reorder with confidence.",
      },
      {
        heading: "Fast Shopping Flow",
        body: "Customers can move from category to product detail quickly with clean product cards and clear calls to action.",
      },
      {
        heading: "Admin Managed Content",
        body: "Hero copy, FAQs, SEO tags, blogs, and page sections can be maintained from the Medusa admin panel.",
      },
    ],
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
      {
        question: "Can I manage homepage content from Medusa?",
        answer:
          "Yes. Page SEO, page copy, FAQs, banners, blogs, products, and categories are connected to Medusa-managed content.",
      },
      {
        question: "How often should product content be updated?",
        answer:
          "Review featured products, categories, and banners regularly so the homepage stays fresh and commercially useful.",
      },
    ],
    seo: {
      title: "Pet Square | Pet Food, Toys, Care & Accessories",
      description:
        "Shop pet food, toys, care products, bedding, and accessories for dogs, cats, birds, fish, and small pets at Pet Square.",
      keywords: "pet supplies, pet food, dog food, cat food, pet toys, pet accessories, Pet Square",
      canonical_url: "/",
      og_title: "Pet Square | Everyday Essentials for Happy Pets",
      og_description:
        "Curated pet food, care, toys, and accessories managed from the Pet Square Medusa store.",
      og_image_url: "",
      robots: "index,follow",
    },
    is_published: true,
  },
  {
    key: "shop",
    title: "Shop Pet Supplies",
    intro: "Browse pet food, treats, toys, care, bedding, and accessories by category.",
    sections: [
      { heading: "Food and Nutrition", body: "Keep core food and treat ranges easy to compare by pet type and routine." },
      { heading: "Toys and Enrichment", body: "Show interactive toys, comfort toys, and everyday play products clearly." },
      { heading: "Care and Grooming", body: "Group grooming, hygiene, health, and travel products for easy discovery." },
      { heading: "Bedding and Accessories", body: "Surface beds, bowls, leads, collars, and home essentials in one flow." },
    ],
    faqs: [
      { question: "Can I filter products by category?", answer: "Yes. Use category navigation to browse products by pet type and product need." },
      { question: "Where do prices come from?", answer: "Product prices come from Medusa variant pricing for the active store region." },
      { question: "Can products be updated in admin?", answer: "Yes. Product titles, descriptions, media, variants, and prices are managed in Medusa." },
      { question: "Why does a product show unavailable?", answer: "A product can show unavailable until its variant has a valid price configured." },
    ],
    seo: {
      title: "Shop Pet Supplies | Pet Square",
      description: "Shop pet food, toys, care products, bedding, and accessories by category at Pet Square.",
      keywords: "shop pet supplies, pet products, dog supplies, cat supplies, pet accessories",
      canonical_url: "/shop",
      og_title: "Shop Pet Supplies at Pet Square",
      og_description: "Browse pet products organized by category and pet routine.",
      og_image_url: "",
      robots: "index,follow",
    },
    is_published: true,
  },
  {
    key: "blog",
    title: "Pet Care Blog",
    intro: "Practical care guides, product education, nutrition tips, and seasonal advice for pet owners.",
    sections: [
      { heading: "Nutrition Guides", body: "Publish food, treat, and feeding advice that helps customers buy confidently." },
      { heading: "Care Routines", body: "Share grooming, hygiene, travel, and seasonal care content for everyday pet owners." },
      { heading: "Product Education", body: "Explain how to choose toys, bedding, collars, bowls, and category essentials." },
      { heading: "Store Updates", body: "Use blogs for launches, promotions, buying guides, and timely announcements." },
    ],
    faqs: [
      { question: "Who writes the blog content?", answer: "Your admin team can publish and update blog content from the Medusa admin panel." },
      { question: "Can blogs support SEO?", answer: "Yes. Blog titles, excerpts, categories, and page SEO help search-friendly content structure." },
      { question: "Can blog content link to products?", answer: "Yes. Add product links and category links inside blog content where useful." },
      { question: "How many blogs should appear?", answer: "Keep at least four to five helpful articles visible so the page feels complete." },
    ],
    seo: {
      title: "Pet Care Blog | Nutrition, Training & Product Guides | Pet Square",
      description: "Read Pet Square guides on pet nutrition, care routines, toys, accessories, and everyday pet wellness.",
      keywords: "pet blog, pet care guides, pet nutrition, dog care, cat care, pet wellness",
      canonical_url: "/blog",
      og_title: "Pet Care Blog by Pet Square",
      og_description: "Helpful pet care, nutrition, training, and shopping guides.",
      og_image_url: "",
      robots: "index,follow",
    },
    is_published: true,
  },
  {
    key: "about",
    title: "About Pet Square",
    intro: "A pet-first store focused on useful products, reliable service, and clear shopping guidance.",
    sections: [
      { heading: "Our Promise", body: "Make pet shopping easier with clear categories, useful product information, and dependable support." },
      { heading: "Product Standards", body: "Keep product ranges organized, practical, and easy for customers to compare." },
      { heading: "Customer Support", body: "Help shoppers choose the right product before and after purchase." },
      { heading: "Content Managed in Medusa", body: "Use Pages in admin to keep brand copy and SEO current without code changes." },
    ],
    faqs: [
      { question: "What is Pet Square?", answer: "Pet Square is an ecommerce store for pet food, toys, care products, and accessories." },
      { question: "Who manages the website content?", answer: "Your admin users can manage content, products, categories, banners, blogs, and SEO from Medusa." },
      { question: "Can the About page be edited?", answer: "Yes. Use the Pages section in Medusa admin and edit the page key about." },
      { question: "Can SEO be changed later?", answer: "Yes. SEO fields are editable per page from Medusa admin." },
    ],
    seo: {
      title: "About Pet Square | Pet Supplies Store",
      description: "Learn about Pet Square, a pet supplies store focused on food, toys, care products, accessories, and reliable shopping support.",
      keywords: "about Pet Square, pet store, pet supplies store, pet ecommerce",
      canonical_url: "/about",
      og_title: "About Pet Square",
      og_description: "A pet-first store for food, care, toys, and accessories.",
      og_image_url: "",
      robots: "index,follow",
    },
    is_published: true,
  },
  {
    key: "contact",
    title: "Contact Pet Square",
    intro: "Reach the Pet Square team for product help, order questions, partnerships, and support.",
    sections: [
      { heading: "Customer Support", body: "Use the contact form for order help, product questions, and account support." },
      { heading: "Product Questions", body: "Ask before buying when you need help choosing size, type, food, care, or accessories." },
      { heading: "Business Enquiries", body: "Send partnership, wholesale, or operational enquiries through the same support flow." },
      { heading: "Response Window", body: "Keep support hours and response expectations updated from the admin page content." },
    ],
    faqs: [
      { question: "How can I contact Pet Square?", answer: "Use the contact form, email, or phone details shown on the Contact page." },
      { question: "When will support reply?", answer: "Support response times can be defined by the admin team in this page content." },
      { question: "Can I ask about products before buying?", answer: "Yes. Share your pet type and product need so support can guide you." },
      { question: "Can contact SEO be edited?", answer: "Yes. Update the contact page SEO object in Medusa Pages." },
    ],
    seo: {
      title: "Contact Pet Square | Customer Support",
      description: "Contact Pet Square for order support, product questions, pet supply guidance, and business enquiries.",
      keywords: "contact Pet Square, pet store support, pet product help, customer service",
      canonical_url: "/contact",
      og_title: "Contact Pet Square",
      og_description: "Get support for orders, products, and pet shopping questions.",
      og_image_url: "",
      robots: "index,follow",
    },
    is_published: true,
  },
  {
    key: "faq",
    title: "Frequently asked questions",
    intro:
      "Everything you need to know about delivery, returns, product quality, and account support.",
    sections: [
      { heading: "Shopping", body: "Find answers about categories, products, pricing, and checkout." },
      { heading: "Orders", body: "Understand order confirmation, delivery, returns, and support flows." },
      { heading: "Accounts", body: "Help customers understand registration, login, and account basics." },
      { heading: "Content", body: "Keep page-specific FAQs updated from Medusa Pages." },
    ],
    faqs: [
      { question: "Where do FAQs come from?", answer: "FAQs are managed from the Pages section in Medusa admin." },
      { question: "Can each page have different FAQs?", answer: "Yes. Checkout, category, blog, and other pages can each have their own FAQ set." },
      { question: "Can I edit FAQ SEO?", answer: "Yes. Edit the seo object on the faq page in Medusa Pages." },
      { question: "How many FAQs should I add?", answer: "Use at least four to five high-quality FAQs for important pages." },
    ],
    seo: {
      title: "Pet Square FAQs | Delivery, Returns, Orders & Products",
      description: "Find answers to common Pet Square questions about products, orders, delivery, returns, checkout, and support.",
      keywords: "Pet Square FAQs, pet store questions, delivery FAQs, returns FAQs, order support",
      canonical_url: "/faq",
      og_title: "Pet Square Frequently Asked Questions",
      og_description: "Helpful answers for shopping, delivery, returns, checkout, and support.",
      og_image_url: "",
      robots: "index,follow",
    },
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
      {
        question: "Can I update my cart before payment?",
        answer:
          "Yes. Review quantities and items before moving into the payment step.",
      },
      {
        question: "Where are discount codes applied?",
        answer:
          "Discount and promotion codes can be validated during the checkout flow when configured in Medusa.",
      },
    ],
    seo: {
      title: "Checkout Help | Pet Square",
      description: "Review checkout help for Pet Square orders, delivery options, payment security, discounts, and cart updates.",
      keywords: "checkout help, pet store checkout, payment security, delivery options, Pet Square",
      canonical_url: "/checkout",
      og_title: "Checkout Help | Pet Square",
      og_description: "Answers for delivery, payment, discounts, and order review before checkout.",
      og_image_url: "",
      robots: "noindex,follow",
    },
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
      {
        question: "Can category FAQs be different from checkout FAQs?",
        answer:
          "Yes. Each page key can keep its own FAQ list in Medusa Pages.",
      },
      {
        question: "How many category items should be visible?",
        answer:
          "Aim for at least four to five categories so shoppers can quickly understand the store range.",
      },
    ],
    seo: {
      title: "Pet Product Categories | Pet Square",
      description: "Browse Pet Square categories for food, toys, care, bedding, clothing, and accessories by pet type.",
      keywords: "pet categories, dog products, cat products, pet food, pet toys, pet accessories",
      canonical_url: "/shop",
      og_title: "Pet Product Categories | Pet Square",
      og_description: "Find the right products by pet type, category, and shopping routine.",
      og_image_url: "",
      robots: "index,follow",
    },
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
      {
        heading: "Order Tracking",
        body:
          "Tracking details are shared after dispatch when carrier tracking is available.",
      },
    ],
    faqs: [
      { question: "How long does shipping take?", answer: "Standard delivery typically takes 3-7 business days depending on location." },
      { question: "When are orders processed?", answer: "Orders are usually processed within 1-2 business days after payment confirmation." },
      { question: "How are shipping charges calculated?", answer: "Shipping charges are calculated at checkout based on order and delivery details." },
      { question: "Will I receive tracking?", answer: "Tracking is provided when it is available from the delivery carrier." },
    ],
    seo: {
      title: "Shipping Information | Pet Square",
      description: "Learn about Pet Square shipping times, order processing, delivery charges, tracking, and dispatch information.",
      keywords: "Pet Square shipping, pet supplies delivery, order tracking, shipping charges",
      canonical_url: "/shipping",
      og_title: "Shipping Information | Pet Square",
      og_description: "Delivery, dispatch, and tracking information for Pet Square orders.",
      og_image_url: "",
      robots: "index,follow",
    },
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
      {
        heading: "Return Condition",
        body:
          "Returned products should be unused, complete, and in original packaging unless a fault has been confirmed.",
      },
      {
        heading: "Support Review",
        body:
          "Contact support with order details and photos when your request needs review.",
      },
    ],
    faqs: [
      { question: "How long do I have to request a return?", answer: "You can request a return within 7 days of delivery for eligible items." },
      { question: "When will I receive a refund?", answer: "Approved refunds are processed within 5-10 business days after inspection." },
      { question: "Do products need original packaging?", answer: "Yes. Eligible returns should usually be unused and in original packaging." },
      { question: "How do I start a return?", answer: "Contact support with your order details and the reason for return." },
    ],
    seo: {
      title: "Returns & Refunds | Pet Square",
      description: "Read Pet Square return policy details, refund timelines, eligibility, packaging requirements, and support steps.",
      keywords: "Pet Square returns, refund policy, pet store returns, order refund",
      canonical_url: "/returns",
      og_title: "Returns & Refunds | Pet Square",
      og_description: "Return eligibility, refund timelines, and support steps for Pet Square orders.",
      og_image_url: "",
      robots: "index,follow",
    },
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
      {
        heading: "Product Information",
        body:
          "Product descriptions, images, and availability should be reviewed by customers before purchase.",
      },
      {
        heading: "Policy Updates",
        body:
          "Terms may be updated when store policies, services, or legal requirements change.",
      },
    ],
    faqs: [
      { question: "When do these terms apply?", answer: "They apply when customers browse, create accounts, place orders, or use the website." },
      { question: "Can prices change?", answer: "Yes. Prices and promotions may change without notice." },
      { question: "Are orders always accepted?", answer: "Orders are subject to product availability and confirmation." },
      { question: "Can terms be updated?", answer: "Yes. Terms can be updated as the store and policies change." },
    ],
    seo: {
      title: "Terms & Conditions | Pet Square",
      description: "Read the Pet Square terms covering website use, orders, pricing, product information, and policy updates.",
      keywords: "Pet Square terms, terms and conditions, pet store policy, ecommerce terms",
      canonical_url: "/terms",
      og_title: "Terms & Conditions | Pet Square",
      og_description: "Website, order, pricing, and policy terms for Pet Square customers.",
      og_image_url: "",
      robots: "index,follow",
    },
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
      {
        heading: "Data Sharing",
        body:
          "Data may be shared with service providers needed for payments, delivery, support, and store operations.",
      },
      {
        heading: "Customer Choices",
        body:
          "Customers can contact support for privacy questions or account data requests.",
      },
    ],
    faqs: [
      { question: "What data does Pet Square collect?", answer: "Basic account, order, delivery, and support information needed to run the store." },
      { question: "Why is data used?", answer: "Data is used for orders, delivery updates, support, and service improvements." },
      { question: "Is payment data stored?", answer: "Payment details are handled through secure payment flows and are not stored by the storefront." },
      { question: "How can I ask a privacy question?", answer: "Contact support with your privacy or data request." },
    ],
    seo: {
      title: "Privacy Policy | Pet Square",
      description: "Learn how Pet Square collects, uses, and protects customer data for orders, delivery, support, and service improvements.",
      keywords: "Pet Square privacy policy, customer data, ecommerce privacy, pet store privacy",
      canonical_url: "/privacy-policy",
      og_title: "Privacy Policy | Pet Square",
      og_description: "How Pet Square handles customer data, orders, support, and privacy requests.",
      og_image_url: "",
      robots: "index,follow",
    },
    is_published: true,
  },
]

const fillItems = <T extends Record<string, string>>(
  current: T[],
  fallback: T[] | undefined,
  minCount: number,
  uniqueKey: keyof T
) => {
  const next = [...current]
  const seen = new Set(next.map((item) => String(item[uniqueKey]).toLowerCase()))

  ;(fallback || []).forEach((item) => {
    const key = String(item[uniqueKey]).toLowerCase()
    if (!seen.has(key) && next.length < minCount) {
      next.push(item)
    }
  })

  return next
}

const mergeDefaultContent = (page: ManagedPage): ManagedPage => {
  const fallback = defaults.find((row) => row.key === page.key)
  const normalized = normalizePage({
    ...page,
    seo: page.seo || fallback?.seo,
  })

  if (!fallback) {
    return normalized
  }

  return {
    ...normalized,
    sections: fillItems(normalized.sections, fallback.sections, 4, "heading"),
    faqs: fillItems(normalized.faqs, fallback.faqs, 4, "question"),
    seo: cleanSeo(page.seo || fallback.seo, normalized),
  }
}

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
        pages.set(page.key, mergeDefaultContent(page))
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
    seo: cleanSeo(input.seo, {
      key,
      title: input.title.trim(),
      intro: input.intro?.trim() || "",
    }),
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
    seo:
      input.seo === undefined
        ? cleanSeo(current.seo, {
            key: nextKey,
            title:
              input.title === undefined
                ? current.title
                : input.title.trim() || current.title,
            intro: input.intro === undefined ? current.intro : input.intro.trim(),
          })
        : cleanSeo(input.seo, {
            key: nextKey,
            title:
              input.title === undefined
                ? current.title
                : input.title.trim() || current.title,
            intro: input.intro === undefined ? current.intro : input.intro.trim(),
          }),
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
