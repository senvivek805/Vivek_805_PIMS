from django.urls import path

from . import views

app_name = 'funds_api'

urlpatterns = [
    # ============================================
    # BUDGET CATEGORIES & HEADS
    # ============================================
    path('budget-categories/', views.budget_category_list, name='budget-category-list'),
    path('budget-heads/', views.budget_head_list, name='budget-head-list'),

    # ============================================
    # FUND RECEIPTS
    # ============================================
    path('fund-receipts/', views.fund_receipt_list_create, name='fund-receipt-list-create'),
    path('fund-receipts/stats/', views.fund_receipt_stats, name='fund-receipt-stats'),
    path('fund-receipts/by-project/<int:project_id>/', views.fund_receipts_by_project, name='fund-receipt-by-project'),
    path('fund-receipts/<int:pk>/', views.fund_receipt_detail, name='fund-receipt-detail'),

    # ============================================
    # FUND BREAKUPS
    # ============================================
    path('fund-breakups/', views.fund_breakup_list_create, name='fund-breakup-list-create'),
    path('fund-breakups/<int:pk>/', views.fund_breakup_detail, name='fund-breakup-detail'),

    # Bulk save (for UI — save all at once)
    path(
        'fund-receipts/<int:receipt_id>/breakups/bulk-save/',
        views.fund_breakup_bulk_save,
        name='fund-breakup-bulk-save'
    ),

    # ============================================
    # BUDGET OVERVIEW
    # ============================================
    path('budget/overview/', views.budget_overview, name='budget-overview'),
]