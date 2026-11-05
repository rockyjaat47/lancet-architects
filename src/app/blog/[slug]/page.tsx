import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import JsonLd from "@/components/JsonLd";
import { Container } from "@/components/ui";
import { articles, formatDate, getArticle, journalCategoryLabel, site } from "@/lib/content";
import { SITE_URL, breadcrumbJsonLd, pageMetadata } from "@/lib/seo";

export function generateStaticParams() {
  return articles.map((a) => ({ slug: a.slug }));
}
export const dynamicParams = false;

export async function generateMetadata({ params }: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const a = getArticle(slug);
  if (!a) return {};
  return pageMetadata({ title: a.title, description: a.excerpt, path: `/blog/${a.slug}`, image: a.cover, type: "article" });
}

export default async function ArticlePage({ params }: PageProps<"/blog/[slug]">) {
  const { slug } = await params;
  const a = getArticle(slug);
  if (!a) notFound();
  const { default: Body } = await import(`@content/journal/${slug}.mdx`);
  const idx = articles.findIndex((x) => x.slug === slug);
  const next = articles[(idx + 1) % articles.length];

  return (
    <article className="pt-[11rem] max-lg:pt-32">
      <Container>
        <header className="mx-auto max-w-[48rem] text-center">
          <p className="text-micro uppercase">
            <Link href="/blog" className="hover:underline">
              Blog
            </Link>{" "}
            · {journalCategoryLabel[a.category] ?? a.category} · <time dateTime={a.date}>{formatDate(a.date)}</time>
          </p>
          <h1 className="mt-8 text-3xl uppercase leading-[1.15] max-md:text-2xl">{a.title}</h1>
        </header>
        <div className="relative mx-auto mt-16 aspect-[16/9] max-w-[72rem] overflow-hidden rounded-card bg-line">
          <Image src={a.cover} alt={a.alt} fill priority sizes="(max-width: 1023px) 88vw, 72rem" className="object-cover" />
        </div>
        <div className="prose-studio mx-auto mt-16 max-w-[38rem] text-[1rem]">
          <Body />
        </div>
        <nav aria-label="Next article" className="mx-auto mt-24 max-w-[38rem] border-t border-line pt-8">
          <p className="text-micro uppercase opacity-80">Other blog</p>
          <Link href={`/blog/${next.slug}`} className="mt-2 block font-display text-xl uppercase hover:underline underline-offset-4">
            {next.title} →
          </Link>
        </nav>
      </Container>
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Blog", path: "/blog" },
            { name: a.title, path: `/blog/${a.slug}` },
          ]),
          {
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: a.title,
            description: a.excerpt,
            image: `${SITE_URL}${a.cover}`,
            datePublished: a.date,
            author: { "@type": "Organization", name: site.name },
            publisher: { "@id": `${SITE_URL}/#organization` },
            mainEntityOfPage: `${SITE_URL}/blog/${a.slug}`,
            inLanguage: "en-IN",
          },
        ]}
      />
    </article>
  );
}
