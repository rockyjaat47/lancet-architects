import type { Metadata } from "next";
import { site } from "./content";

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? site.url;

/** Keep meta descriptions within the ~160 characters search engines display. */
export function clampDescription(d: string, max = 158) {
  if (d.length <= max) return d;
  const cut = d.slice(0, max - 1);
  return cut.slice(0, cut.lastIndexOf(" ")).replace(/[,;:—–-]$/, "") + "…";
}

export function pageMetadata({
  title,
  description = site.description,
  path = "/",
  image,
  type = "website",
}: {
  title?: string;
  description?: string;
  path?: string;
  image?: string;
  type?: "website" | "article";
}): Metadata {
  // Pages without their own photo use the default social card (public/og-default.png)
  const img = image ?? "/og-default.png";
  description = clampDescription(description);
  const images = [{ url: img, ...(image ? {} : { width: 1200, height: 630, alt: site.name }) }];
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { title: title ? `${title} — ${site.name}` : site.name, description, url: path, type, images, locale: "en_IN", siteName: site.name },
    twitter: { card: "summary_large_image", title: title ? `${title} — ${site.name}` : site.name, description, images: [img] },
  };
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": ["LocalBusiness", "ProfessionalService"],
    "@id": `${SITE_URL}/#organization`,
    name: site.name,
    legalName: site.legalName,
    description: site.description,
    slogan: `${site.tagline.before}${site.tagline.bold}${site.tagline.after}`,
    url: SITE_URL,
    logo: `${SITE_URL}${site.emblem}`,
    image: `${SITE_URL}/og-default.png`,
    telephone: site.phones,
    email: site.emails,
    address: {
      "@type": "PostalAddress",
      streetAddress: site.address.street,
      postalCode: site.address.postalCode,
      addressLocality: site.address.city,
      addressRegion: site.address.region,
      addressCountry: site.address.country,
    },
    geo: { "@type": "GeoCoordinates", latitude: site.geo.lat, longitude: site.geo.lng },
    hasMap: site.mapUrl,
    contactPoint: site.phones.map((p) => ({ "@type": "ContactPoint", telephone: p.replace(/\s/g, ""), contactType: "customer service", areaServed: "IN", availableLanguage: ["en", "hi"] })),
    areaServed: site.areaServed,
    knowsAbout: ["Architecture", "Interior design", "Landscape design", "Residential architecture", "Commercial architecture", "Sustainable design"],
    sameAs: Object.values(site.socials),
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: `${SITE_URL}${it.path}`,
    })),
  };
}
