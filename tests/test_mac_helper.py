"""Exercise offline packaging and authorization boundaries with synthetic data."""
import base64
import copy
import hashlib
import importlib.util
import json
import os
from pathlib import Path
import shutil
import stat
import subprocess
import sys
import tempfile
import unittest
from unittest.mock import patch
import zipfile

import client_setup as cs
from tools import release


def request_data():
    wire = b'\x00\x00\x00\x0bssh-ed25519\x00\x00\x00\x20' + b'x' * 32
    return {'schema': 1, 'request_id': 'ab' * 16, 'target_account': 'test_user',
            'target_ipv4': '.'.join(map(str, (192, 168, 99, 21))),
            'controller_ipv4': '.'.join(map(str, (192, 168, 99, 22))),
            'host_fingerprint': 'SHA256:' + 'A' * 43,
            'public_key': 'ssh-ed25519 ' + base64.b64encode(wire).decode('ascii'),
            'created_epoch': 1_791_867_600, 'accept_until_epoch': 1_791_954_000,
            'duration_seconds': 3600}


class MacHelperTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.root = Path(self.tmp.name).resolve()
        self.skill = self.root / 'installed/eric-dahao-agent-skill'
        for name in release.SKILL_FILES:
            destination = self.skill / Path(name).relative_to('.agents/skills/eric-dahao-agent-skill')
            destination.parent.mkdir(parents=True, exist_ok=True)
            destination.write_bytes((cs.ROOT / name).read_bytes())
        self.source = self.skill / 'assets/mac-connect'
        spec = importlib.util.spec_from_file_location('isolated_mac_builder', self.skill / 'scripts/build_mac_helper.py')
        self.builder = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(self.builder)

    def test_unbound_connect_and_authorize_only_package_explicit_members(self):
        for name in ('request.json', 'client_key', 'known_hosts', 'unlisted.txt'):
            (self.source / name).write_text('SYNTHETIC_NEVER_PACKAGE', encoding='utf-8')
        resources = {'connect': {'DahaoConnect.js'},
                     'authorize': {'DahaoAuthorize.js', 'authorize.pl', 'KeyGrant.pm'}}
        for kind, names in resources.items():
            with self.subTest(kind=kind):
                target = self.root / (kind + '.zip')
                result = self.builder.build(target, kind)
                app = 'Dahao-' + ('Connect' if kind == 'connect' else 'Authorize')
                prefix = app + '.app/Contents/'
                expected = {'LICENSE', '先读我.txt', prefix + 'Info.plist', prefix + 'PkgInfo', prefix + 'MacOS/' + app}
                expected |= {prefix + 'Resources/' + name for name in names}
                with zipfile.ZipFile(target) as archive:
                    self.assertEqual(set(archive.namelist()), expected)
                    self.assertEqual(len(archive.namelist()), len(expected))
                    self.assertEqual(archive.read('LICENSE'), (self.skill / 'LICENSE').read_bytes())
                    for member in archive.infolist():
                        data = archive.read(member)
                        self.assertNotIn(b'SYNTHETIC_NEVER_PACKAGE', data)
                        self.assertEqual(hashlib.sha256(data).hexdigest(), result['file_sha256'][member.filename])
                        mode = member.external_attr >> 16
                        self.assertTrue(stat.S_ISREG(mode))
                        self.assertEqual(mode & 0o777, 0o755 if '/MacOS/' in member.filename else 0o644)
                self.assertFalse(result['private_request_included'])
                self.assertEqual(hashlib.sha256(target.read_bytes()).hexdigest(), result['sha256'])
                self.assertFalse((self.root / 'client_setup.py').exists())

    def test_private_request_is_explicit_validated_and_hash_bound(self):
        raw = json.dumps(request_data()).encode('utf-8')
        request = self.root / 'synthetic-request.json'
        request.write_bytes(raw)
        output = self.root / 'once.zip'
        result = self.builder.build(output, 'authorize', request)
        prefix = 'Dahao-Authorize.app/Contents/Resources/'
        with zipfile.ZipFile(output) as archive:
            self.assertEqual(archive.read(prefix + 'request.json'), raw)
            js = archive.read(prefix + 'DahaoAuthorize.js')
            self.assertIn(hashlib.sha256(raw).hexdigest().encode(), js)
            self.assertNotIn(b'__REQUEST_SHA256__', js)
            for entry in archive.infolist():
                self.assertEqual((entry.external_attr >> 16) & 0o077, 0)
        self.assertTrue(result['private_request_included'])
        # Summary must not echo the target metadata or request values.
        summary = json.dumps(result)
        for value in (request_data()['target_ipv4'], request_data()['target_account'], request_data()['public_key']):
            self.assertNotIn(value, summary)

    def test_invalid_requests_fail_before_creating_output(self):
        invalid = [None, [], {**request_data(), 'extra': 'not_allowed'}]
        for key, value in [('schema', True), ('duration_seconds', 7200), ('created_epoch', 'tomorrow'),
                           ('target_account', 'user;echo bad'), ('target_ipv4', '203.0.113.1'),
                           ('controller_ipv4', request_data()['target_ipv4']), ('target_ipv4', 123),
                           ('target_ipv4', '192.268.0.1'), ('host_fingerprint', 'SHA256:short'),
                           ('public_key', 'ssh-rsa fake'), ('public_key', 'ssh-ed25519 ' + 'A' * 68),
                           ('accept_until_epoch', 1_891_954_000), ('request_id', '../' * 10)]:
            data = copy.deepcopy(request_data())
            data[key] = value
            invalid.append(data)
        for number, data in enumerate(invalid):
            with self.subTest(number=number):
                request = self.root / 'synthetic-request.json'
                request.write_text(json.dumps(data), encoding='utf-8')
                output = self.root / 'bad.zip'
                with self.assertRaises((ValueError, TypeError)):
                    self.builder.build(output, 'authorize', request)
                self.assertFalse(output.exists())
        duplicate = json.dumps(request_data()).replace('"schema": 1', '"schema": 1, "schema": 1')
        with self.assertRaisesRegex(ValueError, 'duplicate_request_field'):
            self.builder.validate_request(duplicate.encode())

    def test_output_safety_and_argument_combinations(self):
        output = self.root / 'exists.zip'
        output.write_bytes(b'keep')
        with self.assertRaises(ValueError):
            self.builder.build(output)
        self.assertEqual(output.read_bytes(), b'keep')
        with self.assertRaisesRegex(ValueError, 'outside_installed_skill'):
            self.builder.build(self.skill / 'private.zip')
        with self.assertRaises(ValueError):
            self.builder.build(self.root / 'wrong.exe')
        with self.assertRaises(ValueError):
            self.builder.build(self.root / 'wrong.zip', 'connect', self.root / 'missing.json')
        with self.assertRaises(ValueError):
            self.builder.build(self.root / 'wrong.zip', 'unknown')

    def test_start_helper_uses_only_verified_relative_prefix(self):
        for relative in ('', '/absolute', '../escape', 'a/../escape', 'a//b', 'a/./b', 'a;whoami', '$(bad)', 'a\\b'):
            with self.subTest(relative=relative), self.assertRaises(ValueError):
                self.builder.build(self.root / 'bad.zip', 'start', runtime_relative=relative)
        output = self.root / 'start.zip'
        relative = '.local/share/dahao/openclaw-TEST'
        self.builder.build(output, 'start', runtime_relative=relative)
        with zipfile.ZipFile(output) as archive:
            name = 'Dahao-OpenClaw.app/Contents/Resources/Start-OpenClaw.command'
            command = archive.read(name)
            self.assertIn(relative.encode(), command)
            self.assertNotIn(b'__RUNTIME_RELATIVE__', command)
            self.assertEqual((archive.getinfo(name).external_attr >> 16) & 0o777, 0o755)
            self.assertFalse(any(n.endswith('request.json') for n in archive.namelist()))

    def test_linked_source_or_output_rejected_before_read(self):
        # Deterministic guard test also works without Windows symlink privileges.
        source = self.source / 'DahaoConnect.js'
        original = Path.is_symlink
        with patch.object(Path, 'is_symlink', lambda path: path == source or original(path)):
            with self.assertRaisesRegex(ValueError, 'linked_path_rejected'):
                self.builder.build(self.root / 'blocked.zip')
        target = self.root / 'blocked.zip'
        with patch.object(Path, 'is_symlink', lambda path: path == target.parent or original(path)):
            with self.assertRaisesRegex(ValueError, 'linked_output'):
                self.builder.build(target)
        self.assertFalse(target.exists())

    def test_cli_runs_standalone_and_errors_do_not_echo_request(self):
        script = str(self.skill / 'scripts/build_mac_helper.py')
        proc = subprocess.run([sys.executable, '-B', script, '--kind', 'connect', '--output', str(self.root / 'cli.zip')],
                              cwd=self.root, capture_output=True, timeout=30)
        self.assertEqual(proc.returncode, 0, proc.stderr)
        self.assertEqual(json.loads(proc.stdout)['kind'], 'connect')
        bad = self.root / 'invalid-request.json'
        bad.write_text('SYNTHETIC_PRIVATE_SENTINEL', encoding='utf-8')
        proc = subprocess.run([sys.executable, '-B', script, '--kind', 'authorize', '--request', str(bad),
                               '--output', str(self.root / 'bad.zip')], cwd=self.root, capture_output=True, timeout=30)
        self.assertEqual(proc.returncode, 1)
        self.assertEqual(json.loads(proc.stdout)['status'], 'blocked')
        self.assertNotIn(b'SYNTHETIC_PRIVATE_SENTINEL', proc.stdout + proc.stderr)
        self.assertFalse((self.root / 'bad.zip').exists())


