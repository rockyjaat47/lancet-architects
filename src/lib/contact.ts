import { site } from "./content";

/** "+91-8707438955" → "+91 87074 38955" (Indian mobile grouping). */
export function formatPhone(p: string) {
  const d = p.replace(/\D/g, "");
  if (d.length === 12 && d.startsWith("91")) return `+91 ${d.slice(2, 7)} ${d.slice(7)}`;
  return p;
}

export const telHref = (p: string) => `tel:+${p.replace(/\D/g, "")}`;

/** WhatsApp chat link with a pre-filled enquiry message. */
export function whatsappHref(message = `Hello ${site.name}, I would like to enquire about a project.`) {
  return `${site.socials.whatsapp}?text=${encodeURIComponent(message)}`;
}

export const consultationHref = (service?: string) => `/contact/?service=${encodeURIComponent(service ?? "Free consultation")}#enquiry`;
