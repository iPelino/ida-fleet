from rest_framework import serializers
from .models import BankLoan, PersonalLoan, AdvancePayment, UnpaidFuel, LoanPayment
from apps.fleet.models import Vehicle

class BankLoanSerializer(serializers.ModelSerializer):
    remaining_amount = serializers.DecimalField(max_digits=20, decimal_places=2, read_only=True)
    
    class Meta:
        model = BankLoan
        fields = '__all__'
        read_only_fields = ('created_by',)

class PersonalLoanSerializer(serializers.ModelSerializer):
    remaining_balance = serializers.DecimalField(max_digits=20, decimal_places=2, read_only=True)
    
    class Meta:
        model = PersonalLoan
        fields = '__all__'
        read_only_fields = ('created_by',)

class AdvancePaymentSerializer(serializers.ModelSerializer):
    remaining_amount = serializers.DecimalField(max_digits=20, decimal_places=2, read_only=True)
    
    class Meta:
        model = AdvancePayment
        fields = '__all__'
        read_only_fields = ('created_by',)

class UnpaidFuelSerializer(serializers.ModelSerializer):
    remaining_balance = serializers.DecimalField(max_digits=20, decimal_places=2, read_only=True)
    total_amount = serializers.DecimalField(max_digits=20, decimal_places=2, read_only=True)
    
    class Meta:
        model = UnpaidFuel
        fields = '__all__'
        read_only_fields = ('created_by',)

class LoanPaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = LoanPayment
        fields = '__all__'
        read_only_fields = ('created_by',)
    
    def validate(self, data):
        # Ensure exactly one loan type is selected (already in model, but good for API feedback)
        loans = [
            data.get('bank_loan'), 
            data.get('personal_loan'), 
            data.get('advance_payment'), 
            data.get('unpaid_fuel')
        ]
        if sum(1 for l in loans if l is not None) != 1:
            raise serializers.ValidationError("Payment must be linked to exactly one loan type")
        
        # Verify trip revenue method has a trip
        if data.get('method') == 'Trip Revenue' and not data.get('trip'):
            raise serializers.ValidationError("Trip must be specified for 'Trip Revenue' payment method")
            
        return data
