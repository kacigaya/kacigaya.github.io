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

## Validation

Before fix, `audio-flinger-before.txt` showed Dolby Digital Plus output and:

```text
[AML_HAL] digital_audio_mode   :       AUTO
```

After fix, `audio-flinger-pcm.txt` showed:

```text
[AML_HAL] digital_audio_mode   :        PCM
```

Mixer selected Stereo PCM. System applied `hdmi_format=0`.

Other checks:

- `pre-pcm-global.txt` versus `post-pcm-global.txt` differ only in `encoded_surround_output` and derived `digital_audio_format`
- `rollback-verified-global.txt` matches `pre-pcm-global.txt` exactly
- `pcm-success-logcat.txt` shows volume changes without passthrough warning
- `pcm-droidlogic-services.txt` shows audio and HDMI CEC services still running
- CEC stayed enabled, power mode `broadcast`. CEC volume control was already disabled at baseline. Left unchanged.

User confirmation before reboot: popup gone, sound and volume work.

User confirmation after ADB reboot: Volume Up/Down, TV power off/on, Home, Back, Assistant, and physical remote all pass, no popup. Remote function after reboot also confirms reconnection.

Persistence across reboot: yes, by physical tests. Wireless ADB did not reconnect automatically, so direct post-reboot setting readback was unavailable when report was written.

Left untouched: SystemUI, launcher, remote services, HDMI services, notification settings, Toast permissions. Ordinary notifications/Toasts not separately exercised. Early logcat cleared as requested and volume keys exercised.

## Background research

[Google remote setup documentation](https://support.google.com/chromecast/answer/10094150?hl=en) covers separate volume setup and use of Chromecast volume control.

[Google sound settings documentation](https://support.google.com/chromecast/answer/10110321?hl=en) covers sound format configuration and Chromecast volume control.

[Published Amlogic audio HAL source](https://github.com/khadas/android_hardware_amlogic_audio/blob/khadas-vim4-android14/audio_hal/audio_hw.c) implements `adev_get_hal_control_volume_en()`, source of `hal_param_hal_control_vol_en` checked by popup code. That code decides software volume support from output format, including PCM. Source comes from related Amlogic platform, not proof of Chromecast native implementation. Device dumps and passing tests establish workaround here.
