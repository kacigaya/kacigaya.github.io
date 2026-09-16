import { GITHUB_LOGIN } from "@/lib/socials";
import { utcDate } from "@/lib/utils";

export type ContributionDay = {
  date: string;
  count: number;
  level: number;
};

export type Calendar = {
  weeks: (ContributionDay | null)[][];
  months: (string | null)[];
};

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

// the API pads the window out to whole weeks, so trailing days can sit in the
// future. Cut at today the way GitHub does.
export function upToToday(
  days: ContributionDay[],
  today: string,
): ContributionDay[] {
  return days.filter((d) => d.date <= today);
}

// pad to whole GitHub-style weeks (Sunday-first columns), then tag the column
// where each month first appears so labels line up over the grid.
export function toCalendar(days: ContributionDay[]): Calendar {
  if (days.length === 0) return { weeks: [], months: [] };

  const lead = utcDate(days[0].date).getUTCDay();
  const cells: (ContributionDay | null)[] = [...Array(lead).fill(null), ...days];
  while (cells.length % 7 !== 0) cells.push(null);

  const weeks: (ContributionDay | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));

  const months: (string | null)[] = weeks.map(() => null);
  let last = -1;
  weeks.forEach((week, wi) => {
    const day = week.find(Boolean);
    if (!day) return;
    const month = utcDate(day.date).getUTCMonth();
    if (month !== last) {
      months[wi] = MONTHS[month];
      last = month;
    }
  });

  return { weeks, months };
}

// Runs once, during the static export. The daily rebuild keeps the window
// current.
export async function getContributions(): Promise<
  (Calendar & { total: number }) | null
> {
  const today = new Date().toISOString().slice(0, 10);
  try {
    // y=last is the rolling 12-month window GitHub shows on a profile, not the
    // calendar year. Its total lands under a "lastYear" key instead of a year.
    const res = await fetch(
      `https://github-contributions-api.jogruber.de/v4/${GITHUB_LOGIN}?y=last`,
    );
    if (!res.ok) return null;
    const json = (await res.json()) as {
      total?: Record<string, number>;
      contributions?: ContributionDay[];
    };
    return {
      total: json.total?.lastYear ?? 0,
      ...toCalendar(upToToday(json.contributions ?? [], today)),
    };
  } catch {
    return null;
  }
}
