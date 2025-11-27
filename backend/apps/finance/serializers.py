from rest_framework import serializers
from .models import Payment, Expense

class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = '__all__'
        # read_only_fields = ['trip']

class ExpenseSerializer(serializers.ModelSerializer):
    vehicleName = serializers.SerializerMethodField()
    tripDescription = serializers.CharField(source='trip.description', read_only=True)

    class Meta:
        model = Expense
        fields = '__all__'

    def get_vehicleName(self, obj):
        return str(obj.vehicle)
