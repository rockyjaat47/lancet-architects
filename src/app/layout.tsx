import type { Metadata, Viewport } from "next";
import { Karla, Outfit } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Cursor from "@/components/Cursor";
import SmoothScroll from "@/components/SmoothScroll";
import CookieBanner from "@/components/CookieBanner";
import JsonLd from "@/components/JsonLd";
import { site } from "@/lib/content";
import { SITE_URL, organizationJsonLd } from "@/lib/seo";

const karla = Karla({ variable: "--font-karla", subsets: ["latin"], weight: ["300", "400", "500", "700"], display: "swap" });
const outfit = Outfit({ variable: "--font-outfit", subsets: ["latin"], weight: ["300", "400", "500", "700"], display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: `${site.name} — Architecture & Interior Design in Lucknow`, template: `%s — ${site.name}` },
  description: site.description,
  applicationName: site.name,
  alternates: { canonical: "/" },
  openGraph: { type: "website", locale: "en_IN", siteName: site.name, url: "/" },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
  keywords: ["architect in Lucknow", "architecture firm Lucknow", "interior designer Lucknow", "landscape architect", site.name],
};

export const viewport: Viewport = {
  themeColor: "#f7f6f2",
  width: "device-width",
  initialScale: 1,
};

// Runs before paint: hides the first-visit loader for returning visitors.
// Also marks that JavaScript runs ("js"): without it the loader is never shown.
const visitedScript = `document.documentElement.classList.add('js');try{if(sessionStorage.getItem('visited'))document.documentElement.classList.add('visited')}catch(e){}`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-IN" className={`${karla.variable} ${outfit.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: visitedScript }} />
      </head>
      <body>
        <a
          href="#contenu"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[3000] focus:rounded focus:bg-ink focus:px-4 focus:py-2 focus:text-paper"
        >
          Skip to content
        </a>
        <Providers>
          <Header />
          <main id="contenu">{children}</main>
          <Footer />
          <CookieBanner />
          <Cursor />
          <SmoothScroll />
        </Providers>
        <JsonLd data={organizationJsonLd()} />
      </body>
    </html>
  );
}
