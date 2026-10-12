# Dahao · 搭好

**AI setup, for the rest of us.**

[简体中文](README.md) · Private development preview

Dahao lets an Agent on your computer help prepare another Windows or Mac computer for a partner, family member or friend who is new to AI. The Agent leads discovery, target confirmation, SSH access, environment checks, installation, configuration and verification. The user handles choices and any necessary first-time access on the target.

<picture>
  <source media="(prefers-reduced-motion: reduce)" srcset="assets/readme/hero-en.png">
  <img src="assets/readme/hero-en.webp" width="100%" alt="A 24-second original pink illustrated film: expressive display typography, a hand-drawn computer handoff, a moving seven-step route, tool choices, annotated working rules and an illustrated first task. Real Agent installation is not connected.">
</picture>

[Download English MP4](assets/readme/hero-en.mp4?raw=true) · [GIF](assets/readme/hero-en.gif?raw=true) · [Transcript](docs/demo.md) · [Local player](docs/watch.html)

**Available today:** connection step 0 plus the seven-step checklist, Windows/Mac connection instructions, passive LAN discovery, a single selected target SSH-banner check and a verified Windows sandbox example. On one Windows target, host verification, PIN-only temporary authorization, SSH login and an existing OpenClaw installation passed live checks, including a synthetic task. Temporary access was revoked and a new login was rejected. Fresh installation, rule/Skill loading, Mac hardware and actual QR login remain unverified. [Support matrix](docs/support-matrix.md)

## Install the Skill in the helper’s Codex, then ask

Tell Codex:

> Install the `.agents/skills/dahao` Skill from https://github.com/NewenergyEric/dahao after reviewing its source.

On the next turn:

> $dahao Help me prepare an AI assistant for my partner’s Windows computer on the same Wi-Fi. Use OpenClaw by default. Find the target and let me confirm it before connecting; guide us through setup and verification, with safety first.

The Skill contains the discovery script, connection/setup/chat checklists, behavior template and Windows helper source. No repository checkout, website or HTML download is required. The local Agent needs terminal/file tools; Python helpers use the standard library, and Windows GUI builds require Windows and its installed .NET Framework compiler. Repository access is currently required while the repository is private.

The recipient confirms their computer, reviews and clicks any necessary temporary authorization, then logs in or scans a code in the official application. Codex maintains the checklist in the conversation. Reuse existing installations, keep unverified steps visible, and store target/session records outside the installed Skill in a private workspace. Mac instructions exist but have not been tested on hardware.

Optional references: [setup](docs/installation-checklist.md), [Windows/Mac connection](docs/connection-checklist.md), [Feishu/WeChat](docs/chat-connection-checklist.md), [HTML checklist](docs/getting-started.html).

## Generic tools and private authorization packages

The generic Skill and helper contain no target identity or keys. A per-session package contains the target account/address, a newly generated public key and host fingerprint; it contains no private key, password or token, but is still private authorization material and must never be published or reused. The corresponding private key stays in a restricted controller directory and is deleted after revocation and a rejected-login check.

Authorization permits command execution as the displayed account; the tested administrator route has broad permissions. The 60-minute limit rejects new logins, not already-running commands. The Windows helpers are unsigned previews: if blocked, verify the source without disabling protection. [Safety details](.agents/skills/dahao/references/safety.md).

The live test reused OpenClaw 2026.9.6 and passed health and a synthetic task. Its audit reported 0 critical findings and 8 warnings; hardening remains pending. Fresh installation, rule/Skill loading, Mac hardware and live QR login remain unverified. [Redacted evidence](docs/live-connection-verification.json).

## One small task is enough to begin

“We are going away for two days. Help me pack light and separate what to bring from what to check.”

![Original weekend packing illustration showing what to pack, what to check and missing details; not executed by a real Agent](assets/readme/case-board-en.png)

This is an **original illustration of the intended task outcome**, not a live Agent result. [Read the input and example checklist](examples/first-task/weekend.md).

## Set the working boundaries first

The [general AGENTS template](examples/behavior/AGENTS.template.md) covers inspection, tool permissions, secret references, verification and continuation. It borrows the generic layering approach from Cici Foundry without importing private instances, SOUL or USER files. Adapt and verify the actual runtime entry point before claiming the rules are loaded. [Behavior checks](docs/behavior-baseline.md)

[Standalone Skill verification](docs/skill-install-verification.json)

<details>
<summary>Runnable example, evidence and maintenance</summary>

With Windows and Python 3.12+ already available, no Python dependencies are required:

```powershell
python -B demo.py
```

The isolated example installs package 1.0.0, repeats it, upgrades to 1.1.0, preserves overrides and resumes an interrupted update. The synthetic order result is two orders totaling CNY 47.50, with a largest order of 27.50. This validates the local configuration mechanism, not real Agent deployment or the travel example.

[Installation evidence](docs/installation-verification.json) · [Configuration workflow](docs/workflow.md) · [Media validation](docs/media-validation.json) · [Film rebuild](motion/README.md)

```powershell
python -B -m unittest discover -s tests -v
python -B tools/release.py check
```

The product commands remain configure / check / update; `--brief` still only generates guidance. The [remote workflow](docs/remote-workflow.md) uses the Agent’s tools within authorization for a specific target. The helper does not authenticate, install software or read existing secrets. [Connection evidence](docs/remote-access-verification.json) distinguishes fixture tests from real-target verification.

[Publishing scope](docs/publishing.md) · [Sources and licensing](THIRD_PARTY_NOTICES.md)

</details>

Dahao keeps its independent pink identity. This repository remains private; the author has not yet chosen a license for public open-source release.
