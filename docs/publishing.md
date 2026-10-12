# 发布准备

作者已授权在隐私审查通过后按 MIT 公开本仓库；第三方材料保留原许可。release-files.json 是逐项白名单；python -B tools/release.py check 检查文本、路径、秘密模式、固定包 hash 与媒体 pin，build 生成可重复 ZIP。扫描通过不等于已授权发布，也不证明像素内没有秘密；生成图片另作人工视觉检查。

绝不将 customers、machines、sandboxes、.control、.demo-runs、.test-runs、.private、.release、日志或本机 DELIVERY.md 加入公共制品。不复制实际 API 值、代理订阅、cookie、聊天与客户数据。凭据引用也不从用户环境取值。

项目复制自明确审核的公开源码子集，采用自己的 README、Skill 入口、营销资产与 ZIP 名称。Client Setup 的用户文件、旧蓝色视频与私有历史没有复制。

## 默认交付

每次交付附用户价值、随独立 Skill 安装的文字清单和隔离安装验证，Agent 在对话中带着完成；HTML 仅作可选参考。分别记录连接、安装、规则/Skill 加载与任务范围。只更新证据中实际复测的内容；未实现的安装步骤保留待办。

私有仓库也只提交 release-files.json 列出的已审字节。首次提交前检查完整暂存树、文件 hash、提交身份与消息，保留本地审阅记录。MIT 许可不代替隐私审查；工具仍会要求人工审核 Git 历史，审核记录保存在本机私有目录。所有分支、标签、提交、制品及运行日志也应核对，不能只检查当前文件。

## 独立 Skill 与接入包

普通用户由 Codex 安装 `.agents/skills/dahao` 后调用 `$dahao`，不需要网页、全仓库或合成演示。操作参考、模板和小助手源码在 Skill 内维护，仓库 docs 仅保留入口。

公开代码与通用构建没有本次目标资料；私人授权 ZIP 含账户、地址、新公钥、主机校验码，不含私钥/密码/token，但仍禁止公开。每次协助现场生成新密钥，私钥只留控制端；收回临时授权并验证拒绝后清理。公开路径检查还会拒绝 request.json、known_hosts、authorized_keys、公钥文件和临时 client_key，即使误加到白名单也在读取前阻止。

独立安装验证应只复制已列入白名单的 Skill 子目录到空目录，从无仓库环境执行脚本和 Windows 构建自检，并核对参考链接都在包内。通用 ZIP 的成员逐项核对；不能递归打包本机目录。GitHub 上的安装器按明确提交安装，安装后比较整个 Skill 的文件与 hash。
