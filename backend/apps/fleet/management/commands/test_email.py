from django.core.management.base import BaseCommand
from django.core.mail import send_mail
from django.conf import settings
import sys


class Command(BaseCommand):
    help = 'Test email configuration by sending a test email'

    def add_arguments(self, parser):
        parser.add_argument(
            '--to',
            type=str,
            help='Email address to send test email to (default: ZOHO_EMAIL_USER)',
        )

    def handle(self, *args, **options):
        recipient = options.get('to') or settings.DEFAULT_FROM_EMAIL
        
        self.stdout.write(self.style.WARNING('Testing Email Configuration'))
        self.stdout.write(f'EMAIL_BACKEND: {settings.EMAIL_BACKEND}')
        self.stdout.write(f'EMAIL_HOST: {settings.EMAIL_HOST}')
        self.stdout.write(f'EMAIL_PORT: {settings.EMAIL_PORT}')
        self.stdout.write(f'EMAIL_USE_TLS: {settings.EMAIL_USE_TLS}')
        self.stdout.write(f'EMAIL_HOST_USER: {settings.EMAIL_HOST_USER or "NOT SET"}')
        self.stdout.write(f'EMAIL_HOST_PASSWORD: {"SET" if settings.EMAIL_HOST_PASSWORD else "NOT SET"}')
        self.stdout.write(f'DEFAULT_FROM_EMAIL: {settings.DEFAULT_FROM_EMAIL}')
        self.stdout.write(f'REMINDER_NOTIFICATION_RECIPIENTS: {settings.REMINDER_NOTIFICATION_RECIPIENTS}')
        self.stdout.write('')
        
        if not settings.EMAIL_HOST_USER or not settings.EMAIL_HOST_PASSWORD:
            self.stdout.write(
                self.style.ERROR('❌ Email credentials not configured!')
            )
            self.stdout.write(
                'Please set ZOHO_EMAIL_USER and ZOHO_EMAIL_PASSWORD environment variables'
            )
            sys.exit(1)
        
        if not settings.REMINDER_NOTIFICATION_RECIPIENTS:
            self.stdout.write(
                self.style.WARNING('⚠️  REMINDER_NOTIFICATION_RECIPIENTS is not set, using DEFAULT_FROM_EMAIL')
            )
        
        self.stdout.write(f'Sending test email to: {recipient}')
        
        try:
            send_mail(
                subject='🧪 Test Email - IDA Fleet Management',
                message='This is a test email from the IDA Fleet Management System.\n\n'
                        'If you receive this email, your email configuration is working correctly.\n\n'
                        'Configuration Details:\n'
                        f'- Email Host: {settings.EMAIL_HOST}\n'
                        f'- From Address: {settings.DEFAULT_FROM_EMAIL}\n\n'
                        'Best regards,\n'
                        'IDA Fleet Management System',
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[recipient],
                fail_silently=False,
            )
            
            self.stdout.write(
                self.style.SUCCESS(f'✅ Test email sent successfully to {recipient}!')
            )
            self.stdout.write('Please check your inbox (and spam folder)')
            
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'❌ Failed to send test email: {str(e)}')
            )
            sys.exit(1)
