"use client";

import { usePathname } from "next/navigation";
import Header from "./Header";
import Footer from "./Footer";
import Cursor from "./Cursor";
import SmoothScroll from "./SmoothScroll";
import CookieBanner from "./CookieBanner";

/** Public-site chrome (header, footer, cursor, smooth scroll, cookies). The /admin area renders without it. */
export default function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return <main id="contenu">{children}</main>;
  return (
    <>
      <Header />
      <main id="contenu">{children}</main>
      <Footer />
      <CookieBanner />
      <Cursor />
      <SmoothScroll />
    </>
  );
}
