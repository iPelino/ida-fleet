from rest_framework import viewsets
from .models import Vehicle, Reminder
from .serializers import VehicleSerializer, ReminderSerializer
from rest_framework.decorators import action
from rest_framework.response import Response

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
