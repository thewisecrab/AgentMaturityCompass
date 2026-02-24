"""Root conftest — ensures `amc` package is importable when running pytest from repo root."""
import sys
from pathlib import Path

# Add platform/python to sys.path so `import amc` works from any cwd
_platform_dir = Path(__file__).resolve().parent
if str(_platform_dir) not in sys.path:
    sys.path.insert(0, str(_platform_dir))
