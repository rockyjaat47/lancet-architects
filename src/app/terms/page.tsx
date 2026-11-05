import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";
import { site } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({ title: "Terms & conditions", path: "/terms" });

export default function Page() {
  return (
    <LegalPage title="Terms & conditions" updated="March 2025">
      <p>By accessing and using our website and services, you agree to the following terms:</p>
      <ul>
        <li>All architectural designs and plans remain the intellectual property of {site.name}.</li>
        <li>Unauthorized use of our content — texts, drawings, photographs and logo — is strictly prohibited.</li>
        <li>Clients must provide accurate project details for proper service delivery.</li>
        <li>We reserve the right to modify these terms without prior notice.</li>
      </ul>
      <h2>Publisher</h2>
      <p>
        {site.legalName}
        <br />
        {site.address.street}, {site.address.city}, {site.address.region} {site.address.postalCode}, {site.address.countryLabel}
        <br />
        Phone: {site.phones.join(", ")} — Email: {site.email}
      </p>
      <h2>Hosting</h2>
      <p>Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, USA — vercel.com</p>
      <h2>Liability</h2>
      <p>
        We make every effort to keep the information on this website accurate and up to date, but we cannot be held
        responsible for any omissions or inaccuracies. Project images may include 3D visualisations.
      </p>
    </LegalPage>
  );
}
