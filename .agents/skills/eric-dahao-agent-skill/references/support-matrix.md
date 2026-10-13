# 系统与运行器支持矩阵

搭好由本机 Agent 帮用户为另一台电脑推进发现、接入、安装、配置与验收。Windows 与 Mac 都有真实目标案例；每次新交付仍按目标逐项验证。下表截至 2026-10-13，历史版本不代表当前推荐版本。

| 能力 | Windows | Mac | 证据与边界 |
|---|---|---|---|
| 本机 Agent 协作流程 | 随 Skill 提供 | 随 Skill 提供 | 独立 Skill 包含操作参考与小助手源码，无需网页 |
| 控制端被动发现 | 实际运行过 | 解析器合成测试 | 邻居缓存可能不完整；Mac 作为目标通过不代表 Mac 控制端实测 |
| 单目标 SSH 检查与身份核验 | 一台目标通过 | 一台目标通过 | 端口、独立公钥指纹、认证和远端身份分别核对 |
| 双击连接信息交接 | 真实目标通过 | 真实 Apple 芯片目标通过 | [Windows 小助手](windows-connect.md)、[Mac 小助手](mac-helper.md)；均未签名 |
| 点击临时公钥授权 | 已有 SSH 的本地管理员账户通过 | 已有远程登录的普通账户路径通过 | 账户级命令权限；来源限制、60 分钟新登录有效期，禁止转发；不收集密码/PIN |
| SSH 重连与撤销 | 通过，撤销后拒绝新登录 | 通过，撤销后拒绝新登录 | 本次私钥已清理，保留其他授权及原有服务 |
| OpenClaw 安装与环境 | 复用已有 2026.9.6，Node 24.19.0 | 用户级新装 2026.10.2，Node 24.21.0 | Mac 为 arm64；保留原有 Node/NVM；Windows 空白机安装、Intel Mac 未验收 |
| OpenClaw 使用验证 | 工具完成健康及合成任务 | 工具核验安装/CLI 版本；使用者随后确认验证成功 | Mac 模型任务未由工具留存结果，模型密钥由本人配置 |
| 给新手的打开入口 | 依已有安装交付 | 支持为已核验前缀构建启动 App | 启动包不重新安装，打开后仍需本人配置和试用 |
| 安全加固 | 原审计 0 严重、8 提醒待处理 | 临时接入收回已验收；全面加固未验收 | 功能通过不自动关闭安全待办 |
| 工作规则 / Skill 实际加载 | 本次未验收 | 本次未验收 | 文件存在、文案约束或 CLI 可运行不能代替加载与行为证据 |
| Hermes、飞书 / 微信 | 操作清单，实际扫码未验收 | 操作清单，实际扫码未验收 | 执行前核对选定版本官方入口与权限，默认本人私聊 |
| `--brief` 分流 | 只读计划 | 只读计划 | guidance_only，没有执行安装或 SSH |
| 项目内合成配置示例 | 已验证 | 未实现 | 与真实目标协作流程分别记录 |

## 两次真实交付的脱敏记录

- [Windows 实测](https://github.com/NewenergyEric/eric-dahao-agent-skill/blob/main/docs/live-connection-verification.json)：连接小助手 → PIN-only 公钥授权 → SSH 身份和重连 → 复用现有 OpenClaw → 健康与合成任务 → 撤销及拒绝新登录。
- [Mac 实测](https://github.com/NewenergyEric/eric-dahao-agent-skill/blob/main/docs/mac-connection-verification.json)：连接小助手 → 公钥核验与点击授权 → SSH 身份和重连 → 独立用户目录新装 Node/OpenClaw → CLI 版本验证 → 撤销及清理；使用者随后确认安装与验证成功。

Mac 下载曾因网络中断不完整，校验阻止使用后，续传并验证完整性再继续。公开记录不包含真实地址、用户名、电脑名、指纹、请求、密钥或原始日志。每次交付都给出真实安装位置、打开方式、验证证据和下一步；验证记录不能自动成为另一台机器的验收。

[独立 Skill 验证](https://github.com/NewenergyEric/eric-dahao-agent-skill/blob/main/docs/skill-install-verification.json) · [历史发现工具验证](https://github.com/NewenergyEric/eric-dahao-agent-skill/blob/main/docs/remote-access-verification.json) · [项目合成示例](https://github.com/NewenergyEric/eric-dahao-agent-skill/blob/main/docs/installation-verification.json)
