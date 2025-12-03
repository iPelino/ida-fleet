import os
from celery import Celery
from celery.schedules import crontab

# Set the default Django settings module
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'fleet_management.settings')

app = Celery('fleet_management')

# Load configuration from Django settings
app.config_from_object('django.conf:settings', namespace='CELERY')

# Auto-discover tasks in all installed apps
app.autodiscover_tasks()

# Scheduled tasks configuration
app.conf.beat_schedule = {
    'check-reminders-hourly': {  # Changed from daily to hourly for better reliability
        'task': 'apps.fleet.tasks.check_and_send_reminders',
        'schedule': crontab(minute=0),  # Every hour on the hour
    },
    'mark-overdue-reminders': {
        'task': 'apps.fleet.tasks.mark_overdue_reminders',
        'schedule': crontab(hour=0, minute=5),  # Run daily at 12:05 AM
    },
}

app.conf.timezone = 'Africa/Kigali'


@app.task(bind=True, ignore_result=True)
def debug_task(self):
    print(f'Request: {self.request!r}')
