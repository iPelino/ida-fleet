from rest_framework import serializers
from .models import Payment, Expense, ExchangeRate

class ExchangeRateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExchangeRate
        fields = ['id', 'from_currency', 'to_currency', 'rate', 'effective_date', 'is_active']
        read_only_fields = ['effective_date']

class PaymentSerializer(serializers.ModelSerializer):
    converted_amount = serializers.SerializerMethodField()
    
    class Meta:
        model = Payment
        fields = '__all__'
    
    def get_converted_amount(self, obj):
        """Return amount converted to the requested display currency"""
        request = self.context.get('request')
        if request:
            display_currency = request.query_params.get('display_currency', 'USD')
            try:
                return float(obj.get_converted_amount(display_currency))
            except:
                return float(obj.amount)
        return float(obj.amount)

class ExpenseSerializer(serializers.ModelSerializer):
    vehicleName = serializers.SerializerMethodField()
    tripDescription = serializers.CharField(source='trip.description', read_only=True)
    converted_amount = serializers.SerializerMethodField()

    class Meta:
        model = Expense
        fields = '__all__'

    def get_vehicleName(self, obj):
        return str(obj.vehicle)
    
    def get_converted_amount(self, obj):
        """Return amount converted to the requested display currency"""
        request = self.context.get('request')
        if request:
            display_currency = request.query_params.get('display_currency', 'USD')
            try:
                return float(obj.get_converted_amount(display_currency))
            except:
                return float(obj.amount)
        return float(obj.amount)
