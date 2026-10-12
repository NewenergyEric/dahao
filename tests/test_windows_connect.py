"""Execute the Windows GUI's security checks in a fresh build, without target access."""
import importlib.util
import os
from pathlib import Path
import subprocess
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[1]


@unittest.skipUnless(os.name == "nt", "Windows .NET Framework build required")
class WindowsConnectTests(unittest.TestCase):
    def test_offline_build_and_confirmation_and_public_key_guards(self):
        spec = importlib.util.spec_from_file_location("build_windows_connect", ROOT / "tools/build_windows_connect.py")
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)
        with tempfile.TemporaryDirectory() as folder:
            result = module.build(Path(folder) / "artifact")
            self.assertEqual(result["self_test"], "passed")
            exe = Path(result["output"]) / result["executable"]["name"]
            denied = subprocess.run([str(exe), "--unsupported-option"], timeout=15, capture_output=True)
            self.assertEqual(denied.returncode, 2)
            self.assertFalse(result["signed"])
            self.assertEqual(result["real_target_execution"], "not_verified")

    def test_authorization_guard_denies_wrong_account_and_expiry_and_preserves_other_keys(self):
        spec = importlib.util.spec_from_file_location("build_windows_authorize", ROOT / "tools/build_windows_connect.py")
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)
        with tempfile.TemporaryDirectory() as folder:
            result = module.build(Path(folder) / "artifact", authorize=True)
            self.assertEqual(result["self_test"], "passed")
            self.assertEqual(result["kind"], "authorization_ui_without_request")
            self.assertFalse((Path(result["output"]) / "request.json").exists())


if __name__ == "__main__":
    unittest.main()
