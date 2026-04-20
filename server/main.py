import sys
import os

# Ensure the 'server/' directory is on sys.path so that the 'app' package
# is importable whether uvicorn is launched from the project root or from
# inside the server/ directory.
_server_dir = os.path.dirname(os.path.abspath(__file__))
if _server_dir not in sys.path:
    sys.path.insert(0, _server_dir)

from app.main import app  # noqa: E402

__all__ = ["app"]