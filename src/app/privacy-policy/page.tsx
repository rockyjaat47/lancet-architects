import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";
import { site } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({ title: "Privacy policy", path: "/privacy-policy" });

export default function Page() {
  return (
    <LegalPage title="Privacy policy" updated="March 2025">
      <p>
        At {site.name}, we are committed to protecting your privacy. This Privacy Policy explains how we collect, use,
        disclose, and safeguard your personal information when you visit our website or use our architectural services. By
        using our website and services, you agree to the practices described in this policy.
      </p>
      <h2>1. Information collection</h2>
      <p>
        We may collect personal information such as your name, email address, phone number, mailing address, and project
        details when you contact us or request our services. Additionally, we gather non-personal data, including your
        browser type, IP address, and website usage details through cookies and tracking technologies — only if you accept
        them in the cookie banner. This information helps us improve our services and enhance your experience.
      </p>
      <h2>2. How we use your data</h2>
      <p>
        Your information is primarily used to provide architectural design and consulting services, respond to inquiries,
        and improve our website. We may also send updates, promotional offers, or newsletters, but you can opt out at any
        time.
      </p>
      <h2>3. Data sharing</h2>
      <p>
        We do not sell, rent, or trade your personal information. However, in certain cases, we may share it with service
        providers who assist us in delivering our services (website hosting, email delivery), comply with legal
        requirements, or protect our rights and security.
      </p>
      <h2>4. Data protection</h2>
      <p>To protect your data, we implement industry-standard security measures, but no method is 100% secure.</p>
      <h2>5. Cookies & tracking</h2>
      <p>
        Our website may use cookies to enhance your experience. Analytics cookies are only set after you click “Accept” in
        the cookie banner; your choice is stored in your browser (key “cookie-consent”). You can also manage cookies through
        your browser settings.
      </p>
      <h2>6. Your rights</h2>
      <p>
        You have rights regarding your personal information, including the ability to access, correct, delete, or restrict
        its use. If you wish to exercise these rights, you may contact us at <a href={`mailto:${site.email}`}>{site.email}</a>.
      </p>
      <h2>7. Third-party links</h2>
      <p>Our website may contain links to third-party websites, but we are not responsible for their privacy practices.</p>
      <h2>8. Policy updates</h2>
      <p>We may update this Privacy Policy periodically, and any changes will be posted on this page with the updated effective date.</p>
      <h2>9. Contact information</h2>
      <p>
        If you have any questions about this policy, please contact us:
        <br />
        Phone: {site.phones.join(", ")}
        <br />
        Email: {site.emails.join(", ")}
        <br />
        Address: {site.address.street}, {site.address.city}, {site.address.region} {site.address.postalCode}
      </p>
    </LegalPage>
  );
}
