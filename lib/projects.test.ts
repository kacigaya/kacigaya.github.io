import { afterEach, expect, test } from "bun:test";
import { loadProjects, splitProjects, type RepoNode } from "./projects";
import { SITE_URL } from "./site";

function repo(name: string, extra: Partial<RepoNode> = {}): RepoNode {
  return {
    name,
    description: `${name} desc`,
    url: `https://github.com/kacigaya/${name}`,
    homepageUrl: null,
    isArchived: false,
    repositoryTopics: { nodes: [{ topic: { name: "typescript" } }] },
    ...extra,
  };
}

test("pinned repos are excluded from more, archived dropped", () => {
  const { pinned, more } = splitProjects({
    pinnedItems: { nodes: [repo("binje", { homepageUrl: "https://binje.app" })] },
    repositories: {
      nodes: [repo("binje"), repo("bangs"), repo("old", { isArchived: true })],
    },
  });

  expect(pinned.map((p) => p.name)).toEqual(["binje"]);
  expect(pinned[0].homepage).toBe("https://binje.app");
  expect(pinned[0].stack).toEqual(["typescript"]);
  expect(more.map((p) => p.name)).toEqual(["bangs"]);
});

const realFetch = globalThis.fetch;
const realToken = process.env.GITHUB_TOKEN;

// React's fetch type carries a preconnect method, so a bare function is not
// assignable to it.
function stubFetch(impl: () => Promise<Response>) {
  globalThis.fetch = Object.assign(impl, { preconnect: () => {} });
}

afterEach(() => {
  globalThis.fetch = realFetch;
  if (realToken === undefined) delete process.env.GITHUB_TOKEN;
  else process.env.GITHUB_TOKEN = realToken;
});

// getProjects runs inside the production prerender: a throw here fails the
// build instead of emptying one section.
test("survives a GitHub outage while a token is configured", async () => {
  process.env.GITHUB_TOKEN = "token";
  stubFetch(() => Promise.reject(new Error("ENOTFOUND")));

  expect(await loadProjects()).toEqual({ pinned: [], more: [] });
});

test("falls back when an authenticated query answers without a user", async () => {
  process.env.GITHUB_TOKEN = "token";
  let call = 0;
  stubFetch((): Promise<Response> => {
    call += 1;
    return Promise.resolve(
      call === 1
        ? Response.json({ data: { user: null } })
        : Response.json([
            {
              name: "bangs",
              description: null,
              html_url: "https://github.com/kacigaya/bangs",
              homepage: null,
              archived: false,
              fork: false,
              topics: ["rust"],
            },
          ]),
    );
  });

  const { pinned } = await loadProjects();

  expect(call).toBe(2);
  expect(pinned.map((p) => p.name)).toEqual(["bangs"]);
});

test("description and homepage normalize", () => {
  const { pinned } = splitProjects({
    pinnedItems: {
      nodes: [
        repo("empty", { description: null, homepageUrl: "" }),
        repo("bare", { homepageUrl: "binje.duckdns.org" }),
        repo("unsafe", { homepageUrl: "javascript:alert(1)" }),
      ],
    },
    repositories: { nodes: [] },
  });

  expect(pinned[0].desc).toBe("");
  expect(pinned[0].homepage).toBeUndefined();
  expect(pinned[1].homepage).toBe("https://binje.duckdns.org/");
  expect(pinned[2].homepage).toBeUndefined();
});

test("portfolio card uses the current site URL despite stale GitHub metadata", () => {
  const { pinned } = splitProjects({
    pinnedItems: { nodes: [repo("portfolio", { homepageUrl: "https://gayakaci.com/" })] },
    repositories: { nodes: [] },
  });

  expect(pinned[0].homepage).toBe(SITE_URL);
});

test("public project fallback also replaces the retired portfolio URL", async () => {
  delete process.env.GITHUB_TOKEN;
  stubFetch(() => Promise.resolve(Response.json([{
    name: "portfolio",
    description: null,
    html_url: "https://github.com/kacigaya/portfolio",
    homepage: "https://gayakaci.com/",
    archived: false,
    fork: false,
    topics: [],
  }])));

  expect((await loadProjects()).pinned[0].homepage).toBe(SITE_URL);
});
