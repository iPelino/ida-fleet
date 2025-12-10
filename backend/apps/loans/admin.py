from django.contrib import admin
from .models import BankLoan, PersonalLoan, AdvancePayment, UnpaidFuel, LoanPayment

@admin.register(BankLoan)
class BankLoanAdmin(admin.ModelAdmin):
    list_display = ('bank_name', 'amount', 'remaining_amount', 'status', 'start_date')
    list_filter = ('status', 'currency')
    search_fields = ('bank_name', 'notes')

@admin.register(PersonalLoan)
class PersonalLoanAdmin(admin.ModelAdmin):
    list_display = ('creditor_name', 'amount', 'remaining_balance', 'status', 'payment_due_date')
    list_filter = ('status', 'currency')
    search_fields = ('creditor_name', 'notes')

@admin.register(AdvancePayment)
class AdvancePaymentAdmin(admin.ModelAdmin):
    list_display = ('recipient_name', 'amount', 'remaining_amount', 'status', 'date_issued')
    list_filter = ('status', 'currency')
    search_fields = ('recipient_name', 'reason')

@admin.register(UnpaidFuel)
class UnpaidFuelAdmin(admin.ModelAdmin):
    list_display = ('supplier', 'liters', 'total_amount', 'remaining_balance', 'status', 'date')
    list_filter = ('status',)
    search_fields = ('supplier',)

@admin.register(LoanPayment)
class LoanPaymentAdmin(admin.ModelAdmin):
    list_display = ('date', 'amount', 'method', 'related_loan')
    list_filter = ('method', 'date')
    search_fields = ('reference_number',)
    
    def related_loan(self, obj):
        if obj.bank_loan: return f"Bank Loan: {obj.bank_loan}"
        if obj.personal_loan: return f"Personal Loan: {obj.personal_loan}"
        if obj.advance_payment: return f"Advance: {obj.advance_payment}"
        if obj.unpaid_fuel: return f"Fuel: {obj.unpaid_fuel}"
        return "-"
