// Checked in rather than fetched: credentials span multiple providers.
// Order is newest first.
export type Certification = {
  name: string;
  issuer: string;
  // Public credential or provider profile link, when available.
  url?: string;
};

const CREDLY = "https://www.credly.com/badges";

// `certifications` is exam- or path-level work; `foundational` is the entry
// level course badges. Same split as the skills section: a flat list of fifteen
// badges claims less than six that mean something.
export const certifications: Certification[] = [
  { name: "CCNA", issuer: "Cisco Networking Academy" },
  {
    name: "Network Technician Career Path",
    issuer: "Cisco",
    url: `${CREDLY}/64b6be3f-3073-4b4a-90bb-1fc8a153f26d/public_url`,
  },
  {
    name: "Junior Cybersecurity Analyst Career Path",
    issuer: "Cisco",
    url: `${CREDLY}/004b7fc6-140e-4af0-b4a7-61ed1551f0d1/public_url`,
  },
  {
    name: "Ethical Hacker",
    issuer: "Cisco",
    url: `${CREDLY}/14ea1940-61a4-4ba1-a325-ab962fccd306/public_url`,
  },
  {
    name: "Network Defense",
    issuer: "Cisco",
    url: `${CREDLY}/530d2f17-cfd0-488b-87a1-1d36315ab7ee/public_url`,
  },
  {
    name: "Google SecOps",
    issuer: "Google Cloud Security",
    url: "https://www.skills.google/public_profiles/b8d7d609-b00f-4fa4-9ec4-1552756cf3e0",
  },
];

export const foundational: Certification[] = [
  { name: "Networking Basics", issuer: "Cisco" },
  { name: "Industrial Networking Essentials", issuer: "Cisco" },
  { name: "Introduction to Cybersecurity", issuer: "Cisco" },
  { name: "Introduction to IoT", issuer: "Cisco" },
  { name: "Introduction to Modern AI", issuer: "Cisco" },
  { name: "Digital Safety and Security Awareness", issuer: "Cisco" },
  { name: "Cybersecurity Awareness Learner", issuer: "Certiprof" },
];
