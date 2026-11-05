import type { Metadata } from "next";
import GalleryGrid from "@/components/GalleryGrid";
import JsonLd from "@/components/JsonLd";
import { Container, PillLink } from "@/components/ui";
import { gallery, site } from "@/lib/content";
import { SITE_URL, breadcrumbJsonLd, pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Gallery",
  description: `Architecture and interior design work by ${site.name}, Lucknow — façades, hospitals, showrooms, kitchens and bedrooms.`,
  path: "/gallery",
  image: gallery[0]?.src,
});

export default function GalleryPage() {
  return (
    <Container className="pt-[11rem] max-lg:pt-32">
      <header className="flex flex-wrap items-end justify-between gap-6">
        <h1 className="text-3xl max-md:text-2xl">Gallery</h1>
        <PillLink href="/projects">All projects</PillLink>
      </header>
      <div className="mt-[4.5rem] max-md:mt-10">
        <GalleryGrid items={gallery} />
      </div>
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Gallery", path: "/gallery" },
          ]),
          {
            "@context": "https://schema.org",
            "@type": "ImageGallery",
            name: `${site.name} gallery`,
            image: gallery.map((g) => ({ "@type": "ImageObject", contentUrl: `${SITE_URL}${g.src}`, description: g.alt })),
          },
        ]}
      />
    </Container>
  );
}
