import Link from "next/link";
import { ArrowUpRight, ConsultButton, Container } from "./ui";

const ALL = [
  { href: "/projects", label: "Our projects", text: "Hospitals, showrooms, homes and interiors we have designed." },
  { href: "/services", label: "Our services", text: "Architecture, interiors, landscape and project management." },
  { href: "/about", label: "About Lancet", text: "Our vision, mission, director and team in Lucknow." },
  { href: "/gallery", label: "Gallery", text: "Photos of our buildings and interiors." },
  { href: "/blog", label: "Blog", text: "Ideas on modern, sustainable architecture." },
  { href: "/contact", label: "Contact us", text: "Call, WhatsApp or send an enquiry." },
];

/** Contextual internal links ("Explore more") placed at the end of inner pages. */
export default function RelatedLinks({ exclude = [], title = "Explore more", service }: { exclude?: string[]; title?: string; service?: string }) {
  const links = ALL.filter((l) => !exclude.includes(l.href)).slice(0, 4);
  return (
    <Container className="mt-[8rem] max-md:mt-20">
      <section aria-labelledby="related-title" className="border-t border-line pt-10">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <h2 id="related-title" className="font-sans text-micro uppercase">
            {title}
          </h2>
          <ConsultButton service={service} />
        </div>
        <ul className="mt-10 grid grid-cols-4 gap-6 max-lg:grid-cols-2 max-md:grid-cols-1">
          {links.map((l) => (
            <li key={l.href}>
              <Link href={l.href} className="group block h-full rounded-card border border-line p-6 transition-colors hover:border-ink">
                <span className="flex items-center justify-between font-display text-lg">
                  {l.label}
                  <ArrowUpRight className="h-[0.8em] w-[0.8em] transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </span>
                <span className="mt-2 block text-sm text-ink/80">{l.text}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </Container>
  );
}
