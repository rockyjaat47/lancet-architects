"use client";

import { useEffect, useRef, useState } from "react";
import { Reveal } from "./Reveal";

type Step = { title: string; text: string };

/** Sticky circle with numbered nodes + scrolling steps; the step in view is highlighted. */
export default function ProcessSteps({ steps }: { steps: Step[] }) {
  const [active, setActive] = useState(0);
  const refs = useRef<(HTMLLIElement | null)[]>([]);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(Number((e.target as HTMLElement).dataset.i));
        });
      },
      { rootMargin: "-45% 0px -45% 0px" }
    );
    refs.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, []);

  const n = steps.length;
  const R = 46;

  return (
    <div className="grid grid-cols-12 gap-x-6 max-md:grid-cols-1">
      <div className="md:col-span-5 max-md:hidden">
        <div className="sticky top-[calc(50svh-9rem)] mx-auto aspect-square w-[18rem]">
          <svg viewBox="0 0 100 100" className="h-full w-full overflow-visible" aria-hidden="true">
            <circle cx="50" cy="50" r={R} fill="none" stroke="currentColor" strokeOpacity=".35" strokeWidth=".3" />
            <circle
              cx="50"
              cy="50"
              r={R}
              fill="none"
              stroke="currentColor"
              strokeWidth=".5"
              strokeDasharray={2 * Math.PI * R}
              strokeDashoffset={2 * Math.PI * R * (1 - (active + 1) / n)}
              transform="rotate(-90 50 50)"
              className="transition-[stroke-dashoffset] duration-700 ease-out"
            />
            {steps.map((_, i) => {
              const a = (i / n) * Math.PI * 2 - Math.PI / 2;
              const x = 50 + R * Math.cos(a);
              const y = 50 + R * Math.sin(a);
              return (
                <g key={i}>
                  <circle cx={x} cy={y} r="3.2" className={`transition-colors duration-500 ${i <= active ? "fill-ink" : "fill-paper"}`} stroke="currentColor" strokeWidth=".3" />
                  <text x={x} y={y + 1.1} textAnchor="middle" fontSize="3" className={`font-sans ${i <= active ? "fill-paper" : "fill-ink"}`}>
                    {i + 1}
                  </text>
                </g>
              );
            })}
          </svg>
          <p className="absolute inset-0 flex items-center justify-center text-center font-display text-2xl leading-[1.15]">
            Your project
            <br />
            in {n} steps
          </p>
        </div>
      </div>
      <p className="mb-10 font-display text-2xl md:hidden">Your project in {n} steps</p>
      <ol className="list-none md:col-span-6 md:col-start-7 space-y-[9rem] py-[10svh] max-md:space-y-16 max-md:py-0">
        {steps.map((s, i) => (
          <li
            key={s.title}
            ref={(el) => {
              refs.current[i] = el;
            }}
            data-i={i}
            className={`transition-opacity duration-700 max-md:opacity-100 ${i === active ? "opacity-100" : "opacity-75"}`}
          >
            <div>
              <p className="text-micro font-bold uppercase tracking-[0.08em] text-ink">Step {String(i + 1).padStart(2, "0")}</p>
              <h3 className="mt-2 text-lg leading-snug">{s.title}</h3>
              <Reveal as="p" y={20} className="mt-8 max-w-[22rem] text-sm">
                {s.text}
              </Reveal>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
