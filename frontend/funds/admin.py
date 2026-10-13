from django.contrib import admin
from django.utils.html import format_html

from .models import FundReceipt


@admin.register(FundReceipt)
class FundReceiptAdmin(admin.ModelAdmin):
    list_display = (
        'receipt_reference_no',
        'project',
        'financial_year',
        'fund_type',
        'amount_display',
        'receipt_date',
        'is_deleted',
    )
    search_fields = (
        'receipt_reference_no',
        'project__project_code',
        'project__project_name',
        'financial_year',
    )
    list_filter = ('fund_type', 'financial_year', 'is_deleted', 'receipt_date')
    readonly_fields = ('created_at', 'updated_at')
    date_hierarchy = 'receipt_date'
    list_select_related = ('project',)

    fieldsets = (
        ('📋 Receipt Information', {
            'fields': (
                'project',
                'financial_year',
                'fund_type',
            )
        }),
        ('💰 Amount & Date', {
            'fields': (
                'receipt_date',
                'receipt_reference_no',
                'amount_received',
            )
        }),
        ('📝 Remarks', {
            'fields': ('remarks',)
        }),
        ('🔒 Audit Info', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    def amount_display(self, obj):
        """Amount ko green color me dikhao."""
        if obj.amount_received is None:
            return "—"
        formatted = f"₹{float(obj.amount_received):,.2f}"
        return format_html(
            '<span style="color: #10b981; font-weight: 700;">{}</span>',
            formatted
        )
    amount_display.short_description = '💰 Amount'

    class Media:
        css = {'all': ('admin/css/pims_admin.css',)}