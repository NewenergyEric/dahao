'use strict';
const assert = require('node:assert/strict');
const helper = require(process.argv[2]);
let tests = 0;
function test(name, fn) { fn(); tests++; process.stdout.write('PASS ' + name + '\n'); }
const fingerprint = 'SHA256:' + 'A'.repeat(43);
function fake(choices, options = {}) {
    const commands = [], dialogs = [], clipboard = [];
    const app = {
        doShellScript(command) {
            commands.push(command);
            if (command === helper.commands.platform) return 'Darwin';
            if (command === helper.commands.wifi) return options.interfaces || 'en0';
            if (command === '/usr/sbin/ipconfig getifaddr en0') return '203.0.113.20';
            if (command === helper.commands.computer) return options.computer || 'SYNTHETIC-MAC';
            if (command === helper.commands.user) return 'sample';
            if (command === helper.commands.version) return '26.0';
            if (command === helper.commands.architecture) return 'arm64';
            if (command === helper.commands.fingerprint) {
                if (options.keyError) throw new Error('SYNTHETIC ERROR NEVER DISPLAY');
                return options.keyOutput || '256 ' + fingerprint + ' sample (ED25519)';
            }
            if (command === helper.commands.loopback) {
                if (options.loopbackError) throw new Error('SYNTHETIC LOCAL HANDSHAKE ERROR');
                return '256 ' + fingerprint + ' (ED25519)';
            }
            if (command === helper.commands.port) return options.closed ? 'closed' : 'open';
            if (command === helper.commands.settings) return '';
            throw new Error('unexpected_command');
        },
        displayDialog(message, opts) {
            dialogs.push({message, opts});
            const choice = choices.shift();
            assert.ok(choice, 'Unexpected extra dialog');
            assert.ok(opts.buttons.includes(choice), 'Unknown button: ' + choice);
            if (opts.cancelButton === choice) throw Object.assign(new Error('User canceled'), {errorNumber: -128});
            return {buttonReturned: choice};
        },
        setTheClipboardTo(value) { clipboard.push(value); }
    };
    return {app, commands, dialogs, clipboard, choices};
}

