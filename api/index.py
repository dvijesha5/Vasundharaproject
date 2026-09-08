import os
import sys
import traceback
from pathlib import Path

# Robust path discovery for Vercel Serverless environment
current_file = Path(__file__).resolve()
current_dir = current_file.parent

search_paths = [
    current_dir / 'backend',
    current_dir.parent / 'backend',
    current_dir,
    current_dir.parent,
    Path('/var/task/backend'),
    Path('/var/task'),
]

backend_dir = None
for p in search_paths:
    if (p / 'config' / 'settings.py').exists() or (p / 'manage.py').exists():
        backend_dir = p
        break

# Add all relevant paths to sys.path
for p in search_paths:
    p_str = str(p)
    if p.exists() and p_str not in sys.path:
        sys.path.insert(0, p_str)

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

django_app = None
init_error = None

try:
    import django
    django.setup()

    # Optional auto-migration runner
    if os.environ.get('AUTO_MIGRATE', 'False').lower() in ('true', '1', 't'):
        try:
            from django.core.management import call_command
            call_command('migrate', interactive=False)
        except Exception as mig_err:
            print(f"Auto-migration notice: {mig_err}")

    from django.core.wsgi import get_wsgi_application
    django_app = get_wsgi_application()

except Exception as e:
    init_error = traceback.format_exc()
    print(f"Django WSGI initialization error:\n{init_error}")


def handler(environ, start_response):
    global django_app, init_error

    if init_error:
        start_response('500 Internal Server Error', [('Content-Type', 'text/plain; charset=utf-8')])
        return [f"Django Initialization Error on Serverless:\n\n{init_error}".encode('utf-8')]

    # Restore original requested path if Vercel rewritten destination set PATH_INFO to /api/index.py
    current_path = environ.get('PATH_INFO', '')
    if 'index.py' in current_path:
        original_uri = (
            environ.get('HTTP_X_FORWARDED_URI')
            or environ.get('HTTP_X_MATCHED_PATH')
            or environ.get('RAW_URI')
        )
        if original_uri:
            environ['PATH_INFO'] = original_uri.split('?')[0]

    try:
        return django_app(environ, start_response)

    except Exception as e:
        tb = traceback.format_exc()
        print(f"Request Error:\n{tb}")
        start_response('500 Internal Server Error', [('Content-Type', 'text/plain; charset=utf-8')])
        return [f"Server Execution Error:\n\n{tb}".encode('utf-8')]

app = handler