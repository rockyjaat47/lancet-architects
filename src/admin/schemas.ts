import type { Field, Obj } from "./Form";
import { slugify } from "./images";

/** Content files the admin edits (paths in the GitHub repository). */
export const FILES = {
  site: "content/site.json",
  projects: "content/projects.json",
  gallery: "content/gallery.json",
  journal: "content/journal.json",
  about: "content/about.json",
  team: "content/team.json",
  services: "content/services.json",
  testimonials: "content/testimonials.json",
} as const;
export type FileKey = keyof typeof FILES;
export type Data = Record<FileKey, unknown>;

export const PROJECT_CATEGORIES = [
  { value: "residential", label: "Residential" },
  { value: "commercial", label: "Commercial" },
  { value: "healthcare", label: "Healthcare" },
  { value: "institutional", label: "Institutional" },
  { value: "landscape", label: "Landscape" },
  { value: "public", label: "Public" },
  { value: "interior", label: "Interior" },
];
export const BLOG_CATEGORIES = [
  { value: "architecture", label: "Architecture" },
  { value: "interior", label: "Interior" },
  { value: "news", label: "News" },
];

const s = (o: Obj, k: string) => String(o?.[k] ?? "");

// ---------------- collections (lists of items with their own editor) ----------------

export type CollectionDef = {
  file: FileKey;
  title: string;
  intro: string;
  noun: string; // "project"
  fields: (data: Data) => Field[];
  titleOf: (o: Obj) => string;
  subtitleOf?: (o: Obj) => string;
  thumbOf?: (o: Obj) => string;
  make: () => Obj;
  /** item keeps a URL slug generated from its title */
  slug?: boolean;
  /** extra validation, returns error messages */
  validate?: (o: Obj, all: Obj[]) => string[];
  viewUrl?: (o: Obj) => string;
};

export const projectsDef: CollectionDef = {
  file: "projects",
  title: "Projects",
  intro: "Projects appear on the home slider, the Projects page (with the category filter), in the sitemap and on their own page. The order here is the display order.",
  noun: "project",
  slug: true,
  make: () => ({ slug: "", title: "", category: "residential", location: "Lucknow, Uttar Pradesh", surface: "", year: "", client: "", excerpt: "", description: [], cover: "", alt: "", gallery: [] }),
  titleOf: (o) => s(o, "title"),
  subtitleOf: (o) => [PROJECT_CATEGORIES.find((c) => c.value === o.category)?.label, o.location, o.year].filter(Boolean).join(" · "),
  thumbOf: (o) => s(o, "cover"),
  viewUrl: (o) => `/projects/${s(o, "slug")}/`,
  fields: () => [
    { k: "title", label: "Project name", type: "text", required: true, placeholder: "e.g. Modern Family Residence" },
    { k: "category", label: "Category", type: "select", options: PROJECT_CATEGORIES, help: "Used by the filter on the Projects page." },
    { k: "location", label: "Location", type: "text", placeholder: "Gomti Nagar, Lucknow" },
    { k: "surface", label: "Area", type: "text", placeholder: "e.g. 4,500 sq ft", help: "Leave empty to hide." },
    { k: "year", label: "Completion year", type: "text", placeholder: "e.g. 2024", help: "Leave empty to hide." },
    { k: "client", label: "Client", type: "text", help: "Only if the client agrees to be named. Leave empty to hide." },
    { k: "excerpt", label: "Short summary", type: "textarea", rows: 2, required: true, help: "1–2 sentences. Shown in Google results and when the page is shared." },
    { k: "description", label: "Description", type: "paragraphs", required: true },
    { k: "cover", label: "Main photo", type: "image", folder: "projects", required: true, help: "Shown on the slider, the project list and at the top of the project page. Landscape photos work best." },
    { k: "alt", label: "Main photo description", type: "text", required: true, help: "Describe the photo for Google and screen readers, e.g. “Front elevation of the hospital at sunset”." },
    { k: "gallery", label: "More photos", type: "images", folder: "projects" },
  ],
};

