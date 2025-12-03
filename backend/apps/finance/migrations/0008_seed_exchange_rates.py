# Data migration to seed initial exchange rates

from django.db import migrations
from decimal import Decimal


def seed_exchange_rates(apps, schema_editor):
    """Seed initial exchange rates matching the current hardcoded rates"""
    ExchangeRate = apps.get_model('finance', 'ExchangeRate')
    
    # Create initial rates
    rates_to_create = [
        # USD to other currencies
        {'from_currency': 'USD', 'to_currency': 'RWF', 'rate': Decimal('1300.000000')},
        {'from_currency': 'USD', 'to_currency': 'EUR', 'rate': Decimal('0.910000')},
        
        # RWF to other currencies (for direct lookups)
        {'from_currency': 'RWF', 'to_currency': 'USD', 'rate': Decimal('0.000769')},  # 1/1300
        {'from_currency': 'RWF', 'to_currency': 'EUR', 'rate': Decimal('0.000700')},  # 1300/0.91
        
        # EUR to other currencies
        {'from_currency': 'EUR', 'to_currency': 'USD', 'rate': Decimal('1.098901')},  # 1/0.91
        {'from_currency': 'EUR', 'to_currency': 'RWF', 'rate': Decimal('1428.571429')},  # 1300/0.91
    ]
    
    for rate_data in rates_to_create:
        ExchangeRate.objects.get_or_create(
            from_currency=rate_data['from_currency'],
            to_currency=rate_data['to_currency'],
            is_active=True,
            defaults={'rate': rate_data['rate']}
        )


def reverse_seed(apps, schema_editor):
    """Remove seeded exchange rates"""
    ExchangeRate = apps.get_model('finance', 'ExchangeRate')
    ExchangeRate.objects.all().delete()


class Migration(migrations.Migration):

    dependencies = [
        ('finance', '0007_exchangerate'),
    ]

    operations = [
        migrations.RunPython(seed_exchange_rates, reverse_seed),
    ]
