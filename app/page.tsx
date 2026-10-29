import { Footer } from "@/components/footer";
import { JsonLd } from "@/components/json-ld";
import { Nav } from "@/components/nav";
import { Deferred } from "@/components/deferred";
import { Separator } from "@/components/separator";
import { SkipLink } from "@/components/skip-link";
import { Hero } from "@/sections/hero";
import { About } from "@/sections/about";
import { Projects } from "@/sections/projects";
import { Contributions } from "@/sections/contributions";
import { Blogs } from "@/sections/blogs";
import { Contact } from "@/sections/contact";
import { AUTHOR, PERSON_ID, SITE_URL, WEBSITE_ID } from "@/lib/site";

export default function Page() {
  return (
    <>
      <SkipLink />
      <Nav />
      <main id="main" className="mx-auto max-w-3xl px-6 md:px-8 pt-24 pb-32">
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "WebSite",
            "@id": WEBSITE_ID,
            name: AUTHOR.name,
            url: `${SITE_URL}/`,
            inLanguage: "en",
            author: { "@id": PERSON_ID },
            publisher: { "@id": PERSON_ID },
          }}
        />
        <Hero />
        <Deferred>
          <About />
        </Deferred>
        <Deferred>
          <Projects />
        </Deferred>
        <Deferred>
          <Contributions />
        </Deferred>
        <Deferred>
          <Blogs />
        </Deferred>
        <Deferred>
          <Contact />
        </Deferred>
      </main>
      <Separator className="mx-auto max-w-3xl" />
      <Footer />
    </>
  );
}
