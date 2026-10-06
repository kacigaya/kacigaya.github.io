"use client";

import { ErrorContent } from "@/components/error-content";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <ErrorContent error={error} onRetry={reset} />;
}
