"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Button } from "@/components/button";

// Shared by app/error.tsx and app/global-error.tsx. They recover through
// different callbacks (reset and retry), so each passes its own.
export function ErrorContent({
  error,
  onRetry,
}: {
  error: Error & { digest?: string };
  onRetry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main id="main" className="mx-auto max-w-3xl px-6 pt-32 pb-32 md:px-8">
      <h1 className="md-h1 text-2xl md:text-3xl uppercase">
        500: something broke
      </h1>
      {/* scoped to the message: on <main> the whole page, buttons included,
          becomes an assertive live region. */}
      <p className="mt-6 max-w-2xl text-muted-foreground" role="alert">
        This page failed to render. Retry it, or head back home.
        {error.digest && (
          <>
            {" "}
            <span className="tabular-nums">digest {error.digest}</span>
          </>
        )}
      </p>
      <div className="mt-8 flex flex-wrap gap-2">
        <Button size="lg" onClick={onRetry}>
          retry
        </Button>
        <Button size="lg" variant="outline" render={<Link href="/" />}>
          <span className="bracketed">back home</span>
        </Button>
      </div>
    </main>
  );
}
