from django.urls import path

from . import views

app_name = 'vendors_api'

urlpatterns = [
    # List + Create
    path('vendors/', views.vendor_list_create, name='list-create'),

    # Stats
    path('vendors/stats/', views.vendor_stats, name='stats'),

    # Detail + Update + Delete
    path('vendors/<int:pk>/', views.vendor_detail, name='detail'),
]