import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Post dates and contribution days are bare YYYY-MM-DD. Parsing them without an
// explicit zone makes them local, which shifts the day west of UTC.
export function utcDate(iso: string): Date {
  return new Date(`${iso}T00:00:00Z`);
}

// Both the locale and the zone are pinned: the server and the browser would
// otherwise disagree and the rendered date would not survive hydration. The
// site is served in English, so en-US is the format it should read in.
const DATE_FORMAT = new Intl.DateTimeFormat("en-US", {
  timeZone: "UTC",
  year: "numeric",
  month: "short",
  day: "numeric",
});

export function formatDate(iso: string): string {
  return DATE_FORMAT.format(utcDate(iso));
}

// Month and year only, for the "updated" line on project cards. Same pinned
// locale and zone as formatDate, so server and browser agree. Accepts the full
// ISO timestamp the GitHub API returns.
const MONTH_FORMAT = new Intl.DateTimeFormat("en-US", {
  timeZone: "UTC",
  year: "numeric",
  month: "short",
});

export function formatMonth(iso: string): string {
  const date = new Date(iso);
  return Number.isNaN(date.valueOf()) ? "" : MONTH_FORMAT.format(date);
}
