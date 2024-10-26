import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "AQ Styles",
    short_name: "AQ",
    description: "Inventory management system for AQ STYLES",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#2EC6FE",
    theme_color: "#9d57ff",
    dir: "auto",
    lang: "en-US",
    icons: [
      {
        src: "/icon512_maskable.png", // Ensure this is in the public folder
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icon512_rounded.png", // Ensure this is in the public folder
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
