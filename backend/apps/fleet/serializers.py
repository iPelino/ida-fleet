from rest_framework import serializers
from .models import Vehicle, Reminder

class VehicleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vehicle
        fields = '__all__'

class ReminderSerializer(serializers.ModelSerializer):
    vehicleName = serializers.SerializerMethodField()

    class Meta:
        model = Reminder
        fields = '__all__'

    def get_vehicleName(self, obj):
        return str(obj.vehicle)
