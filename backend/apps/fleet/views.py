from rest_framework import viewsets
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from django.conf import settings
from django.utils import timezone
from datetime import timedelta
from .models import Vehicle, Reminder, ReminderNotification
from .serializers import VehicleSerializer, ReminderSerializer
import redis
import logging

logger = logging.getLogger(__name__)


class VehicleViewSet(viewsets.ModelViewSet):
    queryset = Vehicle.objects.all()
    serializer_class = VehicleSerializer


class ReminderViewSet(viewsets.ModelViewSet):
    queryset = Reminder.objects.all()
    serializer_class = ReminderSerializer

    @action(detail=False, methods=['post'], url_path='check-notifications')
    def check_notifications(self, request):
        # Mock implementation
        return Response({"notificationsSent": 0})

    @action(detail=True, methods=['post'], url_path='send-notification')
    def send_notification(self, request, pk=None):
        # Mock implementation
        return Response({"status": "sent"})


@api_view(['GET'])
@permission_classes([IsAdminUser])
def reminder_system_health(request):
    """Check the health of the reminder notification system"""
    
    # Check Redis/Celery broker connection
    redis_status = "unknown"
    try:
        r = redis.Redis.from_url(settings.CELERY_BROKER_URL)
        r.ping()
        redis_status = "connected"
    except Exception as e:
        redis_status = f"failed: {str(e)}"
        logger.error(f"Redis connection failed: {e}")
    
    # Check email configuration
    email_config = {
        "backend": settings.EMAIL_BACKEND,
        "host": settings.EMAIL_HOST,
        "port": settings.EMAIL_PORT,
        "user_configured": bool(settings.EMAIL_HOST_USER),
        "password_configured": bool(settings.EMAIL_HOST_PASSWORD),
        "from_email": settings.DEFAULT_FROM_EMAIL,
        "recipients": settings.REMINDER_NOTIFICATION_RECIPIENTS,
        "recipients_count": len(settings.REMINDER_NOTIFICATION_RECIPIENTS),
    }
    
    # Check pending reminders
    today = timezone.now().date()
    pending_reminders = Reminder.objects.filter(
        emailNotification=True,
        status='Pending',
        dueDate__gte=today
    ).count()
    
    # Check notifications sent in last 7 days
    recent_notifications = ReminderNotification.objects.filter(
        sentAt__gte=timezone.now() - timedelta(days=7)
    )
    
    notifications_stats = {
        "total_last_7_days": recent_notifications.count(),
        "sent": recent_notifications.filter(status='sent').count(),
        "failed": recent_notifications.filter(status='failed').count(),
        "pending": recent_notifications.filter(status='pending').count(),
    }
    
    # Overall health status
    is_healthy = (
        redis_status == "connected" and
        email_config["user_configured"] and
        email_config["password_configured"] and
        email_config["recipients_count"] > 0
    )
    
    return Response({
        "status": "healthy" if is_healthy else "unhealthy",
        "timestamp": timezone.now(),
        "celery_broker": redis_status,
        "email_configuration": email_config,
        "reminders": {
            "pending_with_notification": pending_reminders,
        },
        "notifications": notifications_stats,
    })

