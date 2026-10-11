# 发布准备

作者已授权私有仓库创建与审核后推送；当前仍未选择公开开源许可证。release-files.json 是逐项白名单；python -B tools/release.py check 检查文本、路径、秘密模式、固定包 hash 与媒体 pin，build 生成可重复 ZIP。扫描通过不等于已授权发布，也不证明像素内没有秘密；生成图片另作人工视觉检查。

绝不将 customers、machines、sandboxes、.control、.demo-runs、.test-runs、.private、.release、日志或本机 DELIVERY.md 加入公共制品。不复制实际 API 值、代理订阅、cookie、聊天与客户数据。凭据引用也不从用户环境取值。

项目复制自明确审核的公开源码子集，采用自己的 README、Skill 入口、营销资产与 ZIP 名称。Client Setup 的用户文件、旧蓝色视频与私有历史没有复制。

## 默认交付

每次当前版本交付附用户价值说明、HTML 使用流程、可勾选安装清单和独立导出副本的安装验证，分别记录安装、本地加载、真实 Agent 加载与业务范围。入口为 getting-started.html、installation-checklist.md 与 installation-verification.json。只更新证据中实际复测的内容；未实现的安装步骤保留待办。

私有仓库也只提交 release-files.json 列出的已审字节。首次提交前检查完整暂存树、文件 hash、提交身份与消息，保留本地审阅记录。许可证未选择时 publication_ready 仍为 false，这不自动授权公开开源或更改仓库可见性。
