from django.db import models
from django.conf import settings

class Customer(models.Model):
    name = models.CharField(max_length=200)
    email = models.EmailField(blank=True, null=True)
    phone = models.CharField(max_length=50, blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    createdAt = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class Trip(models.Model):
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name='trips')
    vehicle = models.ForeignKey('fleet.Vehicle', on_delete=models.SET_NULL, null=True, related_name='trips')
    description = models.CharField(max_length=255)
    startDate = models.DateTimeField()
    endDate = models.DateTimeField()
    startLocation = models.CharField(max_length=255, blank=True, null=True)
    endLocation = models.CharField(max_length=255, blank=True, null=True)
    totalPrice = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=3, default='USD')
    tripType = models.CharField(max_length=50, blank=True, null=True)
    cargoWeight = models.FloatField(blank=True, null=True)
    weightUnit = models.CharField(max_length=10, blank=True, null=True)
    createdBy = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    createdAt = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.description} ({self.customer})"
