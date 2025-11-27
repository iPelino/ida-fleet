from django.contrib import admin
from .models import Vehicle, Reminder

@admin.register(Vehicle)
class VehicleAdmin(admin.ModelAdmin):
    list_display = ('make', 'model', 'licensePlate', 'status', 'year')
    search_fields = ('make', 'model', 'licensePlate', 'vin')
    list_filter = ('status', 'year')

@admin.register(Reminder)
class ReminderAdmin(admin.ModelAdmin):
    list_display = ('title', 'vehicle', 'type', 'dueDate', 'status')
    search_fields = ('title', 'vehicle__licensePlate')
    list_filter = ('type', 'status', 'dueDate')
