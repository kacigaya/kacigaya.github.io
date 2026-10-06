import { Children, isValidElement, type ReactNode } from "react";
import type { Components } from "react-markdown";
import { slugify, type Heading } from "@/lib/posts";

// Heading text as it ends up on screen: `## Read the [RFC](url)` renders as
// "Read the RFC", which is what the id has to be built from.
function textOf(children: ReactNode): string {
  return Children.toArray(children)
    .map((child) => {
      if (typeof child === "string" || typeof child === "number") {
        return String(child);
      }
      if (isValidElement<{ children?: ReactNode }>(child)) {
        return textOf(child.props.children);
      }
      return "";
    })
    .join("");
}

// The table of contents links to ids built by lib/posts from the markdown
// source, so the rendered headings take their ids from that same list instead
// of re-deriving them. Anything the source parser missed falls back to its own
// slug, which is a dead anchor at worst, never a wrong one.
export function createMarkdownComponents(headings: Heading[]): Components {
  // one queue entry per occurrence, so repeated heading text gets the distinct
  // ids lib/posts assigned rather than all collapsing onto the first.
  const ids = new Map<string, string[]>();
  for (const heading of headings) {
    const queue = ids.get(heading.text);
    if (queue) queue.push(heading.id);
    else ids.set(heading.text, [heading.id]);
  }
  const idFor = (children: ReactNode) => {
    const text = textOf(children);
    return ids.get(text)?.shift() ?? slugify(text);
  };

  // only children are forwarded: react-markdown also passes its AST handle,
  // which would serialize into a DOM attribute if spread through.
  return {
    h2: ({ children }) => <h2 id={idFor(children)}>{children}</h2>,
    h3: ({ children }) => <h3 id={idFor(children)}>{children}</h3>,
    // code is identifiers and syntax; browser auto-translate rewrites it into
    // something that no longer runs. className carries the highlight tokens.
    code: ({ children, className }) => (
      <code className={className} translate="no">
        {children}
      </code>
    ),
  };
}
