from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from drf_spectacular.views import SpectacularAPIView, SpectacularRedocView, SpectacularSwaggerView
from apps.accounts.views import SignUpView, LoginView, UserView, RoleListView
from apps.fleet.views import VehicleViewSet, ReminderViewSet, reminder_system_health
from apps.operations.views import CustomerViewSet, TripViewSet
from apps.finance.views import ExpenseViewSet, PaymentViewSet, ExchangeRateViewSet

router = DefaultRouter()
router.register(r'vehicles', VehicleViewSet)
router.register(r'reminders', ReminderViewSet)
router.register(r'customers', CustomerViewSet)
router.register(r'trips', TripViewSet)
router.register(r'expenses', ExpenseViewSet)
router.register(r'payments', PaymentViewSet)
router.register(r'exchange-rates', ExchangeRateViewSet)
from apps.accounts.views import UserViewSet
router.register(r'users', UserViewSet)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/signup', SignUpView.as_view(), name='signup'),
    path('api/login', LoginView.as_view(), name='login'), # We might need a custom login view if not using standard auth token view
    path('api/user', UserView.as_view(), name='user'),
    path('api/roles', RoleListView.as_view(), name='roles'),
    path('api/', include(router.urls)),
    path('api/support/', include('apps.support.urls')),
    path('api/reminder-health', reminder_system_health, name='reminder-health'),
    # Swagger
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/schema/swagger-ui/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/schema/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
]
