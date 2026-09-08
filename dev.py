"""
BizLens Unified Development Server Runner
Starts both Django backend (127.0.0.1:8000) and Vite frontend (localhost:3000) in a single command.
Usage:
    python dev.py
"""
import os
import sys
import subprocess
import signal

ROOT_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.join(ROOT_DIR, 'backend')
FRONTEND_DIR = os.path.join(ROOT_DIR, 'frontend')

def run():
    print("\n" + "="*60)
    print("  🚀 Starting BizLens Full-Stack Development Environment")
    print("="*60)
    print("  Backend:  http://127.0.0.1:8000 (Django REST Framework)")
    print("  Frontend: http://localhost:3000  (React + Vite)")
    print("  Press Ctrl+C to shut down both servers safely.")
    print("="*60 + "\n")

    # Start Django Backend
    django_cmd = [sys.executable, 'manage.py', 'runserver', '127.0.0.1:8000']
    backend_proc = subprocess.Popen(
        django_cmd,
        cwd=BACKEND_DIR,
        shell=False
    )

    # Start Vite Frontend
    npm_cmd = 'npm.cmd' if sys.platform == 'win32' else 'npm'
    frontend_proc = subprocess.Popen(
        [npm_cmd, 'run', 'dev'],
        cwd=FRONTEND_DIR,
        shell=False
    )

    def shutdown(sig, frame):
        print("\n\nShutting down BizLens development servers...")
        try:
            backend_proc.terminate()
        except Exception:
            pass
        try:
            frontend_proc.terminate()
        except Exception:
            pass
        print("Shutdown complete. Goodbye!\n")
        sys.exit(0)

    signal.signal(signal.SIGINT, shutdown)
    signal.signal(signal.SIGTERM, shutdown)

    try:
        backend_proc.wait()
    except KeyboardInterrupt:
        shutdown(None, None)

if __name__ == '__main__':
    run()
