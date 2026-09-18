---
title: "Google TV volume popup workaround"
date: "2026-09-18"
description: "Chromecast passthrough Toast traced to com.droidlogic AudioSystemCmdService, stopped with encoded_surround_output PCM setting, verified across reboot."
tags: ["google-tv", "chromecast", "audio", "adb", "troubleshooting"]
---

Volume presses showed same popup every time. Sound kept playing underneath. Problem was passthrough warning Toast, not volume system.

Fix used here: force PCM/stereo output with existing Android global setting. Popup gone. Sound and volume control work. Verified before reboot and again after reboot with physical remotes.

Tradeoff: Dolby/DTS surround passthrough disabled. This removes condition that triggers warning. It changes audio format. No dedicated setting exists for warning alone.

## Device and popup source

- Device: Google Chromecast, product `sabrina_prod_stable`, device `sabrina`
- Android 14, build `UTTC.250917.004`
- Package: `com.droidlogic`, PID 1245 during capture
- Service: `com.droidlogic/.audioservice.services.AudioSystemCmdService`
- Method: `showPassthroughWarning()` plus posted callback
- Resource: `com.droidlogic:string/volume_control_hint`
- Mechanism: Android text Toast via `Toast.makeText(...).show()`

Installed APK string matches reported message:

> To adjust volume, enable CEC control(Settings > Display & Sound > HDMI CEC) or adjust the TV remote control.

Logcat ties presses directly to service. Each press logged:

```text
AudioSystemCmdService: on need to show other passthrough hint
```

NotificationService then logged Toast from same package:

```text
Toast already killed. pkg=com.droidlogic
```

Smali confirms path. Volume receiver checks HAL parameter:

```text
hal_param_hal_control_vol_en
```

If result is not `hal_param_hal_control_vol_en=1`, it calls `showPassthroughWarning()`. That method guards with `mShowingPassthroughHint`, posts to handler, creates Toast from `volume_control_hint`, then calls `show()`.

No separate hide-warning switch found in installed code. Package-wide Toast block would also hit Bluetooth/ARC messages. Disabling service would break other audio duties. Neither used.

## Fix and rollback

Original value was `0`, automatic. TV Settings code maps no surround to `1`.

Apply PCM:

```sh
adb -s 192.168.1.128:41087 shell settings put global encoded_surround_output 1
```

Rollback tested:

```sh
adb -s 192.168.1.128:41087 shell settings put global encoded_surround_output 0
```

Wireless ADB port can change after reboot. Replace `-s` target with current entry from `adb devices -l`.

No direct edit to `digital_audio_format` needed. System derives it. Setting PCM changed `digital_audio_format` from `1` to `0` automatically. Rollback restored both values. Full global dump matched pre-change dump exactly, `diff` clean. PCM then reapplied before reboot.

## How verification worked

Process was baseline, change one setting, check result, roll back, reapply, reboot, check again with physical remotes.

First saved baselines. `pre-pcm-global.txt` stored all global settings before change. `pre-pcm-hdmi.txt` stored HDMI CEC state. `audio-flinger-before.txt` showed Dolby Digital Plus output with `digital_audio_mode: AUTO`.

Applied PCM with one command. Compared `pre-pcm-global.txt` against `post-pcm-global.txt`. Diff showed only two lines:

```text
digital_audio_format: 1 -> 0
encoded_surround_output: 0 -> 1
```

First line is user setting. Second line is derived vendor state. System updated it automatically. No other global changed. Fix stayed narrow. No separate edit to `digital_audio_format` was needed.

Pressed volume keys for behavior check and captured `pcm-success-logcat.txt`. Log shows switch to PCM:

```text
digital audio mode: PCM
hdmi_format=0
```

Volume changes appear in log without warning line. For contrast, warning line from before fix:

```text
AudioSystemCmdService: on need to show other passthrough hint
```

That line logged on every press before fix. It stays absent after fix. `audio-flinger-pcm.txt` confirms result with `digital_audio_mode: PCM` and Stereo PCM in mixer.

Verified services still ran. `pcm-droidlogic-services.txt` lists running services. `AudioSystemCmdService` still runs under PID 1245. HDMI CEC services still run. `pcm-hdmi.txt` matches `pre-pcm-hdmi.txt`. CEC stayed enabled. Power mode stayed `broadcast`. CEC volume control was already `0` at baseline and stayed `0`. Fix did not toggle CEC. Audio format changed, volume path worked.

Tested rollback. Set value back to `0`. Saved full dump as `rollback-verified-global.txt`. Diff against `pre-pcm-global.txt` returned identical. That proves rollback restores exact prior state. After that check, reapplied PCM value `1` before reboot.

Tested persistence across reboot. Ran ADB reboot. Wireless ADB did not reconnect by itself, so no direct setting readback was possible right after reboot. Used physical tests instead. Before reboot user confirmed popup gone, sound and volume work. After reboot user ran full remote pass: Volume Up/Down, TV power off/on, Home, Back, Assistant, plus physical remote. All passed with no popup. Passing remote tests after reboot proves setting survived reboot and remotes reconnected.

Untouched scope: SystemUI, launcher, remote services, HDMI services, notification settings, Toast permissions. Ordinary notifications and Toasts were not separately exercised. Early logcat was cleared as requested and volume keys were exercised to reproduce issue.

## Background research

[Google remote setup documentation](https://support.google.com/chromecast/answer/10094150?hl=en) covers separate volume setup and use of Chromecast volume control.

[Google sound settings documentation](https://support.google.com/chromecast/answer/10110321?hl=en) describes sound format configuration and Chromecast volume control.

[Published Amlogic audio HAL source](https://github.com/khadas/android_hardware_amlogic_audio/blob/khadas-vim4-android14/audio_hal/audio_hw.c) implements `adev_get_hal_control_volume_en()`, source of `hal_param_hal_control_vol_en` checked by popup code. That code decides software volume support from output format, including PCM. Source comes from related Amlogic platform, not proof of Chromecast native implementation. Device dumps and passing tests establish workaround here.
