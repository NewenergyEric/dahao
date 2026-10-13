"""Build an offline Mac helper from exact reviewed files; never create SSH keys.

The optional request is private, public-key-only session metadata supplied by the
helping Agent after target verification. Generic builds cannot authorize access.
Python standard library only; building a ZIP does not execute it or contact a Mac.
"""
from __future__ import annotations
import argparse
import base64
import hashlib
import ipaddress
import json
import os
from pathlib import Path
import plistlib
import re
import stat
import zipfile

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'assets/mac-connect'
FIELDS = {'schema', 'request_id', 'target_account', 'target_ipv4', 'controller_ipv4',
          'host_fingerprint', 'public_key', 'created_epoch', 'accept_until_epoch', 'duration_seconds'}


def regular_bytes(path: Path, limit: int = 100_000) -> bytes:
    path = Path(path).absolute()
    for item in (path, *path.parents):
        if item.is_symlink() or (hasattr(item, 'is_junction') and item.is_junction()):
            raise ValueError('linked_path_rejected')
    info = path.stat()
    if not stat.S_ISREG(info.st_mode) or info.st_nlink != 1 or info.st_size > limit:
        raise ValueError('regular_bounded_file_required')
    with path.open('rb') as stream:
        opened = os.fstat(stream.fileno())
        if (opened.st_dev, opened.st_ino) != (info.st_dev, info.st_ino):
            raise ValueError('source_changed')
        data = stream.read(limit + 1)
    if len(data) > limit:
        raise ValueError('file_too_large')
    return data


def validate_request(data: bytes) -> dict:
    def unique(pairs):
        obj = {}
        for key, value in pairs:
            if key in obj:
                raise ValueError('duplicate_request_field')
            obj[key] = value
        return obj
    request = json.loads(data, object_pairs_hook=unique)
    if not isinstance(request, dict) or set(request) != FIELDS:
        raise ValueError('request_fields')
    for key in ('schema', 'created_epoch', 'accept_until_epoch', 'duration_seconds'):
        if type(request[key]) is not int:
            raise ValueError('request_integer')
    if request['schema'] != 1 or request['duration_seconds'] != 3600:
        raise ValueError('request_version_or_duration')
    patterns = {'request_id': r'[a-f0-9]{32}', 'target_account': r'[a-z_][a-z0-9_-]{0,31}',
                'host_fingerprint': r'SHA256:[A-Za-z0-9+/]{43}',
                'public_key': r'ssh-ed25519 [A-Za-z0-9+/]{68}'}
    for key, pattern in patterns.items():
        if not isinstance(request[key], str) or not re.fullmatch(pattern, request[key]):
            raise ValueError('invalid_' + key)
    # RFC 1918 network constants, not target addresses.
    networks = tuple(ipaddress.IPv4Network(value) for value in ((0x0A000000, 8), (0xAC100000, 12), (0xC0A80000, 16)))
    for key in ('target_ipv4', 'controller_ipv4'):
        if not isinstance(request[key], str):
            raise ValueError('ipv4_string_required')
        address = ipaddress.IPv4Address(request[key])
        if not any(address in network for network in networks):
            raise ValueError('private_ipv4_required')
    if request['target_ipv4'] == request['controller_ipv4']:
        raise ValueError('different_computers_required')
    wire = base64.b64decode(request['public_key'].split()[1], validate=True)
    if len(wire) != 51 or wire[:19] != b'\x00\x00\x00\x0bssh-ed25519\x00\x00\x00\x20':
        raise ValueError('ed25519_public_wire_required')
    start, end = request['created_epoch'], request['accept_until_epoch']
    if not 1_000_000_000 <= start < end <= 9_999_999_999 or end - start > 86400:
        raise ValueError('acceptance_window')
    return request


def launch_script(kind: str) -> bytes:
    common = '''#!/bin/sh
set -eu
umask 077
unset BASH_ENV ENV ZDOTDIR
PATH=/usr/bin:/bin:/usr/sbin:/sbin
export PATH
task_dir=$(CDPATH= cd "$(/usr/bin/dirname "$0")" && /bin/pwd)
'''
    if kind == 'start':
        return (common + '/usr/bin/open -a Terminal "$task_dir/../Resources/Start-OpenClaw.command"\n').encode()
    resource = 'DahaoConnect.js' if kind == 'connect' else 'DahaoAuthorize.js'
    tail = ' "$task_dir/../Resources"' if kind == 'authorize' else ''
    return (common + 'exec /usr/bin/env -i PATH=/usr/bin:/bin:/usr/sbin:/sbin LANG=en_US.UTF-8 /usr/bin/osascript -l JavaScript "$task_dir/../Resources/' + resource + '"' + tail + '\n').encode()