test('cancel before confirmation performs no inspection or copy', () => {
    const f = fake(['取消']); helper.runWithApp(f.app);
    assert.equal(f.commands.length, 0); assert.equal(f.clipboard.length, 0);
});
test('closing after inspection never copies or opens settings', () => {
    const f = fake(['这是目标电脑', '关闭']); helper.runWithApp(f.app);
    assert.equal(f.clipboard.length, 0); assert.ok(!f.commands.includes(helper.commands.settings));
});
test('explicit copy includes only selected metadata and valid public fingerprint', () => {
    const f = fake(['这是目标电脑', '复制信息', '确认复制', '完成']); helper.runWithApp(f.app);
    assert.equal(f.clipboard.length, 1); assert.ok(f.clipboard[0].includes(fingerprint));
    assert.ok(f.clipboard[0].includes('尚未认证')); assert.ok(f.clipboard[0].includes('未授予访问'));
    assert.ok(!f.commands.includes(helper.commands.settings)); assert.equal(f.choices.length, 0);
});
test('return from copy confirmation does not touch clipboard', () => {
    const f = fake(['这是目标电脑', '复制信息', '返回', '关闭']); helper.runWithApp(f.app);
    assert.equal(f.clipboard.length, 0); assert.equal(f.choices.length, 0);
});
test('settings open only after explicit choice and do not change services', () => {
    const f = fake(['这是目标电脑', '设置步骤', '打开系统设置', '重新检查', '关闭'], {closed: true});
    helper.runWithApp(f.app);
    assert.equal(f.commands.filter(x => x === helper.commands.settings).length, 1);
    assert.equal(f.clipboard.length, 0);
    assert.ok(f.dialogs.some(x => x.message.includes('仅这些用户')));
    assert.ok(f.dialogs.some(x => x.message.includes('完全访问')));
    assert.ok(!f.commands.some(x => /sudo|launchctl|systemsetup|authorized_keys|chmod|security |curl|wget/.test(x)));
});
test('return from settings does not launch settings', () => {
    const f = fake(['这是目标电脑', '设置步骤', '返回', '关闭']); helper.runWithApp(f.app);
    assert.ok(!f.commands.includes(helper.commands.settings)); assert.equal(f.choices.length, 0);
});
test('unreadable public file uses local public handshake without elevation', () => {
    const f = fake(['这是目标电脑', '复制信息', '确认复制', '完成'], {keyOutput: 'unreadable'});
    helper.runWithApp(f.app);
    assert.ok(f.clipboard[0].includes('无读取权限')); assert.ok(!f.clipboard[0].includes('SYNTHETIC ERROR'));
    assert.ok(f.clipboard[0].includes(fingerprint)); assert.ok(f.clipboard[0].includes('本机 SSH 服务'));
    assert.equal(f.commands.filter(x => x === helper.commands.loopback).length, 1);
});
test('untrusted interface output cannot turn into shell arguments', () => {
    const f = fake([], {interfaces: 'en0;bad en1$(bad) en9999 bad en0'});
    helper.collect(f.app);
    assert.deepEqual(f.commands.filter(x => x.startsWith('/usr/sbin/ipconfig')), ['/usr/sbin/ipconfig getifaddr en0']);
});
test('computer name is data and never executed or split into extra report lines', () => {
    const f = fake(['这是目标电脑', '复制信息', '确认复制', '完成'], {computer: 'sample$(bad)\nforged\u202e'});
    helper.runWithApp(f.app);
    assert.ok(!f.commands.some(x => x.includes('$(bad)')));
    assert.ok(!f.clipboard[0].includes('\nforged')); assert.ok(!f.clipboard[0].includes('\u202e'));
});
test('invalid or loopback IPv4 is rejected', () => {
    for (const value of ['192.268.0.1', '127.0.0.1', '0.0.0.0', '1.2.3', '1.2.3.4;bad', '01.2.3.4']) assert.equal(helper.isIPv4(value), false);
    assert.equal(helper.isIPv4('203.0.113.20'), true);
});
test('public key command never addresses a private key or asks for admin privileges', () => {
    assert.ok(helper.commands.fingerprint.includes('-lf /etc/ssh/ssh_host_ed25519_key.pub'));
    assert.ok(helper.commands.fingerprint.includes('-L'));
    assert.ok(!helper.commands.fingerprint.includes('sudo'));
});
test('port check precedes fingerprint reading after first enablement', () => {
    const f = fake([]); helper.collect(f.app);
    assert.ok(f.commands.indexOf(helper.commands.port) < f.commands.indexOf(helper.commands.fingerprint));
});
test('missing public file can use the independent local endpoint', () => {
    const f = fake([], {keyOutput: 'absent_or_inaccessible'}); const info = helper.collect(f.app);
    assert.equal(info.fingerprint, fingerprint); assert.ok(info.publicKeyFileStatus.includes('不存在'));
});
test('suspect public file link or nonregular file stops without fallback', () => {
    for (const keyOutput of ['unsafe_link', 'not_regular']) {
        const f = fake([], {keyOutput}); const info = helper.collect(f.app);
        assert.ok(info.fingerprint.includes('未取得')); assert.ok(!f.commands.includes(helper.commands.loopback));
    }
});
test('closed service with absent key does not retry a local handshake', () => {
    const f = fake([], {closed: true, keyOutput: 'absent_or_inaccessible'}); helper.collect(f.app);
    assert.ok(!f.commands.includes(helper.commands.loopback));
});
test('failed local handshake exposes only a useful status', () => {
    const f = fake(['这是目标电脑', '复制信息', '确认复制', '完成'], {keyError: true, loopbackError: true});
    helper.runWithApp(f.app);
    assert.ok(f.clipboard[0].includes('未取得'));
    assert.ok(!f.clipboard[0].includes('SYNTHETIC ERROR'));
    assert.ok(!f.clipboard[0].includes('SYNTHETIC LOCAL HANDSHAKE ERROR'));
});
test('parses comment-free ssh-keygen result and rejects malformed or different key type', () => {
    assert.equal(helper.parseFingerprint('256 ' + fingerprint + ' (ED25519)'), fingerprint);
    assert.equal(helper.parseFingerprint('256 ' + fingerprint + ' comment (ED25519)'), fingerprint);
    assert.equal(helper.parseFingerprint('256 ' + fingerprint + ' (ECDSA)'), '');
    assert.equal(helper.parseFingerprint('256 SHA256:short (ED25519)'), '');
});
test('public loopback read uses a fixed local endpoint and no authentication command', () => {
    assert.ok(helper.commands.loopback.includes('ssh-keyscan -4 -T 3 -t ed25519 127.0.0.1'));
    assert.ok(helper.commands.loopback.includes('ssh-keygen -E sha256 -lf -'));
    assert.ok(!/ssh |scp |sudo|curl|wget|cat /.test(helper.commands.loopback));
});
process.stdout.write(JSON.stringify({tests, status: 'passed', Mac_runtime: 'not_verified'}) + '\n');
