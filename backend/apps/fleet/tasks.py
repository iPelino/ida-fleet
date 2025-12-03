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
    logger.info("Starting reminder check task")
    today = timezone.now().date()
    
    # Get reminders that need notification
    reminders = Reminder.objects.filter(
        emailNotification=True,
        status='Pending',
        dueDate__gte=today
    )
    
    logger.info(f"Found {reminders.count()} pending reminders with email notification enabled")
    
    sent_count = 0
    skipped_count = 0
    
    for reminder in reminders:
        days_until_due = (reminder.dueDate - today).days
        
        logger.info(
            f"Processing reminder: {reminder.title} (ID: {reminder.id}) - "
            f"Due in {days_until_due} days, notification threshold: {reminder.notificationDaysBefore} days"
        )
        
        # Send if within notification window and not recently sent
        if days_until_due <= reminder.notificationDaysBefore:
            should_send = True
            
            if reminder.lastNotificationSent:
                days_since_last = (timezone.now() - reminder.lastNotificationSent).days
                logger.info(f"Last notification sent {days_since_last} days ago")
                should_send = days_since_last >= 3  # Don't spam, wait 3 days between emails
            
            if should_send:
                logger.info(f"Scheduling email for reminder: {reminder.title}")
                send_reminder_email.delay(reminder.id)
                sent_count += 1
            else:
                logger.info(f"Skipping reminder {reminder.title} - recently sent")
                skipped_count += 1
        else:
            logger.info(
                f"Skipping reminder {reminder.title} - not yet in notification window "
                f"({days_until_due} days until due > {reminder.notificationDaysBefore} day threshold)"
            )
            skipped_count += 1
    
    logger.info(f"Reminder check complete: {sent_count} scheduled, {skipped_count} skipped")
    return sent_count


@shared_task
def send_reminder_email(reminder_id):
    """Send a single reminder email"""
    try:
        logger.info(f"Starting to send email for reminder ID: {reminder_id}")
        
        reminder = Reminder.objects.get(id=reminder_id)
        vehicle = reminder.vehicle
        days_until_due = (reminder.dueDate - timezone.now().date()).days
        
        # Get recipient list from settings
        recipients = settings.REMINDER_NOTIFICATION_RECIPIENTS
        
        if not recipients:
            logger.error("No REMINDER_NOTIFICATION_RECIPIENTS configured in settings")
            raise ValueError("No recipients configured for reminder notifications")
        
        logger.info(f"Sending reminder to {len(recipients)} recipient(s): {', '.join(recipients)}")
        
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
        
        logger.info(f"Sending email with subject: {subject}")
        
        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            recipients,
            fail_silently=False,
        )
        
        logger.info(f"Email sent successfully for reminder: {reminder.title}")
        
        # Log successful notification for each recipient
        for recipient_email in recipients:
            ReminderNotification.objects.create(
                reminder=reminder,
                recipientEmail=recipient_email,
                status='sent'
            )
        
        # Update reminder
        reminder.lastNotificationSent = timezone.now()
        reminder.save(update_fields=['lastNotificationSent'])
        
        logger.info(f"Updated lastNotificationSent for reminder: {reminder.title}")
        return True
        
    except Reminder.DoesNotExist:
        logger.error(f"Reminder {reminder_id} not found")
        return False
    except Exception as e:
        logger.error(f"Failed to send reminder email {reminder_id}: {str(e)}", exc_info=True)
        
        # Log failed notification
        try:
            recipients = getattr(settings, 'REMINDER_NOTIFICATION_RECIPIENTS', [settings.DEFAULT_FROM_EMAIL])
            for recipient_email in recipients:
                ReminderNotification.objects.create(
                    reminder_id=reminder_id,
                    recipientEmail=recipient_email,
                    status='failed',
                    errorMessage=str(e)
                )
        except Exception as log_error:
            logger.error(f"Failed to log notification error: {str(log_error)}")
        
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
