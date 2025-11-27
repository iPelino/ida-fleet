import os
import django
import sys

# Setup Django environment
sys.path.append('/app')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'fleet_management.settings')
django.setup()

from django.contrib.auth import authenticate
from django.contrib.auth import get_user_model

User = get_user_model()
email = 'sudo@admin.com'
password = 'Admin@12345'

print(f"Attempting to authenticate user: {email}")

try:
    user = User.objects.get(email=email)
    print(f"User found: {user}")
    print(f"User password hash: {user.password}")
    print(f"User is active: {user.is_active}")
except User.DoesNotExist:
    print("User does not exist!")
    sys.exit(1)

auth_user = authenticate(email=email, password=password)
if auth_user:
    print("Authentication SUCCESS")
else:
    print("Authentication FAILED")
    # Try with username kwarg just in case
    print("Trying with username kwarg...")
    auth_user_2 = authenticate(username=email, password=password)
    if auth_user_2:
        print("Authentication SUCCESS with username kwarg")
    else:
        print("Authentication FAILED with username kwarg")
