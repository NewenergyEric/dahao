# 搭好 · dahao

### 把 AI 搭好，让你用得起来。

**给不太会 AI 的人，准备一个能开始的入口。**

[English](README.en.md) · 私有开发预览

搭好让本机 Agent 帮你给另一台电脑部署 AI 助手，适合给不太会 AI 的爱人、家人或朋友准备电脑。从“想让它帮哪件小事”开始，Agent 带着发现目标、建立连接、检查环境、安装配置，再验证第一件任务。你只参与目标确认、选择和必要的首次接入；下一次沿用记录继续。

<picture>
  <source media="(prefers-reduced-motion: reduce)" srcset="assets/readme/hero-zh.png">
  <img src="assets/readme/hero-zh.webp" width="100%" alt="24 秒搭好动效介绍：粉色手绘交接电脑场景、得意黑衍生展示字、连续素材运动和七步路线。给 AI 新手选择工具、准备工作规则与 Skills；真实安装仍待接入。">
</picture>

[下载中文 MP4](assets/readme/hero-zh.mp4?raw=true) · [GIF](assets/readme/hero-zh.gif?raw=true) · [短片与文字稿](docs/demo.md) · [本地播放器](docs/watch.html)

**今天可以用：** 第 0 步连接 + 七步安装清单、Windows/Mac 接入流程、Windows 双击连接小助手（本地未签名预览）、本机被动设备发现、单个已确认目标的 SSH 标识检查，以及已验证的 Windows 沙箱示例。已在一台 Windows 上实测指纹核对、只有 PIN 时的临时授权、SSH 登录，以及现有 OpenClaw 的健康检查与合成任务；临时接入已撤销并验证拒绝重连。全新安装、规则/Skill 加载、Mac 实机与真实扫码仍待验证。[查看当前边界](docs/support-matrix.md)

## 在帮助者的 Codex 里安装一次，然后说一句话

把下面的话发给本机 Codex：

> 请安装 https://github.com/NewenergyEric/dahao 中 `.agents/skills/dahao` 这个 Skill。先审阅来源和代码，安装完成后告诉我。

安装后，下一轮直接说：

> $dahao 帮我给同 Wi-Fi 下爱人的 Windows 电脑准备 AI 助手。默认 OpenClaw，先带我找到并确认电脑，再连接、检查、安装和验证。一步一步来，安全放在第一位。

**只安装 Skill 即可开始，不必下载整个仓库或网页。** 发现脚本、连接/安装/扫码清单、行为模板和 Windows 小助手源码都在 Skill 内。Codex 或兼容 Agent 仍需具备终端/文件工具；Python helper 使用标准库，Windows GUI 在 Windows 上用已有 .NET Framework 构建。Skill 提供操作流程和工具，不会绕过目标确认、系统授权或自动取得另一台电脑的控制权。仓库目前私有，安装者暂需访问权限。

接受帮助的爱人或朋友不用研究 Codex、Git 或命令行。你带着本机 Agent 推进，对方只需要：

1. 确认哪台是自己的电脑；Windows 可双击只读小助手交接信息。
2. 必要时看清权限，点击本次临时授权；只有 PIN 也有已实测路线。
3. 选择用途、亲自在官方界面登录或扫码，体验第一件小任务。

Agent 在对话里维护清单：**确认与连接 → 依赖 → 网络 → 工具（按需）→ OpenClaw/Hermes → 行为规则 → Skills → 验收与收回权限**。已有环境先验证再复用，未测项明确保留；Mac 已有清单但未实机验证。

可直接继续说：“检查上次做到哪里了”或“给它加一个 Skill，保留原来的习惯”。目标信息和进度保存在本机私有目录，不写进安装好的 Skill 或 GitHub。

[独立 Skill 验证](docs/skill-install-verification.json)

<details>
<summary>可选参考：文字清单、网页与扫码步骤</summary>

[安装清单](docs/installation-checklist.md) · [Windows/Mac 连接](docs/connection-checklist.md) · [飞书/微信](docs/chat-connection-checklist.md) · [可选 HTML 清单](docs/getting-started.html)

