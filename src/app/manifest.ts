import { asset } from "@/lib/base-path";
import type { MetadataRoute } from "next";
import { site } from "@/lib/content";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: site.name,
    short_name: site.name,
    lang: "en-IN",
    start_url: asset("/"),
    display: "standalone",
    background_color: "#f7f6f2",
    theme_color: "#f7f6f2",
    icons: [{ src: asset("/icon.jpg"), sizes: "476x476", type: "image/jpeg" }],
  };
}

export const dynamic = "force-static";
