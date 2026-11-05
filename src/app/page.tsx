import type { Metadata } from "next";
import Loader from "@/components/Loader";
import ProjectSlider from "@/components/ProjectSlider";
import { homeSlides, site } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = {
  ...pageMetadata({ path: "/" }),
  title: { absolute: `${site.name} — Best Architecture & Interior Firm in Lucknow` },
};

export default function Home() {
  const slides = homeSlides();
  return (
    <>
      <Loader />
      <p className="sr-only">
        {site.tagline.before}
        {site.tagline.bold}
        {site.tagline.after}
      </p>
      <ProjectSlider projects={slides} />
    </>
  );
}
