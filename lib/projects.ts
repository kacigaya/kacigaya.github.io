import { GITHUB_LOGIN } from "@/lib/socials";
import { SITE_URL } from "@/lib/site";

const MORE_PROJECTS_LIMIT = 18;

export type Project = {
  name: string;
  desc: string;
  url: string;
  homepage?: string;
  stack: string[];
};

export type RepoNode = {
  name: string;
  description: string | null;
  url: string;
  homepageUrl: string | null;
  isArchived: boolean;
  repositoryTopics: { nodes: { topic: { name: string } }[] };
};

export type UserRepos = {
  pinnedItems: { nodes: RepoNode[] };
  repositories: { nodes: RepoNode[] };
};

const QUERY = `
  fragment repo on Repository {
    name
    description
    url
    homepageUrl
    isArchived
    repositoryTopics(first: 10) { nodes { topic { name } } }
  }
  query($login: String!) {
    user(login: $login) {
      pinnedItems(first: 6, types: REPOSITORY) {
        nodes { ... on Repository { ...repo } }
      }
      repositories(
        first: 24
        privacy: PUBLIC
        isFork: false
        ownerAffiliations: OWNER
        orderBy: { field: PUSHED_AT, direction: DESC }
      ) {
        nodes { ...repo }
      }
    }
  }
`;

function normalizeHomepage(homepage: string | null): string | undefined {
  if (!homepage) return undefined;
  const alreadyAbsolute = URL.canParse(homepage);
  const value = alreadyAbsolute ? homepage : `https://${homepage}`;
  if (!URL.canParse(value)) return undefined;
  const url = new URL(value);
  return url.protocol === "http:" || url.protocol === "https:"
    ? alreadyAbsolute ? homepage : url.toString()
    : undefined;
}

function projectHomepage(name: string, homepage: string | null): string | undefined {
  // The portfolio repository still lists the retired custom domain on GitHub.
  return name === "portfolio" ? SITE_URL : normalizeHomepage(homepage);
}

function toProject(repo: RepoNode): Project {
  return {
    name: repo.name,
    desc: repo.description ?? "",
    url: repo.url,
    homepage: projectHomepage(repo.name, repo.homepageUrl),
    stack: repo.repositoryTopics.nodes.map((n) => n.topic.name),
  };
}

export function splitProjects(user: UserRepos) {
  const pinned = user.pinnedItems.nodes.map(toProject);
  const pinnedUrls = new Set(pinned.map((p) => p.url));
  const more = user.repositories.nodes
    .filter((repo) => !repo.isArchived && !pinnedUrls.has(repo.url))
    .map(toProject)
    .slice(0, MORE_PROJECTS_LIMIT);
  return { pinned, more };
}

// This runs once, during the static export, so anything unhandled here fails
// the build rather than degrading the section. Every failure mode falls
// through to the public API, then to nothing.
export async function loadProjects() {
  const token = process.env.GITHUB_TOKEN;
  if (!token) return getPublicProjects();

  try {
    const res = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: QUERY, variables: { login: GITHUB_LOGIN } }),
    });
    if (!res.ok) return getPublicProjects();

    const json = (await res.json()) as {
      data?: { user?: UserRepos | null };
      errors?: unknown[];
    };
    // a revoked token or a renamed login answers 200 with no user
    if (json.errors || !json.data?.user) return getPublicProjects();

    return splitProjects(json.data.user);
  } catch {
    return getPublicProjects();
  }
}

async function getPublicProjects() {
  try {
    return await fetchPublicProjects();
  } catch {
    return { pinned: [], more: [] };
  }
}

async function fetchPublicProjects() {
  const res = await fetch(
    `https://api.github.com/users/${GITHUB_LOGIN}/repos?type=owner&sort=pushed&per_page=24`,
    {
      headers: { Accept: "application/vnd.github+json" },
    },
  );
  if (!res.ok) return { pinned: [], more: [] };

  const repos = (await res.json()) as Array<{
    name: string;
    description: string | null;
    html_url: string;
    homepage: string | null;
    archived: boolean;
    fork: boolean;
    topics: string[];
  }>;
  const projects = repos
    .filter((repo) => !repo.archived && !repo.fork)
    .map((repo) => ({
      name: repo.name,
      desc: repo.description ?? "",
      url: repo.html_url,
      homepage: projectHomepage(repo.name, repo.homepage),
      stack: repo.topics,
    }));

  return {
    // The public REST API does not expose pinned repositories, so recent work
    // is a stable no-token fallback for previews and deploys.
    pinned: projects.slice(0, 6),
    more: projects.slice(6, 6 + MORE_PROJECTS_LIMIT),
  };
}
