"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { validateContact, type ContactErrors, type ContactInput } from "@/lib/contact-schema";
import { site } from "@/lib/content";

export const SERVICES = ["Free consultation", "Architectural design", "Interior design", "Landscape design", "Project management & execution", "Other"];
const empty: ContactInput = { profile: "A homeowner", service: SERVICES[0], name: "", email: "", phone: "", message: "", consent: false, website: "" };

/** Reads ?service=… (from the "Get a free consultation" / "Discuss your project" buttons) to pre-select the service. */
export default function ContactForm() {
  const q = useSearchParams().get("service");
  const service = q && SERVICES.includes(q) ? q : SERVICES[0];
  return <ContactFormInner key={service} service={service} />;
}

export function ContactFormInner({ service = SERVICES[0] }: { service?: string }) {
  const [v, setV] = useState<ContactInput>({ ...empty, service });
  const [errors, setErrors] = useState<ContactErrors>({});
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [serverError, setServerError] = useState("");
  const [mailto, setMailto] = useState(false);

  const set = <K extends keyof ContactInput>(k: K, val: ContactInput[K]) => {
    setV((s) => ({ ...s, [k]: val }));
    if (errors[k]) setErrors((e) => ({ ...e, [k]: undefined }));
  };

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const errs = validateContact(v);
    setErrors(errs);
    if (Object.keys(errs).length) {
      const first = Object.keys(errs)[0];
      (e.currentTarget.elements.namedItem(first) as HTMLElement | null)?.focus();
      return;
    }
    setStatus("sending");
    const endpoint = process.env.NEXT_PUBLIC_FORM_ENDPOINT;
    if (v.website) return setStatus("sent"); // honeypot
    if (!endpoint) {
      // Static hosting without a form service: open the visitor's email app, pre-filled.
      const subject = `${v.service}: enquiry from ${v.name} (${v.profile})`;
      const body = `Service: ${v.service}\nProfile: ${v.profile}\nName: ${v.name}\nEmail: ${v.email}\nPhone: ${v.phone}\n\n${v.message}`;
      window.location.href = `mailto:${site.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      setMailto(true);
      setStatus("sent");
      return;
    }
    try {
      // Works with Formspree / Web3Forms / Getform style endpoints (JSON POST).
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          ...(process.env.NEXT_PUBLIC_FORM_ACCESS_KEY ? { access_key: process.env.NEXT_PUBLIC_FORM_ACCESS_KEY } : {}),
          subject: `${v.service}: enquiry from ${v.name} (${v.profile})`,
          service: v.service,
          profile: v.profile,
          name: v.name,
          email: v.email,
          phone: v.phone,
          message: v.message,
        }),
      });
      if (!res.ok) throw new Error(String(res.status));
      setStatus("sent");
      setV(empty);
    } catch {
      setServerError(`Sending failed. Please call ${site.phone} or write to ${site.email}.`);
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <div role="status" className="py-10">
        <p className="font-display text-2xl">{mailto ? "Your email app has opened." : "Thank you — your message has been sent."}</p>
        <p className="mt-4 text-sm opacity-80">
          {mailto ? (
            <>
              Just press send. Nothing opened? Write to <a href={`mailto:${site.email}`} className="underline">{site.email}</a> or call{" "}
              <a href={`tel:${site.phone.replace(/[^\d+]/g, "")}`} className="underline">{site.phone}</a>.
            </>
          ) : (
            "We will get back to you shortly."
          )}
        </p>
        <button type="button" onClick={() => {
            setMailto(false);
            setStatus("idle");
          }} className="mt-8 text-micro uppercase underline underline-offset-4">
          Send another message
        </button>
      </div>
    );
  }

  const field = "w-full border-0 border-b border-paper/30 bg-transparent py-3 text-[1rem] text-paper outline-none transition-colors placeholder:text-paper/35 focus:border-paper";
  const err = (k: keyof ContactInput) =>
    errors[k] ? (
      <p id={`${k}-error`} className="mt-2 text-micro text-accent">
        {errors[k]}
      </p>
    ) : null;
  const aria = (k: keyof ContactInput) => ({ "aria-invalid": !!errors[k], "aria-describedby": errors[k] ? `${k}-error` : undefined });

  return (
    <form noValidate onSubmit={onSubmit} className="space-y-10" aria-label="Contact form">
      <div className="flex flex-wrap items-end gap-x-6 gap-y-2">
        <label htmlFor="profile" className="font-display text-2xl leading-none text-paper/60">
          I am
        </label>
        <div className="relative min-w-[18rem] flex-1 max-w-[20rem]">
          <select id="profile" name="profile" value={v.profile} onChange={(e) => set("profile", e.target.value)} className={`${field} appearance-none pr-8 text-micro uppercase`}>
            <option className="text-ink">A homeowner</option>
            <option className="text-ink">A business</option>
            <option className="text-ink">An institution</option>
            <option className="text-ink">A job applicant</option>
          </select>
          <span aria-hidden="true" className="pointer-events-none absolute right-1 top-1/2 -translate-y-1/2 text-[0.6rem] opacity-80">
            ▼
          </span>
        </div>
      </div>

      <div className="flex flex-wrap items-end gap-x-6 gap-y-2">
        <label htmlFor="service" className="font-display text-2xl leading-none text-paper/60">
          I need
        </label>
        <div className="relative min-w-[18rem] flex-1 max-w-[20rem]">
          <select id="service" name="service" value={v.service} onChange={(e) => set("service", e.target.value)} className={`${field} appearance-none pr-8 text-micro uppercase`}>
            {SERVICES.map((s) => (
              <option key={s} className="text-ink">
                {s}
              </option>
            ))}
          </select>
          <span aria-hidden="true" className="pointer-events-none absolute right-1 top-1/2 -translate-y-1/2 text-[0.6rem] opacity-80">
            ▼
          </span>
        </div>
      </div>

      <div className="grid gap-10 md:grid-cols-2">
        <div>
          <label htmlFor="name" className="text-micro uppercase opacity-80">
            Full name *
          </label>
          <input id="name" name="name" autoComplete="name" value={v.name} onChange={(e) => set("name", e.target.value)} className={field} {...aria("name")} />
          {err("name")}
        </div>
        <div>
          <label htmlFor="email" className="text-micro uppercase opacity-80">
            Email *
          </label>
          <input id="email" name="email" type="email" autoComplete="email" value={v.email} onChange={(e) => set("email", e.target.value)} className={field} {...aria("email")} />
          {err("email")}
        </div>
        <div>
          <label htmlFor="phone" className="text-micro uppercase opacity-80">
            Phone
          </label>
          <input id="phone" name="phone" type="tel" autoComplete="tel" value={v.phone} onChange={(e) => set("phone", e.target.value)} className={field} {...aria("phone")} />
          {err("phone")}
        </div>
      </div>

      <div>
        <label htmlFor="message" className="text-micro uppercase opacity-80">
          Tell us about your project *
        </label>
        <textarea id="message" name="message" rows={5} value={v.message} onChange={(e) => set("message", e.target.value)} className={`${field} resize-y`} {...aria("message")} />
        {err("message")}
      </div>

      {/* honeypot */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="website">Leave empty</label>
        <input id="website" name="website" tabIndex={-1} autoComplete="off" value={v.website} onChange={(e) => set("website", e.target.value)} />
      </div>

      <div>
        <div className="flex items-start gap-3">
          <input
            id="consent"
            name="consent"
            type="checkbox"
            checked={v.consent}
            onChange={(e) => set("consent", e.target.checked)}
            className="mt-1 h-4 w-4 shrink-0 accent-accent"
            {...aria("consent")}
          />
          <label htmlFor="consent" className="text-[0.8rem] leading-relaxed opacity-80">
            I agree that my details may be used to contact me about my enquiry, as described in the{" "}
            <Link href="/privacy-policy" className="underline underline-offset-2">
              privacy policy
            </Link>
            . *
          </label>
        </div>
        {err("consent")}
      </div>

      {status === "error" && (
        <p role="alert" className="text-sm text-accent">
          {serverError}
        </p>
      )}

      <button
        type="submit"
        disabled={status === "sending"}
        className="inline-flex items-center gap-2 rounded-full border border-paper/60 px-6 py-3 text-micro uppercase transition-colors hover:bg-paper hover:text-ink disabled:opacity-50"
      >
        <span aria-hidden="true" className="h-[0.45rem] w-[0.45rem] rounded-full bg-current" />
        {status === "sending" ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}
