"""Compatibility entry point; the canonical builder ships inside the Skill."""
from pathlib import Path
import runpy

SCRIPT = Path(__file__).resolve().parents[1] / ".agents/skills/dahao/scripts/build_windows_connect.py"
_module = runpy.run_path(str(SCRIPT))
build = _module["build"]

if __name__ == "__main__":
    raise SystemExit(_module["main"]())
