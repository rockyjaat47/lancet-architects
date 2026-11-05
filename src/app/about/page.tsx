import type { Metadata } from "next";
import Image from "next/image";
import JsonLd from "@/components/JsonLd";
import Testimonials from "@/components/Testimonials";
import { Divider, Reveal, SplitWords } from "@/components/Reveal";
import Link from "next/link";
import { ConsultButton, Container, PillLink } from "@/components/ui";
import { about as s, site, team, testimonials } from "@/lib/content";
import { SITE_URL, breadcrumbJsonLd, pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "About Us — Architects & Interior Designers in Lucknow",
  description: `Meet ${site.name}, Lucknow: our vision, mission, director and team. 14+ years and 500+ projects in architecture, interiors and landscape.`,
  path: "/about",
  image: s.heroImage,
});

export default function AboutPage() {
  const director = team.find((m) => m.director) ?? team[0];
  const members = team.filter((m) => m !== director && m.name);
  const sectorLinks: Record<string, string> = { Residential: "/services", Commercial: "/projects", Institutional: "/projects", Landscape: "/services", Public: "/services" };
  const avg = testimonials.reduce((a, t) => a + t.rating, 0) / testimonials.length;

  return (
    <>
      <Container className="pt-[6.4rem] max-lg:pt-20">
        <div className="relative aspect-[2.3/1] overflow-hidden rounded-card bg-line max-md:aspect-[4/3]">
          <Image src={s.heroImage} alt={s.heroAlt} fill loading="eager" fetchPriority="high" sizes="92vw" className="object-cover" />
        </div>

        <header className="mt-[4.5rem] max-w-[46rem]">
          <h1 className="text-2xl leading-[1.3] max-md:text-xl">About {site.name} — {s.kicker}</h1>
          <SplitWords as="p" text={s.statement} className="mt-3 font-display text-3xl leading-[1.08] max-md:text-2xl" />
        </header>

        <section className="mt-[9rem] grid grid-cols-12 gap-x-6 max-md:mt-20 max-md:grid-cols-1" aria-labelledby="about-title">
          <h2 id="about-title" className="md:col-span-6 font-sans text-micro uppercase max-md:mb-6">
            Welcome to {site.name}
          </h2>
          <div className="md:col-span-4 md:col-start-7 max-md:col-span-1">
            <Reveal as="p" className="text-[1.05rem] leading-[1.4]">
              {s.about.lead}
            </Reveal>
            {s.about.paragraphs.map((t) => (
              <Reveal as="p" key={t} y={30} className="mt-8 text-sm">
                {t}
              </Reveal>
            ))}
            <Reveal as="p" y={30} className="mt-10 text-sm">
              {s.about.sectorsTitle}
            </Reveal>
            <ul className="mt-4 list-disc space-y-1 pl-5 text-sm">
              {s.about.sectors.map((t, i) => (
                <Reveal as="li" key={t} y={20} delay={i * 0.08}>
                  <Link href={sectorLinks[t] ?? "/services"} className="underline-offset-2 hover:underline">
                    {t}
                  </Link>
                </Reveal>
              ))}
            </ul>
          </div>
          <div className="md:col-span-2 flex justify-end max-md:col-span-1 max-md:mt-10 max-md:justify-start">
            <div>
              <PillLink href="/projects">View projects</PillLink>
            </div>
          </div>
        </section>

        {/* stats */}
        <section aria-label="Our stats" className="mt-[8rem] max-md:mt-20">
          <Divider />
          <dl className="grid grid-cols-4 max-md:grid-cols-2">
            {s.stats.map((st, i) => (
              <Reveal key={st.label} delay={i * 0.09} className="border-line py-10 max-md:py-8 [&:not(:first-child)]:md:border-l md:pl-8 max-md:even:pl-6 max-md:even:border-l">
                <dt className="sr-only">{st.label}</dt>
                <dd>
                  <span className="block font-display text-4xl leading-none max-md:text-3xl">{st.value}</span>
                  <span className="mt-3 block text-micro uppercase" aria-hidden="true">
                    {st.label}
                  </span>
                </dd>
              </Reveal>
            ))}
          </dl>
          <Divider />
        </section>

        {/* vision & mission */}
        <section className="mt-[8rem] grid grid-cols-12 gap-x-6 gap-y-10 max-md:mt-20 max-md:grid-cols-1" aria-labelledby="vision-title">
          <div className="md:col-span-5 max-md:col-span-1">
            <h2 id="vision-title" className="font-sans text-micro uppercase">
              Our vision
            </h2>
            <Reveal as="p" className="mt-6 font-display text-2xl leading-[1.2] max-md:text-xl">
              {s.vision}
            </Reveal>
          </div>
          <div className="md:col-span-6 md:col-start-7 max-md:col-span-1">
            <h2 className="font-sans text-micro uppercase">Our mission</h2>
            <ol className="mt-6 divide-y divide-line border-y border-line">
              {s.mission.map((m, i) => (
                <Reveal as="li" key={m.title} y={20} delay={i * 0.06} className="grid grid-cols-[2.5rem_1fr] gap-x-4 py-6">
                  <span className="font-display text-lg text-accent">{String(i + 1).padStart(2, "0")}</span>
                  <div>
                    <h3 className="text-lg leading-snug">{m.title}</h3>
                    <p className="mt-2 text-sm">{m.text}</p>
                  </div>
                </Reveal>
              ))}
            </ol>
          </div>
        </section>

        <section className="mt-[8rem] grid grid-cols-12 gap-x-6 max-md:mt-20 max-md:grid-cols-1" aria-labelledby="experience-title">
          <h2 id="experience-title" className="md:col-span-4 font-sans text-micro uppercase max-md:mb-6">
            {s.experienceTitle}
          </h2>
          <div className="md:col-span-7 md:col-start-6 max-md:col-span-1">
            <Reveal as="p" className="text-[1.05rem] leading-[1.45]">
              {s.experienceText}
            </Reveal>
            <div className="mt-10 flex flex-wrap gap-3">
              <PillLink href="/services">Our services</PillLink>
              <PillLink href="/projects">Our projects</PillLink>
              <ConsultButton />
            </div>
          </div>
        </section>
      </Container>

      {/* director */}
      <section className="mt-[9rem] rounded-section bg-ink pb-[5rem] pt-[1.8rem] text-paper max-md:mt-20" aria-labelledby="director-title">
        <Container>
          <h2 id="director-title" className="font-sans text-micro uppercase">
            Director’s profile & message
          </h2>
          <Divider dark className="mt-[1.6rem]" />
          <div className="mt-12 grid grid-cols-12 gap-x-6 gap-y-10 max-md:grid-cols-1">
            <Reveal className="relative md:col-span-4 aspect-[3/4] overflow-hidden rounded-card bg-paper/10 max-md:col-span-1">
              <Image src={director.photo} alt={director.alt} fill sizes="(max-width: 767px) 88vw, 32vw" className="object-cover" />
            </Reveal>
            <div className="md:col-span-7 md:col-start-6 max-md:col-span-1">
              <h3 className="flex items-center gap-2 text-lg">
                <span aria-hidden="true">↘</span>
                {director.name || `${director.role}, ${site.name}`}
              </h3>
              {director.name && <p className="mt-1 text-[0.6rem] uppercase opacity-80 max-md:text-micro">{director.role}</p>}
              {(director.qualifications || director.experience) && (
                <dl className="mt-6 grid max-w-[30rem] grid-cols-[auto_1fr] gap-x-6 gap-y-2 border-y border-paper/20 py-4 text-sm">
                  {director.qualifications && (
                    <>
                      <dt className="text-micro uppercase opacity-80">Qualifications</dt>
                      <dd>{director.qualifications}</dd>
                    </>
                  )}
                  {director.experience && (
                    <>
                      <dt className="text-micro uppercase opacity-80">Experience</dt>
                      <dd>{director.experience}</dd>
                    </>
                  )}
                </dl>
              )}
              <div className="mt-8 space-y-5 text-[0.9rem] leading-relaxed opacity-90">
                {(director.bio ?? []).map((b, i) => (
                  <Reveal as="p" key={i} y={20}>
                    {b}
                  </Reveal>
                ))}
              </div>
              <div className="mt-12">
                <ConsultButton dark>Meet the director — free consultation</ConsultButton>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* testimonials */}
      <Container className="mt-[8rem] max-md:mt-20">
        <section aria-labelledby="reviews-title">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <h2 id="reviews-title" className="font-sans text-micro uppercase">
                Client reviews
              </h2>
              <p className="mt-4 font-display text-3xl leading-none max-md:text-2xl">
                {avg.toFixed(1)} / 5 <span className="text-lg opacity-80">on Google</span>
              </p>
            </div>
            <PillLink href={site.socials.google}>Read all reviews</PillLink>
          </div>
          <div className="mt-14">
            <Testimonials items={testimonials} />
          </div>
        </section>
      </Container>

      <section className="relative mt-[8rem] flex min-h-[70svh] items-center justify-center overflow-hidden bg-black-2 text-paper" aria-labelledby="team-title">
        <Image src={s.partners.image} alt="" fill sizes="100vw" className="object-cover opacity-40" />
        <div className="relative max-w-[42rem] px-[6vw] text-center">
          <h2 id="team-title" className="font-sans text-micro uppercase">
            Our team
          </h2>
          <Reveal as="p" className="mt-10 text-[1.25rem] leading-[1.55] max-md:text-base">
            {s.partners.text}
          </Reveal>
        </div>
      </section>

      {members.length > 0 && (
        <Container className="mt-[8rem] max-md:mt-20">
          <section aria-labelledby="people-title">
            <h2 id="people-title" className="font-sans text-micro uppercase">
              Meet the team
            </h2>
            <ul className="mt-10 grid grid-cols-4 gap-x-6 gap-y-12 max-lg:grid-cols-3 max-md:grid-cols-2">
              {members.map((m) => (
                <li key={m.name}>
                  <div className="relative aspect-[3/4] overflow-hidden rounded-card bg-line">
                    <Image src={m.photo} alt={m.alt || `${m.name}, ${m.role} at ${site.name}`} fill sizes="(max-width: 767px) 44vw, 22vw" className="object-cover" />
                  </div>
                  <h3 className="mt-4 text-lg leading-snug">{m.name}</h3>
                  <p className="mt-1 text-micro uppercase text-ink/75">{m.role}</p>
                  {m.qualifications && <p className="mt-1 text-sm">{m.qualifications}</p>}
                </li>
              ))}
            </ul>
          </section>
        </Container>
      )}

      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "About", path: "/about" },
          ]),
          {
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            "@id": `${SITE_URL}/#organization`,
            name: site.name,
            ...(director.name
              ? { founder: { "@type": "Person", name: director.name, jobTitle: director.role, ...(director.qualifications ? { hasCredential: director.qualifications } : {}) } }
              : {}),
            ...(members.length ? { employee: members.map((m) => ({ "@type": "Person", name: m.name, jobTitle: m.role })) } : {}),
            aggregateRating: { "@type": "AggregateRating", ratingValue: avg.toFixed(1), reviewCount: testimonials.length, bestRating: 5 },
            review: testimonials.map((t) => ({
              "@type": "Review",
              author: { "@type": "Person", name: t.name },
              reviewRating: { "@type": "Rating", ratingValue: t.rating, bestRating: 5 },
              reviewBody: t.text,
            })),
          },
        ]}
      />
    </>
  );
}
