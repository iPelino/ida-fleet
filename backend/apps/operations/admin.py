from django.contrib import admin
from .models import Customer, Trip

@admin.register(Customer)
class CustomerAdmin(admin.ModelAdmin):
    list_display = ('name', 'email', 'phone', 'createdAt')
    search_fields = ('name', 'email', 'phone')

@admin.register(Trip)
class TripAdmin(admin.ModelAdmin):
    list_display = ('description', 'customer', 'vehicle', 'startDate', 'endDate', 'totalPrice', 'currency')
    search_fields = ('description', 'customer__name', 'vehicle__licensePlate')
    list_filter = ('startDate', 'currency')
