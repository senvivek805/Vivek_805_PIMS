from django.urls import path

from . import views

app_name = 'bills_api'

urlpatterns = [
    # List + Create
    path('bills/', views.bill_entry_list_create, name='list-create'),

    # Stats
    path('bills/stats/', views.bill_entry_stats, name='stats'),

    # Detail
    path('bills/<int:pk>/', views.bill_entry_detail, name='detail'),
    # Pending Approvals
    path('pending-approvals/', views.pending_approvals, name='pending-approvals'),
]