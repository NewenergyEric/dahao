# 搭好 · dahao · Agent 电脑安装清单

[飞书 / 微信扫码清单](chat-connection-checklist.md) · [当前示例验证记录](https://github.com/NewenergyEric/dahao/blob/main/docs/installation-verification.json)

让本机 Agent 帮你给另一台电脑搭好助手；你确认目标与选择，Agent 带着发现、连接、安装配置和验收。

先做第 0 步，再做后面的 7 步。Skill 可指导终端操作；随包工具包含发现、单目标 SSH 检查、Windows 连接/临时授权 GUI 源码和合成示例。一台 Windows 的真实登录与现有 OpenClaw 可用性已验证；全新安装、规则/Skill 加载与 Mac 实机仍待验证。手动勾选不代表自动验收。默认 OpenClaw，可选 Hermes 或用户指定的 Agent。

## 先选择

- 目标电脑：Windows / Mac；默认另一台，也可就在这台。
- 网络：复用可用通路或直连 / Clash Verge Rev / 用户指定工具。
- 本机准备工具：Codex / VS Code + Agent 扩展 / Cursor / 现有工具；目标端确有需要时再安装。
- 日常 Agent：OpenClaw（默认）/ Hermes / 用户指定。
- Skills：第一件任务所需 / 用户审核清单 / 检查现有 Skills。

选择改变后重新核对完成项。另一台电脑由本机 Agent 先发现并引导建立接入，缺少接入时才请目标操作者完成必要的开启步骤。只准备实际需要的依赖，不把所有选项一起安装。

## 0. 发现并连接目标电脑

- [ ] 本机 Agent 检查控制端工具，读取已有局域网候选；用户确认目标，不先索要整套网络参数。
- [ ] 确认后检查该目标 SSH；未开启时走 [Windows / Mac checklist](connection-checklist.md) 的对应分支。
- [ ] 核对目标公钥指纹；只有 PIN 的 Windows 使用独立临时授权小助手，核对权限后点击，无需发送 PIN/密码。Agent 确认远端电脑、账户、系统并重连。
- [ ] 连接成功后继续检查环境；无证据的阶段保留未完成，不将端口打开写成已登录。

本机就在目标上时只需确认身份与项目目录，无需 SSH。完整职责与命令见 [Agent 远端工作流](remote-workflow.md)。

## 1. 依赖环境

- [ ] 核对目标系统、架构、执行位置与现有 Git、Node.js、Python 等版本。
- [ ] 按选定 Agent 发行版的官方要求补齐依赖，记录版本；原生系统或 WSL2 由实际支持和用户选择决定。
- [ ] 在实际执行环境验证所需工具可运行。当前项目示例要求 Python 3.12+，只使用标准库。

来源：[OpenClaw 安装要求](https://docs.openclaw.ai/install)、[Hermes 安装说明](https://hermes-agent.nousresearch.com/docs/getting-started/installation)。

## 2. Clash 等网络通路

- [ ] 已有网络可用则复用；需要安装时选择维护者发行版与适合的架构。
- [ ] 用户在自己的客户端配置订阅或登录。本清单、项目与聊天均不接收秘密值。
- [ ] 分别验证安装工具及 Agent 所需端点可达；仅浏览器能访问不等于运行器通路已好。

来源：[Clash Verge Rev 维护者下载](https://github.com/clash-verge-rev/clash-verge-rev/releases)、[维护者文档](https://www.clashverge.dev/)。需要修改目标代理/TUN 时，先展示具体变化和恢复方式，并核对对应授权；不读取订阅。

## 3. Codex / IDE

- [ ] 在帮助者电脑安装或复用 Codex/所选工具，由本人登录并安装 dahao Skill；接收帮助的人不必安装 Codex，也不必下载网页。
- [ ] 调用 `$dahao`；以已安装的 SKILL.md 所在目录定位脚本和参考资料，另选私有工作目录保存本次进度。
- [ ] 完成一个不含私人数据的小任务，确认准备工具可用。

入口：[Codex 官方开始说明](https://developers.openai.com/codex/quickstart)。VS Code / Cursor 从其各自官方站点选择系统对应安装包；选择 IDE 时另外确认所需 Agent 扩展，IDE 本身不等于 Agent 已配置。

## 4. 安装日常 Agent

- [ ] 默认 OpenClaw，或使用明确选定的 Hermes / 其他 Agent，记录官方来源与发行版本。
- [ ] 确定安装位置、工作目录、模型和账号路径；凭据仅在目标工具中配置，项目只记录引用或状态。
- [ ] 实际核对版本与运行状态，完成最小任务。安装文件存在不算可用。

已有安装先验证再复用。本次复用目标上的 OpenClaw 2026.9.6，版本、健康及合成任务通过；未调用新安装器，也未升级或重写其配置。安全审计提醒另列待办；上游支持某系统不表示搭好已验证全新安装。

## 5. 行为约束文件

- [ ] 审阅 [AGENTS 模板](../assets/AGENTS.template.md)，按所选运行器实际支持的规则入口适配。
- [ ] 先看原配置差异，仅合并明确选择的工作规则；不覆盖现有有效设置。
- [ ] 分别规定工作流程、工具范围、确认边界、来源/版本、验收、失败恢复和接续。
- [ ] 排除 SOUL、USER、记忆、聊天、个人档案和任何秘密值。
- [ ] 配置实际工具权限与审批，验证规则被加载并通过行为检查；仅有 Markdown 不能证明权限被限制。

见[行为基线与验证方法](behavior-baseline.md)。参考 Cici Foundry 的配置分层方法，不复制它的用户 Profile 或实例数据。

## 6. Skills

- [ ] 先确定第一件真实任务，只选择必要且审核过的 Skills。
- [ ] 核对来源、版本、许可、依赖及工具权限，再按选定 Agent 的加载规则安装。
- [ ] 确认实际发现并调用 Skill，完成相应任务；更新时保留用户覆盖。

当前已支持的 Windows 项目示例：先 check，configure/update 生成差异，审核完整 plan_id 后批准；详见 [工作流](https://github.com/NewenergyEric/dahao/blob/main/docs/workflow.md)。真实 Agent 的 Skill 安装和加载尚未接入。

Windows 首次交接优先使用[双击连接小助手](windows-connect.md)，用户核对后复制必要信息；不要求新手抄技术命令。Mac 按连接清单走系统设置路线。

## 可选：手机扫码接飞书 / 微信

- [ ] 按[独立扫码 checklist](chat-connection-checklist.md)选择 OpenClaw/Hermes 与飞书/个人微信，核对入口、插件来源和版本。
- [ ] 先限制本人私聊、关闭群聊并核对工具权限；由用户在官方界面查看授权并扫码，不传二维码或秘密给 Agent。
- [ ] 验证本人回复、未授权访问拒绝和重连；保留停用/撤销授权方法。扫码成功不代替这些证据。

## 7. 验收与接续

- [ ] 分别记录文件安装、规则/Skill 实际加载、真实任务结果，附可检查证据。
- [ ] 未验证项明确保留，不用示例成功代替真实用户任务成功。
- [ ] 分开说明“功能已通过”和“安全待办”；安全审计、规则/Skill 加载、扫码与权限边界各自验收。
- [ ] 完工撤销本次临时 SSH 公钥并实测拒绝新登录，再清理本次私钥；保留目标原有服务。
- [ ] 本地保存版本、回执、未完成项和下一条 check；下次核对目标身份后继续。

## 开发者示例是可选项

独立安装的 Skill 已带有操作清单、发现脚本、Windows 小助手源码与构建工具；不依赖仓库根目录或 HTML。另有仓库内 Python 合成示例，仅用于开发者验证配置机制，不是使用前置条件。[历史示例证据](https://github.com/NewenergyEric/dahao/blob/main/docs/installation-verification.json)。

## 交给 Agent 的话

> 使用 $dahao，在对话里带我完成清单。由本机 Agent 先发现并确认另一台目标电脑，带我建立并核验连接；然后按我选择的方案逐项检查：依赖环境、网络通路、Codex/IDE、日常 Agent、行为约束文件、Skills 与验收。默认 OpenClaw，保留现有设置；不导入 SOUL、USER 或任何私人资料。只执行当前支持且获授权的步骤，逐项留下证据、待办和下一步，不把勾选当作安装成功。

官方入口核对日期：2026-10-12。实际安装前按选定发行版本重新核对要求；本清单未将实时 latest 固定成项目的可执行配方。
