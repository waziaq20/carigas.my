import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "carigas.my — Cari Kedai Gas LPG",
    short_name: "carigas.my",
    description:
      "Find LPG gas shops near you in Malaysia. Compare prices, exchange services, and get directions.",
    start_url: "/ms",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#c53c00",
    categories: ["navigation", "utilities", "lifestyle"],
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  }
}
