import projectsData from "@content/projects.json";
import teamData from "@content/team.json";
import journalData from "@content/journal.json";
import siteData from "@content/site.json";
import servicesData from "@content/services.json";
import aboutData from "@content/about.json";
import galleryData from "@content/gallery.json";
import testimonialsData from "@content/testimonials.json";

export type Project = {
  slug: string;
  title: string;
  category: string;
  type?: string;
  program?: string;
  location?: string;
  year?: number | string;
  surface?: string;
  client?: string;
  excerpt: string;
  description: string[];
  cover: string;
  gallery: string[];
  alt: string;
};

export type TeamMember = { name: string; role: string; bio: string[]; photo: string; alt: string };
export type Article = { slug: string; title: string; category: string; date: string; excerpt: string; cover: string; images?: string[]; alt: string };
export type GalleryItem = { src: string; alt: string; project?: string; label?: string };
export type Testimonial = { name: string; text: string; rating: number };

export const site = siteData;
export const services = servicesData;
export const about = aboutData;
export const projects = projectsData as Project[];
export const team = teamData as TeamMember[];
export const gallery = galleryData as GalleryItem[];
export const testimonials = testimonialsData as Testimonial[];
export const articles = (journalData as Article[]).sort((a, b) => b.date.localeCompare(a.date));

/** All known categories (same as the previous site). Only those used by at least one project are shown in the filter. */
const ALL_CATEGORIES: { id: string; label: string }[] = [
  { id: "residential", label: "Residential" },
  { id: "commercial", label: "Commercial" },
  { id: "healthcare", label: "Healthcare" },
  { id: "institutional", label: "Institutional" },
  { id: "landscape", label: "Landscape" },
  { id: "public", label: "Public" },
  { id: "interior", label: "Interior" },
];

export const categories = [
  { id: "all", label: "All" },
  ...ALL_CATEGORIES.filter((c) => projects.some((p) => p.category === c.id)),
];

export const categoryLabel = (c: string) => ALL_CATEGORIES.find((x) => x.id === c)?.label ?? c;

export const journalCategoryLabel: Record<string, string> = {
  architecture: "Architecture",
  interior: "Interior",
  news: "News",
};

export function getProject(slug: string) {
  const i = projects.findIndex((p) => p.slug === slug);
  if (i === -1) return null;
  return { project: projects[i], next: projects[(i + 1) % projects.length] };
}

export function getArticle(slug: string) {
  return articles.find((a) => a.slug === slug) ?? null;
}

export const projectLocation = (p: Project) => p.location ?? `${site.address.city}, ${site.address.region}`;

/**
 * Home slider entries: every image of every project (interleaved), plus interior shots from the gallery,
 * so the infinite arc has enough slides even with few projects.
 */
export function homeSlides() {
  type Slide = { key: string; href: string; title: string; location: string; cover: string; alt: string };
  const perProject = projects.map((p) =>
    [p.cover, ...p.gallery].map((src, i) => ({
      key: `${p.slug}-${i}`,
      href: `/projects/${p.slug}`,
      title: p.title,
      location: `${categoryLabel(p.category)} / ${projectLocation(p)}`,
      cover: src,
      alt: i === 0 ? p.alt : `${p.title} — view ${i + 1}`,
    }))
  );
  const slides: Slide[] = [];
  const max = Math.max(...perProject.map((x) => x.length));
  for (let i = 0; i < max; i++) perProject.forEach((list) => list[i] && slides.push(list[i]));
  gallery
    .filter((g) => !g.project)
    .forEach((g, i) => {
      slides.splice(Math.min(slides.length, 2 + i * 3), 0, {
        key: `gallery-${i}`,
        href: "/gallery",
        title: g.label ?? "Gallery",
        location: `Interior / ${site.address.city}`,
        cover: g.src,
        alt: g.alt,
      });
    });
  return slides;
}

export const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
