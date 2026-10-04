import { Footer } from "@/components/footer";
import { Nav } from "@/components/nav";
import { Deferred } from "@/components/deferred";
import { Separator } from "@/components/separator";
import { SkipLink } from "@/components/skip-link";
import { Hero } from "@/sections/hero";
import { About } from "@/sections/about";
import { Experience } from "@/sections/experience";
import { Projects } from "@/sections/projects";
import { Contributions } from "@/sections/contributions";
import { Blogs } from "@/sections/blogs";
import { Skills } from "@/sections/skills";
import { Certifications } from "@/sections/certifications";
import { Contact } from "@/sections/contact";

export default function Page() {
  return (
    <>
      <SkipLink />
      <Nav />
      <main id="main" className="mx-auto max-w-3xl px-6 md:px-8 pt-24 pb-32">
        <Hero />
        <Deferred>
          <About />
        </Deferred>
        <Deferred>
          <Experience />
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
          <Skills />
        </Deferred>
        <Deferred>
          <Certifications />
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
