"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { site } from "@/lib/content";
import { BrandLogo } from "./Logo";
import { ArrowRight, ArrowUpRight, ConsultButton, Container, WhatsAppIcon } from "./ui";
import { consultationHref, formatPhone, telHref, whatsappHref } from "@/lib/contact";

const nav = [
  { label: "Projects", href: "/projects" },
  { label: "About", href: "/about" },
  { label: "Services", href: "/services" },
  { label: "Gallery", href: "/gallery" },
  { label: "Blog", href: "/blog" },
];

const social: { label: string; href: string }[] = [
  { label: "WhatsApp", href: site.socials.whatsapp },
  { label: "Google reviews", href: site.socials.google },
];

/** Big scrolling call to action above the footer (links to the enquiry form). */
export function Marquee() {
  const text = "Let’s design your space — get a free consultation →";
  return (
    <Link href={consultationHref()} prefetch={false} className="group block overflow-hidden py-[9rem] transition-colors hover:text-accent max-md:py-20">
      <span className="sr-only">Get a free consultation</span>
      <span aria-hidden="true" className="animate-marquee flex w-max whitespace-nowrap font-display text-[8.4vw] font-light leading-none">
        <span className="pr-[0.6em]">{text}</span>
        <span className="pr-[0.6em]">{text}</span>
      </span>
    </Link>
  );
}

/** Home page: compact contact bar at the bottom of the slider. */
function HomeContactBar() {
  const item = "pointer-events-auto inline-flex min-h-[32px] items-center gap-2 rounded-full px-3 hover:bg-ink hover:text-paper transition-colors";
  return (
    <footer className="pointer-events-none fixed inset-x-0 bottom-[1.1rem] z-10 px-[3.68rem] text-micro uppercase text-ink max-lg:bottom-3 max-lg:px-[4vw]">
      <div className="flex items-center justify-between gap-3 max-lg:justify-center">
        <nav aria-label="Quick contact" className="flex flex-wrap items-center gap-1 max-lg:justify-center">
          <a href={telHref(site.phone)} className={item}>
            <span aria-hidden="true">☎</span>
            <span className="max-lg:hidden">{formatPhone(site.phone)}</span>
            <span className="lg:hidden">Call</span>
          </a>
          <a href={whatsappHref()} target="_blank" rel="noopener noreferrer" className={item}>
            <WhatsAppIcon className="h-[1.3em] w-[1.3em] text-[#1a9e4b]" /> WhatsApp<span className="sr-only"> (opens in a new tab)</span>
          </a>
          <a href={`mailto:${site.email}`} className={`${item} normal-case`}>
            <span aria-hidden="true">✉</span>
            <span className="max-lg:hidden">{site.email}</span>
            <span className="uppercase lg:hidden">Email</span>
          </a>
          <ConsultButton className="pointer-events-auto ml-2 !min-h-[32px] !px-4 lg:hidden">Free consultation</ConsultButton>
        </nav>
        <p className="pointer-events-auto normal-case text-ink/75 max-lg:hidden">{site.credit}</p>
      </div>
    </footer>
  );
}

export default function Footer() {
  const pathname = usePathname();

  if (pathname === "/") return <HomeContactBar />;

  const linkCls = "flex min-h-[24px] items-center hover:underline";
  // A link to the page you are on does nothing by default: scroll back to the top instead.
  const samePage = (href: string) => (e: React.MouseEvent) => {
    if (pathname.replace(/\/$/, "") !== href) return;
    e.preventDefault();
    const lenis = (window as unknown as { __lenis?: { scrollTo: (t: number, o?: object) => void } }).__lenis;
    if (lenis) lenis.scrollTo(0, { duration: 1.2 });
    else window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="bg-paper">
      <Marquee />
      <Container>
        <hr className="h-px border-0 bg-line" />
        <div className="grid grid-cols-12 gap-x-6 gap-y-12 pb-16 pt-[4.5rem] max-md:grid-cols-2">
          <nav aria-label="Footer" className="md:col-span-4 max-md:col-span-2">
            <ul className="font-sans text-[1.39rem] leading-[1.35] max-md:text-2xl">
              {nav.map((n) => (
                <li key={n.href}>
                  <Link href={n.href} onClick={samePage(n.href)} aria-current={pathname.replace(/\/$/, "") === n.href ? "page" : undefined} className="group inline-flex items-center gap-[0.63rem] underline-offset-4 hover:underline">
                    {n.label}
                    <ArrowUpRight className="h-[0.8em] w-[0.8em] transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/contact" onClick={samePage("/contact")} className="group inline-flex items-center gap-[0.63rem] underline-offset-4 hover:underline">
                  <ArrowRight className="h-[0.8em] w-[0.8em]" />
                  Contact
                </Link>
              </li>
            </ul>
          </nav>
          <div className="md:col-span-3 text-micro uppercase leading-relaxed max-md:col-span-2">
            <p className="mb-14 opacity-80 max-md:mb-4">Address</p>
            <address className="not-italic">
              <a href={site.mapUrl} target="_blank" rel="noopener noreferrer" className="group block underline-offset-2 hover:underline">
                {site.address.street}
                <br />
                {site.address.city}, {site.address.region} {site.address.postalCode}
                <br />
                {site.address.countryLabel}
                <span className="mt-3 flex min-h-[24px] items-center gap-1 underline underline-offset-2">
                  View on Google Maps <ArrowUpRight className="h-[0.9em] w-[0.9em]" />
                </span>
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            </address>
          </div>
          <div className="md:col-span-3 text-micro uppercase leading-relaxed max-md:col-span-1">
            <p className="mb-14 opacity-80 max-md:mb-4">Contact</p>
            {site.phones.map((p) => (
              <a key={p} href={telHref(p)} className={linkCls}>
                <span className="sr-only">Call </span>
                {formatPhone(p)}
              </a>
            ))}
            <a href={whatsappHref()} target="_blank" rel="noopener noreferrer" className={`${linkCls} gap-2`}>
              <WhatsAppIcon className="h-[1.3em] w-[1.3em] text-[#1a9e4b]" /> WhatsApp enquiry
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
            {site.emails.map((e) => (
              <a key={e} href={`mailto:${e}?subject=${encodeURIComponent("Project enquiry")}`} className={`${linkCls} normal-case`}>
                {e}
              </a>
            ))}
            <Link href="/contact" className="mt-1 flex min-h-[24px] items-center underline underline-offset-2">
              Contact form
            </Link>
          </div>
          <div className="md:col-span-2 text-right text-micro uppercase leading-relaxed max-md:col-span-1 max-md:text-left">
            <p className="mb-14 opacity-80 max-md:mb-4">Follow us</p>
            <ul>
              {social.map((s) => (
                <li key={s.label}>
                  <a href={s.href} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-[24px] items-center underline underline-offset-2 hover:opacity-80">
                    {s.label}
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-line py-6 text-micro text-ink/75">
          <p className="flex items-center gap-4">
            <BrandLogo size="h-9" wordmark="h-4" />
            <span>{site.credit}</span>
          </p>
          <p className="flex gap-6 [&>a]:inline-flex [&>a]:min-h-[24px] [&>a]:items-center">
            <Link href="/terms" className="hover:underline">
              Terms & conditions
            </Link>
            <Link href="/privacy-policy" className="hover:underline">
              Privacy policy
            </Link>
          </p>
        </div>
      </Container>
    </footer>
  );
}
