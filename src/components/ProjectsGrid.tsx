"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import type { Project } from "@/lib/content";
import { categories, categoryLabel, projectLocation } from "@/lib/content";
import { expoOut } from "@/lib/motion";
import { Container } from "./ui";

export default function ProjectsGrid({ projects }: { projects: Project[] }) {
  const [cat, setCat] = useState("all");
  const list = cat === "all" ? projects : projects.filter((p) => p.category === cat);
  const count = (id: string) => (id === "all" ? projects.length : projects.filter((p) => p.category === id).length);

  return (
    <>
      <Container>
      <hr className="h-px border-0 bg-line" />
      <ul className="grid grid-cols-1 gap-x-[8.75rem] gap-y-16 pb-[16rem] pt-[3.2rem] md:grid-cols-2 max-md:pb-32">
        <AnimatePresence mode="popLayout" initial={false}>
          {list.map((p, i) => (
            <motion.li
              key={p.slug}
              layout
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, transition: { duration: 0.25 } }}
              transition={{ duration: 0.9, ease: expoOut, delay: (i % 6) * 0.05 }}
              className={i % 2 === 1 ? "md:translate-y-[13.5rem]" : ""}
            >
              <Link href={`/projects/${p.slug}`} className="group block" data-cursor="view">
                <div className="relative aspect-[4/3] overflow-hidden rounded-card bg-line">
                  <Image
                    src={p.cover}
                    alt={p.alt}
                    fill
                    priority={i < 2}
                    sizes="(max-width: 767px) 88vw, 42vw"
                    className="object-cover transition-transform duration-[1.2s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
                  />
                </div>
                <p className="mt-8 text-[0.56rem] uppercase text-ink/75 max-md:mt-4 max-md:text-micro">
                  {categoryLabel(p.category)} / {projectLocation(p)}
                </p>
                <h2 className="mt-1 text-[1.39rem] leading-snug max-md:text-lg">
                  <span className="bg-[linear-gradient(currentColor,currentColor)] bg-[length:0%_1px] bg-left-bottom bg-no-repeat transition-[background-size] duration-500 group-hover:bg-[length:100%_1px]">
                    {p.title}
                  </span>
                </h2>
              </Link>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
      </Container>

      {/* sticky category bar (reference: white bar fixed at the bottom) */}
      <div className="sticky bottom-0 z-20 bg-white">
        <div
          role="group"
          aria-label="Filter by category"
          className="mx-auto flex max-w-[105rem] items-center justify-center gap-[2.2rem] px-[6vw] py-[2.2rem] max-md:justify-start max-md:gap-5 max-md:overflow-x-auto max-md:py-4"
        >
          <p className="mr-10 font-display text-[1rem] font-bold max-md:mr-1 max-md:text-sm">Categories</p>
          {categories.map((c) => (
            <button
              key={c.id}
              type="button"
              aria-pressed={cat === c.id}
              onClick={() => setCat(c.id)}
              className={`flex min-h-[24px] shrink-0 items-start whitespace-nowrap text-[0.65rem] uppercase tracking-[0.02em] transition-opacity hover:opacity-100 max-md:text-micro ${
                cat === c.id ? "underline underline-offset-4 opacity-100" : "opacity-80"
              }`}
            >
              {c.label}
              <sup className="ml-[0.2em] text-[0.7em]" aria-hidden="true">
                {count(c.id)}
              </sup>
              <span className="sr-only">, {count(c.id)} {count(c.id) === 1 ? "project" : "projects"}</span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
