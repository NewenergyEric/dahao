# Dahao · 搭好

**AI setup, for the rest of us.**

[简体中文](README.md) · Private development preview

Dahao lets an Agent on your computer help prepare another Windows or Mac computer for a partner, family member or friend who is new to AI. The Agent leads discovery, target confirmation, SSH access, environment checks, installation, configuration and verification. The user handles choices and any necessary first-time access on the target.

<picture>
  <source media="(prefers-reduced-motion: reduce)" srcset="assets/readme/hero-en.png">
  <img src="assets/readme/hero-en.webp" width="100%" alt="A 24-second original pink illustrated film: expressive display typography, a hand-drawn computer handoff, a moving seven-step route, tool choices, annotated working rules and an illustrated first task. Real Agent installation is not connected.">
</picture>

[Download English MP4](assets/readme/hero-en.mp4?raw=true) · [GIF](assets/readme/hero-en.gif?raw=true) · [Transcript](docs/demo.md) · [Local player](docs/watch.html)

**Available today:** connection step 0 plus the seven-step checklist, Windows/Mac connection instructions, passive LAN discovery, a single selected target SSH-banner check and a verified Windows sandbox example. Real-target SSH authentication, remote Agent installation and loading remain unverified. [Support matrix](docs/support-matrix.md)

## Start with the checklist

After obtaining repository access, choose **Code → Download ZIP**, extract it and open [`docs/getting-started.html`](docs/getting-started.html) in a browser. The interactive checklist is currently in Chinese. Choose a plan, track progress, and copy, download or print it.

| Step | Your choice |
|---|---|
| 0. Discover and connect | The local Agent finds candidates; you confirm the target and establish verified access |
| 1. Dependencies | Windows / Mac, this / another computer; inspect what is already present |
| 2. Network access | Reuse working access, or select Clash or another tool |
| 3. Codex / IDE | Choose the workspace that guides preparation |
| 4. Daily Agent | OpenClaw by default, Hermes or another Agent if preferred |
| 5. Working rules | Task flow, tools, permissions and confirmation boundaries |
| 6. Skills | Begin with the few Skills needed for the first task |
| 7. Verify and continue | Check installation, actual loading and task results separately |

Check marks record manual progress; they do not run an installer. Changing the plan clears the previous checks. The page does not collect credentials or subscription URLs.

## Give your Agent one concrete request

Open this project in Codex or your existing workspace and use the [`$dahao` Skill](.agents/skills/dahao/SKILL.md).

- “Help me prepare an assistant computer. The first task is a weekend packing list.” → Receive a preparation checklist, choices, gaps and completion criteria.
- “How far along are we?” → Check existing state and separate completed, unconfirmed and unsupported steps.
- “Add a Skill and keep my preferences.” → Review the source and changes within the supported scope, preserving explicit overrides.

## One small task is enough to begin

“We are going away for two days. Help me pack light and separate what to bring from what to check.”

![Original weekend packing illustration showing what to pack, what to check and missing details; not executed by a real Agent](assets/readme/case-board-en.png)

This is an **original illustration of the intended task outcome**, not a live Agent result. [Read the input and example checklist](examples/first-task/weekend.md).

## Set the working boundaries first

The [general AGENTS template](examples/behavior/AGENTS.template.md) covers inspection, tool permissions, secret references, verification and continuation. It borrows the generic layering approach from Cici Foundry without importing private instances, SOUL or USER files. Adapt and verify the actual runtime entry point before claiming the rules are loaded. [Behavior checks](docs/behavior-baseline.md)

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