export const blogDef: CollectionDef = {
  file: "journal",
  title: "Blog",
  intro: "Blog posts appear on the Blog page, newest first. Write the article in the “Article text” box at the bottom.",
  noun: "post",
  slug: true,
  make: () => ({ slug: "", title: "", category: "architecture", date: new Date().toISOString().slice(0, 10), excerpt: "", cover: "", alt: "" }),
  titleOf: (o) => s(o, "title"),
  subtitleOf: (o) => [BLOG_CATEGORIES.find((c) => c.value === o.category)?.label, o.date].filter(Boolean).join(" · "),
  thumbOf: (o) => s(o, "cover"),
  viewUrl: (o) => `/blog/${s(o, "slug")}/`,
  fields: () => [
    { k: "title", label: "Title", type: "text", required: true },
    { k: "category", label: "Category", type: "select", options: BLOG_CATEGORIES },
    { k: "date", label: "Date", type: "date", required: true },
    { k: "excerpt", label: "Summary", type: "textarea", rows: 3, required: true, help: "Shown on the Blog page and in Google results." },
    { k: "cover", label: "Cover photo", type: "image", folder: "blog", required: true },
    { k: "alt", label: "Cover photo description", type: "text", required: true },
  ],
};

export const galleryDef: CollectionDef = {
  file: "gallery",
  title: "Gallery",
  intro: "Photos on the Gallery page. Photos not linked to a project also appear on the home slider.",
  noun: "photo",
  make: () => ({ src: "", alt: "", label: "" }),
  titleOf: (o) => s(o, "alt") || "Untitled photo",
  subtitleOf: (o) => s(o, "project") || s(o, "label"),
  thumbOf: (o) => s(o, "src"),
  fields: (data) => [
    { k: "src", label: "Photo", type: "image", folder: "gallery", required: true },
    { k: "alt", label: "Photo description", type: "text", required: true, help: "e.g. “Modular kitchen with walnut cabinets”." },
    {
      k: "project",
      label: "Belongs to project",
      type: "select",
      options: [{ value: "", label: "— None —" }, ...((data.projects as Obj[]) ?? []).map((p) => ({ value: s(p, "slug"), label: s(p, "title") }))],
      help: "Linked photos open the project page.",
    },
    { k: "label", label: "Label (if not linked to a project)", type: "text", placeholder: "Interior Design" },
  ],
};

export const teamDef: CollectionDef = {
  file: "team",
  title: "Team",
  intro: "The FIRST person is shown as the director (photo, qualifications and message on the About page). Everyone else appears in the “Meet the team” grid.",
  noun: "person",
  make: () => ({ name: "", role: "", qualifications: "", experience: "", photo: "", alt: "", bio: [] }),
  titleOf: (o) => s(o, "name") || s(o, "role") || "Unnamed",
  subtitleOf: (o) => s(o, "role"),
  thumbOf: (o) => s(o, "photo"),
  fields: () => [
    { k: "name", label: "Full name", type: "text" },
    { k: "role", label: "Designation", type: "text", required: true, placeholder: "e.g. Senior Interior Designer" },
    { k: "qualifications", label: "Qualifications", type: "text", placeholder: "e.g. B.Arch, M.Plan — CoA reg. no. …" },
    { k: "experience", label: "Experience", type: "text", placeholder: "e.g. 15 years in residential & healthcare projects" },
    { k: "photo", label: "Photo", type: "image", folder: "team", required: true, help: "Portrait photo, plain background preferred." },
    { k: "alt", label: "Photo description", type: "text", placeholder: "Portrait of …" },
    { k: "bio", label: "Message / biography (director)", type: "paragraphs", help: "Shown for the director only. Leave an empty line between paragraphs." },
  ],
  validate: (o, all) => (all.indexOf(o) > 0 && !s(o, "name") ? ["Team members need a name"] : []),
};

