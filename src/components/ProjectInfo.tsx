"use client";

import { useId, useState } from "react";

export default function ProjectDescription({ paragraphs }: { paragraphs: string[] }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  return (
    <div>
      <div
        id={id}
        className={`relative space-y-[1.4em] overflow-hidden text-[0.97rem] leading-[1.55] transition-[max-height] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          open ? "max-h-[60rem]" : "max-h-[15.5rem]"
        }`}
      >
        {paragraphs.map((t, i) => (
          <p key={i}>{t}</p>
        ))}
        {!open && <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-paper" />}
      </div>
      {paragraphs.length > 1 && (
        <button
          type="button"
          aria-expanded={open}
          aria-controls={id}
          onClick={() => setOpen(!open)}
          className="mt-6 text-[0.97rem] underline underline-offset-4 hover:opacity-80"
        >
          {open ? "Read less" : "Read more"}
        </button>
      )}
    </div>
  );
}
