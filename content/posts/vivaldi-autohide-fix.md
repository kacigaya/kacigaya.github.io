---
title: "Fix Vivaldi sidebars staying open after switching windows"
date: "2026-09-15"
description: "An experimental local patch for stuck auto-hide sidebars in macOS Vivaldi 8.2.4133.52, with bundle checks, a backup, and restoration."
tags: ["macos", "vivaldi", "javascript", "troubleshooting"]
repo: "https://github.com/kacigaya/vivaldi-autohide-fix"
---

Vivaldi's auto-hide sidebars can stay open after you switch to another window. The window loses focus, but the sidebar keeps the visibility state left by the pointer hovering over it.

[vivaldi-autohide-fix](https://github.com/kacigaya/vivaldi-autohide-fix) is an experimental local patch for this case. It targets **Vivaldi 8.2.4133.52 on macOS**, installed at `/Applications/Vivaldi.app`.

## What changes on focus loss

The window-focus handler in this version updates the window's active state without clearing its hover visibility or hotspot state. The patch changes that handler so an inactive window resets `hotSpotStatus` to `"away"` and hides left and right auto-hide wrappers unless their `keepOpen` flag is set.

Explicitly kept-open sidebars stay open. Top and bottom visibility stays unchanged. When the window gains focus, the added reset does not run.

The script edits Vivaldi's bundled JavaScript directly. It requires exactly one match for the original handler and refuses missing, duplicate, or already patched targets. There are no dependencies to install; the script runs with Bun.

## Apply the patch

Clone the repository and check whether the installed bundle matches:

```bash
git clone https://github.com/kacigaya/vivaldi-autohide-fix.git
cd vivaldi-autohide-fix
bun patch.js check
```

A successful check confirms the expected handler exists. It does not verify browser behavior or whether macOS will accept the modified application.

Quit Vivaldi normally, then apply:

```bash
bun patch.js apply
```

The script saves the original beside `bundle.js` as `bundle.js.autohide-original`. If an existing backup differs from the current bundle, it refuses to overwrite it.

Modifying the signed application bundle can invalidate its code signature, and macOS may reject the modified app. The script does not disable signing or security protections.

## Check the behavior

Reopen Vivaldi and test with two windows:

1. Hover over the right sidebar to reveal it.
2. Activate the other window. The first window's sidebar should close.
3. Return to the first window and check that hovering reveals the sidebar again.
4. Check tab switching, address entry, and sidebars you explicitly keep open.

The project's automated tests cover state transitions and patch matching. They do not exercise the running browser or macOS signature acceptance. This patch also does not address every cause of a sidebar sticking while its window remains active.

## Restore before updating

Quit Vivaldi, then restore the original bundle:

```bash
bun patch.js restore
```

Restoration checks that the current bundle is exactly the patched version of the saved original. If the bundle has changed since patching, the script refuses to overwrite it.

Restore before updating Vivaldi. An update may replace the patched bundle, and this script's path and handler match are specific to 8.2.4133.52. A newer version needs a fresh compatibility check.

The [repository README](https://github.com/kacigaya/vivaldi-autohide-fix#readme) documents usage and limits. The [patch source](https://github.com/kacigaya/vivaldi-autohide-fix/blob/main/patch.js) contains the exact handler replacement and restoration checks.
