import type { Metadata } from "next";
import ProjectsGrid from "@/components/ProjectsGrid";
import JsonLd from "@/components/JsonLd";
import { projects, site } from "@/lib/content";
import { SITE_URL, breadcrumbJsonLd, pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Architecture & Interior Projects in Lucknow",
  description: `Projects by ${site.name}, Lucknow: hospital architecture, jewelry showroom design and interiors. Filter by category and see location and details.`,
  path: "/projects",
});

export default function ProjectsPage() {
  return (
    <div className="pt-[6.5rem] max-lg:pt-20">
      <h1 className="sr-only">Architecture & interior projects by {site.name}, Lucknow</h1>
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
