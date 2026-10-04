import { Card, CardPanel } from "@/components/card";

// Checked in rather than fetched: a short, curated history reads better than a
// feed. Order is newest first. `org` is kept off the translate pass so company
// names are not localized.
type Role = {
  title: string;
  org: string;
  period: string;
  points: string[];
};

const roles: Role[] = [
  {
    title: "Web Cybersecurity Engineer",
    org: "Société Générale Assurance",
    period: "Sep 2025 — present",
    points: [
      "Reverse engineer anti-bot systems and browser fingerprinting, then engineer browser identity (user agents, technical fingerprints) to keep automated processes stable.",
      "Build Python automation for complex web workflows: API integration, session management, and resilient scripts with timeout, retry, and data quality control.",
      "Built a PowerShell tool (TUI + GUI) that classifies SonarQube SBOM files and generates vulnerability and CVE reports; triage with Qualys.",
      "Automate cloud VM provisioning in PowerShell and diagnose environments via Bash across Azure and AWS.",
    ],
  },
  {
    title: "Network & Systems Administrator",
    org: "Dolce Hotel Versailles by Wyndham",
    period: "Jul 2024 — Sep 2025",
    points: [
      "Administered the network: VLANs, access points, and Cisco Meraki switches.",
      "Deployed an Acronis backup server and vCenter virtualization; managed Active Directory, Microsoft 365, and Linux/Windows servers.",
      "Handled user support and incident resolution; configured GLPI, xRDP, DNS, and DHCP.",
    ],
  },
];

export function Experience() {
  return (
    <section id="experience" className="mt-12 border-t pt-12">
      <h2 className="md-h2 text-base uppercase">experience</h2>
      <p className="mt-2 text-xs text-muted-foreground">
        roles, most recent first
      </p>
      <ol className="mt-6 flex flex-col gap-3">
        {roles.map((role) => (
          <li key={role.org}>
            <Card>
              <CardPanel className="flex flex-col gap-3 p-4">
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <div className="flex min-w-0 flex-col gap-0.5">
                    <h3 className="md-h3 text-sm text-foreground">
                      {role.title}
                    </h3>
                    <span className="text-sm text-muted-foreground" translate="no">
                      {role.org}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {role.period}
                  </span>
                </div>
                <ul className="flex flex-col gap-2 text-sm leading-relaxed text-muted-foreground">
                  {role.points.map((point) => (
                    <li
                      key={point}
                      className="pl-4 before:-ml-4 before:text-muted-foreground before:content-['>_']"
                    >
                      {point}
                    </li>
                  ))}
                </ul>
              </CardPanel>
            </Card>
          </li>
        ))}
      </ol>
    </section>
  );
}
