/* MIT. Offline, read-only macOS handoff helper. No remote authorization here. */
var TITLE = '搭好 · Mac 连接小助手';
var COMMANDS = {
    platform: '/usr/bin/uname -s',
    computer: '/usr/sbin/scutil --get ComputerName',
    user: '/usr/bin/id -un',
    version: '/usr/bin/sw_vers -productVersion',
    architecture: '/usr/bin/uname -m',
    wifi: "LC_ALL=C /usr/sbin/networksetup -listallhardwareports | /usr/bin/awk '/Hardware Port: (Wi-Fi|AirPort)/ {getline; if ($1 == \"Device:\") print $2}'",
    port: 'if /usr/bin/nc -z -G 2 -w 2 127.0.0.1 22 >/dev/null 2>&1; then /bin/echo open; else /bin/echo closed; fi',
    fingerprint: "if [ -L /etc/ssh/ssh_host_ed25519_key.pub ]; then /bin/echo unsafe_link; elif [ ! -e /etc/ssh/ssh_host_ed25519_key.pub ]; then /bin/echo absent_or_inaccessible; elif [ ! -f /etc/ssh/ssh_host_ed25519_key.pub ]; then /bin/echo not_regular; elif [ ! -r /etc/ssh/ssh_host_ed25519_key.pub ]; then /bin/echo unreadable; else /usr/bin/ssh-keygen -E sha256 -lf /etc/ssh/ssh_host_ed25519_key.pub 2>/dev/null | /usr/bin/awk '{print $1, $2, $NF}'; fi",
    loopback: "LC_ALL=C /usr/bin/ssh-keyscan -4 -T 3 -t ed25519 127.0.0.1 2>/dev/null | LC_ALL=C /usr/bin/ssh-keygen -E sha256 -lf - 2>/dev/null | /usr/bin/awk '{print $1, $2, $NF}'",
    settings: '/usr/bin/open -b com.apple.systempreferences'
};

function plain(value, limit) {
    return String(value).replace(/[\x00-\x1f\x7f\u2028\u2029\u202a-\u202e\u2066-\u2069]/g, ' ').trim().slice(0, limit || 140);
}

function read(app, command, fallback) {
    try { return plain(app.doShellScript(command)) || fallback; }
    catch (ignored) { return fallback; }
}

function isIPv4(value) {
    var parts = value.split('.');
    if (parts.length !== 4) return false;
    for (var i = 0; i < parts.length; i++) {
        if (!/^(0|[1-9][0-9]{0,2})$/.test(parts[i]) || Number(parts[i]) > 255) return false;
    }
    return value !== '0.0.0.0' && value.indexOf('127.') !== 0;
}

function parseFingerprint(output) {
    var match = plain(output, 512).match(/^256\s+(SHA256:[A-Za-z0-9+/]{43}=?)\s+(?:.*\s)?\(ED25519\)$/);
    return match ? match[1] : '';
}

function fingerprintInfo(app, portOpen) {
    var output = read(app, COMMANDS.fingerprint, 'read_failed');
    var code = parseFingerprint(output);
    var states = {
        unsafe_link: '公钥路径是链接，已停止读取',
        not_regular: '公钥路径不是普通文件，已停止读取',
        absent_or_inaccessible: '默认公钥文件不存在或路径不可访问',
        unreadable: '默认公钥文件存在，当前账户无读取权限',
        read_failed: '默认公钥读取失败'
    };
    var status = code ? '已读取默认公钥文件' : (states[output] || '默认公钥未返回可识别的 ED25519 校验码');
    if (code) return {fingerprint: code, source: 'Mac 默认主机公钥文件', fileStatus: status};
    // A suspicious path is not an excuse to hide the anomaly behind another route.
    if (portOpen && output !== 'unsafe_link' && output !== 'not_regular') {
        code = parseFingerprint(read(app, COMMANDS.loopback, ''));
        if (code) return {fingerprint: code, source: 'Mac 本机 SSH 服务（仅回环地址，无需管理员）', fileStatus: status};
    }
    return {fingerprint: '未取得；请把读取状态交给帮助者', source: '未取得', fileStatus: status};
}

function collect(app) {
    if (read(app, COMMANDS.platform, '') !== 'Darwin') throw new Error('unsupported_platform');
    var interfaces = read(app, COMMANDS.wifi, '').split(/\s+/);
    var addresses = [];
    for (var i = 0; i < interfaces.length && i < 8; i++) {
        // The only variable shell argument is an exact, validated interface identifier.
        if (!/^en[0-9]{1,3}$/.test(interfaces[i])) continue;
        var address = read(app, '/usr/sbin/ipconfig getifaddr ' + interfaces[i], '');
        if (isIPv4(address) && addresses.indexOf(address) < 0) addresses.push(address);
    }
    var portOpen = read(app, COMMANDS.port, 'closed') === 'open';
    var keyInfo = fingerprintInfo(app, portOpen);
    return {
        computer: read(app, COMMANDS.computer, '未能读取'),
        user: read(app, COMMANDS.user, '未能读取'),
        version: read(app, COMMANDS.version, '未能读取'),
        architecture: read(app, COMMANDS.architecture, '未能读取'),
        wifi: addresses.length ? addresses.join(' / ') : '未读到 Wi-Fi IPv4，请在系统设置中查看',
        portOpen: portOpen,
        fingerprint: keyInfo.fingerprint,
        fingerprintSource: keyInfo.source,
        publicKeyFileStatus: keyInfo.fileStatus
    };
}

