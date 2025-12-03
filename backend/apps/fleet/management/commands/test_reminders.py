from django.core.management.base import BaseCommand
from django.utils import timezone
from apps.fleet.models import Reminder
from apps.fleet.tasks import check_and_send_reminders, send_reminder_email
import sys


class Command(BaseCommand):
    help = 'Test the reminder notification system'

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Show what would be sent without actually sending emails',
        )
        parser.add_argument(
            '--send',
            action='store_true',
            help='Actually send reminder emails',
        )
        parser.add_argument(
            '--reminder-id',
            type=int,
            help='Test a specific reminder by ID',
        )

    def handle(self, *args, **options):
        dry_run = options.get('dry_run')
        send = options.get('send')
        reminder_id = options.get('reminder_id')
        
        if not dry_run and not send:
            self.stdout.write(
                self.style.ERROR('Please specify either --dry-run or --send')
            )
            sys.exit(1)
        
        self.stdout.write(self.style.WARNING('🔍 Testing Reminder System'))
        self.stdout.write('')
        
        # Test specific reminder
        if reminder_id:
            self._test_specific_reminder(reminder_id, dry_run, send)
            return
        
        # Test all pending reminders
        today = timezone.now().date()
        
        self.stdout.write(f'Current date: {today}')
        self.stdout.write(f'Current time: {timezone.now()}')
        self.stdout.write(f'Timezone: {timezone.get_current_timezone()}')
        self.stdout.write('')
        
        # Get all pending reminders with email notification
        reminders = Reminder.objects.filter(
            emailNotification=True,
            status='Pending',
            dueDate__gte=today
        )
        
        self.stdout.write(f'Found {reminders.count()} pending reminders with email notification enabled')
        self.stdout.write('')
        
        if reminders.count() == 0:
            self.stdout.write(
                self.style.WARNING('No pending reminders found. Create a reminder to test.')
            )
            return
        
        eligible_count = 0
        for reminder in reminders:
            days_until_due = (reminder.dueDate - today).days
            is_eligible = days_until_due <= reminder.notificationDaysBefore
            
            status_icon = '✅' if is_eligible else '⏳'
            self.stdout.write(f'{status_icon} Reminder #{reminder.id}: {reminder.title}')
            self.stdout.write(f'   Vehicle: {reminder.vehicle}')
            self.stdout.write(f'   Type: {reminder.type}')
            self.stdout.write(f'   Due Date: {reminder.dueDate}')
            self.stdout.write(f'   Days until due: {days_until_due}')
            self.stdout.write(f'   Notification threshold: {reminder.notificationDaysBefore} days')
            self.stdout.write(f'   Last notification: {reminder.lastNotificationSent or "Never"}')
            
            if is_eligible:
                if reminder.lastNotificationSent:
                    days_since_last = (timezone.now() - reminder.lastNotificationSent).days
                    should_send = days_since_last >= 3
                    self.stdout.write(f'   Days since last notification: {days_since_last}')
                    self.stdout.write(f'   Should send: {"YES" if should_send else "NO (too soon)"}')
                else:
                    self.stdout.write(f'   Should send: YES')
                eligible_count += 1
            else:
                self.stdout.write(f'   Should send: NO (not in notification window)')
            
            self.stdout.write('')
        
        self.stdout.write(f'Eligible reminders: {eligible_count}')
        self.stdout.write('')
        
        if send:
            self.stdout.write(self.style.SUCCESS('📧 Sending reminder emails...'))
            result = check_and_send_reminders()
            self.stdout.write(self.style.SUCCESS(f'✅ Scheduled {result} reminder emails'))
        else:
            self.stdout.write(
                self.style.WARNING('Dry run complete. Use --send to actually send emails.')
            )
    
    def _test_specific_reminder(self, reminder_id, dry_run, send):
        """Test a specific reminder by ID"""
        try:
            reminder = Reminder.objects.get(id=reminder_id)
        except Reminder.DoesNotExist:
            self.stdout.write(
                self.style.ERROR(f'❌ Reminder #{reminder_id} not found')
            )
            sys.exit(1)
        
        self.stdout.write(f'Testing Reminder #{reminder.id}: {reminder.title}')
        self.stdout.write(f'Vehicle: {reminder.vehicle}')
        self.stdout.write(f'Type: {reminder.type}')
        self.stdout.write(f'Due Date: {reminder.dueDate}')
        self.stdout.write(f'Status: {reminder.status}')
        self.stdout.write(f'Email Notification: {reminder.emailNotification}')
        self.stdout.write(f'Notification Days Before: {reminder.notificationDaysBefore}')
        self.stdout.write(f'Last Notification: {reminder.lastNotificationSent or "Never"}')
        self.stdout.write('')
        
        if send:
            self.stdout.write(self.style.SUCCESS(f'📧 Sending email for reminder #{reminder_id}...'))
            result = send_reminder_email(reminder_id)
            
            if result:
                self.stdout.write(self.style.SUCCESS('✅ Email sent successfully!'))
            else:
                self.stdout.write(self.style.ERROR('❌ Failed to send email'))
        else:
            self.stdout.write(
                self.style.WARNING('Dry run complete. Use --send to actually send email.')
            )
