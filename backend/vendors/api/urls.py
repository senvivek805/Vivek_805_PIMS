from django.urls import path
from . import views
from .views import import_excel_data

urlpatterns = [
    path('vendors/', views.vendor_list_create, name='list-create'),
    path('vendors/stats/', views.vendor_stats, name='stats'),
    path('vendors/<int:pk>/', views.vendor_detail, name='detail'),
    
    # 👇 Yahan dhyan do, import wale path me bhi 'vendors/' add kiya hai
    path('vendors/import/', import_excel_data, name='import-excel'),
]