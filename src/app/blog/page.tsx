import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import { Reveal } from "@/components/Reveal";
import { Container } from "@/components/ui";
import { articles, formatDate, journalCategoryLabel, site } from "@/lib/content";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Blog",
  description: `Ideas and insights on modern, sustainable architecture and interior design from ${site.name}, Lucknow.`,
  path: "/blog",
});

function Meta({ category, date }: { category: string; date: string }) {
  return (
    <p className="flex justify-between text-[0.5rem] uppercase max-md:text-micro">
      <span>
        <span className="font-bold">Category:</span> <span className="opacity-80">{journalCategoryLabel[category] ?? category}</span>
      </span>
      <time dateTime={date}>{formatDate(date)}</time>
    </p>
  );
}

export default function BlogPage() {
  return (
    <Container className="pt-[11rem] max-lg:pt-32">
      <h1 className="text-center text-3xl max-md:text-2xl">Recent blog</h1>

      <ul className="mt-[5.5rem] grid grid-cols-2 gap-x-[2.2rem] gap-y-16 max-md:mt-14 max-md:grid-cols-1">
        {articles.map((a, i) => (
          <Reveal as="li" key={a.slug} delay={(i % 2) * 0.09}>
            <article>
              <Link href={`/blog/${a.slug}`} className="group block" tabIndex={-1} aria-hidden="true">
                <div className="relative aspect-[3/2] overflow-hidden rounded-[0.2rem] bg-line">
                  <Image src={a.cover} alt={a.alt} fill priority={i < 2} sizes="(max-width: 767px) 88vw, 45vw" className="object-cover transition-transform duration-1000 group-hover:scale-105" />
                </div>
              </Link>
              <div className="mt-4">
                <Meta category={a.category} date={a.date} />
              </div>
              <h2 className="mt-8 text-[1.95rem] uppercase leading-[1.3] max-md:text-xl">
                <Link href={`/blog/${a.slug}`} className="underline-offset-4 hover:underline">
                  {a.title}
                </Link>
              </h2>
              <p className="mt-6 max-w-[34rem] text-[0.85rem] leading-[1.6] max-md:text-sm">{a.excerpt}</p>
            </article>
          </Reveal>
        ))}
      </ul>
      <JsonLd data={breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Blog", path: "/blog" }])} />
    </Container>
  );
}
