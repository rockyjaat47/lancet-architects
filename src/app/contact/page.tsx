import type { Metadata } from "next";
import { Suspense } from "react";
import ContactForm, { ContactFormInner } from "@/components/ContactForm";
import { formatPhone, telHref, whatsappHref } from "@/lib/contact";
import { WhatsAppIcon } from "@/components/ui";
import JsonLd from "@/components/JsonLd";
import RelatedLinks from "@/components/RelatedLinks";
import { Reveal } from "@/components/Reveal";
import { Container, Label } from "@/components/ui";
import { BrandLogo } from "@/components/Logo";
import { site } from "@/lib/content";
import { SITE_URL, breadcrumbJsonLd, pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Contact Us — Book a Free Consultation",
  description: `Contact ${site.name}, Telibagh, Lucknow. Call ${formatPhone(site.phone)}, WhatsApp us or send an enquiry for a free consultation.`,
  path: "/contact",
});


/** Stylised location card (no third-party map embed, so no cookies) — opens Google Maps. */
function MapCard() {
  return (
    <a
      href={site.mapUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative block h-full min-h-[24rem] overflow-hidden bg-[#eae9e4]"
    >
      <svg viewBox="0 0 600 560" className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        {/* abstract city grid + river */}
        <g stroke="#d4d3cf" strokeWidth="10" fill="none">
          <path d="M-20 140h660M-20 300h660M-20 430h660M120-20v600M300-20v600M470-20v600" />
          <path d="M-20 60 640 520" strokeWidth="18" />
        </g>
        <path d="M-20 500c120-60 200-40 320-90s200-150 320-160v330H-20z" fill="#f7f6f2" />
        <text x="40" y="535" fontSize="13" letterSpacing="2" fill="#363e3a" opacity=".55" fontFamily="sans-serif">
          RAIBARELI ROAD · TELIBAGH · LUCKNOW
        </text>
      </svg>
      <div className="absolute left-[34%] top-[44%] flex items-center gap-3 transition-transform duration-500 group-hover:-translate-y-1">
        <svg viewBox="0 0 24 32" className="h-10 w-8 text-accent" aria-hidden="true">
          <path fill="currentColor" d="M12 0C5.4 0 0 5.2 0 11.7 0 20.5 12 32 12 32s12-11.5 12-20.3C24 5.2 18.6 0 12 0zm0 16a4.3 4.3 0 1 1 0-8.6 4.3 4.3 0 0 1 0 8.6z" />
        </svg>
        <span className="rounded-card bg-paper/90 px-3 py-2 shadow-sm">
          <BrandLogo size="h-7" wordmark="h-5" />
        </span>
      </div>
      <span className="absolute bottom-5 right-5 rounded-full bg-ink px-4 py-2 text-micro uppercase text-paper">Open in Google Maps ↗</span>
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
}

export default function ContactPage() {
  return (
    <>
      <section className="grid min-h-[38rem] grid-cols-2 pt-[6.4rem] max-lg:grid-cols-1 max-lg:pt-24">
        <Container className="flex flex-col justify-center py-16 lg:max-w-none">
          <p className="text-micro uppercase text-ink/75">Contact {site.name}</p>
          <h1 className="mt-3 text-[3.2rem] leading-[1] max-md:text-3xl">Let’s talk about your project</h1>
          <p className="mt-6 max-w-[24rem] text-[1.4rem] leading-[1.2] font-display max-md:text-xl">
            Tell us about your dream project, we will make it come true.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <a href={telHref(site.phone)} className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-ink px-5 text-micro uppercase transition-colors hover:bg-ink hover:text-paper">
              <span aria-hidden="true">☎</span> Call {formatPhone(site.phone)}
            </a>
            <a href={whatsappHref()} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-[44px] items-center gap-2 rounded-full bg-[#1a7f42] px-5 text-micro uppercase text-white transition-colors hover:bg-ink">
              <WhatsAppIcon className="h-[1.3em] w-[1.3em]" /> WhatsApp enquiry
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
            <a href="#enquiry" className="inline-flex min-h-[44px] items-center gap-2 rounded-full bg-accent px-5 text-micro font-bold uppercase text-paper transition-colors hover:bg-ink">
              Get a free consultation ↓
            </a>
          </div>
          <dl className="mt-12 grid max-w-[34rem] grid-cols-[auto_1fr] gap-x-8 gap-y-3 text-sm">
            <dt className="text-micro uppercase text-ink/75">Phone</dt>
            <dd className="flex flex-wrap gap-x-4">
              {site.phones.map((p) => (
                <a key={p} href={telHref(p)} className="inline-flex min-h-[28px] items-center hover:underline">
                  {formatPhone(p)}
                </a>
              ))}
            </dd>
            <dt className="text-micro uppercase text-ink/75">Email</dt>
            <dd className="flex flex-wrap gap-x-4">
              {site.emails.map((e) => (
                <a key={e} href={`mailto:${e}`} className="inline-flex min-h-[28px] items-center hover:underline">
                  {e}
                </a>
              ))}
            </dd>
            <dt className="text-micro uppercase text-ink/75">Studio</dt>
            <dd>
              <a href={site.mapUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">
                {site.address.street}, {site.address.city} {site.address.postalCode}
                <span className="sr-only"> (open in Google Maps, new tab)</span>
              </a>
            </dd>
          </dl>
        </Container>
        <div className="relative max-lg:h-[22rem]">
          <MapCard />
        </div>
      </section>

      <section id="enquiry" className="scroll-mt-24 rounded-section bg-ink text-paper" aria-labelledby="form-title">
        <Container className="grid grid-cols-12 gap-x-6 py-[2.2rem] max-md:grid-cols-1">
          <div className="md:col-span-3 flex flex-col justify-between gap-16 border-r border-paper/25 pr-6 max-md:col-span-1 max-md:border-0 max-md:pr-0">
            <h2 id="form-title" className="font-sans text-[0.97rem]">
              Send an enquiry
            </h2>
            <div className="space-y-10 text-[0.75rem] leading-relaxed">
              <address className="not-italic uppercase">
                {site.address.street}
                <br />
                {site.address.city}, {site.address.region} {site.address.postalCode}
              </address>
              <div>
                <Label className="mb-2 text-[0.5rem] opacity-80">Contact details</Label>
                {site.phones.map((p) => (
                  <a key={p} href={telHref(p)} className="flex min-h-[24px] items-center opacity-80 hover:opacity-100">
                    {formatPhone(p)}
                  </a>
                ))}
                <a href={whatsappHref()} target="_blank" rel="noopener noreferrer" className="flex min-h-[24px] items-center gap-2 opacity-80 hover:opacity-100">
                  <WhatsAppIcon className="h-[1.2em] w-[1.2em]" /> WhatsApp
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
                {site.emails.map((e) => (
                  <a key={e} href={`mailto:${e}`} className="flex min-h-[24px] items-center opacity-80 hover:opacity-100">
                    {e}
                  </a>
                ))}
              </div>
            </div>
          </div>
          <Reveal className="md:col-span-8 md:col-start-5 py-8 max-md:col-span-1 max-md:mt-10" y={30}>
            <Suspense fallback={<ContactFormInner />}>
              <ContactForm />
            </Suspense>
          </Reveal>
        </Container>
      </section>

      <RelatedLinks exclude={["/contact", "/blog"]} title="Before you call" />
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Contact", path: "/contact" },
          ]),
          { "@context": "https://schema.org", "@type": "ContactPage", name: `Contact ${site.name}`, url: `${SITE_URL}/contact/`, about: { "@id": `${SITE_URL}/#organization` } },
        ]}
      />
    </>
  );
}
