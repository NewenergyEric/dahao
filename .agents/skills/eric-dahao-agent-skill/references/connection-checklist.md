# 第 0 步：连接目标电脑

[回到安装清单](installation-checklist.md)

先连到正确的电脑，再准备依赖、网络、Agent 和 Skills。这里的“目标电脑”是要装助手的电脑，“控制电脑”是你现在操作的电脑。选择目标系统时看目标电脑，不能用控制电脑的系统代替。

本清单由本机 Agent 带着执行，详细分工见[远端工作流](remote-workflow.md)。Agent 先发现、检查、准备命令；用户只需确认目标，并完成必须在目标端进行的首次开启、指纹核对或登录。**Windows 和 Mac 各有一台真实目标通过 SSH 核验、授权、重连和撤销；Windows 复用 OpenClaw 完成任务，Mac 完成用户级新装并获使用者验证确认。** 具体范围见[支持矩阵](support-matrix.md)。 本机示例测试通过、端口可达、SSH 登录成功、Agent 可用是四件不同的事，分别记录证据。

## 先选连接方式

| 当前情况 | 走哪条路线 | 第 0 步完成条件 |
|---|---|---|
| 已在目标电脑操作 | 本机执行，无需 SSH | 核对系统、用户名、电脑名和本次工作目录 |
| 另一台 Windows，想从当前电脑操作 | Windows OpenSSH Server + SSH 客户端 | 核对指纹，登录并确认远端身份 |
| 另一台 Mac，想从当前电脑操作 | Mac“远程登录”+ SSH 客户端 | 仅授权所选账户，核对指纹并确认远端身份 |
| 另一台电脑，但暂不启用远程接入 | 在目标电脑打开 Codex/已有工具并安装 Skill | 核对目标身份后按本机路线继续 |

- [ ] 确认你有权访问目标电脑，并明确本次操作范围；首次开启远程服务通常需要到目标机操作。
- [ ] 两台电脑已联网，目标电脑保持开机、联网且未睡眠。同一 Wi-Fi 只是起点，访客网络或客户端隔离仍可能阻止互访。
- [ ] Agent 先读取本机已有局域网候选，你确认目标；没有候选或无法辨认时，才按下面分支在目标查看 IPv4、电脑名及账户。信息只留私有记录，不提交到 GitHub。
- [ ] 密码由用户在 SSH 提示中自行输入；不把密码、私钥、订阅或 token 放进聊天、命令参数、简报或清单。

## 由本机 Agent 先做

- [ ] 自行核对控制端系统、`ssh -V` 及已有工具，不先要求用户提供 IP 和 sshd 状态。
- [ ] 从本 Skill 目录运行 `python -B scripts/discover_target.py discover`，展示候选，说明缓存可能为空或过期；不自动选择或全网扫描。
- [ ] 用户确认目标后，运行 helper 的 `probe --host TARGET_IPV4 --confirmed-target`（替换占位符）。只检查选定目标的 TCP 22 与 SSH 标识；没有开启才走 A/B 的必要步骤。
- [ ] 准备下方系统对应命令，说明哪些在控制端、哪些在目标端；已经做过的不重复做。

## 认不出目标时：只确认一个 IPv4

本机 Agent 先发现候选；列表没有电脑名、目标未出现或用户认不出时，再做这一环。缓存为空不表示目标不存在。

| 谁来做 | 做什么 | 为什么 |
|---|---|---|
| 用户，在目标 Windows 上 | 优先双击连接小助手；不便使用时打开设置 → 网络和 Internet → Wi-Fi → 当前网络属性，找到 IPv4；若走网线则查看以太网属性 | 指定要连接的是哪一台，避免把路由器、手机或控制端当作目标 |
| 用户，在目标 Mac 上 | 优先双击 Mac 连接小助手；不便使用时到系统设置 → Wi-Fi → 详细信息 → TCP/IP 找到 IPv4 | 指定要操作的 Mac，不要求新手输入终端命令 |
| 用户 | 只回复目标 IPv4，或小助手展示的最少连接信息，并确认这是打算安装助手的电脑 | 不需要密码、完整 ipconfig、网卡 MAC、订阅或截图中的其他信息 |
| 本机 Agent | 校验地址是四段数字，每段 0–255；与观察到的局域网核对，必要时让用户确认笔误 | 不能猜一个“看起来像”的地址后连接 |
| 本机 Agent | 单独理解 `/24` 等 CIDR 后缀，SSH 使用确认后的纯地址 | `/24` 表示网络前缀，不是账号、密码或 SSH 端口 |
| 双方 | 目标确认后才做单目标 SSH 检查；之后仍核对指纹、账户和电脑身份 | 地址正确不等于已经验证主机身份 |

