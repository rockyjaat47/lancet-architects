import type { Metadata } from "next";
import Image from "next/image";
import ProcessSteps from "@/components/ProcessSteps";
import JsonLd from "@/components/JsonLd";
import { Divider, Reveal, SplitWords } from "@/components/Reveal";
import { Container, Label, PillLink } from "@/components/ui";
import { services as e, site } from "@/lib/content";
import { SITE_URL, breadcrumbJsonLd, pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Services & process",
  description: `Architecture, interior and landscape services by ${site.name} in Lucknow — innovative design, project management and timely delivery, from concept to execution.`,
  path: "/services",
});

export default function ServicesPage() {
  return (
    <>
      <Container className="pt-[13rem] max-lg:pt-32">
        <section className="grid grid-cols-12 gap-x-6 max-md:grid-cols-1" aria-labelledby="services-title">
          <Label className="md:col-span-4 pt-3 max-md:mb-6">Why choose us</Label>
          <div className="md:col-span-7 md:col-start-5 max-md:col-span-1">
            <h1 id="services-title" className="max-w-[30rem] text-2xl leading-[1.15]">
              {e.intro}
            </h1>
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
            <div>
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
                <PillLink href="/contact" dark>
                  Start your project
                </PillLink>
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
              itemListElement: e.list.map((name) => ({ "@type": "Offer", itemOffered: { "@type": "Service", name } })),
            },
          },
        ]}
      />
    </>
  );
}
