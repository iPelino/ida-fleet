from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import BankLoan, PersonalLoan, AdvancePayment, UnpaidFuel, LoanPayment
from .serializers import (
    BankLoanSerializer, 
    PersonalLoanSerializer, 
    AdvancePaymentSerializer, 
    UnpaidFuelSerializer,
    LoanPaymentSerializer
)

class BaseLoanViewSet(viewsets.ModelViewSet):
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

class BankLoanViewSet(BaseLoanViewSet):
    queryset = BankLoan.objects.all().order_by('-created_at')
    serializer_class = BankLoanSerializer

class PersonalLoanViewSet(BaseLoanViewSet):
    queryset = PersonalLoan.objects.all().order_by('-created_at')
    serializer_class = PersonalLoanSerializer

class AdvancePaymentViewSet(BaseLoanViewSet):
    queryset = AdvancePayment.objects.all().order_by('-created_at')
    serializer_class = AdvancePaymentSerializer

class UnpaidFuelViewSet(BaseLoanViewSet):
    queryset = UnpaidFuel.objects.all().order_by('-date')
    serializer_class = UnpaidFuelSerializer

class LoanPaymentViewSet(BaseLoanViewSet):
    queryset = LoanPayment.objects.all().order_by('-date')
    serializer_class = LoanPaymentSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        # Filter by loan type if needed
        bank_loan_id = self.request.query_params.get('bank_loan')
        if bank_loan_id:
            queryset = queryset.filter(bank_loan_id=bank_loan_id)
        
        personal_loan_id = self.request.query_params.get('personal_loan')
        if personal_loan_id:
            queryset = queryset.filter(personal_loan_id=personal_loan_id)
            
        advance_id = self.request.query_params.get('advance_payment')
        if advance_id:
            queryset = queryset.filter(advance_payment_id=advance_id)
            
        fuel_id = self.request.query_params.get('unpaid_fuel')
        if fuel_id:
            queryset = queryset.filter(unpaid_fuel_id=fuel_id)
            
        return queryset