function report(info) {
    return [
        '搭好连接信息 v1.1 · Mac · 用户已确认这是目标电脑',
        '电脑名称：' + info.computer,
        '登录账户：' + info.user,
        'macOS 版本：' + info.version,
        '运行架构：' + info.architecture,
        'Wi-Fi IPv4：' + info.wifi,
        '本机 22 端口：' + (info.portOpen ? '开放（仅端口检查，尚未认证）' : '未开放（请检查远程登录）'),
        '安全校验码（ED25519 公钥 SHA256）：' + info.fingerprint,
        '校验码来源：' + info.fingerprintSource,
        '默认公钥读取状态：' + info.publicKeyFileStatus,
        '读取时间：' + new Date().toISOString(),
        '请仅交给本次帮助者。此工具未开启 SSH、未授予访问、未登录或安装。'
    ].join('\n');
}

function dialog(app, message, buttons, preferred) {
    var options = {
        withTitle: TITLE, buttons: buttons, defaultButton: preferred,
        withIcon: 'note'
    };
    if (buttons[0] === '取消' || buttons[0] === '关闭') options.cancelButton = buttons[0];
    return app.displayDialog(message, options).buttonReturned;
}

function runWithApp(app) {
    app.includeStandardAdditions = true;
    try {
        var first = dialog(app,
            '先确认：你正在要接受帮助的那台 Mac 上。\n\n这个小助手只读取电脑名、账户、系统版本、Wi-Fi 地址、端口状态和 SSH 公钥校验码。必要时连接 Mac 自己的 SSH 服务读取公开校验码，不登录、不向外连接。\n\n不读密码、私钥或个人文件，不上传信息，不自动开放远程访问。你选择复制后，连接信息才会进入剪贴板。',
            ['取消', '这是目标电脑'], '取消');
        if (first !== '这是目标电脑') return;
        while (true) {
            var info = collect(app);
            var text = report(info);
            var action = dialog(app, text + '\n\n需要开启远程登录时，点“设置步骤”。',
                ['关闭', '设置步骤', '复制信息'], '复制信息');
            if (action === '复制信息') {
                var consent = dialog(app,
                    '将复制上面这段连接信息，并覆盖当前剪贴板。只粘贴给这次帮助你的人，不发群聊或公开页面。\n\n本工具不会读取原剪贴板，也不会发送信息。',
                    ['返回', '确认复制'], '确认复制');
                if (consent !== '确认复制') continue;
                app.setTheClipboardTo(text);
                app.displayDialog('已复制。把这段文字交给帮助者即可。\n\n现在只完成了信息交接，还没有授予远程控制权限。', {
                    withTitle: TITLE, buttons: ['完成'], defaultButton: '完成'
                });
                return;
            }
            if (action === '设置步骤') {
                var next = dialog(app,
                    '这一步要由你在 Mac 的系统设置中完成：\n\n1. 通用 → 共享 → 远程登录。\n2. 允许访问选择“仅这些用户”，只保留本次要用的账户。\n3. 开启“远程登录”。普通协助先不要开启“远程用户对磁盘的完全访问”。\n\n开启后，允许的账户可通过 SSH 登录并执行命令。这里只打开设置，不自动改开关；登录密码只在系统窗口里输入。\n\n本次新开启的远程登录，用完可在同一位置关闭；原本就在使用的设置先保留。',
                    ['返回', '打开系统设置'], '返回');
                if (next === '打开系统设置') {
                    try { app.doShellScript(COMMANDS.settings); }
                    catch (ignored) {
                        app.displayDialog('请手动打开“系统设置 → 通用 → 共享”。', {
                            withTitle: TITLE, buttons: ['知道了'], defaultButton: '知道了'
                        });
                    }
                    dialog(app, '请按刚才的步骤在系统设置里检查远程登录。\n\n完成后回到这里，点“重新检查”；不想开放时可以关闭小助手。',
                        ['关闭', '重新检查'], '重新检查');
                }
                continue;
            }
            return;
        }
    } catch (error) {
        // A native Cancel/Escape is not an authorization, error, or reason to continue.
        if (Number(error.errorNumber) === -128 || Number(error.number) === -128 || /(-128|User canceled|用户取消)/i.test(String(error.message))) return;
        try {
            app.displayDialog('小助手未完成读取或复制。请只告诉帮助者“Mac 小助手未完成”，不要发送密码或完整系统日志。', {
                withTitle: TITLE, buttons: ['关闭'], defaultButton: '关闭'
            });
        } catch (ignored) {}
    }
}

// macOS osascript invokes the run handler. Node uses exports only for offline tests.
function run() { runWithApp(Application.currentApplication()); }
if (typeof module !== 'undefined') {
    module.exports = {runWithApp: runWithApp, collect: collect, report: report, isIPv4: isIPv4, plain: plain, parseFingerprint: parseFingerprint, fingerprintInfo: fingerprintInfo, commands: COMMANDS};
}
