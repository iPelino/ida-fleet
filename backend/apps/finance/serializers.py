from rest_framework import serializers
from .models import Payment, Expense, ExchangeRate, ExpenseCategory

class ExpenseCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ExpenseCategory
        fields = '__all__'

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
    receipt_file_url = serializers.SerializerMethodField()

    class Meta:
        model = Expense
        approved_by_name = serializers.CharField(source='approved_by.email', read_only=True)
    
    class Meta:
        model = Expense
        fields = '__all__'
        read_only_fields = ['status', 'approved_by', 'approved_at', 'rejection_reason', 'createdAt']

    def get_vehicleName(self, obj):
        return str(obj.vehicle)
    
    def get_receipt_file_url(self, obj):
        """Return the full URL for the receipt file"""
        if obj.receipt_file:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.receipt_file.url)
            return obj.receipt_file.url
        return None
    
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
