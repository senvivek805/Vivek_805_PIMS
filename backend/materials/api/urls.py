from django.urls import path

from . import views

app_name = 'materials_api'

urlpatterns = [
    # Categories
    path('material-categories/', views.material_category_list, name='category-list'),

    # Materials — List + Create
    path('materials/', views.material_list_create, name='list-create'),

    # Materials — Stats
    path('materials/stats/', views.material_stats, name='stats'),

    # Materials — Detail
    path('materials/<int:pk>/', views.material_detail, name='detail'),

    # ============================================
    # MATERIAL RECEIPTS
    # ============================================

    # List + Create
    path('material-receipts/', views.material_receipt_list_create, name='receipt-list-create'),

    # Stats
    path('material-receipts/stats/', views.material_receipt_stats, name='receipt-stats'),

    # PO Items for Receipt (prefill)
    path('material-receipts/po/<int:po_id>/items/', views.po_items_for_receipt, name='po-items-for-receipt'),

    # Detail
    path('material-receipts/<int:pk>/', views.material_receipt_detail, name='receipt-detail'),

    # ============================================
    # MATERIAL ISSUES
    # ============================================

    # List + Create
    path('material-issues/', views.material_issue_list_create, name='issue-list-create'),

    # Stats
    path('material-issues/stats/', views.material_issue_stats, name='issue-stats'),

    # Detail
    path('material-issues/<int:pk>/', views.material_issue_detail, name='issue-detail'),

    # ============================================
    # MATERIAL RETURN NOTES (MRN)
    # ============================================

    # List + Create
    path('material-returns/', views.material_return_list_create, name='return-list-create'),

    # Stats
    path('material-returns/stats/', views.material_return_stats, name='return-stats'),

    # Detail
    path('material-returns/<int:pk>/', views.material_return_detail, name='return-detail'),

    # ============================================
    # LOW STOCK ALERTS
    # ============================================

    path('materials/low-stock/', views.low_stock_materials, name='low-stock'),
]