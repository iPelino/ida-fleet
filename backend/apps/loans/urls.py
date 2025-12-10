from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    BankLoanViewSet, 
    PersonalLoanViewSet, 
    AdvancePaymentViewSet, 
    UnpaidFuelViewSet,
    LoanPaymentViewSet
)

router = DefaultRouter()
router.register(r'bank-loans', BankLoanViewSet, basename='bank-loan')
router.register(r'personal-loans', PersonalLoanViewSet, basename='personal-loan')
router.register(r'advance-payments', AdvancePaymentViewSet, basename='advance-payment')
router.register(r'unpaid-fuel', UnpaidFuelViewSet, basename='unpaid-fuel')
router.register(r'payments', LoanPaymentViewSet, basename='loan-payment')

urlpatterns = [
    path('', include(router.urls)),
]
