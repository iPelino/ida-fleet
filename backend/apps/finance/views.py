from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from .models import Payment, Expense, ExchangeRate, ExpenseCategory
from .serializers import PaymentSerializer, ExpenseSerializer, ExchangeRateSerializer, ExpenseCategorySerializer

class ExpenseCategoryViewSet(viewsets.ModelViewSet):
    queryset = ExpenseCategory.objects.all()
    serializer_class = ExpenseCategorySerializer

class ExchangeRateViewSet(viewsets.ModelViewSet):
    queryset = ExchangeRate.objects.all()
    serializer_class = ExchangeRateSerializer
    
    @action(detail=False, methods=['get'])
    def active(self, request):
        """Get all active exchange rates"""
        active_rates = ExchangeRate.objects.filter(is_active=True)
        serializer = self.get_serializer(active_rates, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def rates_map(self, request):
        """Get active rates as a simple currency->rate mapping for frontend"""
        active_rates = ExchangeRate.objects.filter(is_active=True)
        
        # Build a mapping: {from_currency: {to_currency: rate}}
        rates_map = {}
        for rate in active_rates:
            if rate.from_currency not in rates_map:
                rates_map[rate.from_currency] = {}
            rates_map[rate.from_currency][rate.to_currency] = float(rate.rate)
        
        return Response(rates_map)

class PaymentViewSet(viewsets.ModelViewSet):
    queryset = Payment.objects.all()
    serializer_class = PaymentSerializer

class ExpenseViewSet(viewsets.ModelViewSet):
    queryset = Expense.objects.all()
    serializer_class = ExpenseSerializer

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        expense = self.get_object()
        user = request.user
        
        if getattr(user, 'role', '') not in ['manager', 'admin'] and not user.is_superuser:
             return Response({'error': 'Only managers can approve expenses'}, status=status.HTTP_403_FORBIDDEN)
             
        expense.status = 'APPROVED'
        expense.approved_by = user
        expense.approved_at = timezone.now()
        expense.save()
        return Response(self.get_serializer(expense).data)

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        expense = self.get_object()
        user = request.user
        
        if getattr(user, 'role', '') not in ['manager', 'admin'] and not user.is_superuser:
             return Response({'error': 'Only managers can reject expenses'}, status=status.HTTP_403_FORBIDDEN)

        reason = request.data.get('reason', '')
        expense.status = 'REJECTED'
        expense.rejection_reason = reason
        expense.approved_by = user
        expense.approved_at = timezone.now()
        expense.save()
        return Response(self.get_serializer(expense).data)
