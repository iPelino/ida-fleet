from django.db import models
from django.conf import settings

class Vehicle(models.Model):
    STATUS_CHOICES = (
        ('Active', 'Active'),
        ('Under Maintenance', 'Under Maintenance'),
        ('Inactive', 'Inactive'),
    )

    make = models.CharField(max_length=100)
    model = models.CharField(max_length=100)
    year = models.IntegerField()
    licensePlate = models.CharField(max_length=20, unique=True)
    vin = models.CharField(max_length=50, blank=True, null=True)
    currentMileage = models.IntegerField(default=0)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Active')
    notes = models.TextField(blank=True, null=True)
    createdAt = models.DateTimeField(auto_now_add=True)
    updatedAt = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.make} {self.model} ({self.licensePlate})"

class Reminder(models.Model):
    TYPE_CHOICES = (
        ('Insurance', 'Insurance'),
        ('Service', 'Service'),
        ('License', 'License'),
        ('Other', 'Other'),
    )
    STATUS_CHOICES = (
        ('Pending', 'Pending'),
        ('Completed', 'Completed'),
        ('Overdue', 'Overdue'),
    )

    vehicle = models.ForeignKey(Vehicle, on_delete=models.CASCADE, related_name='reminders')
    title = models.CharField(max_length=200)
    type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    dueDate = models.DateField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pending')
    notes = models.TextField(blank=True, null=True)
    emailNotification = models.BooleanField(default=False)
    notificationDaysBefore = models.IntegerField(default=7)
    
    # New fields for notification tracking
    lastNotificationSent = models.DateTimeField(null=True, blank=True)
    createdBy = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='created_reminders')
    createdAt = models.DateTimeField(auto_now_add=True)
    updatedAt = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['dueDate']
        indexes = [
            models.Index(fields=['dueDate', 'status']),
            models.Index(fields=['emailNotification']),
        ]

    def __str__(self):
        return f"{self.title} - {self.vehicle}"


class ReminderNotification(models.Model):
    """Track all email notifications sent for reminders"""
    STATUS_CHOICES = (
        ('sent', 'Sent'),
        ('failed', 'Failed'),
        ('pending', 'Pending'),
    )
    
    reminder = models.ForeignKey(Reminder, on_delete=models.CASCADE, related_name='notifications')
    sentAt = models.DateTimeField(auto_now_add=True)
    recipientEmail = models.EmailField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    errorMessage = models.TextField(blank=True, null=True)
    
    class Meta:
        ordering = ['-sentAt']
    
    def __str__(self):
        return f"{self.reminder.title} - {self.status} at {self.sentAt}"
