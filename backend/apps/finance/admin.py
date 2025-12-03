from django.contrib import admin
from .models import Payment, Expense, ExchangeRate

@admin.register(ExchangeRate)
class ExchangeRateAdmin(admin.ModelAdmin):
    list_display = ('from_currency', 'to_currency', 'rate', 'effective_date', 'is_active')
    list_filter = ('is_active', 'from_currency', 'to_currency', 'effective_date')
    search_fields = ('from_currency', 'to_currency')
    ordering = ('-effective_date',)
    
    def save_model(self, request, obj, form, change):
        """Deactivate previous rate when saving a new one"""
        if obj.is_active:
            # Deactivate previous rates for the same currency pair
            ExchangeRate.objects.filter(
                from_currency=obj.from_currency,
                to_currency=obj.to_currency,
                is_active=True
            ).exclude(pk=obj.pk).update(is_active=False)
        
        obj.updated_by = request.user
        super().save_model(request, obj, form, change)

@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ('trip', 'amount', 'currency', 'date', 'type')
    search_fields = ('trip__description', 'type')
    list_filter = ('date', 'type', 'currency')

@admin.register(Expense)
class ExpenseAdmin(admin.ModelAdmin):
    list_display = ('category', 'amount', 'currency', 'exchangeRate', 'date', 'expenseType', 'vehicle', 'trip')
    search_fields = ('category', 'description', 'vehicle__licensePlate', 'trip__description')
    list_filter = ('date', 'expenseType', 'category', 'currency')
    readonly_fields = ('exchangeRate', 'createdAt')
