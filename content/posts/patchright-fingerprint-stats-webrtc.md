---
title: "Tuning Patchright for fingerprint-stats pages"
date: "2026-06-07"
featured: true
description: "Why AmiUnique and WebRTC leak tests need a different approach than bot-detection demos, and how WebSkrap handles them with native Chromium flags and opt-in context metadata instead of JavaScript spoofing."
tags: ["browser-automation", "stealth", "patchright", "chromium", "webrtc"]
repo: "https://github.com/kacigaya/webskrap"
---

Bot-detection demos and fingerprint-statistics pages measure different things. I learned that the slow way. After getting headless patchright to clear reCAPTCHA, Cloudflare, CreepJS, and the rest, I pointed it at [AmiUnique](https://amiunique.org) and expected a similar result. It does not ask, "Is this a bot?" It asks, "How rare is this exact browser?" That requires a different approach.

Patchright's whole strategy is to expose the real browser. For a bot detector that is the winning move, because every synthetic override is a behavioral mismatch waiting to be caught. For a uniqueness scorer it cuts the other way. The honest environment is often the *unusual* one: a default-locale headless Chrome on a fresh profile looks nothing like the median visitor. So the fixes here are opt-in. The strict default stays the same.

## Two surfaces worth touching

A fingerprint-stats page reads dozens of attributes. Most of them (fonts, canvas hashes, TLS, audio) you cannot fake cheaply without reintroducing the tampering signals patchright exists to avoid. Two are different. They are owned by the browser process, so Chrome can set them natively with no JavaScript in sight.

### Profile context metadata

Playwright's context options let you set `locale`, `timezone_id`, `color_scheme`, and `reduced_motion`. These are real BrowserContext settings, not getter patches, so they do not trip a `toString` check the way `Object.defineProperty` does. The default patchright path skips them on purpose, because on a bot detector a mismatched timezone is a tell. On a stats page, aligning them to the chosen profile is what makes the visitor look ordinary.

So I made it a switch:

```python
from webskrap import SessionConfig

config = SessionConfig(
    driver="patchright",
    channel="chrome",
    headless=True,
    mask_headless_user_agent=True,
    patchright_context_profile=True,
)
```

With `patchright_context_profile=True`, WebSkrap applies the profile's locale, timezone, color scheme, reduced-motion preference, and any `extra_http_headers` you set. It keeps `no_viewport=True`. Screen and window metrics still come from the browser or from `headless_screen`, so I am not stacking a synthetic viewport on top of a synthetic locale and hoping they agree.

### WebRTC ICE candidates

The WebRTC leak is the one that actually matters for privacy. A leak-test page opens an `RTCPeerConnection`, gathers ICE candidates, and reads your local and direct public IPs straight off them, proxy or no proxy. The usual fix you see online is to monkeypatch `RTCPeerConnection` in JavaScript. That works until something diffs the function source.

Chrome already has a process-level knob for this, and it never occurred to me until I went looking:

```
--webrtc-ip-handling-policy=disable_non_proxied_udp
--force-webrtc-ip-handling-policy
```

The first sets the policy. The second is the part that bit me: without the force flag, Chrome quietly ignores the policy in normal builds. You need both. WebSkrap adds them when you ask:

```python
config = SessionConfig(
    driver="patchright",
    channel="chrome",
    webrtc_ip_handling_policy="disable_non_proxied_udp",
)
```

The four accepted values map to Chrome's own: `default`, `default_public_and_private_interfaces`, `default_public_interface_only`, and `disable_non_proxied_udp`. Pick the last one when a leak test should see no local or direct public candidates.

The scope matters. This controls ICE candidates and nothing else. It does not hide the page's normal remote address or touch fonts, canvas, battery, device memory, or TLS. It plugs one specific hole.

## Reducing render entropy

The other knob is rendering. WebGL and canvas readback are two of the highest-entropy surfaces on a stats page, because the exact pixels your GPU produces are close to a serial number. Chrome can switch both off at the process level:

```
--disable-webgl
--disable-reading-from-canvas
```

```python
config = SessionConfig(
    driver="patchright",
    channel="chrome",
    reduce_fingerprint_surface=True,
)
```

This is a genuine tradeoff, not a free win. A page that needs WebGL or exports a canvas will break. I would not turn it on for general scraping. For a uniqueness test where you want a boring fingerprint, it helps.

## How the flags get merged

One implementation detail I cared about: none of these should stomp a flag you set by hand. Every helper checks `launch_args` first and skips its own flag if you already passed that prefix.

```python
def _webrtc_ip_handling_args(self) -> list[str]:
    if self.browser != "chromium" or self.webrtc_ip_handling_policy is None:
        return []
    candidates = {
        "--webrtc-ip-handling-policy": (
            f"--webrtc-ip-handling-policy={self.webrtc_ip_handling_policy}"
        ),
        "--force-webrtc-ip-handling-policy": "--force-webrtc-ip-handling-policy",
    }
    return [
        arg
        for prefix, arg in candidates.items()
        if not any(a == prefix or a.startswith(f"{prefix}=") for a in self.launch_args)
    ]
```

If you pass `--webrtc-ip-handling-policy=default_public_interface_only` yourself, your value wins and WebSkrap does not append a second, conflicting one. The same guard covers the render flags. All of it is chromium-only; on Firefox these helpers return nothing.

## From the CLI

The same controls exist on `webskrap fetch`, plus a repeatable `--launch-arg` for anything I have not wrapped yet:

```bash
webskrap fetch https://amiunique.org/fr/fingerprint \
  --driver patchright \
  --channel chrome \
  --patchright-context-profile \
  --reduce-fingerprint-surface \
  --webrtc-ip-handling-policy disable_non_proxied_udp
```

The policy value is validated up front. A typo raises a `BadParameter` with the four legal values listed, instead of silently launching Chrome with a flag it ignores.

## Takeaways

- A bot detector and a uniqueness scorer want opposite things from you. The honest fingerprint that beats CreepJS is often the rare one that AmiUnique flags. Keep the strict mode as the default and make the stats-page tuning opt-in.
- Set it in the browser, not in JavaScript. Locale, timezone, WebRTC policy, and render switches all have native homes. Reach for `Object.defineProperty` only when there is no flag, and here there always was.
- `--webrtc-ip-handling-policy` does nothing on its own in a normal Chrome build. You need `--force-webrtc-ip-handling-policy` next to it or the policy is ignored.
- Know what each knob does not do. WebRTC handling is about ICE candidates, not your remote IP, and disabling WebGL will break pages that need it.

## Sources

- [Chromium command-line flags](https://www.chromium.org/developers/how-tos/run-chromium-with-flags): `--webrtc-ip-handling-policy`, `--disable-webgl`, `--disable-reading-from-canvas`
- [AmiUnique](https://amiunique.org): browser fingerprint uniqueness scorer
- [patchright](https://github.com/Kaliiiiiiiiii-Vinyzu/patchright): CDP-leak-free Playwright fork
- [Playwright BrowserContext options](https://playwright.dev/python/docs/api/class-browser#browser-new-context): `locale`, `timezone_id`, `color_scheme`, `reduced_motion`
