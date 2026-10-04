import { ArrowRight, Download } from "lucide-react";
import { Button } from "@/components/button";
import { Caret } from "@/components/caret";
import { Logo } from "@/components/logo";
import { BASE_PATH } from "@/lib/site";
import { socials } from "@/lib/socials";

export function Hero() {
  return (
    <section id="top" className="pt-8 md:pt-12">
      {/* decorative: the heading right below already carries the name */}
      <div className="mb-8 flex justify-center md:mb-10">
        <Logo className="h-16 w-auto md:h-20" />
      </div>
      <h1 className="md-h1 text-2xl md:text-3xl leading-[1.15] text-balance uppercase">
        Gaya KACI
        <Caret />
      </h1>
      <p className="mt-2 text-sm md:text-base text-muted-foreground uppercase">
        cybersecurity student · web security researcher
      </p>
      <p className="mt-6 max-w-2xl leading-relaxed text-pretty text-muted-foreground">
        Master’s student at{" "}
        <span className="text-foreground" translate="no">
          Efrei Paris Panthéon-Assas Université
        </span>
        . I work in web development and cybersecurity at{" "}
        <span className="text-foreground" translate="no">
          Société Générale Assurance
        </span>, where I
        research web security and build security tools.
      </p>
      <div className="mt-7 flex flex-wrap gap-2">
        <Button size="lg" render={<a href="#projects" />}>
          view projects
          <ArrowRight
            aria-hidden="true"
            className="transition-transform in-[[data-slot=button]:hover]:translate-x-0.5"
          />
        </Button>
        <Button size="lg" variant="outline" render={<a href="#contact" />}>
          get in touch
        </Button>
        <Button size="lg" variant="outline" render={<a href="#blogs" />}>
          read posts
        </Button>
        {/* a static asset in public/, so the base path is added by hand */}
        <Button
          size="lg"
          variant="outline"
          render={
            <a href={`${BASE_PATH}/CV_Gaya_KACI.pdf`} target="_blank" rel="noreferrer" />
          }
        >
          <Download aria-hidden="true" />
          download cv
          <span className="sr-only"> (PDF, opens in new tab)</span>
        </Button>
      </div>
      <p className="mt-6 text-sm text-muted-foreground">
        <span aria-hidden>&gt;</span>{" "}
        <span className="text-foreground">
          /{socials.location.toLowerCase().replace(/, /g, "/")}
        </span>
      </p>
    </section>
  );
}