这些是参考资料，不是使用前置条件，不需要部署网站。扫码清单覆盖 OpenClaw/Hermes 与飞书/个人微信；本人扫码、允许范围、真实回复和重连分别验收。

</details>

## 小助手包里有什么，哪些不能公开

**公开的是通用工具；每次接入现场生成私人授权包。**

| 材料 | 是否包含真实连接资料 | 怎样处理 |
|---|---|---|
| Skill、通用连接/授权程序 | 不带目标、私钥、密码或 token | 审核通过后分发；通用授权程序单独不能接入电脑 |
| 本次目标授权包 | 有账户、地址、新公钥、主机校验码；没有私钥、密码或 token | 仅交给本次目标所有者，不能公开或复用 |
| 临时私钥 | 留在帮助者电脑的受限目录 | 不读取、不传给目标、不上传；撤销并验证后删除 |

点击授权意味着允许帮助者以所示账户执行命令，当前管理员路线权限较高；60 分钟限制新登录，已开始的命令可能继续。完工撤销本次授权并验证拒绝新登录。Windows 小助手目前未签名，若被拦截先核验来源，不关闭系统保护。[安全说明](.agents/skills/dahao/references/safety.md)

## 第一件事，可以很小

“周末出去两天，想轻装。帮我分清要带什么、出发前确认什么。”

![原创周末旅行任务示意：随身物品、出发前确认和待补充问题分开整理；尚未由真实 Agent 执行](assets/readme/case-board-zh.png)

这是**原创目标任务示意**，方便你判断“小助手该交出什么”；尚未由真实 Agent 执行。[查看完整输入与清单](examples/first-task/weekend.md)

## 先定工作边界，再加本领

[通用行为模板](examples/behavior/AGENTS.template.md)覆盖检查、工具权限、秘密引用、验证和接续。借鉴 Cici Foundry 的通用分层方法，未复制私人实例、SOUL 或 USER；需要按所选运行器核对实际加载入口。[行为验收方法](docs/behavior-baseline.md)

Skills 从第一件任务所需开始。当前合成示例已验证更新、保留覆盖和中断恢复；真实运行器加载仍需后续接入。

<details>
<summary>当前可运行的示例、证据与维护说明</summary>

已有 Windows + Python 3.12+ 时，无需安装 Python 依赖。在项目目录执行：

```powershell
python -B demo.py
```

新的独立沙箱会演示配置包 1.0.0 安装、重复执行、升级 1.1.0、保留覆盖、中断与恢复。合成订单结果为 2 笔、CNY 47.50，最大单笔 27.50。**这证明配置机制可运行，不代表旅行任务或真实 Agent 已部署。**

[隔离安装验证](docs/installation-verification.json) · [配置与恢复](docs/workflow.md) · [只读电脑引导](docs/computer-guide.md) · [素材与媒体验证](docs/media-validation.json) · [重建短片](motion/README.md)

```powershell
python -B -m unittest discover -s tests -v
python -B tools/release.py check
```

本次现有 OpenClaw 2026.9.6 已完成一项合成旅行清单测试；这是独立于上方原创示意的实测案例。安全审计为 0 项严重、8 条提醒，尚未全部处理，不能称为安全验收完成。[脱敏实测记录](docs/live-connection-verification.json)

用户入口仍为 configure / check / update。[远端工作流](docs/remote-workflow.md)由 Agent 的终端工具在目标授权下推进；`--brief` 仍只读。被动发现 helper 不认证、不安装；不读取既有凭据或订阅。[连接能力验证](docs/remote-access-verification.json)与真实目标验收分别记录。

[发布边界](docs/publishing.md) · [来源与许可](THIRD_PARTY_NOTICES.md) · [Skill 使用](docs/skill-usage.md)

</details>

搭好独立维护粉色亲民版，面向不太会 AI 的使用者。仓库保持私有，公开开源所需的许可证与版权仍由作者决定。
