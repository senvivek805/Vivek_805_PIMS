from django.urls import path

from . import views

app_name = 'purchase_api'

urlpatterns = [
    # List + Create
    path('purchase-orders/', views.purchase_order_list_create, name='list-create'),

    # Stats
    path('purchase-orders/stats/', views.purchase_order_stats, name='stats'),

    # Pending POs — Alert
    path('purchase-orders/pending-alerts/', views.pending_purchase_orders, name='pending-alerts'),

    # Detail + Update + Delete
    path('purchase-orders/<int:pk>/', views.purchase_order_detail, name='detail'),
]