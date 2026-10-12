"""Exercise the distributable Skill without a repository or ambient working directory."""
import importlib.util
import json
import os
from pathlib import Path
import re
import subprocess
import sys
import tempfile
import unittest
from unittest.mock import patch
from urllib.parse import unquote, urlsplit
import zipfile

import client_setup as cs
from tools import release


class SkillInstallTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.root = Path(self.tmp.name).resolve()
        self.skill = self.root / 'installed-skills/dahao'
        for name in release.SKILL_FILES:
            relative = Path(name).relative_to('.agents/skills/dahao')
            destination = self.skill / relative
            destination.parent.mkdir(parents=True, exist_ok=True)
            destination.write_bytes((cs.ROOT / name).read_bytes())

    def test_relative_references_resolve_inside_standalone_skill(self):
        count = 0
        for path in self.skill.rglob('*.md'):
            for link in re.findall(r'\]\(([^)]+)\)', path.read_text(encoding='utf-8')):
                parsed = urlsplit(link)
                if parsed.scheme or not parsed.path:
                    continue
                target = (path.parent / unquote(parsed.path)).resolve()
                self.assertTrue(target.is_relative_to(self.skill), (path.name, link))
                self.assertTrue(target.is_file(), (path.name, link))
                count += 1
        self.assertGreater(count, 15)
        self.assertFalse((self.root / 'client_setup.py').exists())

    def test_discovery_cli_runs_from_an_unrelated_directory_without_network(self):
        process = subprocess.run([sys.executable, '-B', str(self.skill / 'scripts/discover_target.py'), '--help'],
                                 cwd=self.root, capture_output=True, timeout=15)
        self.assertEqual(process.returncode, 0)
        self.assertIn(b'discover', process.stdout)

    @unittest.skipUnless(os.name == 'nt', 'Windows compiler required')
    def test_standalone_authorizer_build_excludes_private_or_unlisted_inputs(self):
        # Deliberately contaminate the build source with harmless sentinels.
        # The production builder must use exact members, never a recursive ZIP.
        source = self.skill / 'assets/windows-connect'
        for name in ('request.json', 'client_key', 'known_hosts'):
            (source / name).write_text('SYNTHETIC_DO_NOT_PACKAGE', encoding='utf-8')
        output = self.root / 'artifacts/authorization'
        process = subprocess.run([sys.executable, '-B', str(self.skill / 'scripts/build_windows_connect.py'),
                                  '--authorize', '--output', str(output)], cwd=self.root,
                                 capture_output=True, timeout=120)
        self.assertEqual(process.returncode, 0, process.stderr.decode('utf-8', errors='replace'))
        result = json.loads(process.stdout)
        self.assertEqual(result['self_test'], 'passed')
        expected = {'Dahao-Authorize.exe', 'build-record.json', '先读我.txt',
                    'source/DahaoConnect.cs', 'source/DahaoAuthorize.cs', 'source/app.manifest'}
        with zipfile.ZipFile(result['bundle']) as archive:
            self.assertEqual(set(archive.namelist()), expected)
            self.assertFalse(any(b'SYNTHETIC_DO_NOT_PACKAGE' in archive.read(n) for n in archive.namelist()))
        self.assertFalse((output / 'request.json').exists())
        self.assertFalse((output / 'client_key').exists())
        spec = importlib.util.spec_from_file_location('standalone_builder', self.skill / 'scripts/build_windows_connect.py')
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)
        with self.assertRaisesRegex(RuntimeError, 'output_must_be_outside_installed_skill'):
            module.build(self.skill / 'private-material')
        self.assertFalse((self.skill / 'private-material').exists())

    def test_session_materials_rejected_before_any_read_even_if_allowlisted(self):
        manifest = json.loads((cs.ROOT / 'release-files.json').read_bytes())
        paths = ['request.json', 'known_hosts', 'authorized_keys', 'administrators_authorized_keys',
                 'client_key', 'client_key.pub', 'id_ed25519', 'temporary-access.json']
        for leaf in paths:
            with self.subTest(leaf=leaf):
                self.root.joinpath('release-files.json').write_text(json.dumps({**manifest, 'files': manifest['files'] + ['docs/' + leaf]}), encoding='utf-8')
                seen = []
                original = cs.read
                def audited_read(path):
                    seen.append(path)
                    return original(path)
                with patch.object(cs, 'read', side_effect=audited_read), self.assertRaisesRegex(release.ReleaseError, 'private_path_excluded'):
                    release.load_sources(self.root, identifiers=[])
                self.assertEqual(seen, [self.root / 'release-files.json'])


if __name__ == '__main__':
    unittest.main()
