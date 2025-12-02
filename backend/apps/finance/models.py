from django.db import models
from django.conf import settings

class Payment(models.Model):
    trip = models.ForeignKey('operations.Trip', on_delete=models.CASCADE, related_name='payments')
    amount = models.DecimalField(max_digits=20, decimal_places=2)
    currency = models.CharField(max_length=3, default='USD')
    date = models.DateTimeField()
    type = models.CharField(max_length=50) # e.g., Cash, Transfer
    createdAt = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.amount} for {self.trip}"

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
        return f"{self.category} - {self.amount}"
