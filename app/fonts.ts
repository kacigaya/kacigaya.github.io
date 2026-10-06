import localFont from "next/font/local";

export const jetbrains = localFont({
  variable: "--font-jetbrains",
  display: "swap",
  // ponytail: content glyph subset; regenerate the WOFF2 files when adding new scripts.
  src: [
    { path: "../assets/fonts/JetBrainsMonoNerdFont-Regular.woff2", weight: "400", style: "normal" },
    { path: "../assets/fonts/JetBrainsMonoNerdFont-Bold.woff2", weight: "700", style: "normal" },
  ],
});
