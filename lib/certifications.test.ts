import { expect, test } from "bun:test";
import { certifications, foundational } from "./certifications";

test("names are unique, so React keys stay stable", () => {
  const names = [...certifications, ...foundational].map((c) => c.name);
  expect(new Set(names).size).toBe(names.length);
});

test("credential links use HTTPS and recognized providers", () => {
  for (const cert of [...certifications, ...foundational]) {
    if (!cert.url) continue;
    const url = new URL(cert.url);
    expect(url.protocol).toBe("https:");
    expect(["www.credly.com", "www.skills.google"]).toContain(url.hostname);
  }
});
