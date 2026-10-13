# Dahao · eric-dahao-agent-skill

**Set up an Agent for someone you care about, then help them finish their first useful task.**

[中文](README.md) · For people helping a partner, family member or friend use AI · [MIT](LICENSE)

Install the Skill in your own Codex and explain who you are helping and what they want to do. Dahao guides you through choosing the right computer, checking the environment, preparing the Agent and Skills, and trying one real task. OpenClaw is the default; Hermes or an existing assistant can be selected.

<picture>
  <source media="(prefers-reduced-motion: reduce)" srcset="assets/readme/hero-zh.png">
  <img src="assets/readme/hero-zh.webp" width="100%" alt="Pink hand-drawn Dahao workflow: help a friend choose tools, work rules and Skills, then start a useful task.">
</picture>

[24-second introduction, Chinese](docs/watch.html) · [Checklist, Chinese](docs/installation-checklist.md) · [Capabilities and evidence](docs/support-matrix.md)

## Start in three steps

**1. You install the Skill.** Send this to Codex on the helper's computer:

```text
Install this Skill after reviewing its source:
https://github.com/NewenergyEric/eric-dahao-agent-skill/tree/main/.agents/skills/eric-dahao-agent-skill
Install the complete folder. Compare any older version first and preserve my work records.
```

**2. Say who needs help and what they want to do:**

```text
$eric-dahao-agent-skill Help me prepare an AI assistant on my friend's Mac.
Start with OpenClaw. The first task is a weekend packing and travel checklist.
We are on the same Wi-Fi. Guide us through confirming the computer, checking
what is already there and setting it up. Give us one immediate step at a time.
```

**3. Follow the next step together.** Your friend confirms their computer, approves necessary access, signs in or scans through the official interface, and tries the first task. Later, ask to check progress or add one Skill while keeping their existing preferences.

The complete Skill contains its scripts, connection and installation checklists, work-rule template and Windows helper source. No webpage or full repository is required to begin. Windows and Mac have preparation routes; exact tooling and implementation limits are in the [support matrix](docs/support-matrix.md).

## Who does what

| You, the helper | Your friend | The Agent |
|---|---|---|
| Install the Skill and explain the goal | Confirm their computer | Check existing tools and show the next step |
| Review the target and proposed changes | Approve necessary access and sign in personally | Connect and configure within the specific authorization |
| Help try one useful task | Use the assistant themselves | Check connection, installation, loading and output; revoke this session's temporary access |

Already on the target computer? Use the local route. Already have a working Agent? Check and reuse it. Need formal customer delivery? Use [Luodi](https://github.com/NewenergyEric/eric-agent-luodi-skill).

## Keep going when something is unclear

- Cannot identify the computer: ask for help confirming it before any connection.
- Windows account has only a PIN: use the helper workflow and let the owner review the access request.
- A step failed: check its current state before repeating an installation.
- Ready to hand over: let your friend try a task and verify temporary access is revoked.

Passwords, private keys, subscriptions and QR codes stay in the correct native or official interface. Target-specific access bundles are private delivery materials. [Safety details](.agents/skills/eric-dahao-agent-skill/references/safety.md)

[Windows/Mac connection](docs/connection-checklist.md) · [Chat channels](docs/chat-connection-checklist.md) · [Optional HTML checklist](docs/getting-started.html)

<details>
<summary>Existing installations and other Agents</summary>

The old identifier was `dahao`. Install `eric-dahao-agent-skill`, confirm it can be selected, then remove only the confirmed old Skill directory if needed. Keep private session records and target settings where they are. Select the new Skill in the next conversation turn if the list needs refreshing.

Other Agent Skills-compatible tools can install the full folder using their official method. Actual operations require terminal and file tools. The Python helpers use the standard library; Windows GUI builds use the system .NET Framework on Windows.

</details>

<details>
<summary>Developer checks, helper builds and real-device scope</summary>

A Windows trial covers temporary SSH access, identity/reconnection, reuse of an existing OpenClaw installation and access revocation. Fresh Agent installation, actual rules/Skill loading, Mac hardware and live QR login are documented separately in the [support matrix](docs/support-matrix.md). Functionality and remaining security work are separate outcomes.

The Windows helper is unsigned. Follow the [build instructions](.agents/skills/eric-dahao-agent-skill/references/windows-helper.md); verify the source if blocked and do not disable security protection. Access permissions and expiry behavior are explained in the safety reference.

The full repository also has a synthetic configuration example for Windows + Python 3.12+:

```powershell
python -B demo.py
python -B -m unittest discover -s tests -v
python -B tools/release.py check
```

[Standalone Skill checks](docs/skill-install-verification.json) · [Windows trial](docs/live-connection-verification.json) · [Synthetic example](docs/installation-verification.json) · [Workflow](docs/workflow.md) · [Media source](motion/README.md)

</details>

[Editorial references](docs/skill-usage.md) · [Publishing rules](docs/publishing.md) · [Third-party notices](THIRD_PARTY_NOTICES.md)

Original content uses [MIT](LICENSE). The pink Dahao brand, hand-drawn artwork, fonts and motion remain in place.
