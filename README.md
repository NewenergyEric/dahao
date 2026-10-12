# 搭好 · dahao

### 把 AI 搭好，让你用得起来。

**给不太会 AI 的人，准备一个能开始的入口。**

[English](README.en.md) · 私有开发预览

搭好是一个面向 AI 新手的部署准备 Skill，也帮助你给爱人、家人或朋友配置助手电脑。从“想让它帮哪件小事”开始，选择工具、检查环境、定好行为规则，再验证第一件任务。下一次添加或更新 Skill，继续沿用清单和接续记录。

<picture>
  <source media="(prefers-reduced-motion: reduce)" srcset="assets/readme/hero-zh.png">
  <img src="assets/readme/hero-zh.webp" width="100%" alt="24 秒搭好动效介绍：粉色手绘交接电脑场景、得意黑衍生展示字、连续素材运动和七步路线。给 AI 新手选择工具、准备工作规则与 Skills；真实安装仍待接入。">
</picture>

[下载中文 MP4](assets/readme/hero-zh.mp4?raw=true) · [GIF](assets/readme/hero-zh.gif?raw=true) · [短片与文字稿](docs/demo.md) · [本地播放器](docs/watch.html)

**今天可以用：** 完整七步清单、工具选择项、通用行为模板，以及已验证的 Windows 沙箱示例。真实 Agent 安装、规则与 Skill 加载仍待接入。[查看当前边界](docs/support-matrix.md)

## 从一张清单开始

取得仓库访问权限后，点击 **Code → Download ZIP** 并解压，用浏览器打开 [`docs/getting-started.html`](docs/getting-started.html)。选择你的方案，再逐项确认；进度保存在当前浏览器，可以复制、下载或打印。

**[打开七步准备清单](docs/getting-started.html)** · [纯文字版](docs/installation-checklist.md)

| 按顺序准备 | 你需要决定什么 |
|---|---|
| 1. 依赖环境 | Windows / Mac、这台 / 另一台；先检查已有环境 |
| 2. 网络通路 | 复用可用网络，或选 Clash 等工具 |
| 3. Codex / IDE | 选一个带你准备电脑的工具，也可沿用现有工具 |
| 4. 日常 Agent | 默认 OpenClaw，可选 Hermes 或指定其他 Agent |
| 5. 行为约束 | 怎样做事、能用什么工具、什么时候需要确认 |
| 6. Skills | 先选第一件任务用得上的少量技能 |
| 7. 验收接续 | 分别检查安装、实际加载、任务结果，留下下一步 |

勾选只记录人工进度，不运行安装。已有可用环境直接复用；换方案会清空旧勾选。页面不接收 token、订阅地址或其他秘密值。

## 把第一句话交给 Agent

在 Codex 或已有工具里打开项目，使用 [`$dahao` Skill](.agents/skills/dahao/SKILL.md)，从下面任意一句开始。

| 你说 | 当前会拿到什么 |
|---|---|
| “给她准备一个小助手，先帮她整理周末旅行清单。” | 目标电脑与工具选择、七步准备清单、缺口和完成条件 |
| “看看现在准备到哪一步了。” | 检查已有状态，区分已完成、待确认与尚未接入 |
| “想加一个 Skill，保留我的习惯。” | 在当前支持范围内检查来源、比较变化、保留明确的覆盖项 |

不必先研究每个命令。先说明想做的事，Agent 再解释下一步与当前能执行的范围。

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

用户入口仍为 configure / check / update。Mac 和另一台电脑只提供只读引导；不全局安装、不连接客户机器、不修改系统网络、不读取既有凭据或订阅。

[发布边界](docs/publishing.md) · [来源与许可](THIRD_PARTY_NOTICES.md) · [Skill 使用](docs/skill-usage.md)

</details>

搭好独立维护粉色亲民版，面向不太会 AI 的使用者。仓库保持私有，公开开源所需的许可证与版权仍由作者决定。
