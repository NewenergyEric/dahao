/* MIT. Private per-session request is packaged separately from this generic UI. */
var TITLE = '搭好 · Mac 临时接入';
var REQUEST_SHA256 = '__REQUEST_SHA256__';

function quote(value) {
    var s = String(value);
    if (/[\x00-\x1f\x7f]/.test(s)) throw new Error('UNSAFE_PATH');
    return "'" + s.replace(/'/g, "'\\''") + "'";
}
function invoke(app, resources, mode) {
    if (['inspect', 'grant', 'revoke'].indexOf(mode) < 0) throw new Error('MODE');
    if (!/^[a-f0-9]{64}$/.test(REQUEST_SHA256)) throw new Error('PACKAGE');
    var command = '/usr/bin/env -i PATH=/usr/bin:/bin:/usr/sbin:/sbin /usr/bin/perl -f ' +
        quote(resources + '/authorize.pl') + ' ' + mode + ' ' + quote(resources + '/request.json') + ' ' + REQUEST_SHA256;
    var raw = app.doShellScript(command);
    if (raw.length > 4096) throw new Error('RESPONSE_SIZE');
    var result = JSON.parse(raw);
    if (!result || typeof result.status !== 'string') throw new Error('RESPONSE');
    return result;
}
function dialog(app, message, buttons, defaultButton, cancelButton) {
    return app.displayDialog(message, {withTitle: TITLE, buttons: buttons,
        defaultButton: defaultButton, cancelButton: cancelButton}).buttonReturned;
}
function blocked(app, result) {
    var code = /^[A-Z_]+$/.test(result.code || '') ? result.code : 'CHECK_FAILED';
    var why = {
        WRONG_ACCOUNT: '当前账户与本次目标不一致。',
        HOST_FINGERPRINT: '电脑身份与本次核对的身份不一致。',
        WRONG_IP: '这台电脑的网络地址变了，需要帮助者更新本次请求。',
        REQUEST_EXPIRED: '本次请求已过期，需要帮助者重新准备。',
        ACCESS_EXPIRED: '本次接入已到期，不会因重复点击延长。',
        ALREADY_USED: '本次接入已经撤销，旧包不能再次授权。',
        REMOVED_ACCESS: '本次授权已被移除，不会自动恢复。',
        WRITE_ACL: '现有文件权限需要人工核对，小助手不会替你修改权限。',
        UNSAFE_MODE: '现有文件权限需要人工核对，小助手不会替你修改权限。',
        BUSY: '相关文件正在被其他程序使用，请稍后再试。'
    };
    dialog(app, (why[code] || '安全检查未通过，已停止当前操作。') +
        '\n\n请只把这行状态交给帮助者：搭好 Mac 接入未完成 · ' + code +
        '\n不用发密码、密钥或其他文件。若此前已授权，可稍后再点撤销；60 分钟到期后会拒绝新登录。', ['关闭'], '关闭', '关闭');
}
function start(app, resources) {
    var info = invoke(app, resources, 'inspect');
    if (info.status === 'blocked') { blocked(app, info); return; }
    if (!/^[a-z_][a-z0-9_-]{0,31}$/.test(info.account || '') ||
        !/^[0-9.]{7,15}$/.test(info.controller || '') || !/^[0-9.]{7,15}$/.test(info.target || '')) throw new Error('IDENTITY');
    var action = dialog(app,
        '只给本次信任的帮助者使用。\n\n目标账户：' + info.account +
        '\n目标电脑地址：' + info.target + '\n帮助电脑地址：' + info.controller +
        '\n\n打开这个工具不会自动授权。你可以先看清权限，也可以撤销本次接入。',
        ['取消', '撤销本次接入', '查看授权'], '取消', '取消');
    if (action === '撤销本次接入') {
        var revoked = invoke(app, resources, 'revoke');
        if (revoked.status === 'blocked') { blocked(app, revoked); return; }
        if (revoked.status !== 'revoked' && revoked.status !== 'not_granted') throw new Error('REVOKE_STATUS');
        dialog(app, '本次接入已撤销或尚未创建。\n\n只移除这一次的授权；保留其他 SSH 授权和系统设置。已启动的命令不会因此自动结束。\n\n请回复：Mac 本次接入已撤销。', ['关闭'], '关闭', '关闭');
        return;
    }
    if (action !== '查看授权') return;
    var consent = dialog(app,
        '允许帮助电脑以「' + info.account + '」账户执行命令，检查环境、安装和验证 OpenClaw。\n\n' +
        '这会新增一条临时 SSH 公钥授权。帮助者能操作该账户可以访问的文件；这不是隔离沙箱。小助手不申请管理员、完整磁盘访问或关闭系统保护。\n\n' +
        '从首次允许起 60 分钟，只接受上面的帮助电脑，禁用 SSH 转发。到期拒绝新登录，已启动的命令可能继续。重复点击不会延时。\n\n' +
        '随时重新打开这个工具，点“撤销本次接入”。本包只含公钥请求，不含密码、私钥或 token；请勿公开转发。',
        ['取消', '允许本次接入'], '取消', '取消');
    if (consent !== '允许本次接入') return;
    var result = invoke(app, resources, 'grant');
    if (result.status === 'blocked') { blocked(app, result); return; }
    if (result.status !== 'granted') throw new Error('GRANT_STATUS');
    dialog(app, '临时授权已创建（剩余约 ' + Number(result.minutes) + ' 分钟）。\n\n' +
        '请只回复帮助者：Mac 临时授权已创建。\n不用发送密码、PIN 或其他文件。\n\n' +
        '帮助者还需要验证能否登录。测试完成后会收回这次权限；你也可以重新打开本工具并点击撤销。', ['完成'], '完成', '完成');
}
function run(argv) {
    var app = Application.currentApplication();
    app.includeStandardAdditions = true;
    try {
        if (argv.length !== 1 || argv[0].charAt(0) !== '/') throw new Error('PACKAGE_PATH');
        start(app, argv[0]);
    } catch (err) {
        if (err && err.errorNumber === -128) return;
        try { blocked(app, {code:'RUNTIME_OR_PACKAGE'}); } catch (ignored) {}
    }
}
if (typeof module !== 'undefined') module.exports = {quote:quote, invoke:invoke, start:start, setHash:function(h){REQUEST_SHA256=h;}};
