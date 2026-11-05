// Shared validation for the contact form (client + API route). No external dependency.
export type ContactInput = {
  profile: string;
  service?: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  consent: boolean;
  website?: string; // honeypot
};

export type ContactErrors = Partial<Record<keyof ContactInput, string>>;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE = /^[+()\d\s.-]{6,20}$/;

export function validateContact(v: Partial<ContactInput>): ContactErrors {
  const e: ContactErrors = {};
  if (!v.name || v.name.trim().length < 2) e.name = "Please enter your name.";
  if (!v.email || !EMAIL.test(v.email.trim())) e.email = "Please enter a valid email address.";
  if (v.phone && !PHONE.test(v.phone.trim())) e.phone = "Please enter a valid phone number.";
  if (!v.message || v.message.trim().length < 10) e.message = "Your message should be at least 10 characters.";
  if (v.message && v.message.length > 5000) e.message = "Your message is too long (5,000 characters max).";
  if (!v.consent) e.consent = "Please agree so we can process your request.";
  return e;
}
