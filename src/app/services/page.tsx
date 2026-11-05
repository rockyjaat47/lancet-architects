import type { Metadata } from "next";
import Image from "next/image";
import ProcessSteps from "@/components/ProcessSteps";
import JsonLd from "@/components/JsonLd";
import { Divider, Reveal, SplitWords } from "@/components/Reveal";
import Link from "next/link";
import { ConsultButton, Container, Label, PillLink } from "@/components/ui";
import { services as e, site } from "@/lib/content";
import { SITE_URL, breadcrumbJsonLd, pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Architecture, Interior & Landscape Services",
  description: `Architectural, interior and landscape design plus project management in Lucknow — what each service by ${site.name} includes and how we work.`,
  path: "/services",
});

export default function ServicesPage() {
  return (
    <>
      <Container className="pt-[13rem] max-lg:pt-32">
        <section className="grid grid-cols-12 gap-x-6 max-md:grid-cols-1" aria-labelledby="services-title">
          <Label className="md:col-span-4 pt-3 max-md:mb-6">Why choose us</Label>
          <div className="md:col-span-7 md:col-start-5 max-md:col-span-1">
            <h1 id="services-title" className="max-w-[34rem] text-2xl leading-[1.15]">
              {e.headline}
            </h1>
            <p className="mt-4 font-display text-xl text-ink/80">{e.intro}</p>
            <ul className="mt-[4.5rem] max-md:mt-10">
              {e.list.map((item, i) => (
                <Reveal as="li" key={item} delay={i * 0.09} y={30} className="flex items-center gap-12 max-md:gap-6">
                  <span aria-hidden="true" className="h-[0.35rem] w-[0.35rem] shrink-0 rounded-full bg-accent" />
                  <span className="flex-1 border-b border-ink py-[0.7rem] text-[0.9rem] uppercase">{item}</span>
                </Reveal>
              ))}
            </ul>
          </div>
        </section>

        <Reveal className="relative mt-[4.5rem] aspect-[16/8.4] overflow-hidden rounded-card bg-line max-md:aspect-[4/3]">
          <Image src={e.image} alt={e.imageAlt} fill sizes="(max-width: 1023px) 88vw, 92vw" className="object-cover" />
        </Reveal>

        {/* what we do: one block per service */}
        <section className="mt-[8rem] max-md:mt-20" aria-labelledby="offer-title">
          <h2 id="offer-title" className="font-sans text-micro uppercase">
            What we do
          </h2>
          <nav aria-label="Services on this page" className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm">
            {e.offerings.map((o) => (
              <a key={o.id} href={`#${o.id}`} className="underline underline-offset-4 hover:text-accent">
                {o.title}
              </a>
            ))}
          </nav>
          <div className="mt-12 divide-y divide-line border-y border-line">
            {e.offerings.map((o, i) => (
              <article key={o.id} id={o.id} className="grid scroll-mt-28 grid-cols-12 gap-x-6 gap-y-8 py-14 max-md:grid-cols-1 max-md:py-10" aria-labelledby={`${o.id}-title`}>
                <div className="md:col-span-4 max-md:col-span-1">
                  <Reveal className="relative aspect-[4/3] overflow-hidden rounded-card bg-line">
                    <Image src={o.image} alt={o.imageAlt} fill sizes="(max-width: 767px) 88vw, 30vw" className="object-cover" />
                  </Reveal>
                </div>
                <div className="md:col-span-7 md:col-start-6 max-md:col-span-1">
                  <p className="font-display text-lg text-accent">{String(i + 1).padStart(2, "0")}</p>
                  <h3 id={`${o.id}-title`} className="mt-2 text-2xl leading-[1.15] max-md:text-xl">
                    {o.title}
                  </h3>
                  <p className="mt-5 max-w-[36rem] text-[1.02rem] leading-[1.5]">{o.summary}</p>
                  <h4 className="mt-8 text-micro uppercase text-ink/75">What’s included</h4>
                  <ul className="mt-3 grid gap-x-8 gap-y-2 text-sm sm:grid-cols-2">
                    {o.includes.map((x) => (
                      <li key={x} className="flex gap-3">
                        <span aria-hidden="true" className="mt-[0.55em] h-[0.35rem] w-[0.35rem] shrink-0 rounded-full bg-accent" />
                        {x}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-10 flex flex-wrap items-center gap-4">
                    <ConsultButton service={o.service}>Discuss your project</ConsultButton>
                    <Link href="/projects" className="text-micro uppercase underline underline-offset-4 hover:text-accent">
                      See related projects
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </Container>

      <Divider className="mt-[0.5rem]" />

      <Container className="py-[1.5rem]">
        <section className="grid grid-cols-12 gap-x-6 pt-4 max-md:grid-cols-1" aria-labelledby="process-title">
          <Label className="md:col-span-4 max-md:mb-6">How we work</Label>
          <div className="md:col-span-4 md:col-start-5 max-md:col-span-1">
            <SplitWords id="process-title" text={e.process.title} className="text-xl leading-[1.15]" />
            <div className="mt-12 space-y-8 text-sm">
              {e.process.paragraphs.map((t) => (
                <Reveal as="p" key={t} y={30}>
                  {t}
                </Reveal>
              ))}
            </div>
          </div>
          <div className="md:col-span-3 md:col-start-10 flex justify-end max-md:col-span-1 max-md:mt-10 max-md:justify-start">
            <div className="flex flex-col items-start gap-3">
              <ConsultButton />
              <PillLink href="/projects">View projects</PillLink>
            </div>
          </div>
        </section>

        <section className="mt-[12rem] max-md:mt-24" aria-label="Our work process">
          <ProcessSteps steps={e.steps} />
        </section>
      </Container>

      <section className="mt-[10rem] rounded-t-section bg-ink pb-[7rem] pt-[1.8rem] text-paper max-md:mt-24" aria-labelledby="eco-title">
        <Container>
          <Label className="text-center opacity-80">{e.eco.label}</Label>
          <SplitWords id="eco-title" text={e.eco.title} className="mx-auto mt-6 max-w-[62rem] text-center text-3xl leading-[1.1] max-md:text-2xl" />
          <div className="mt-[8rem] grid grid-cols-12 gap-x-6 gap-y-10 max-md:mt-16 max-md:grid-cols-1">
            <Reveal className="relative md:col-span-5 aspect-[4/3] overflow-hidden rounded-card max-md:col-span-1">
              <Image src={e.eco.image} alt={e.eco.imageAlt} fill sizes="(max-width: 767px) 88vw, 40vw" className="object-cover" />
            </Reveal>
            <div className="md:col-span-6 md:col-start-7 max-md:col-span-1">
              <Reveal as="p" className="text-lg leading-snug">
                {e.eco.lead}
              </Reveal>
              <div className="mt-12 grid grid-cols-2 gap-8 text-sm max-md:grid-cols-1">
                {e.eco.columns.map((t) => (
                  <Reveal as="p" key={t} y={30}>
                    {t}
                  </Reveal>
                ))}
              </div>
              <div className="mt-12">
                <ConsultButton dark>Discuss your project</ConsultButton>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Services", path: "/services" },
          ]),
          {
            "@context": "https://schema.org",
            "@type": "Service",
            serviceType: "Architecture & interior design",
            areaServed: site.areaServed,
            provider: { "@id": `${SITE_URL}/#organization` },
            hasOfferCatalog: {
              "@type": "OfferCatalog",
              name: "Services",
              itemListElement: e.offerings.map((o) => ({
                "@type": "Offer",
                itemOffered: { "@type": "Service", name: o.title, description: o.summary, areaServed: site.areaServed, provider: { "@id": `${SITE_URL}/#organization` } },
              })),
            },
          },
        ]}
      />
    </>
  );
}
