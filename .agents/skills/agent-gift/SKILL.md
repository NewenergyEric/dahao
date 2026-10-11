---
name: agent-gift
description: 引导非技术用户为爱人、客户或自己准备一台可用的 Agent 电脑，选择 Windows/Mac 与本机/另一台访问路径。当前可执行基础仅为 Windows 项目沙箱示例的配置、检查、更新；真实 Agent 安装与加载尚未接入。
---

# Agent Gift · 小助手电脑准备向导

把用户想做成的一件事，转为目标电脑的准备计划、可验证的执行和下次能接续的记录。用户入口仅配置、检查、更新；用简单语言解释下一步，不先堆技术问题。

先定位同时包含 README.md、client_setup.py、sources.lock.json 的项目根目录并切换过去，读 README.md；若有私有 DELIVERY.md，读作接续记录。所有来源使用此项目的相对路径，不依赖开发者机器或别的项目。

1. 确认给谁用、第一件真实任务、Windows/Mac、当前执行器是否就在目标电脑。只问尚缺且影响下一步的信息。本机走本地执行器，无需 SSH；另一台先核实系统并复用明确授权的现有连接。尚无访问或依赖时，按 docs/computer-guide.md 引导，不冒充已检查目标。
2. 按 docs/support-matrix.md 区分已实现与待接入。将无秘密的选择写成 examples/computer-local.json 所示简报；`python -B client_setup.py configure --customer <id> --brief <项目内相对路径>` 输出只读引导。check/update 同样支持 --brief；该计划不能批准成安装。Mac 执行、依赖安装、网络诊断、远端访问与真实 Agent 安装适配都未完成，未知版本不猜命令。
3. 用户选 Windows 本机安全示例时，使用 docs/workflow.md：先 check，再 configure/update 预览。客户/实例只用安全代号。首次 not_installed 的 check 不证明身份已核验；确认前核对预览中的 host、target、customer、instance。
4. 保留公共模板、客户覆盖、机器差异。仅合并用户明确更改的 currency/minimum_total/credential_refs；凭据仅 env:名称引用，不读值。展示 add/replace/keep、前后 hash、设置差异及 plan_id，具体计划获得确认后，以原命令加 --approve 执行。用户已明确授权的合成隔离演示可自行确认自己的示例计划。
5. 发现 pending 用原计划 resume；rollback 先说明恢复内容。漂移、身份、来源/hash或路径错误即停止，不强制覆盖或自动重新 pin。只管理列出的文件，不复制个人上下文。
6. 验收分别显示安装、加载与真实任务。示例仅证明本地 Python 合成订单业务，agent_runtime=not_verified 如实保留。没有真实运行器证据就不宣称小助手电脑已交付。
7. 留下 .control/latest/<客户>--<实例>.json 回执和下一条 check 命令，真实 Agent 未接入的缺口另说明；下一段对话先检查再继续。

当前仅本地工程和隔离示例；不全局安装 Skill、不连接另一台电脑、不建立持久访问、不启停现有 Agent、不改代理/TUN/SSH/防火墙、安全设置或读取秘密。未来具体目标的操作需要对应授权。公共包固定在 sources.lock.json；公开制品只用 release-files.json，客户数据、回执和私有记录不进入发布包。

首次上手时主动给出 docs/getting-started.html 和 docs/installation-checklist.md，按清单逐项报告证据与未完成项。当前版本安装验证用新建隔离示例，用户授权后可运行 demo.py；不得把项目示例通过扩展为真实 Agent 已安装。交付或发布材料沿用此清单，执行能力仍以上述范围为准。

安装清单按用户最新选择依次组织：依赖环境 → Clash 等网络通路 → Codex/IDE → 日常 Agent（默认 OpenClaw，可选 Hermes 或用户指定）→ 行为约束文件 → Skills → 验收与接续。清单默认沿用现有环境，只显示选择项与完成条件；本轮不扩展真实安装。行为规则参考 docs/behavior-baseline.md 与 examples/behavior/AGENTS.template.md，不导入 SOUL、USER 或私人资料。
