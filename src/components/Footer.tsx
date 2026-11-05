"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { site } from "@/lib/content";
import { ArrowRight, ArrowUpRight, Container } from "./ui";

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

export function Marquee() {
  const text = `${site.tagline.before}${site.tagline.bold}${site.tagline.after}`;
  return (
    <div className="overflow-hidden py-[9rem] max-md:py-20" aria-hidden="true">
      <div className="animate-marquee flex w-max whitespace-nowrap font-display text-[8.4vw] font-light leading-none">
        <span className="pr-[0.4em]">{text}</span>
        <span className="pr-[0.4em]">{text}</span>
      </div>
    </div>
  );
}

const tel = (p: string) => `tel:${p.replace(/[^\d+]/g, "")}`;

export default function Footer() {
  const pathname = usePathname();

  if (pathname === "/") {
    return (
      <footer className="pointer-events-none fixed inset-x-0 bottom-[1.6rem] z-10 text-center text-micro text-ink/75 max-md:bottom-4">
        <p className="pointer-events-auto inline-block">{site.credit}</p>
      </footer>
    );
  }

  const linkCls = "flex min-h-[24px] items-center hover:underline";

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
                  <Link href={n.href} className="group inline-flex items-center gap-[0.63rem] underline-offset-4 hover:underline">
                    {n.label}
                    <ArrowUpRight className="h-[0.8em] w-[0.8em] transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/contact" className="group inline-flex items-center gap-[0.63rem] underline-offset-4 hover:underline">
                  <ArrowRight className="h-[0.8em] w-[0.8em]" />
                  Contact
                </Link>
              </li>
            </ul>
          </nav>
          <div className="md:col-span-3 text-micro uppercase leading-relaxed max-md:col-span-2">
            <p className="mb-14 opacity-80 max-md:mb-4">Address</p>
            <address className="not-italic">
              <a href={site.mapUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">
                {site.address.street}
                <br />
                {site.address.city}, {site.address.region} {site.address.postalCode}
                <br />
                {site.address.countryLabel}
                <span className="sr-only"> (open in Google Maps, new tab)</span>
              </a>
            </address>
          </div>
          <div className="md:col-span-3 text-micro uppercase leading-relaxed max-md:col-span-1">
            <p className="mb-14 opacity-80 max-md:mb-4">Contact</p>
            {site.phones.map((p) => (
              <a key={p} href={tel(p)} className={linkCls}>
                {p}
              </a>
            ))}
            {site.emails.map((e) => (
              <a key={e} href={`mailto:${e}`} className={`${linkCls} normal-case`}>
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
        <div className="flex flex-wrap justify-between gap-4 border-t border-line py-6 text-micro text-ink/75">
          <p>{site.credit}</p>
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
