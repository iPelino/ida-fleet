# Generated migration for ExchangeRate model

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('finance', '0006_payment_currency_expense_currency'),
    ]

    operations = [
        migrations.CreateModel(
            name='ExchangeRate',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('from_currency', models.CharField(max_length=3)),
                ('to_currency', models.CharField(max_length=3)),
                ('rate', models.DecimalField(decimal_places=6, max_digits=10)),
                ('effective_date', models.DateTimeField(auto_now_add=True)),
                ('is_active', models.BooleanField(default=True)),
                ('updated_by', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'ordering': ['-effective_date'],
                'unique_together': {('from_currency', 'to_currency', 'is_active')},
            },
        ),
    ]