class MacHelperSourceTests(unittest.TestCase):
    def test_native_dialog_safety_with_mocked_system_commands(self):
        node = shutil.which('node')
        self.assertIsNotNone(node, 'Node is required for the JXA source regression checks')
        source = cs.ROOT / '.agents/skills/eric-dahao-agent-skill/assets/mac-connect'
        for test, program, expected in [('connect.js', 'DahaoConnect.js', '"tests":18'),
                                         ('authorize.js', 'DahaoAuthorize.js', '"ui_tests":12')]:
            process = subprocess.run([node, str(cs.ROOT / 'tests/mac' / test), str(source / program)],
                                     capture_output=True, timeout=30)
            self.assertEqual(process.returncode, 0, process.stderr.decode(errors='replace'))
            self.assertIn(expected, process.stdout.decode())

    def test_perl_grant_revoke_preserves_other_authorizations(self):
        perl = shutil.which('perl')
        if not perl and os.name == 'nt':
            git = shutil.which('git')
            if git:
                candidate = Path(git).resolve().parents[1] / 'usr/bin/perl.exe'
                if candidate.is_file():
                    perl = str(candidate)
        self.assertIsNotNone(perl, 'Perl (included with Git for Windows) is required for grant regression checks')
        source = cs.ROOT / '.agents/skills/eric-dahao-agent-skill/assets/mac-connect'
        environment = dict(os.environ, DAHAO_MAC_SOURCE=str(source))
        process = subprocess.run([perl, str(cs.ROOT / 'tests/mac/key-grant.pl')], env=environment,
                                 capture_output=True, timeout=30)
        self.assertEqual(process.returncode, 0, process.stderr.decode(errors='replace'))
        self.assertIn(b'1..41', process.stdout)


if __name__ == '__main__':
    unittest.main()
