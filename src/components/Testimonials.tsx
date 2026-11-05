import type { Testimonial } from "@/lib/content";
import { Reveal } from "./Reveal";

function Stars({ n }: { n: number }) {
  return (
    <span className="flex gap-0.5 text-accent" aria-label={`${n} out of 5 stars`} role="img">
      {Array.from({ length: 5 }, (_, i) => (
        <svg key={i} viewBox="0 0 20 20" className={`h-3.5 w-3.5 ${i < n ? "fill-current" : "fill-line"}`} aria-hidden="true">
          <path d="m10 1.5 2.6 5.3 5.9.9-4.3 4.1 1 5.8L10 14.9l-5.2 2.7 1-5.8L1.5 7.7l5.9-.9z" />
        </svg>
      ))}
    </span>
  );
}

/** Client reviews (imported from the Google reviews of the previous site). */
export default function Testimonials({ items }: { items: Testimonial[] }) {
  return (
    <ul className="grid grid-cols-3 gap-x-6 gap-y-10 max-lg:grid-cols-2 max-md:grid-cols-1">
      {items.map((t, i) => (
        <Reveal as="li" key={t.name} delay={(i % 3) * 0.08} y={30} className="flex flex-col justify-between border-t border-ink pt-5">
          <figure>
            <Stars n={t.rating} />
            <blockquote className="mt-5 font-display text-lg leading-snug">“{t.text}”</blockquote>
            <figcaption className="mt-6 text-micro uppercase">{t.name}</figcaption>
          </figure>
        </Reveal>
      ))}
    </ul>
  );
}
