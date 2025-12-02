# Generated manually on 2025-12-02

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('finance', '0005_alter_payment_amount'),
    ]

    operations = [
        migrations.AddField(
            model_name='payment',
            name='currency',
            field=models.CharField(default='USD', max_length=3),
        ),
        migrations.AddField(
            model_name='expense',
            name='currency',
            field=models.CharField(default='USD', max_length=3),
        ),
    ]
