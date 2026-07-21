import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "Paramatma — Hindu Scriptures",
    short_name: "Paramatma",
    description:
      "A quiet, readable home for Hindu scriptures — 108 names, aartis, bhajans, stotras, and sahasranamas in Devanagari with pronunciation and meaning.",
    start_url: "/",
    display: "standalone",
    background_color: "#fbf7ef",
    theme_color: "#7a2e2e",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512-maskable.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
