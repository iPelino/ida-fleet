from django.contrib import admin
from .models import Payment, Expense

@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ('trip', 'amount', 'date', 'type')
    search_fields = ('trip__description', 'type')
    list_filter = ('date', 'type')

@admin.register(Expense)
class ExpenseAdmin(admin.ModelAdmin):
    list_display = ('category', 'amount', 'amountRwf', 'date', 'expenseType', 'vehicle', 'trip')
    search_fields = ('category', 'description', 'vehicle__licensePlate', 'trip__description')
    list_filter = ('date', 'expenseType', 'category')
