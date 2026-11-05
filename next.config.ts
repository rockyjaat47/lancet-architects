import type { NextConfig } from "next";
import createMDX from "@next/mdx";
import path from "node:path";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  // Fully static site (SSG) — deployable to GitHub Pages, Vercel, Netlify or any static host.
  output: "export",
  trailingSlash: true,
  basePath,
  pageExtensions: ["ts", "tsx", "md", "mdx"],
  images: {
    loader: "custom",
    loaderFile: "./src/lib/image-loader.ts",
    deviceSizes: [480, 828, 1280, 1920],
    imageSizes: [240, 320],
  },
  turbopack: {
    root: path.resolve("."),
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

const withMDX = createMDX({});

export default withMDX(nextConfig);
