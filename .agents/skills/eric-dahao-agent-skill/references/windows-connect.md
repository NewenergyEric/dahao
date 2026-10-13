# 不用命令行，先把目标电脑认对

[回到安装清单](installation-checklist.md#0-发现并连接目标电脑) · [完整连接清单](connection-checklist.md)

请本机 Agent 交付已审阅的 **dahao-connect-windows.zip**，用 U 盘或你信任的文件传输方式带到目标 Windows。下载后先解压，再打开其中的 **Dahao-Connect.exe**。

- [ ] 在准备安装 AI 助手的那台电脑双击打开小助手。
- [ ] 看一眼电脑名称，勾选“这是准备安装 AI 助手的目标电脑”。
- [ ] 点击“复制连接信息”，仅粘贴给本次协助你的 Agent；也可保存为文本带回。
- [ ] Agent 比对安全校验码，确认身份后继续登录、检查环境和安装；没有证据的步骤仍待完成。

| 界面信息 | 为什么需要 |
|---|---|
| 电脑名、Wi-Fi IPv4 | 确定要操作的电脑，避免选错设备 |
| 登录账户 | 找到正确的登录对象；显示昵称未必是账户名 |
| SSH 服务状态 | 判断是否已有接入条件，避免重复安装或修改 |
| 安全校验码 | 由本机公钥计算，供 Agent 与连接端比较；不是密码 |

地址和账户虽不是密码，也只交给本次协助者；不放 GitHub、公开群或截图。小助手离线运行、不自动上传，先展示全部待分享内容。没有找到 Wi-Fi、公钥或读取权限时，只把显示的状态交回，不需要猜测，也不跳过身份核验。

**安全边界：**这个版本只检查，不安装软件、开启 SSH、更改防火墙、读取私钥或授予远程访问。复制按钮只在用户点击时写入剪贴板，保存只写用户选择的文本路径，关闭后退出。默认无需管理员权限。

**如果 Windows 拦截：**这是未签名预览程序。先停止并把拦截状态告知协助者；不要关闭 Defender、SmartScreen、Smart App Control 或修改执行策略。后续新手分发需要可信代码签名及目标设备验证，当前不能保证所有电脑都可直接打开。[Microsoft 说明](https://learn.microsoft.com/en-us/windows/apps/package-and-deploy/smartscreen-reputation)

当前只提供 Windows 小助手；Mac 仍使用[系统设置的连接路线](connection-checklist.md#b-目标是-mac)，尚无双击 App。本次 Windows 目标已完成打开、复制连接信息、管理员补读公钥和指纹核对；未覆盖所有 Windows 版本或组织策略。

维护者参考：[小助手源码与构建说明](windows-helper.md)、[构建工具](../scripts/build_windows_connect.py)。只使用已安装的 Windows .NET Framework，不下载第三方依赖；源码纳入逐项发布审查，程序制品附 SHA256，经私有交付渠道传递。


## 公钥没有读取权限 / 只有 PIN 怎么办

- [ ] 只读小助手提示无权读取公钥时，由 Agent 解释原因；可在目标右键小助手“以管理员身份运行”，只补读校验码，保留原普通窗口确认的登录账户。仍不改系统。
- [ ] 只有 PIN 时不把 PIN 当成 SSH 密码，也不要求找回、关闭或修改密码。由 Agent 准备本次专用临时授权包。
- [ ] 用户在目标打开授权界面，核对目标、控制电脑、执行权限、60 分钟期限和撤销方式，再勾选并点击；Windows 请求管理员确认时由用户完成。
- [ ] 新增权限仅限本次公钥、来源电脑与目标账户，禁用转发；它允许执行命令，并非沙箱。管理员账户权限较高，先理解范围。
- [ ] Agent 实测限制与登录成功后再安装。到期拒绝新登录，已开始的命令可能继续；完工后由 Agent 按约定只撤销本次条目，或点击“撤销本次授权”，再次验证登录被拒绝并清理本次私钥；原有 SSH 保留。

临时授权程序只适配本次已确认的 Windows 本地管理员账户、已有 SSH 与默认授权路径。缺少权限、公司策略或不匹配配置时先说明缺口，不扩大权限来绕过。用户尚未点击前，只能标记“授权待确认”。本次已完成目标端点击授权、真实登录、独立任务和撤销后的拒绝测试；这不意味着全新 Agent 安装或所有安全配置已验收。[Microsoft 公钥登录说明](https://learn.microsoft.com/en-us/windows-server/administration/openssh/openssh_keymanagement) · [OpenSSH 授权选项](https://man.openbsd.org/sshd.8#AUTHORIZED_KEYS_FILE_FORMAT)
