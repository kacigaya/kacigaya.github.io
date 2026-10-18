import { Fragment } from "react";
import { cn, formatDate } from "@/lib/utils";
import { getContributions } from "@/lib/contributions";

// mixes of the --contrib green, defined in globals.css
const LEVEL = ["level-0", "level-1", "level-2", "level-3", "level-4"];
const WEEKDAYS = ["", "Mon", "", "Wed", "", "Fri", ""];

export async function Contributions() {
  const data = await getContributions();
  if (!data || data.weeks.length === 0) return null;

  // one grid: a label gutter column, then one column per week. Columns fill the
  // container and stop growing at an 11px cell, GitHub's size. They have no
  // floor, so all 53 weeks stay on screen at any width instead of scrolling
  // sideways; cells just get small on a phone.
  const template = `auto repeat(${data.weeks.length}, minmax(0, 1fr))`;
  const maxWidth = `calc(${data.weeks.length} * 13px + 2.5rem)`;

  return (
    <section id="contributions" className="mt-12 border-t pt-12">
      <h2 className="md-h2 text-base uppercase">contributions</h2>
      <p className="mt-2 text-xs text-muted-foreground tabular-nums">
        {data.total} contributions in the last year · via github
      </p>
      {/* a chart, not content: the total above is the accessible summary, and
          per-cell labels would be 365 nodes of noise in a screen reader */}
      {/* the capped grid can end up narrower than the column, so the wrapper
          tracks its width and the legend below lines up with its right edge */}
      <div className="mt-6 max-w-full" style={{ width: maxWidth }}>
        <div
          role="img"
          aria-label={`Contribution calendar: ${data.total} contributions in the last year`}
          className="rounded-sm"
        >
          <div
            className="grid gap-px sm:gap-[2px] text-[10px] sm:text-[11px] text-muted-foreground"
            style={{ gridTemplateColumns: template }}
          >
            <div />
            {data.months.map((m, i) => (
              <div key={i} className="mb-1 whitespace-nowrap leading-none">
                {m}
              </div>
            ))}
            {WEEKDAYS.map((label, row) => (
              <Fragment key={row}>
                <div className="flex items-center pr-1 leading-none">
                  {label}
                </div>
                {data.weeks.map((week, wi) => {
                  const day = week[row];
                  return (
                    <div
                      key={wi}
                      title={
                        day
                          ? `${day.count} on ${formatDate(day.date)}`
                          : undefined
                      }
                      className={cn(
                        "contrib-cell",
                        // level comes straight from a third-party API: an
                        // out-of-range value would render an invisible cell.
                        day && (LEVEL[day.level] ?? LEVEL[0]),
                      )}
                    />
                  );
                })}
              </Fragment>
            ))}
          </div>
        </div>
        <div className="mt-3 flex items-center justify-end gap-2 text-[11px] text-muted-foreground">
          <div className="flex items-center gap-[3px]">
            <span className="mr-1">Less</span>
            {LEVEL.map((c, i) => (
              <div key={i} className={cn("size-2.5 rounded-[2px]", c)} />
            ))}
            <span className="ml-1">More</span>
          </div>
        </div>
      </div>
    </section>
  );
}
