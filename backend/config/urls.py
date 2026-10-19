from django.contrib import admin
from django.conf import settings
from django.conf.urls.static import static
from django.urls import path, include

# PIMS Admin Branding
admin.site.site_header = "PIMS Administration"
admin.site.site_title = "PIMS Admin Portal"
admin.site.index_title = "Welcome to PIMS — Project Information Management System"

urlpatterns = [
    path('admin/', admin.site.urls),

    # API — Core
    path('api/', include('core.urls')),

    # API — Accounts (Auth)
    path('api/', include('accounts.api.urls')),

    # API — Projects
    path('api/', include('projects.api.urls')),

    # API — Funds
    path('api/', include('funds.api.urls')),

    # API — Vendors
    path('api/', include('vendors.api.urls')),

    # API — Employees
    path('api/', include('employees.api.urls')),

    # API — Purchase Orders
    path('api/', include('purchase.api.urls')),

    # API — Materials
    path('api/', include('materials.api.urls')),
    # API — Bills
    path('api/', include('bills.api.urls')),
    path('api/', include('service_completion.api.urls')),
    path('api/', include('documents.api.urls')),
]
# Media files serve karne ke liye (Development me)
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)