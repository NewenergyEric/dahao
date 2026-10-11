# Agent Gift

**Prepare a computer that can help someone you care about.** A warm, simple guide for a loved one, a client, or yourself.

[中文](README.md) · [Interactive guide (Chinese)](docs/getting-started.html) · [Installation checklist](docs/installation-checklist.md) · [Isolated validation](docs/installation-verification.json)

Download the HTML and open it locally to use its checklist and copy controls.

Describe one task. The intended journey is needs → computer/access checks → dependencies and Agent → Skills → a real task → a continuation record. This complete journey is a product goal, not an implemented installer.

![Pink product direction](assets/readme/direction-zh.png)

Choose Windows or Mac and whether the executor is already on the target. Local execution needs no SSH. Another computer requires verified, explicitly authorized access. Current execution is only the Windows local synthetic package; Mac has a read-only guidance branch and has not been tested on a Mac.

Open the repository in Codex and use [.agents/skills/agent-gift/SKILL.md](.agents/skills/agent-gift/SKILL.md). Python 3.12+ is needed for the current scripts; empty-machine bootstrapping remains unimplemented.

```powershell
python -B client_setup.py configure --customer sample --brief examples/computer-local.json
python -B demo.py
```

Only configure, check and update are user entries. --brief generates guidance without installation or connections. The sandbox example supports pinned sources, reviewable diffs, preserved overrides, idempotent replay, drift detection and interrupted update recovery. Agent loading and real user-task acceptance remain unverified.

[Support matrix](docs/support-matrix.md) · [Guide](docs/computer-guide.md) · [Current executable workflow](docs/workflow.md)

Separate from the blue FDE Client Setup product. Private repository delivery is authorized; no public open-source release or project license has been selected. No App, web backend, database or persistent management service.
