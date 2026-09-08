import os
import sys
from pathlib import Path

# Add backend directory to sys.path so Django can find apps and config
BASE_DIR = Path(__file__).resolve().parent.parent
backend_path = os.path.join(BASE_DIR, 'backend')

if backend_path not in sys.path:
    sys.path.insert(0, backend_path)

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

# Optional auto-migration runner for Vercel deployments
if os.environ.get('AUTO_MIGRATE', 'False').lower() in ('true', '1', 't'):
    try:
        from django.core.management import call_command
        import django
        django.setup()
        call_command('migrate', interactive=False)
    except Exception as e:
        print(f"Auto-migration warning: {e}")

from config.wsgi import application

app = application