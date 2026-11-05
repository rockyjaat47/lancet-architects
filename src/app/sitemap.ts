import type { MetadataRoute } from "next";
import { articles, projects } from "@/lib/content";
import { SITE_URL } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const statics = [
    ["/", 1],
    ["/projects", 0.9],
    ["/services", 0.8],
    ["/about", 0.8],
    ["/gallery", 0.6],
    ["/contact", 0.8],
    ["/blog", 0.6],
    ["/privacy-policy", 0.2],
    ["/terms", 0.2],
  ] as const;
  return [
    ...statics.map(([path, priority]) => ({ url: `${SITE_URL}${path}`, lastModified: now, priority })),
    ...projects.map((p) => ({ url: `${SITE_URL}/projects/${p.slug}`, lastModified: now, priority: 0.7, images: [`${SITE_URL}${p.cover}`] })),
    ...articles.map((a) => ({ url: `${SITE_URL}/blog/${a.slug}`, lastModified: new Date(a.date), priority: 0.5 })),
  ];
}

export const dynamic = "force-static";
