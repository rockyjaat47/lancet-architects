import type { Metadata } from "next";
import ProjectsGrid from "@/components/ProjectsGrid";
import JsonLd from "@/components/JsonLd";
import { projects, site } from "@/lib/content";
import { SITE_URL, breadcrumbJsonLd, pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Projects",
  description: `Explore the architecture and interior projects of ${site.name}, Lucknow — commercial, residential, institutional and more.`,
  path: "/projects",
});

export default function ProjectsPage() {
  return (
    <div className="pt-[6.5rem] max-lg:pt-20">
      <h1 className="sr-only">Our projects</h1>
      <ProjectsGrid projects={projects} />
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Projects", path: "/projects" },
          ]),
          {
            "@context": "https://schema.org",
            "@type": "ItemList",
            itemListElement: projects.map((p, i) => ({ "@type": "ListItem", position: i + 1, url: `${SITE_URL}/projects/${p.slug}`, name: p.title })),
          },
        ]}
      />
    </div>
  );
}
