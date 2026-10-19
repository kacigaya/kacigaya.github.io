---
title: "Fix missing Gmail notifications on Android"
date: "2026-09-10"
description: "A checklist to restore Gmail alerts on Android: notification channels, sound settings, Gmail sync, and an ADB fix for inconsistent permissions."
tags: ["android", "gmail", "notifications", "adb", "troubleshooting"]
---

Gmail can receive and sync messages correctly while Android stays silent. When that happens, the problem is usually in one of three places: the phone's sound mode, Android's notification settings, or Gmail's settings for the affected account.

The labels and paths vary slightly between Android versions and manufacturers, but the same checks apply.

## Check Android first

1. Press a volume button and confirm the phone is set to **Sound**, not **Vibrate** or **Silent**.
2. Open **Settings → Notifications → App notifications → Gmail** and enable Gmail notifications.
3. Open the notification category for the affected account, then select **Mail**. Set it to **Default** or **Alerting**, enable vibration if wanted, and choose a sound.
4. Confirm **Do Not Disturb** is off, or that Gmail is allowed through it.
5. If messages appear in the notification shade but not in the status bar, disable **Hide silent notifications in status bar**.

Some phones temporarily suppress an app after it posts several alerts in quick succession. If Android logs `Muting recently noisy`, dismiss the existing Gmail notifications, wait a minute, then send one test message.

## Check Gmail's account settings

Android can allow notifications while Gmail disables them for one account.

Open **Gmail → Settings**, select the affected account, then:

1. Set **Email notifications** to **All**.
2. Open **Inbox notifications** and enable **Notify for every message** if every incoming email should alert.
3. Confirm Gmail sync is enabled for the account.

Send a single test message after changing the settings. If it arrives only after Gmail is opened, investigate sync or background restrictions. If it arrives on time without an alert, keep troubleshooting the Android notification channel.

## Repair an inconsistent notification permission with ADB

On Android 13 and later, Gmail can appear to have notification permission while AppOps still reports the operation as ignored. If the settings above look correct, connect the phone with USB debugging enabled and check the current state:

```bash
adb shell cmd appops get --user 0 com.google.android.gm POST_NOTIFICATION
```

If it reports `ignore`, set it to `allow`, stop Gmail, and reopen it:

```bash
adb shell cmd appops set --user 0 com.google.android.gm POST_NOTIFICATION allow
adb shell am force-stop --user 0 com.google.android.gm
adb shell monkey --user 0 -p com.google.android.gm 1
```

Verify the permission and ringer mode:

```bash
adb shell cmd appops get --user 0 com.google.android.gm POST_NOTIFICATION
adb shell dumpsys audio | grep -A2 "Ringer mode:"
```

The expected results are `POST_NOTIFICATION: allow` and a ringer mode of `NORMAL`.

## Avoid resets until you know sync is broken

Do not start by clearing Gmail's storage or removing the Google account. Those steps create extra work and will not fix a notification channel or an AppOps mismatch. First confirm whether messages sync while the app is closed. If they do, focus on sound mode, notification categories, and per-account Gmail settings.
