---
title: "Brave Origin: a subscription check without key pinning"
date: "2026-06-30"
featured: true
description: "The Android Origin gate verifies subscription credentials against a public key the server hands back, with no issuer pinning. A local policy path never redeems them, so a forged credential is enough."
tags: ["brave", "voprf", "reverse-engineering", "android", "security-research"]
---

This research was conducted on hardware I own. It concerns a payment gate, which Brave excludes from its bug bounty, so there is no vendor process for reporting it. This post documents the finding rather than explaining how to evade payment.

## The question

Brave Origin is a paid tier. On desktop the gate is barely a gate: a boolean in the `Local State` JSON, `brave.origin.purchase_validated`. Flip it and Origin unlocks. That is a local pref trusting itself, which is not interesting.

Android is more interesting. The profile is sandboxed, `allowBackup="false"` blocks `adb backup`, and there is no boolean to flip. How does the Android build decide you paid?

## Two paths, one is weaker

Reading `brave-core` (`components/brave_origin` and `components/skus`), the enforcement entry point is `BraveOriginSubscriptionPrefs.checkPoliciesAsync()`. It calls `requestCredentialSummary()` and branches on one thing: is the subscription active.

There are two ways that can end up active.

One is the Google Play pref, `BRAVE_ORIGIN_SUBSCRIPTION_ACTIVE_ANDROID`. That is the Play Billing path. It is Binder IPC, signature verified, and lives outside anything you can reach over HTTPS. It is the honest path.

The other is `credential_summary`, which reads the native SKUs store. That store is the Rust SKUs SDK compiled into the browser (`components/skus/browser/rs`), not the in-page WASM SDK that `account.brave.com` ships. The policy check treats this path as "any source." It does not care that the credential did not come from Play Billing.

So the real question narrows: can `credential_summary` be made to return `active: true` without the Play path?

## The credential

Origin uses time-limited-v2 credentials. These are `challenge-bypass-ristretto` tokens, a VOPRF in the privacy-pass family: the client blinds tokens, the issuer signs the blinded tokens, the client unblinds them, and later presents them. The point of the scheme is that the issuer cannot link a signature to a redemption.

The fetch and verify code is `components/skus/browser/rs/lib/src/sdk/credentials/fetch.rs`:

```rust
let unblinded_creds = batch_proof
    .verify_and_unblind::<Sha512, _>(
        &bucket_creds,         // client tokens
        &bucket_blinded_creds, // the blinded creds
        &signed_creds,         // signed creds FROM SERVER
        &public_key,           // the server's public key FROM SERVER
    )
    .or(Err(InternalError::InvalidProof))?;
```

Look at the last two arguments. The batch DLEQ proof is verified against `public_key`, and `public_key` came from the server in the same response. The code checks that the signatures are internally consistent with the key the server chose. It never checks that the key is Brave's real issuer key. No pinning, no allow-list, no comparison against a baked-in constant.

The only thing standing between a client and an arbitrary issuer key is TLS. TLS authenticates the host, not the key inside the JSON body.

## Why the redemption HMAC does not save Origin

There is a second half to the scheme that should catch a forged credential. Redemption presentation (`present.rs`) is an HMAC keyed by the issuer secret. Present a credential you signed with your own key and a real key-holding server rejects it, because your HMAC does not match. This is what protects Brave VPN: the VPN gateway redeems every credential against the real issuer before it routes traffic.

Origin does not do that. It enforces its policies locally. There is no per-request redemption, so the presentation is never checked against anyone. The signature consistency check in `verify_and_unblind` is the entire trust boundary, and that check trusts the server's own key.

That asymmetry is the finding. The same credential type protects two products. One redeems and is safe. One enforces locally and is not.

## Durability

`matching_order_credential_summary` only triggers a network refresh when the order or its credentials have expired. An order with a far-future expiry resolves entirely from the persisted local store on every later check. So this is not a live proxy trick that has to run each session. It is a one-time write to the native store, after which nothing external needs to be present.

## What this does not reach

The Play Billing path is untouched. That signature check happens across Binder, and no amount of HTTPS interposition sees it. The weakness is specific to the credential-summary path being treated as trusted.

VPN is also untouched, for the reason above. Redemption against the real key is exactly the control Origin skips.

## The fix

Pin the issuer public key, or check the returned key against an allow-list of Brave's real issuer keys, before `verify_and_unblind` is allowed to accept a batch. A local enforcement path that never redeems has to move its trust boundary up to the key, because TLS is authenticating the wrong thing here. It proves you are talking to `payment.rewards.brave.com`. It says nothing about whether the key in the body is Brave's.

## Notes on method

Everything above came from reading the source and the wire types (`orders.rs`, the camelCase `OrderResponse`, the time-limited-v2 credential shape). The two details that quietly break deserialization if you get them wrong, and that tell you the code was written against a strict schema: prices are strings not numbers, and wire timestamps are RFC3339 with a `Z` even though the in-store `Order` uses `NaiveDateTime`. Small things, but they are the kind of detail that confirms you are reading the real contract and not guessing at it.
