from django.contrib import admin
from .models import Vehicle, Reminder, ReminderNotification

@admin.register(Vehicle)
class VehicleAdmin(admin.ModelAdmin):
    list_display = ('licensePlate', 'make', 'model', 'year', 'status', 'currentMileage')
    search_fields = ('licensePlate', 'make', 'model', 'vin')
    list_filter = ('status', 'make')

@admin.register(Reminder)
class ReminderAdmin(admin.ModelAdmin):
    list_display = ('title', 'vehicle', 'type', 'dueDate', 'status', 'emailNotification')
    search_fields = ('title', 'vehicle__licensePlate')
    list_filter = ('type', 'status', 'emailNotification')
    date_hierarchy = 'dueDate'

@admin.register(ReminderNotification)
class ReminderNotificationAdmin(admin.ModelAdmin):
    list_display = ('reminder', 'recipientEmail', 'status', 'sentAt')
    search_fields = ('reminder__title', 'recipientEmail')
    list_filter = ('status', 'sentAt')
    readonly_fields = ('sentAt',)
