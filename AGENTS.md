# 项目约定

先读 README.md 和 .agents/skills/dahao/SKILL.md；DELIVERY.md 若存在，仅作本机私有接续记录。
本项目是 搭好 · dahao：粉色、奶油色、莓果色，由本机 Agent 帮用户为另一台 Windows/Mac 电脑发现、接入、安装配置与验收，面向不熟悉 AI 的爱人、家人、朋友或自己。独立于面向 FDE 的 Client Setup。
Skill 以控制端协作推进真实目标；随包工具支持被动设备发现、指定目标 SSH 标识检查和 Windows 项目内合成示例。Mac/Windows 的 --brief 仍只读引导，真实 SSH 认证、Agent 安装与加载尚无实机验收。
用户入口只保留 configure/check/update。公共模板、用户覆盖、机器差异分开，固定来源/version/hash；不自动重新 pin。
不读取或复制现有凭据、订阅、cookie、聊天或客户数据。凭据仅引用，不读取值。
先发现再由用户确认目标；目标的连接、安装与配置只在对应授权范围内执行，新增 SSH/防火墙/代理或持久访问先说明具体变化和恢复方法。没有管理通道时引导目标操作者完成首次开启，不在控制端误执行。开发验证不连接未知设备或修改系统。本轮维护者已获私有建库和经审核源码推送授权，公开开源发布仍待许可证与版权决定。
先核对实例身份和计划，再执行明确确认的变更。中断用原计划恢复；验收分别报告安装、加载、业务结果。
修改执行逻辑后运行 python -B -m unittest discover -s tests -v；发布准备运行 python -B tools/release.py check。
发布文件逐项列入 release-files.json，客户目录、回执、日志、备份和私有记录全部排除。许可证由作者选择。

交付默认包含用户价值、docs/getting-started.html、docs/installation-checklist.md、Windows/Mac 连接清单和当前可用版的隔离安装验证。连接、安装、加载、任务分别报告证据。未接入能力保留未完成状态。

产品名为「搭好 · dahao」，项目 Skill 为 `$dahao`，面向不太会 AI 的人及帮助他们准备电脑的人。后续视觉修改先读 docs/brand.md：保留个性标题字、手绘素材与解释过程的连续动作，避免静态背景配文字淡入的 PPT 式影片。蓝色 FDE 不随此项目更名或换色。
