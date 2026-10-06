"use client";

import { ErrorContent } from "@/components/error-content";
import { jetbrains } from "./fonts";
import "./globals.css";

// Catches errors in the root layout itself, where app/error.tsx cannot.
// Must carry its own <html> and <body> since the root layout is replaced.
export default function GlobalError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <html lang="en" className={`${jetbrains.variable} dark`}>
      <title>Something went wrong | Gaya KACI</title>
      <body className="min-h-dvh">
        <ErrorContent error={error} onRetry={retry} />
      </body>
    </html>
  );
}