- [ ] 已向用户解释：地址只用于选择目标，只留本机私有接续记录，不进入 GitHub 或公共清单。
- [ ] 已校验输入；有越界数字、缺段或含糊之处时先核对，不自动纠正后连接。
- [ ] 用户已明确确认目标；才进入后面的 SSH 步骤。

示例说明可以使用 `203.0.113.25/24` 这样的文档专用地址，实际不连接示例地址。不要在公共教程放入用户真实地址。

## A. 目标是 Windows

### 默认路线：双击连接小助手

- [ ] 本机 Agent 提供经审阅的小助手包；拷到目标电脑后解压，双击 **Dahao-Connect.exe**。
- [ ] 用户核对电脑名，勾选“这是目标电脑”，点击“复制连接信息”或保存文本，再交回本次 Agent。
- [ ] Agent 读取必要信息、核对主机校验码，再继续认证与安装。只读程序不自动授予远程访问，不修改系统。
- [ ] 只有 PIN 时，改用 Agent 准备的独立临时授权小助手；先看账户、来源、期限与命令执行范围，再点击同意。PIN/密码始终不发给 Agent。
- [ ] 程序被安全保护拦截、公钥不存在或无读取权限时，先交回状态；不关闭保护、不跳过核验。

[三步图文式说明与安全边界](windows-connect.md)。校验码就是后文的主机公钥指纹，用户不用手工运行命令。以下技术步骤仅供 Agent/熟悉系统的操作者处理缺口；已有 SSH 直接复用。

<details>
<summary>展开给协助者的技术步骤</summary>

- [ ] 在目标机确认 Windows 版本与实际账户。打开 PowerShell，分别执行：

```powershell
hostname
whoami
Get-Service sshd -ErrorAction SilentlyContinue
```

`Running` 表示服务在运行，`Stopped` 表示已安装但未启动；没有输出只说明未查到该服务，需要继续核对可选功能。`whoami` 对本地账户通常显示“电脑名\账户名”；连接时使用实际账户名，不能只填显示昵称。公司域账户使用组织给定的登录格式。

- [ ] 在目标机的“设置 → 网络和 Internet → Wi-Fi → 当前网络/硬件属性”查看 IPv4 地址；也可运行 `ipconfig`，只记正在使用的无线网卡 IPv4。
- [ ] 若缺少服务端，在目标机以管理员打开 PowerShell，先检查再按需安装 Windows 自带的可选功能。以下两条分开执行，只有状态是 `NotPresent` 才安装：

```powershell
Get-WindowsCapability -Online -Name OpenSSH.Server~~~~0.0.1.0
Add-WindowsCapability -Online -Name OpenSSH.Server~~~~0.0.1.0
```

- [ ] 在已经授权开启 SSH 的目标机上启动服务并验证。本次临时连接不必设置开机自启：

```powershell
Start-Service sshd
Get-Service sshd
Get-NetTCPConnection -State Listen -LocalPort 22
```

- [ ] 核对 Windows 防火墙的 `OpenSSH-Server-In-TCP` 入站规则允许 TCP 22；官方安装通常会创建此规则。可在 `wf.msc` 的“入站规则 → 对应 OpenSSH 规则 → 属性 → 作用域”将远程地址限制为控制电脑的局域网 IP。修改已有规则前保留原设置、确认没有其他已授权使用者；不关闭整个防火墙，不配置公网端口映射。
- [ ] 在目标机查看主机**公钥**指纹，稍后与控制端首次连接提示比较；不读取或复制私钥：

```powershell
ssh-keygen -lf (Join-Path $env:ProgramData 'ssh/ssh_host_ed25519_key.pub')
```

