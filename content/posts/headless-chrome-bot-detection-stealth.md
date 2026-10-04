---
title: "Passing Bot Detection in Headless Chrome"
date: "2026-06-03"
featured: true
description: "Making headless Chromium clear the same bot-detection suite as headed mode with a simulated screen and a masked user agent, no JavaScript spoofing."
tags: ["browser-automation", "stealth", "playwright", "chromium"]
repo: "https://github.com/kacigaya/webskrap"
---

Headed Chrome driven by [patchright](https://github.com/Kaliiiiiiiiii-Vinyzu/patchright), a CDP-leak-free Playwright fork, already clears the public bot-detection demos: reCAPTCHA v3, Cloudflare Turnstile, BrowserScan, FingerprintJS, CreepJS, Sannysoft, Incolumitas. Headless mode does not. I wanted WebSkrap to close that gap without JavaScript fingerprint spoofing, because broad JS patches register as tampering, and tampering is its own detection signal.

One constraint: native browser controls only. No `Xvfb`, `xfce`, or Docker. The host is macOS, which has no X server, so virtual-framebuffer tricks are unavailable. Every fix had to happen in the browser.

## The two remaining signals

Run headless patchright against the demos and exactly two signals separate it from headed. Both are environmental, not behavioral.

### 1. No physical display

Headless Chrome has no monitor, so screen and window geometry default to junk:

```js
screen.width        // 800
screen.height       // 600
window.outerWidth   // 0
window.outerHeight  // 0
```

A real desktop never reports a 0-pixel outer window. BrowserScan's navigator check, Sannysoft's resolution row, and CreepJS all key on this.

Fix: configure a virtual screen at launch through Chrome's own flags, not JS.

```
--window-size=1366,768
--window-position=0,0
--screen-info={1366x768}
```

`--screen-info` is Chrome's headless virtual-display switch; it defines a screen at `0,0` with the given resolution. After this, the page reports coherent metrics:

```js
screen.width        // 1366
window.outerWidth   // 1366
window.innerHeight  // 695   (minus chrome, coherent)
devicePixelRatio    // 1
```

### 2. The `HeadlessChrome` user agent

The remaining tell is the UA string:

```
Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36
  (KHTML, like Gecko) HeadlessChrome/148.0.0.0 Safari/537.36
```

CreepJS flags `hasHeadlessUA` and `hasHeadlessWorkerUA`; `arh.antoinevastel.com` reports "You are Chrome headless"; `deviceandbrowserinfo` sets `isHeadlessChrome`.

Fix: probe the real UA once, rewrite `HeadlessChrome` to `Chrome`, and re-apply it through Chrome's `--user-agent` launch flag. This stays at the browser level. Native client hints remain intact, and there are no JS getter overrides.

## The SharedWorker trap

The obvious move is Playwright's context `user_agent` option, which sets a CDP UA override. It covers the page, dedicated workers, module workers, and service workers. It does not cover `SharedWorker`. That runs in its own process, outside the page's CDP session, so CreepJS's `hasHeadlessWorkerUA` stays `true`:

| worker type      | context override | `--user-agent` flag |
|------------------|:----------------:|:-------------------:|
| dedicated / blob | clean            | clean               |
| module / nested  | clean            | clean               |
| SharedWorker     | still leaks      | clean               |

The `--user-agent` launch flag is process wide, so it cleans SharedWorker too. Drop the context override and rely on the flag alone. That also avoids a CDP injection per frame.

## The reCAPTCHA red herring

With the screen and UA fixed, eight of nine tests passed. reCAPTCHA v3 timed out, but only under `pytest-asyncio`. The exact same code under `asyncio.run()` scored 0.9 every time. Same browser, same config, same machine.

Logging the network made the failure concrete: the demo's verify request fired with an empty token.

```
GET /recaptcha-v3-verify.php?action=examples/v3scores&token=
                                                       ^ empty
```

`grecaptcha.execute()` was resolving with nothing. Bisecting the difference:

- plain headless, no masking: token issued (0.9)
- `--user-agent` set via `launch_args`, no probe: token issued (0.9)
- masking enabled (probe + flag): empty token

The culprit was not the UA. It was the probe. Determining the real UA meant launching a throwaway browser, reading `navigator.userAgent`, and closing it right before the real launch. Two headless Chrome instances opening and closing within milliseconds, from one IP, tripped reCAPTCHA's risk scoring. `asyncio.run()` happened to sequence the teardown with more slack; `pytest-asyncio`'s loop did not.

A 2-second settle after closing the probe browser lets the prior session fully tear down before the real launch. Token issued, score 0.9, deterministic.

## Result

```
test_recaptcha_v3                    PASSED
test_cloudflare_turnstile_demo       PASSED
test_browserscan_bot_detection       PASSED
test_fingerprintjs_web_scraping_demo PASSED
test_device_and_browser_info         PASSED
test_bot_sannysoft                   PASSED
test_bot_incolumitas                 PASSED
test_are_you_headless                PASSED
test_creepjs                         PASSED
9 passed
```

The config that gets there:

```python
from webskrap import SessionConfig, Viewport

config = SessionConfig(
    driver="patchright",
    channel="chrome",
    headless=True,
    headless_screen=Viewport(width=1366, height=768),
    mask_headless_user_agent=True,
)
```

## Takeaways

- Don't lie in JavaScript. Every spoofed getter is a `toString` mismatch or proxy that CreepJS detects as tampering. Configure the real browser with launch flags instead of `Object.defineProperty`.
- The UA override has to be process wide. Per-context CDP overrides miss SharedWorker. The command-line flag does not.
- Your test runner is part of the environment. A reCAPTCHA failure that reproduces under `pytest-asyncio` but not `asyncio.run()` is not a flake. Here it was event-loop timing on a throwaway browser's teardown leaking into a third-party risk score.

## Sources

- [Chromium command-line flags](https://www.chromium.org/developers/how-tos/run-chromium-with-flags): `--screen-info`, `--window-size`, `--user-agent`
- [patchright](https://github.com/Kaliiiiiiiiii-Vinyzu/patchright): CDP-leak-free Playwright fork
- [CreepJS](https://abrahamjuliot.github.io/creepjs/): fingerprint and tampering test suite
- [User-Agent Client Hints](https://wicg.github.io/ua-client-hints/): why a coherent UA string still needs matching hints
