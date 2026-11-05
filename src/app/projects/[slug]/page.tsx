import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import ProjectDescription from "@/components/ProjectInfo";
import ProjectInfoSheet from "@/components/ProjectInfoSheet";
import JsonLd from "@/components/JsonLd";
import { Reveal } from "@/components/Reveal";
import { ArrowRight } from "@/components/ui";
import { categoryLabel, getProject, projectLocation, projects, site } from "@/lib/content";
import { SITE_URL, breadcrumbJsonLd, pageMetadata } from "@/lib/seo";

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}
export const dynamicParams = false;

export async function generateMetadata({ params }: PageProps<"/projects/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const data = getProject(slug);
  if (!data) return {};
  const { project: p } = data;
  return pageMetadata({
    title: p.title,
    description: `${p.excerpt} ${categoryLabel(p.category)} project by ${site.name}, ${projectLocation(p)}.`,
    path: `/projects/${p.slug}`,
    image: p.cover,
  });
}

export default async function ProjectPage({ params }: PageProps<"/projects/[slug]">) {
  const { slug } = await params;
  const data = getProject(slug);
  if (!data) notFound();
  const { project: p, next } = data;
  const hasNext = next.slug !== p.slug;

  // Only the fields filled in content/projects.json are shown
  const specs = (
    [
      ["Category", categoryLabel(p.category)],
      ["Type", p.type],
      ["Programme", p.program],
      ["Location", p.location],
      ["Area", p.surface],
      ["Client", p.client],
      ["Completion", p.year ? String(p.year) : undefined],
    ] as [string, string | undefined][]
  ).filter((x): x is [string, string] => !!x[1]);

  return (
    <article className="lg:grid lg:grid-cols-[74.6fr_25.4fr]">
      {/* hero */}
      <div className="relative h-svh max-lg:aspect-[1.08] max-lg:h-auto lg:col-start-1 lg:row-start-1">
        <Image src={p.cover} alt={p.alt} fill priority sizes="(max-width: 1023px) 100vw, 75vw" className="object-cover" />
      </div>

      {/* sticky info panel */}
      <ProjectInfoSheet className="bg-paper px-[3.68rem] pb-16 max-lg:px-[6vw] max-lg:pb-32 max-lg:pt-10 lg:sticky lg:top-0 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:flex lg:h-svh lg:flex-col lg:self-start lg:overflow-y-auto lg:pt-[2.95rem]">
        <Link href="/projects" className="flex items-center gap-2 text-[0.56rem] uppercase hover:underline max-lg:hidden lg:h-[1.6rem]">
          <span aria-hidden="true">←</span> All projects
        </Link>
        <h1 className="mt-[5.6rem] text-[2.4rem] leading-[1.05] max-lg:mt-0 max-lg:text-2xl">{p.title}</h1>
        <p className="mt-3 text-micro uppercase text-ink/75">{projectLocation(p)}</p>
        <div className="mt-12">
          <ProjectDescription paragraphs={p.description} />
        </div>
        <dl className="mt-12 border-t border-ink text-[0.56rem] uppercase max-lg:text-micro">
          {specs.map(([k, v]) => (
            <div key={k} className="flex justify-between gap-6 border-b border-ink py-[0.9rem]">
              <dt>{k}</dt>
              <dd className="text-right">{v}</dd>
            </div>
          ))}
        </dl>
        <Link href="/contact" className="mt-10 inline-flex items-center gap-2 text-micro uppercase hover:underline">
          Discuss a similar project <ArrowRight className="h-3 w-3" />
        </Link>
      </ProjectInfoSheet>

      {/* gallery */}
      <div className="flex flex-col gap-4 pt-4 lg:col-start-1 lg:row-start-2">
        {p.gallery.map((src, i) => (
          <Reveal key={src} y={30} className="relative aspect-[16/9] overflow-hidden bg-line max-lg:aspect-[1.08]">
            <Image src={src} alt={`${p.title} — view ${i + 2}`} fill sizes="(max-width: 1023px) 100vw, 75vw" className="object-cover" />
          </Reveal>
        ))}
        {hasNext && (
          <Link
            href={`/projects/${next.slug}`}
            className="group relative flex h-[60svh] items-end overflow-hidden bg-ink p-[3.68rem] text-paper max-lg:p-[6vw]"
            data-cursor="view"
          >
            <Image
              src={next.cover}
              alt=""
              fill
              sizes="(max-width: 1023px) 100vw, 75vw"
              className="object-cover opacity-60 transition-transform duration-[1.4s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
            />
            <span className="relative">
              <span className="block text-micro uppercase">Next project</span>
              <span className="mt-2 flex items-center gap-4 font-display text-3xl leading-none max-md:text-2xl">
                {next.title}
                <ArrowRight className="h-[0.6em] w-[0.6em] transition-transform duration-500 group-hover:translate-x-2" />
              </span>
            </span>
          </Link>
        )}
      </div>

      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Projects", path: "/projects" },
            { name: p.title, path: `/projects/${p.slug}` },
          ]),
          {
            "@context": "https://schema.org",
            "@type": "CreativeWork",
            name: p.title,
            description: p.description.join(" "),
            image: [p.cover, ...p.gallery].map((x) => `${SITE_URL}${x}`),
            genre: categoryLabel(p.category),
            locationCreated: { "@type": "Place", name: projectLocation(p) },
            creator: { "@id": `${SITE_URL}/#organization`, name: site.name },
            url: `${SITE_URL}/projects/${p.slug}`,
          },
        ]}
      />
    </article>
  );
}
