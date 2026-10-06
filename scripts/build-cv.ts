// Renders cv/cv.md to public/CV_Gaya_KACI.pdf: Bun's built-in Markdown
// renderer produces the HTML, cv/cv.css styles it, and headless Chromium
// prints it. Run with `bun run cv`; set CHROME to the Chromium binary when it
// is not on PATH as chromium or google-chrome.
import { $ } from "bun";
import { join } from "node:path";
import { unlinkSync } from "node:fs";

const dir = join(import.meta.dir, "..", "cv");
const out = join(import.meta.dir, "..", "public", "CV_Gaya_KACI.pdf");
// Sections listed here render side by side in one row, in this order.
const ROW = ["education", "certifications"];

const body = Bun.markdown.html(await Bun.file(join(dir, "cv.md")).text());

// Everything before the first h2 is the header. Each h2 opens a section whose
// class is its slugged title, so cv.css can style sections individually.
const [head, ...rest] = body.split(/(?=<h2>)/);
const sections = rest.map((html) => {
  const title = /<h2>(.*?)<\/h2>/.exec(html)?.[1] ?? "";
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return { slug, html: `<section class="${slug}">${html}</section>` };
});

const row = sections.filter((s) => ROW.includes(s.slug));
const firstRow = sections.findIndex((s) => ROW.includes(s.slug));
const ordered = sections.filter((s) => !ROW.includes(s.slug)).map((s) => s.html);
if (firstRow !== -1) {
  ordered.splice(firstRow, 0, `<div class="row">${row.map((s) => s.html).join("")}</div>`);
}

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Gaya KACI | CV</title>
<link rel="stylesheet" href="cv.css">
</head>
<body>
<header>${head}</header>
${ordered.join("\n")}
</body>
</html>`;

// Written next to cv.css so the stylesheet and fonts resolve relatively.
const page = join(dir, ".cv.html");
await Bun.write(page, html);

const chrome = process.env.CHROME ?? Bun.which("chromium") ?? Bun.which("google-chrome");
if (!chrome) throw new Error("Chromium not found: set CHROME to its binary");

try {
  await $`${chrome} --headless --no-sandbox --disable-gpu --font-render-hinting=none --allow-file-access-from-files --no-pdf-header-footer --print-to-pdf=${out} file://${page}`.quiet();
} finally {
  unlinkSync(page);
}
console.log(`wrote ${out}`);
