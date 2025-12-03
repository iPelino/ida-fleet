from django.db import models
from django.conf import settings
from decimal import Decimal

class ExchangeRate(models.Model):
    """Store exchange rates between currencies"""
    from_currency = models.CharField(max_length=3)  # e.g., 'USD'
    to_currency = models.CharField(max_length=3)    # e.g., 'RWF'
    rate = models.DecimalField(max_digits=10, decimal_places=6)  # e.g., 1300.000000
    effective_date = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)
    updated_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    
    class Meta:
        unique_together = ['from_currency', 'to_currency', 'is_active']
        ordering = ['-effective_date']
    
    def __str__(self):
        return f"1 {self.from_currency} = {self.rate} {self.to_currency}"
    
    @classmethod
    def get_rate(cls, from_currency, to_currency):
        """Get the active exchange rate between two currencies"""
        if from_currency == to_currency:
            return Decimal('1.0')
        
        # Try direct conversion
        try:
            rate = cls.objects.get(
                from_currency=from_currency,
                to_currency=to_currency,
                is_active=True
            )
            return rate.rate
        except cls.DoesNotExist:
            # Try inverse conversion (e.g., if we have RWF->USD, calculate USD->RWF)
            try:
                rate = cls.objects.get(
                    from_currency=to_currency,
                    to_currency=from_currency,
                    is_active=True
                )
                return Decimal('1.0') / rate.rate
            except cls.DoesNotExist:
                # Fallback: convert through USD as base currency
                if from_currency != 'USD' and to_currency != 'USD':
                    try:
                        from_to_usd = cls.get_rate(from_currency, 'USD')
                        usd_to_target = cls.get_rate('USD', to_currency)
                        return from_to_usd * usd_to_target
                    except:
                        pass
                raise ValueError(f"No exchange rate found for {from_currency} to {to_currency}")
    
    @classmethod
    def convert(cls, amount, from_currency, to_currency):
        """Convert an amount from one currency to another"""
        if from_currency == to_currency:
            return amount
        
        rate = cls.get_rate(from_currency, to_currency)
        return amount * rate


class Payment(models.Model):
    trip = models.ForeignKey('operations.Trip', on_delete=models.CASCADE, related_name='payments')
    amount = models.DecimalField(max_digits=20, decimal_places=2)
    currency = models.CharField(max_length=3, default='USD')
    date = models.DateTimeField()
    type = models.CharField(max_length=50) # e.g., Cash, Transfer
    createdAt = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.amount} {self.currency} for {self.trip}"
    
    def get_converted_amount(self, target_currency='USD'):
        """Get the payment amount converted to target currency"""
        try:
            return ExchangeRate.convert(self.amount, self.currency, target_currency)
        except ValueError:
            # If no rate found, return original amount
            return self.amount

class Expense(models.Model):
    EXPENSE_TYPE_CHOICES = (
        ('trip', 'Trip Expense'),
        ('vehicle', 'Vehicle Expense'),
    )
    
    vehicle = models.ForeignKey('fleet.Vehicle', on_delete=models.CASCADE, related_name='expenses')
    trip = models.ForeignKey('operations.Trip', on_delete=models.SET_NULL, null=True, blank=True, related_name='expenses')
    expenseType = models.CharField(max_length=20, choices=EXPENSE_TYPE_CHOICES, default='vehicle')
    category = models.CharField(max_length=100)
    amount = models.DecimalField(max_digits=20, decimal_places=2)
    currency = models.CharField(max_length=3, default='USD')
    amountRwf = models.DecimalField(max_digits=12, decimal_places=2, blank=True, null=True)
    exchangeRate = models.DecimalField(max_digits=10, decimal_places=4, blank=True, null=True)
    vendor = models.CharField(max_length=200, blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    receiptUrl = models.URLField(blank=True, null=True)
    createdBy = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    date = models.DateTimeField()
    createdAt = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.category} - {self.amount} {self.currency}"
    
    def get_converted_amount(self, target_currency='USD'):
        """Get the expense amount converted to target currency"""
        try:
            return ExchangeRate.convert(self.amount, self.currency, target_currency)
        except ValueError:
            # If no rate found, return original amount
            return self.amount
    
    def save(self, *args, **kwargs):
        """Auto-populate exchangeRate field when saving"""
        if self.currency and self.currency != 'USD':
            try:
                self.exchangeRate = ExchangeRate.get_rate(self.currency, 'USD')
            except ValueError:
                pass
        super().save(*args, **kwargs)