export const testimonialsDef: CollectionDef = {
  file: "testimonials",
  title: "Client reviews",
  intro: "Reviews shown on the About page (with the average rating).",
  noun: "review",
  make: () => ({ name: "", text: "", rating: 5 }),
  titleOf: (o) => s(o, "name"),
  subtitleOf: (o) => "★".repeat(Number(o.rating) || 0),
  fields: () => [
    { k: "name", label: "Client name", type: "text", required: true },
    { k: "text", label: "Review", type: "textarea", rows: 4, required: true },
    {
      k: "rating",
      label: "Rating",
      type: "select",
      options: [5, 4, 3, 2, 1].map((n) => ({ value: String(n), label: `${"★".repeat(n)} (${n})` })),
    },
  ],
};

// ---------------- single documents ----------------

export type DocDef = { file: FileKey; title: string; intro: string; fields: Field[] };

export const siteDef: DocDef = {
  file: "site",
  title: "Site settings",
  intro: "Contact details, address and texts used across the whole website (header, footer, contact page, Google information).",
  fields: [
    { k: "name", label: "Company name", type: "text", required: true },
    { k: "phones", label: "Phone numbers", type: "strings", add: "Add phone", help: "The first number is the main one (Call buttons). Format: +91 87074 38955" },
    { k: "emails", label: "Email addresses", type: "strings", add: "Add email", help: "The first email receives the contact form." },
    {
      k: "socials",
      label: "Links",
      type: "group",
      fields: [
        { k: "whatsapp", label: "WhatsApp link", type: "url", help: "Format: https://wa.me/918707438955 (country code + number, no spaces)." },
        { k: "google", label: "Google reviews / business link", type: "url" },
      ],
    },
    {
      k: "address",
      label: "Office address",
      type: "group",
      fields: [
        { k: "street", label: "Street", type: "text", required: true },
        { k: "city", label: "City", type: "text", required: true },
        { k: "region", label: "State", type: "text", required: true },
        { k: "postalCode", label: "PIN code", type: "text", required: true },
      ],
    },
    { k: "mapUrl", label: "Google Maps link", type: "url", required: true, help: "Every address on the site links here." },
    { k: "headerTagline", label: "Header text (2 lines)", type: "strings", add: "Add line" },
    {
      k: "tagline",
      label: "Tagline (loader & home)",
      type: "group",
      fields: [
        { k: "bold", label: "First part", type: "text" },
        { k: "after", label: "Second part", type: "text" },
      ],
    },
    { k: "description", label: "Google description (home page)", type: "textarea", rows: 3, help: "About 150 characters." },
    { k: "credit", label: "Copyright line", type: "text" },
  ],
};

export const aboutDef: DocDef = {
  file: "about",
  title: "About page",
  intro: "Texts and numbers on the About page. Director and team are edited in “Team”.",
  fields: [
    { k: "heroImage", label: "Top photo", type: "image", folder: "about", required: true },
    { k: "heroAlt", label: "Top photo description", type: "text" },
    { k: "kicker", label: "Heading", type: "text" },
    { k: "statement", label: "Big statement", type: "textarea", rows: 2 },
    {
      k: "about",
      label: "Introduction",
      type: "group",
      fields: [
        { k: "lead", label: "Opening paragraph", type: "textarea", rows: 4 },
        { k: "paragraphs", label: "More paragraphs", type: "paragraphs" },
        { k: "sectorsTitle", label: "Fields of work — title", type: "text" },
        { k: "sectors", label: "Fields of work", type: "strings", add: "Add field" },
      ],
    },
    {
      k: "stats",
      label: "Numbers",
      type: "list",
      add: "Add number",
      title: (o) => `${s(o, "value")} ${s(o, "label")}`,
      make: () => ({ value: "", label: "" }),
      fields: [
        { k: "value", label: "Number", type: "text", placeholder: "14+" },
        { k: "label", label: "Label", type: "text", placeholder: "Years of experience" },
      ],
    },
    { k: "vision", label: "Vision", type: "textarea", rows: 3 },
    {
      k: "mission",
      label: "Mission points",
      type: "list",
      add: "Add point",
      title: (o) => s(o, "title"),
      make: () => ({ title: "", text: "" }),
      fields: [
        { k: "title", label: "Title", type: "text" },
        { k: "text", label: "Text", type: "textarea", rows: 2 },
      ],
    },
    { k: "experienceTitle", label: "Experience — title", type: "text" },
    { k: "experienceText", label: "Experience — text", type: "textarea", rows: 3 },
    {
      k: "partners",
      label: "“Our team” band",
      type: "group",
      fields: [
        { k: "image", label: "Background photo", type: "image", folder: "about" },
        { k: "text", label: "Text", type: "textarea", rows: 3 },
      ],
    },
  ],
};

