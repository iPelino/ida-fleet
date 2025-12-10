from django.db import models
from django.conf import settings
from decimal import Decimal
from django.utils import timezone

class BankLoan(models.Model):
    STATUS_CHOICES = (
        ('Pending', 'Pending'),
        ('Active', 'Active'),
        ('Paid Off', 'Paid Off'),
        ('Defaulted', 'Defaulted'),
    )
    
    bank_name = models.CharField(max_length=200)
    amount = models.DecimalField(max_digits=20, decimal_places=2)
    currency = models.CharField(max_length=3, default='RWF')
    payment_period_months = models.IntegerField(help_text="Duration of the loan in months")
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pending')
    notes = models.TextField(blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)

    def calculate_end_date(self):
        if self.start_date and self.payment_period_months:
            # Simple approximation, can be improved with dateutil
            import calendar
            month = self.start_date.month - 1 + self.payment_period_months
            year = self.start_date.year + month // 12
            month = month % 12 + 1
            day = min(self.start_date.day, calendar.monthrange(year, month)[1])
            return self.start_date.replace(year=year, month=month, day=day)
        return None

    def save(self, *args, **kwargs):
        if not self.end_date:
            self.end_date = self.calculate_end_date()
        super().save(*args, **kwargs)

    @property
    def remaining_amount(self):
        paid = self.payments.aggregate(total=models.Sum('amount'))['total'] or Decimal('0.00')
        return max(Decimal('0.00'), self.amount - paid)

    def __str__(self):
        return f"{self.bank_name} - {self.amount} {self.currency}"


class PersonalLoan(models.Model):
    STATUS_CHOICES = (
        ('Pending', 'Pending'),
        ('Active', 'Active'),
        ('Paid Off', 'Paid Off'),
    )

    creditor_name = models.CharField(max_length=200)
    amount = models.DecimalField(max_digits=20, decimal_places=2)
    currency = models.CharField(max_length=3, default='RWF')
    date_taken = models.DateField()
    payment_due_date = models.DateField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pending')
    notes = models.TextField(blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)

    @property
    def remaining_balance(self):
        paid = self.payments.aggregate(total=models.Sum('amount'))['total'] or Decimal('0.00')
        return max(Decimal('0.00'), self.amount - paid)

    def __str__(self):
        return f"{self.creditor_name} - {self.amount} {self.currency}"


class AdvancePayment(models.Model):
    STATUS_CHOICES = (
        ('Pending', 'Pending'),
        ('Partial', 'Partial'),
        ('Paid', 'Paid'),
    )

    recipient_name = models.CharField(max_length=200)
    amount = models.DecimalField(max_digits=20, decimal_places=2)
    currency = models.CharField(max_length=3, default='RWF')
    date_issued = models.DateField()
    reason = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pending')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)

    @property
    def remaining_amount(self):
        paid = self.payments.aggregate(total=models.Sum('amount'))['total'] or Decimal('0.00')
        return max(Decimal('0.00'), self.amount - paid)

    def __str__(self):
        return f"{self.recipient_name} - {self.amount} {self.currency}"


class UnpaidFuel(models.Model):
    STATUS_CHOICES = (
        ('Pending', 'Pending'),
        ('Partial', 'Partial'),
        ('Paid', 'Paid'),
    )

    supplier = models.CharField(max_length=200)
    liters = models.DecimalField(max_digits=10, decimal_places=2)
    price_per_liter = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=3, default='RWF')
    date = models.DateField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pending')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)

    @property
    def total_amount(self):
        return self.liters * self.price_per_liter

    @property
    def remaining_balance(self):
        paid = self.payments.aggregate(total=models.Sum('amount'))['total'] or Decimal('0.00')
        return max(Decimal('0.00'), self.total_amount - paid)

    def __str__(self):
        return f"{self.supplier} - {self.liters}L"


class LoanPayment(models.Model):
    METHOD_CHOICES = (
        ('Bank Transfer', 'Bank Transfer'),
        ('MoMo', 'MoMo'),
        ('Cash', 'Cash'),
        ('Trip Revenue', 'Trip Revenue'),
    )

    bank_loan = models.ForeignKey(BankLoan, on_delete=models.CASCADE, null=True, blank=True, related_name='payments')
    personal_loan = models.ForeignKey(PersonalLoan, on_delete=models.CASCADE, null=True, blank=True, related_name='payments')
    advance_payment = models.ForeignKey(AdvancePayment, on_delete=models.CASCADE, null=True, blank=True, related_name='payments')
    unpaid_fuel = models.ForeignKey(UnpaidFuel, on_delete=models.CASCADE, null=True, blank=True, related_name='payments')
    
    amount = models.DecimalField(max_digits=20, decimal_places=2)
    currency = models.CharField(max_length=3, default='RWF')
    date = models.DateField(default=timezone.now)
    method = models.CharField(max_length=20, choices=METHOD_CHOICES)
    reference_number = models.CharField(max_length=100, blank=True, null=True)
    
    # Optional link to a Trip if paid via Trip Revenue
    trip = models.ForeignKey('operations.Trip', on_delete=models.SET_NULL, null=True, blank=True, related_name='loan_payments')
    
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)

    def save(self, *args, **kwargs):
        # Validation to ensure only one loan type is selected
        loans = [self.bank_loan, self.personal_loan, self.advance_payment, self.unpaid_fuel]
        if sum(1 for l in loans if l is not None) != 1:
            raise ValueError("Payment must be linked to exactly one loan type")
        
        super().save(*args, **kwargs)
        
        # Update status of the related loan
        self.update_loan_status()

    def update_loan_status(self):
        if self.bank_loan:
            if self.bank_loan.remaining_amount <= 0:
                self.bank_loan.status = 'Paid Off'
                self.bank_loan.save()
        elif self.personal_loan:
            if self.personal_loan.remaining_balance <= 0:
                self.personal_loan.status = 'Paid Off'
                self.personal_loan.save()
        elif self.advance_payment:
            if self.advance_payment.remaining_amount <= 0:
                self.advance_payment.status = 'Paid'
            elif self.advance_payment.remaining_amount < self.advance_payment.amount:
                 self.advance_payment.status = 'Partial'
            self.advance_payment.save()
        elif self.unpaid_fuel:
            if self.unpaid_fuel.remaining_balance <= 0:
                self.unpaid_fuel.status = 'Paid'
            elif self.unpaid_fuel.remaining_balance < self.unpaid_fuel.total_amount:
                self.unpaid_fuel.status = 'Partial'
            self.unpaid_fuel.save()

    def __str__(self):
        return f"Payment of {self.amount} {self.currency}"
