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
      <h1 className="sr-only">
        {site.name} — architecture & interior firm in Lucknow, Uttar Pradesh. {site.tagline.bold}
        {site.tagline.after}
      </h1>
      <ProjectSlider projects={slides} />
    </>
  );
}