export const servicesDef: DocDef = {
  file: "services",
  title: "Services page",
  intro: "Each service has a “Discuss your project” button that opens the enquiry form with that service selected.",
  fields: [
    { k: "headline", label: "Page heading", type: "text" },
    { k: "intro", label: "Sub-heading", type: "text" },
    { k: "list", label: "Why choose us", type: "strings", add: "Add reason" },
    { k: "image", label: "Top photo", type: "image", folder: "services" },
    { k: "imageAlt", label: "Top photo description", type: "text" },
    {
      k: "offerings",
      label: "Services",
      type: "list",
      add: "Add service",
      title: (o) => s(o, "title"),
      make: () => ({ title: "", summary: "", includes: [], image: "", imageAlt: "" }),
      fields: [
        { k: "title", label: "Service name", type: "text", required: true },
        { k: "summary", label: "Description", type: "textarea", rows: 3 },
        { k: "includes", label: "What’s included", type: "strings", add: "Add item" },
        { k: "image", label: "Photo", type: "image", folder: "services" },
        { k: "imageAlt", label: "Photo description", type: "text" },
      ],
    },
    {
      k: "process",
      label: "How we work",
      type: "group",
      fields: [
        { k: "title", label: "Title", type: "text" },
        { k: "paragraphs", label: "Text", type: "paragraphs" },
      ],
    },
    {
      k: "steps",
      label: "Process steps",
      type: "list",
      add: "Add step",
      title: (o) => s(o, "title"),
      make: () => ({ title: "", text: "" }),
      fields: [
        { k: "title", label: "Step name", type: "text" },
        { k: "text", label: "Text", type: "textarea", rows: 2 },
      ],
    },
    {
      k: "eco",
      label: "Sustainability section",
      type: "group",
      fields: [
        { k: "label", label: "Small label", type: "text" },
        { k: "title", label: "Title", type: "text" },
        { k: "lead", label: "Intro", type: "textarea", rows: 2 },
        { k: "columns", label: "Text", type: "paragraphs" },
        { k: "image", label: "Photo", type: "image", folder: "services" },
        { k: "imageAlt", label: "Photo description", type: "text" },
      ],
    },
  ],
};

// ---------------- normalisation before saving ----------------

/** Keeps derived fields in sync so the website code always gets what it expects. */
export function normalize(key: FileKey, v: unknown): unknown {
  if (key === "site") {
    const o = { ...(v as Obj) };
    const phones = ((o.phones as string[]) ?? []).map((x) => x.trim()).filter(Boolean);
    const emails = ((o.emails as string[]) ?? []).map((x) => x.trim()).filter(Boolean);
    return { ...o, phones, emails, phone: phones[0] ?? "", email: emails[0] ?? "", legalName: o.legalName ?? o.name };
  }
  if (key === "services") {
    const o = { ...(v as Obj) };
    o.offerings = ((o.offerings as Obj[]) ?? []).map((x) => ({ ...x, id: x.id || slugify(s(x, "title")), service: s(x, "title") }));
    return o;
  }
  if (key === "team") return ((v as Obj[]) ?? []).map((m, i) => ({ ...m, director: i === 0 }));
  if (key === "testimonials") return ((v as Obj[]) ?? []).map((t) => ({ ...t, rating: Number(t.rating) || 5 }));
  if (key === "gallery")
    return ((v as Obj[]) ?? []).map((g) => {
      const o = { ...g };
      if (!o.project) delete o.project;
      if (!o.label) delete o.label;
      return o;
    });
  return v;
}
