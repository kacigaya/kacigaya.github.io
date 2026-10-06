import { Footer } from "@/components/footer";
import { Nav } from "@/components/nav";
import { SkipLink } from "@/components/skip-link";
import "../prose.css";

// Both policy pages are the same shell around a block of running text, so the
// shell lives here and each page contributes only its own copy and metadata.
export default function LegalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SkipLink />
      <Nav />
      <main
        id="main"
        className="prose mx-auto max-w-3xl px-6 pt-24 pb-32 md:px-8"
      >
        {children}
      </main>
      <Footer className="pt-0" />
    </>
  );
}
