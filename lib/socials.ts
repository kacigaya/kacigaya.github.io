// The GitHub handle drives both API calls (repos, contributions) and the
// profile link, so it lives here rather than being repeated per lib file.
export const GITHUB_LOGIN = "kacigaya";

export const socials = {
  email: "contact@gaya.anonaddy.com",
  github: `https://github.com/${GITHUB_LOGIN}`,
  githubLabel: `github.com/${GITHUB_LOGIN}`,
  linkedin: "https://linkedin.com/in/kacigaya",
  linkedinLabel: "linkedin.com/in/kacigaya",
  x: "https://x.com/kacigaya",
  xLabel: "x.com/kacigaya",
  googleDeveloper: "https://g.dev/kacigaya",
  googleDeveloperLabel: "g.dev/kacigaya",
  location: "Paris, FR",
} as const;
