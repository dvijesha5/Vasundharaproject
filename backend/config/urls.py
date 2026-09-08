from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse

def health_check(request):
    return JsonResponse({'status': 'ok', 'message': 'BizLens API is running'})

urlpatterns = [
    # Health checks
    path('', health_check),
    path('api/', health_check),
    path('api/health/', health_check),
    path('health/', health_check),

    # Admin
    path('admin/', admin.site.urls),

    # Main API routes with /api/ prefix
    path('api/auth/', include('users.urls')),
    path('api/businesses/', include('businesses.urls')),
    path('api/sales/', include('sales.urls')),
    path('api/expenses/', include('expenses.urls')),
    path('api/products/', include('products.urls')),
    path('api/customers/', include('customers.urls')),
    path('api/uploads/', include('uploads.urls')),
    path('api/analytics/', include('analytics.urls')),
    path('api/insights/', include('insights.urls')),

    # Fallback routes without /api/ prefix in case proxy strips prefix
    path('auth/', include('users.urls')),
    path('businesses/', include('businesses.urls')),
    path('sales/', include('sales.urls')),
    path('expenses/', include('expenses.urls')),
    path('products/', include('products.urls')),
    path('customers/', include('customers.urls')),
    path('uploads/', include('uploads.urls')),
    path('analytics/', include('analytics.urls')),
    path('insights/', include('insights.urls')),
]
