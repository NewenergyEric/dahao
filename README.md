# 搭好 · eric-dahao-agent-skill

**帮爱人、朋友把 Agent 搭好，陪他们做成第一件小事。**

[English](README.en.md) · 给正在帮助家人、朋友准备 AI 助手的人 · [MIT](LICENSE)

[开始使用](#三步开始) · [谁来做哪一步](#你朋友和-agent-各做什么) · [安装清单](docs/installation-checklist.md) · [24 秒介绍](docs/watch.html)

朋友想用 AI，却卡在“装哪个、怎么连、接下来点哪里”。你在自己的 Codex 装好这个 Skill，说清想帮谁、做什么。搭好带着确认电脑、检查环境、准备 Agent 和 Skills，再让对方亲手试一件事。默认 OpenClaw，也能选择 Hermes 或已有助手。

<picture>
  <source media="(prefers-reduced-motion: reduce)" srcset="assets/readme/hero-zh.png">
  <img src="assets/readme/hero-zh.webp" width="100%" alt="粉色手绘搭好流程：帮助者把电脑交给朋友，一步步选择工具、工作规则和 Skills，开始第一件小任务。">
</picture>

[中文 MP4](assets/readme/hero-zh.mp4?raw=true) · [GIF](assets/readme/hero-zh.gif) · [文字稿](docs/demo.md)。保留「搭好 · dahao」中文品牌、手绘素材、字体和连续动效。

## 从一句普通话开始

| 你想帮对方做什么 | 可以这样说 | 先得到什么 |
|---|---|---|
| 给爱人准备 AI 助手 | “帮她用 Mac 整理周末出行清单” | 电脑与用途选择、眼前要做的一步 |
| 朋友已经装过 Agent | “先看看能不能用，能用就保留” | 当前状态、缺什么、下一步做什么 |
| 隔了几天继续 | “接着上次做，给它加一个 Skill” | 原有记录、需要改的部分和试用方法 |

不确定工具怎么选，就先用默认 OpenClaw；已经有能用的助手，就先复用它。

## 三步开始

**1. 你来安装。** 在帮助者自己的 Codex 中发送：

```text
帮我安装这个 Skill：
https://github.com/NewenergyEric/eric-dahao-agent-skill/tree/main/.agents/skills/eric-dahao-agent-skill
审阅来源后安装完整 Skill 目录；如果已有旧版，先核对差异，不覆盖我的工作记录。
```

**2. 说出想帮谁、做哪件事。** 电脑信息不清楚也能开始，Agent 会带你确认。

```text
$eric-dahao-agent-skill 帮我给朋友的 Mac 准备 AI 助手。
先用 OpenClaw，第一件事是整理周末出行清单。
我们在同一个 Wi-Fi 下。先带我确认电脑，再一步步检查和配置；
每次只告诉我们眼前要做什么，已有能用的东西就保留。
```

**3. 跟着做眼前这一步。** 朋友确认自己的电脑，亲自完成必要的系统授权、登录或扫码，再试着完成第一件小任务。以后直接说“检查上次进度”或“帮她加一个 Skill，保留原来的习惯”。

**只安装 Skill 就能开始，不必下载网页或完整仓库。** 脚本、连接清单、工作规则模板和 Windows 小助手源码都在 Skill 内。Windows / Mac 都有接入流程；具体工具要求、适用范围和实机记录集中在[支持矩阵](docs/support-matrix.md)。

<details>
<summary>已有旧版，或使用其他 Agent</summary>

旧 Skill 名称是 `dahao`，新名称是 `eric-dahao-agent-skill`。确认新版可选后，再请 Agent 仅移除确认属于本项目的旧 Skill；私人接入记录和目标配置留在原处。若技能列表未刷新，在下一轮对话重新选择。

其他支持 Agent Skills 的工具可按其官方方式安装完整目录。实际接入需要帮助者的 Agent 具有终端和文件工具；普通聊天可以解释清单，但不能替你操作另一台电脑。Python helper 使用标准库，Windows GUI 在 Windows 上用系统 .NET Framework 构建。

</details>

## 你、朋友和 Agent 各做什么

| 你：帮助者 | 朋友：电脑使用者 | Agent |
|---|---|---|
| 安装 Skill，说清用途和想保留的设置 | 确认哪台是自己的电脑 | 检查已有工具，列出下一步 |
| 核对目标与变更计划 | 亲自确认权限、登录或扫码 | 在具体授权范围内连接、检查和配置 |
| 陪朋友试一次，留下继续的方法 | 亲手完成第一件小任务 | 分别核对连接、安装、加载和成果，收回本次临时访问 |

下面是对话示例：

> **你：** 想给朋友装个 Agent，但她不懂命令行。
>
> **搭好：** 你负责和我一起推进，她只做必要选择。先确认她用 Windows 还是 Mac，以及想让助手帮哪件小事；已有的信息不用再填。
>
> **你：** Mac，做出行清单。她就在旁边。
>
> **搭好：** 先确认我们要操作的电脑。如果需要她在系统设置中开启接入，我会只给她当前这一步；接着检查已有环境，再把要安装和保留的内容列给你们看。

## 带着做的清单

- [ ] 确认目标电脑；就在目标本机时直接开始，另一台先核验连接。
- [ ] 检查依赖和网络，复用已有可用环境。
- [ ] 选择准备工具和日常 Agent，默认 OpenClaw。
- [ ] 设置 AGENTS.md 等工作规则，保留已有习惯和选择。
- [ ] 只加第一件任务需要的 Skills。
- [ ] 让朋友自己试一件事；需要时再接飞书或微信。
- [ ] 核对临时访问已经收回，留下下次继续的一句话。

[详细安装清单](docs/installation-checklist.md) · [Windows / Mac 连接](docs/connection-checklist.md) · [手机入口](docs/chat-connection-checklist.md) · [可选 HTML 清单](docs/getting-started.html)

## 遇到卡点，继续这样说

- **找不到电脑：** “带我确认目标，先别连接你猜到的设备。”
- **Windows 只有 PIN：** “按连接小助手的流程来，让本人看清权限再确认。”
- **某一步失败：** “先看现在做到哪里，不重复安装，给我下一步。”
- **想换 Agent：** “先比较需要改的内容，保留原配置和能用的工具。”
- **准备交给朋友：** “让她自己试一次，然后检查本次临时访问是否已收回。”

密码、私钥、订阅和二维码由本人在正确的官方界面处理。小助手生成的目标授权包只交给这次被帮助的人；通用源码可以公开，真实接入材料留在私有目录。首次接入、权限变化和恢复办法贴着具体动作解释。[详细安全边界](.agents/skills/eric-dahao-agent-skill/references/safety.md)

<details>
<summary>开发者：能力范围、验证与小助手构建</summary>

Skill 提供控制端协作流程，实际动作依赖现有工具、目标权限与版本。Windows 已有一次临时 SSH、身份/重连、复用 OpenClaw 和撤销的实机记录；空白电脑全新安装、规则/Skill 实际加载、Mac 实机与真实扫码的结果以[支持矩阵](docs/support-matrix.md)为准。记录分开列出功能结果和安全待办。

Windows 小助手源码随 Skill 提供，按[构建说明](.agents/skills/eric-dahao-agent-skill/references/windows-helper.md)在本地构建；程序未签名，被拦截时先核验来源，不关闭保护。临时授权的账户权限和到期行为见[安全边界](.agents/skills/eric-dahao-agent-skill/references/safety.md)。

完整仓库中的合成配置示例可在 Windows + Python 3.12+ 运行，不是使用 Skill 的前置条件：

```powershell
python -B demo.py
python -B -m unittest discover -s tests -v
python -B tools/release.py check
```

[独立 Skill 验证](docs/skill-install-verification.json) · [实机历史](docs/live-connection-verification.json) · [配置包示例](docs/installation-verification.json) · [工作流](docs/workflow.md) · [媒体重建](motion/README.md)

</details>

[Skill 与写法来源](docs/skill-usage.md) · [发布边界](docs/publishing.md) · [第三方许可](THIRD_PARTY_NOTICES.md)