def build(output: Path, kind: str = 'connect', request: Path | None = None,
          runtime_relative: str | None = None) -> dict:
    if kind not in ('connect', 'authorize', 'start') or (request and kind != 'authorize'):
        raise ValueError('invalid_mode')
    output = Path(output).absolute()
    for item in (output, *output.parents):
        if item.is_symlink() or (hasattr(item, 'is_junction') and item.is_junction()):
            raise ValueError('linked_output')
    if output.resolve().is_relative_to(ROOT):
        raise ValueError('output_must_be_outside_installed_skill')
    if output.exists() or output.suffix != '.zip':
        raise ValueError('new_zip_path_required')
    name = {'connect': 'Dahao-Connect', 'authorize': 'Dahao-Authorize', 'start': 'Dahao-OpenClaw'}[kind]
    app = name + '.app/Contents/'
    info = {'CFBundleIdentifier': 'local.dahao.' + kind, 'CFBundleName': name,
            'CFBundleExecutable': name, 'CFBundlePackageType': 'APPL',
            'CFBundleInfoDictionaryVersion': '6.0', 'CFBundleShortVersionString': '0.1.1',
            'CFBundleVersion': '2', 'LSMinimumSystemVersion': '11.0', 'NSHighResolutionCapable': True}
    files = {app + 'Info.plist': plistlib.dumps(info), app + 'PkgInfo': b'APPL????',
             app + 'MacOS/' + name: launch_script(kind),
             'LICENSE': regular_bytes(ROOT / 'LICENSE')}
    if kind == 'connect':
        files[app + 'Resources/DahaoConnect.js'] = regular_bytes(SOURCE / 'DahaoConnect.js')
        note = '双击 Dahao-Connect.app → 确认这是目标 Mac → 复制连接信息。只交给本次帮助者。此工具不授予接入。'
    elif kind == 'authorize':
        js = regular_bytes(SOURCE / 'DahaoAuthorize.js')
        if js.count(b'__REQUEST_SHA256__') != 1:
            raise ValueError('request_hash_placeholder')
        if request:
            raw = regular_bytes(request, 16384)
            validate_request(raw)
            js = js.replace(b'__REQUEST_SHA256__', hashlib.sha256(raw).hexdigest().encode('ascii'))
            files[app + 'Resources/request.json'] = raw
        files[app + 'Resources/DahaoAuthorize.js'] = js
        for source in ('authorize.pl', 'KeyGrant.pm'):
            files[app + 'Resources/' + source] = regular_bytes(SOURCE / source)
        note = ('这是本次私人授权包，不得公开或复用。双击 Dahao-Authorize.app，核对目标、来源、账户级命令权限与 60 分钟期限；同意后才点击允许。随时重开可撤销。到期不终止已有命令。'
                if request else '这是不带请求的通用程序，不能授予接入。帮助者需在私有会话目录单独准备已核验目标的公钥请求，再构建一次私人包。私钥永不放入包内。')
    else:
        if not runtime_relative or not re.fullmatch(r'[A-Za-z0-9._/-]+', runtime_relative):
            raise ValueError('runtime_relative_required')
        if runtime_relative.startswith('/') or any(p in ('', '.', '..') for p in runtime_relative.split('/')):
            raise ValueError('unsafe_runtime_relative')
        command = regular_bytes(SOURCE / 'Start-OpenClaw.command')
        if command.count(b'__RUNTIME_RELATIVE__') != 1:
            raise ValueError('runtime_placeholder')
        files[app + 'Resources/Start-OpenClaw.command'] = command.replace(b'__RUNTIME_RELATIVE__', runtime_relative.encode('ascii'))
        note = '双击 Dahao-OpenClaw.app 打开这台 Mac 已安装的 OpenClaw。首次可能进入设置向导；无需输入命令。模型账户由本人选择并在 Mac 填写。此包不安装软件，不建立 SSH 授权。'
    files['先读我.txt'] = (note + '\n\n未签名开发预览。若 macOS 拦截，向帮助者反馈提示，不关闭安全保护。目标资料、授权包、密钥、二维码与原始日志均不公开。\n').encode('utf-8')
    output.parent.mkdir(parents=True, exist_ok=True)
    descriptor = os.open(output, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600 if request else 0o644)
    with os.fdopen(descriptor, 'wb') as stream, zipfile.ZipFile(stream, 'w', compression=zipfile.ZIP_DEFLATED) as archive:
        for path, data in sorted(files.items()):
            member = zipfile.ZipInfo(path, date_time=(2026, 10, 13, 0, 0, 0))
            member.create_system = 3
            executable = '/MacOS/' in path or path.endswith('.command')
            # Private requests remain private after macOS extraction as well.
            mode = 0o700 if request and executable else 0o600 if request else 0o755 if executable else 0o644
            member.external_attr = (stat.S_IFREG | mode) << 16
            member.compress_type = zipfile.ZIP_DEFLATED
            archive.writestr(member, data)
    if request and os.name != 'nt':
        output.chmod(0o600)
    with zipfile.ZipFile(output) as archive:
        if {n: archive.read(n) for n in archive.namelist()} != files:
            raise ValueError('package_verification_failed')
    return {'kind': kind, 'private_request_included': bool(request), 'files': len(files),
            'sha256': hashlib.sha256(output.read_bytes()).hexdigest(),
            'file_sha256': {n: hashlib.sha256(v).hexdigest() for n, v in files.items()},
            'signed_or_notarized': False, 'target_execution': 'not_performed_by_builder'}


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--kind', choices=('connect', 'authorize', 'start'), default='connect')
    parser.add_argument('--output', type=Path, required=True)
    parser.add_argument('--request', type=Path, help='Private public-key-only request; never a private key')
    parser.add_argument('--runtime-relative', help='Verified installation prefix relative to target home, for start only')
    args = parser.parse_args()
    try:
        result = build(args.output, args.kind, args.request, args.runtime_relative)
    except (ValueError, OSError) as error:
        # Do not echo request contents, paths, or exception messages.
        print(json.dumps({'status': 'blocked', 'error_type': type(error).__name__}))
        return 1
    # ASCII JSON remains parseable on Windows consoles with a non-UTF-8 codepage.
    # The ZIP members keep their original UTF-8 filenames and contents.
    print(json.dumps(result, ensure_ascii=True, indent=2))
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
