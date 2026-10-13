"""Build the offline Windows handoff GUI using the installed .NET Framework compiler.

No pip/npm, downloads, policy bypass, elevation, service changes or credentials.
The Python configuration engine remains standard-library-only. This optional
Windows GUI uses the Windows .NET Framework libraries already on the computer.
"""
from __future__ import annotations
import argparse
import hashlib
import json
import os
from pathlib import Path
import subprocess
import tempfile
import zipfile

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "assets/windows-connect"


def build(output: Path, authorize: bool = False) -> dict:
    if os.name != "nt":
        raise RuntimeError("windows_build_required")
    windir = Path(os.environ.get("WINDIR", ""))
    compiler = windir / "Microsoft.NET/Framework64/v4.0.30319/csc.exe"
    if not compiler.is_file():
        compiler = windir / "Microsoft.NET/Framework/v4.0.30319/csc.exe"
    if not compiler.is_file():
        raise RuntimeError("installed_framework_compiler_missing")
    output = output.resolve()
    if output.is_relative_to(ROOT):
        raise RuntimeError("output_must_be_outside_installed_skill")
    output.mkdir(parents=True, exist_ok=False)
    exe = output / ("Dahao-Authorize.exe" if authorize else "Dahao-Connect.exe")
    args = [str(compiler), "/nologo", "/target:winexe", "/platform:anycpu", "/optimize+", "/debug-",
            "/utf8output", "/out:" + str(exe), "/win32manifest:" + str(SOURCE / "app.manifest"),
            "/reference:System.dll", "/reference:System.Core.dll", "/reference:System.Drawing.dll",
            "/reference:System.Windows.Forms.dll", "/reference:System.ServiceProcess.dll",
            str(SOURCE / "DahaoConnect.cs")]
    if authorize:
        args.extend(["/main:Dahao.Authorization.Program", "/reference:System.Web.Extensions.dll", str(SOURCE / "DahaoAuthorize.cs")])
    compiled = subprocess.run(args, capture_output=True, timeout=90)
    if compiled.returncode:
        # Only compiler diagnostics from reviewed source; no environment dumps.
        raise RuntimeError("compile_failed: " + compiled.stdout.decode("utf-8", errors="replace"))
    result = subprocess.run([str(exe), "--self-test"], capture_output=True, timeout=30)
    if result.returncode:
        raise RuntimeError("self_test_failed_code_" + str(result.returncode))
    record = {"schema": 1, "version": "0.1.0", "signed": False,
              "target_runtime": "Windows .NET Framework 4.x / Windows Forms",
              "source_sha256": {name: hashlib.sha256((SOURCE / name).read_bytes()).hexdigest()
                                for name in (("DahaoConnect.cs", "DahaoAuthorize.cs", "app.manifest") if authorize else ("DahaoConnect.cs", "app.manifest"))},
              "executable": {"name": exe.name, "sha256": hashlib.sha256(exe.read_bytes()).hexdigest(), "bytes": exe.stat().st_size},
              "self_test": "passed", "real_target_execution": "not_verified", "kind": "authorization_ui_without_request" if authorize else "read_only_handoff"}
    (output / "build-record.json").write_text(json.dumps(record, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    (output / "先读我.txt").write_text((ROOT / "references/windows-helper.md").read_text(encoding="utf-8"), encoding="utf-8-sig")
    (output / "LICENSE").write_bytes((ROOT / "LICENSE").read_bytes())
    bundle = output / ("dahao-authorize-generic.zip" if authorize else "dahao-connect-windows.zip")
    with zipfile.ZipFile(bundle, "w", compression=zipfile.ZIP_DEFLATED) as archive:
        for name in (exe.name, "build-record.json", "先读我.txt", "LICENSE"):
            archive.write(output / name, name)
        for name in record["source_sha256"]:
            archive.write(SOURCE / name, "source/" + name)
    return {**record, "output": str(output), "bundle": str(bundle), "bundle_sha256": hashlib.sha256(bundle.read_bytes()).hexdigest()}


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output", type=Path)
    parser.add_argument("--authorize", action="store_true", help="Build the optional authorization UI without any private request or SSH key")
    args = parser.parse_args()
    if args.output is None:
        output = Path(tempfile.mkdtemp(prefix="dahao-connect-")) / "windows"
    else:
        output = args.output
    print(json.dumps(build(output, authorize=args.authorize), ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
