from celery import shared_task
from django.core.mail import send_mail
from django.utils import timezone
from django.conf import settings
from datetime import timedelta
from .models import Reminder, ReminderNotification
import logging

logger = logging.getLogger(__name__)


@shared_task
def check_and_send_reminders():
    """Check for upcoming reminders and send email notifications"""
    today = timezone.now().date()
    
    # Get reminders that need notification
    reminders = Reminder.objects.filter(
        emailNotification=True,
        status='Pending',
        dueDate__gte=today
    )
    
    sent_count = 0
    for reminder in reminders:
        days_until_due = (reminder.dueDate - today).days
        
        # Send if within notification window and not recently sent
        if days_until_due <= reminder.notificationDaysBefore:
            should_send = True
            
            if reminder.lastNotificationSent:
                days_since_last = (timezone.now() - reminder.lastNotificationSent).days
                should_send = days_since_last >= 3  # Don't spam, wait 3 days between emails
            
            if should_send:
                send_reminder_email.delay(reminder.id)
                sent_count += 1
    
    logger.info(f"Scheduled {sent_count} reminder emails")
    return sent_count


@shared_task
def send_reminder_email(reminder_id):
    """Send a single reminder email"""
    try:
        reminder = Reminder.objects.get(id=reminder_id)
        vehicle = reminder.vehicle
        days_until_due = (reminder.dueDate - timezone.now().date()).days
        
        subject = f'🔔 Reminder: {reminder.title} - {vehicle.licensePlate}'
        
        message = f"""Dear Team,

This is a reminder for: {reminder.title}

Vehicle: {vehicle.make} {vehicle.model} ({vehicle.licensePlate})
Type: {reminder.type}
Due Date: {reminder.dueDate.strftime('%B %d, %Y')}
Days until due: {days_until_due} day{'s' if days_until_due != 1 else ''}

{f'Notes: {reminder.notes}' if reminder.notes else ''}

Please take necessary action before the due date.

Best regards,
IDA Fleet Management System

---
This is an automated notification. Please do not reply to this email.
"""
        
        recipient = settings.DEFAULT_FROM_EMAIL
        
        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            [recipient],
            fail_silently=False,
        )
        
        # Log successful notification
        ReminderNotification.objects.create(
            reminder=reminder,
            recipientEmail=recipient,
            status='sent'
        )
        
        # Update reminder
        reminder.lastNotificationSent = timezone.now()
        reminder.save(update_fields=['lastNotificationSent'])
        
        logger.info(f"Sent reminder email for: {reminder.title}")
        return True
        
    except Reminder.DoesNotExist:
        logger.error(f"Reminder {reminder_id} not found")
        return False
    except Exception as e:
        logger.error(f"Failed to send reminder email {reminder_id}: {str(e)}")
        
        # Log failed notification
        try:
            ReminderNotification.objects.create(
                reminder_id=reminder_id,
                recipientEmail=settings.DEFAULT_FROM_EMAIL,
                status='failed',
                errorMessage=str(e)
            )
        except:
            pass
        
        return False


@shared_task
def mark_overdue_reminders():
    """Mark reminders as overdue if past due date"""
    today = timezone.now().date()
    updated = Reminder.objects.filter(
        dueDate__lt=today,
        status='Pending'
    ).update(status='Overdue')
    
    logger.info(f"Marked {updated} reminders as overdue")
    return updated
