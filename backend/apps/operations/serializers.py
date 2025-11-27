from rest_framework import serializers
from .models import Customer, Trip
from apps.fleet.serializers import VehicleSerializer

class CustomerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customer
        fields = '__all__'

class TripSerializer(serializers.ModelSerializer):
    customerName = serializers.CharField(source='customer.name', read_only=True)
    vehicleName = serializers.SerializerMethodField()
    payments = serializers.SerializerMethodField()

    class Meta:
        model = Trip
        fields = '__all__'

    def get_vehicleName(self, obj):
        return str(obj.vehicle) if obj.vehicle else None

    def get_payments(self, obj):
        from apps.finance.serializers import PaymentSerializer
        return PaymentSerializer(obj.payments.all(), many=True).data
