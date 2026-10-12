# 项目约定

先读 README.md 和 .agents/skills/dahao/SKILL.md；DELIVERY.md 若存在，仅作本机私有接续记录。
本项目是 搭好 · dahao：粉色、奶油色、莓果色，面向非技术用户给爱人、客户或自己准备小助手电脑。独立于面向 FDE 的 Client Setup。
完整电脑交付是目标，当前执行仅 Windows 项目内合成示例；Mac/Windows 的 --brief 都只读引导，不能宣称真实 Agent 已配置。
用户入口只保留 configure/check/update。公共模板、用户覆盖、机器差异分开，固定来源/version/hash；不自动重新 pin。
不读取或复制现有凭据、订阅、cookie、聊天或客户数据。凭据仅引用，不读取值。
当前不连接另一台电脑、不全局安装、不启停 Agent、不改代理/TUN/防火墙/SSH或安全设置、运行器不创建远端仓库或发布；本轮维护者已获私有建库和经审核源码推送授权，公开开源发布仍待许可证与版权决定。
先核对实例身份和计划，再执行明确确认的变更。中断用原计划恢复；验收分别报告安装、加载、业务结果。
修改执行逻辑后运行 python -B -m unittest discover -s tests -v；发布准备运行 python -B tools/release.py check。
发布文件逐项列入 release-files.json，客户目录、回执、日志、备份和私有记录全部排除。许可证由作者选择。

交付默认包含用户价值、docs/getting-started.html、docs/installation-checklist.md 和当前可用版的隔离安装验证。未接入能力保留未完成状态。

产品名为「搭好 · dahao」，项目 Skill 为 `$dahao`，面向不太会 AI 的人及帮助他们准备电脑的人。后续视觉修改先读 docs/brand.md：保留个性标题字、手绘素材与解释过程的连续动作，避免静态背景配文字淡入的 PPT 式影片。蓝色 FDE 不随此项目更名或换色。