这里的安装、启动服务和防火墙调整是由用户按目标授权执行的系统变更，本次检查没有替用户执行。Windows 自带 OpenSSH 的安装与登录步骤见 [Microsoft 官方文档](https://learn.microsoft.com/zh-cn/windows-server/administration/openssh/openssh_install_firstuse)。

</details>

## B. 目标是 Mac

- [ ] Agent 提供[Mac 双击连接小助手](mac-helper.md)。目标用户在 Mac 解压 ZIP，双击 `Dahao-Connect.app`，确认电脑后复制信息；不索要密码或私钥。
- [ ] 仅在服务未开放时，由目标用户按小助手“设置步骤”进入“系统设置 → 通用 → 共享 → 远程登录”，在具体授权后开启并选“仅这些用户”。不需要屏幕共享、远程管理或磁盘完全访问。
- [ ] Agent 比对目标本机提供的 ED25519 校验码与网络公钥。公钥读取或来源有疑问就先处理，不跳过主机核验。
- [ ] 需要新授权时，按[专用授权流程](mac-helper.md)准备本次私人包。用户核对目标、来源、账户级命令权限和 60 分钟期限后明确点击；私钥只留帮助者电脑。
- [ ] 实际登录核对账户、系统与架构，退出后重连。完工撤销本次条目，验证新的登录被拒绝，再清理本次私钥。

小助手不自动开启 SSH。macOS 拦截时只反馈状态，不关闭安全保护。系统路径参考 [Apple 远程登录说明](https://support.apple.com/zh-cn/guide/mac-help/mchlp1066/mac)；实际系统界面有变化时以目标显示为准。

## C. 本机 Agent 引导连接（适用于两种目标系统）

地址已有发现结果时复用，不让用户重新输入。以下交互命令供需要用户自行认证的终端使用；能复用已核验的授权会话时由 Agent 继续。用户手动登录一次，不自动代表 Agent 已有免交互访问。

- [ ] 在控制电脑的 PowerShell（Windows）或终端（Mac）执行 `ssh -V`。Windows 若未安装客户端，按 Microsoft 官方文档添加 OpenSSH Client；Mac 使用系统自带客户端。
- [ ] 如果控制电脑是 Windows，可先单独测试目标 TCP 22；按提示输入**目标电脑**的局域网 IP：

```powershell
$targetIp = Read-Host '目标电脑的局域网 IPv4'
Test-NetConnection -ComputerName $targetIp -Port 22
```

`TcpTestSucceeded : True` 只证明该端口可达，尚未证明是正确的 SSH 主机或账户。失败先核对 IP、服务、睡眠、防火墙作用域与 Wi-Fi 隔离；ping 不通也不能单独判定 SSH 不可用。

- [ ] 在 Windows 控制端连接所选目标，账户名在本机输入：

```powershell
$targetUser = Read-Host '目标电脑账户名'
ssh -o PermitLocalCommand=no -o ProxyCommand=none -o ProxyJump=none -o ConnectTimeout=8 -o StrictHostKeyChecking=ask -o ForwardAgent=no -o ClearAllForwardings=yes -l $targetUser $targetIp
```

- [ ] 在 Mac 控制端，将下面两个占位符替换为目标账户与局域网地址，再在终端执行；这是连接命令，也会报告端口连接失败：

```sh
ssh -o PermitLocalCommand=no -o ProxyCommand=none -o ProxyJump=none -o ConnectTimeout=8 -o StrictHostKeyChecking=ask -o ForwardAgent=no -o ClearAllForwardings=yes -l TARGET_USER TARGET_IP
```

- [ ] 首次连接只在指纹与目标机对应 `.pub` 公钥的指纹一致后接受。若提示已保存的主机密钥变化，先到目标机核对原因，不删除记录或关闭检查来绕过。[OpenSSH 主机身份核验说明](https://man.openbsd.org/ssh.1#VERIFYING_HOST_KEYS)
- [ ] 用户在自己的终端输入目标账户密码，或使用已经授权的密钥认证。密码输入时没有字符回显属于正常现象；不为试连批量尝试账户或密码。
- [ ] 登录后分别运行 `hostname`、`whoami`；Windows 再运行 `cmd /c ver`，Mac 再运行 `sw_vers`。与目标机本地显示核对一致后输入 `exit`。

SSH 默认是命令行连接，不是远程桌面。首次连接可能将已核对的主机公钥写入控制电脑的 `known_hosts`；无需上传任何私钥，也不默认开启代理转发或端口转发。

## D. 如何判定完成与接续

- [ ] 地址与目标已确认。
- [ ] 端口连接正常，SSH 握手无错误。
- [ ] 主机指纹已经核对。
- [ ] 认证成功，远端电脑名、账户和系统一致；退出后可重新登录。
- [ ] 在本机私有记录中留下目标代号、连接方法、已核验项、未完成项和下次检查动作；公共清单只记录代号和状态。
- [ ] 只有以上项都完成，才人工勾选主清单“00 连接目标电脑”，继续依赖环境。即使手动 SSH 已成功，也不能把搭好的远端执行器、Agent 安装或 Skill 加载写成已验证。
- [ ] 临时接入结束后，由目标所有者决定是否保留。只关闭本次新开启且不再需要的接入：Windows 可 `Stop-Service sshd`，Mac 可关闭“远程登录”；保留或恢复已有使用者的原设置。

## 失败时先看哪一层

| 现象 | 下一步 |
|---|---|
| 端口超时 | 核对目标 IP、在线状态、防火墙范围、访客网络/设备隔离 |
| Connection refused | 核对目标 SSH 服务是否运行、是否监听所用端口 |
| Permission denied | 核对账户名、账户是否允许 SSH、所用认证方式；密码只在本机输入 |
| 主机指纹不一致 | 暂停，到目标机直接核对；不使用 `StrictHostKeyChecking=no` |
| 已登录但电脑名不对 | 退出，重新确认目标地址，暂不运行安装命令 |

官方入口核对：2026-10-12；实机结果更新：2026-10-13。Windows 与 Mac 验证范围分别见[支持矩阵](support-matrix.md)。以上技术命令供帮助者处理缺口，接受帮助的人默认走双击小助手。
