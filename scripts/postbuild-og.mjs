// A static export writes each segment's opengraph-image route to an
// extensionless file (out/blog/<slug>/opengraph-image). GitHub Pages serves
// unknown extensions as application/octet-stream, which Facebook, X, and
// LinkedIn reject as an og:image. The post pages reference the .png form, so
// this renames the generated files to match. Run after `next build`.
import { readdirSync, renameSync, statSync } from "node:fs";
import { join } from "node:path";

const BLOG_DIR = join(process.cwd(), "out", "blog");

let renamed = 0;
for (const slug of readdirSync(BLOG_DIR)) {
  const dir = join(BLOG_DIR, slug);
  if (!statSync(dir).isDirectory()) continue;
  const src = join(dir, "opengraph-image");
  try {
    if (statSync(src).isFile()) {
      renameSync(src, `${src}.png`);
      renamed += 1;
    }
  } catch (err) {
    if (err.code !== "ENOENT") throw err;
  }
}

console.log(`postbuild-og: renamed ${renamed} opengraph-image file(s)`);
