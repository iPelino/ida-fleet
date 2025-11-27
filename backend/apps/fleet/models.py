from django.db import models

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
        ('pending', 'Pending'),
        ('completed', 'Completed'),
    )
    FREQUENCY_CHOICES = (
        ('once', 'Once'),
        ('daily', 'Daily'),
        ('weekly', 'Weekly'),
    )

    vehicle = models.ForeignKey(Vehicle, on_delete=models.CASCADE, related_name='reminders')
    title = models.CharField(max_length=200)
    type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    dueDate = models.DateField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    notes = models.TextField(blank=True, null=True)
    emailNotifications = models.BooleanField(default=False)
    notificationEmail = models.EmailField(blank=True, null=True)
    notificationFrequency = models.CharField(max_length=20, choices=FREQUENCY_CHOICES, default='once', blank=True, null=True)
    notificationDaysBefore = models.IntegerField(default=1, blank=True, null=True)
    createdAt = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} - {self.vehicle}"
