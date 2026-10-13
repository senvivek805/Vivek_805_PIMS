from django.contrib import admin
from django.utils.html import format_html

from .models import BillEntry, BillEntryItem


# ============================================
# BILL ENTRY ITEM — INLINE
# ============================================

class BillEntryItemInline(admin.TabularInline):
    model = BillEntryItem
    extra = 0
    fields = [
        'order',
        'date',
        'particulars',
        'amount_rs',
        'amount_paise',
        'remarks',
    ]
    ordering = ['order', 'id']


# ============================================
# BILL ENTRY — ADMIN
# ============================================

@admin.register(BillEntry)
class BillEntryAdmin(admin.ModelAdmin):
    list_display = [
        'document_no',
        'bill_no',
        'bill_date',
        'recipient_name',
        'vendor_name_display',
        'total_payable_display',
        'status_badge',
        'created_at',
    ]
    list_filter = [
        'status',
        'bill_date',
        'project',
        'vendor',
        'is_deleted',
    ]
    search_fields = [
        'bill_no',
        'document_no',
        'recipient_name',
        'particulars',
        'vendor__vendor_name',
        'project__project_name',
        'project__project_code',
        'purchase_order__po_number',
        'remarks',
    ]
    readonly_fields = [
        'document_no',
        'total_payable',
        'in_words',
        'cgst_amount',
        'sgst_amount',
        'igst_amount',
        'tds_gst',
        'tds_income_tax',
        'created_at',
        'updated_at',
        'created_by',
        'updated_by',
        'is_deleted',
        'deleted_at',
    ]
    date_hierarchy = 'bill_date'
    ordering = ['-bill_date', '-created_at']
    inlines = [BillEntryItemInline]

    fieldsets = (
        ('Basic Information', {
            'fields': (
                'document_no',
                'bill_no',
                'bill_date',
                'diary_voucher_no',
                'diary_voucher_date',
            )
        }),
        ('Relations', {
            'fields': (
                'project',
                'purchase_order',
                'vendor',
                'budget_head',
            )
        }),
        ('Budget Heads', {
            'fields': (
                'major_budget_head',
                'minor_budget_head',
            )
        }),
        ('Recipient & Particulars', {
            'fields': (
                'recipient_name',
                'particulars',
                'vendor_bill_no',
                'vendor_bill_date',
                'absentee',
            )
        }),
        ('Amounts & Deductions', {
            'fields': (
                'bill_amount',
                'cgst_rate',
                'sgst_rate',
                'igst_rate',
                'cgst_amount',
                'sgst_amount',
                'igst_amount',
                'tds_gst_rate',
                'tds_gst',
                'tds_income_tax_rate',
                'tds_income_tax',
                'penalty',
                'pbg_security',
                'total_payable',
                'in_words',
            )
        }),
        ('RTGS — Bank Details', {
            'fields': (
                'bank_account_name',
                'bank_account_no',
                'bank_name',
                'bank_branch',
                'bank_ifsc',
                'bank_account_type',
                'bank_address',
                'rtgs_purpose',
            ),
            'classes': ('collapse',),
        }),
        ('Status & Extra', {
            'fields': (
                'status',
                'remarks',
            )
        }),
        ('Audit', {
            'fields': (
                'created_at',
                'updated_at',
                'created_by',
                'updated_by',
                'is_deleted',
                'deleted_at',
            ),
            'classes': ('collapse',),
        }),
    )

    def vendor_name_display(self, obj):
        return obj.vendor.vendor_name if obj.vendor else '—'
    vendor_name_display.short_description = 'Vendor'

    def total_payable_display(self, obj):
        return f"₹ {obj.total_payable:,.2f}"
    total_payable_display.short_description = 'Total Payable'

    def status_badge(self, obj):
        colors = {
            'draft': '#64748b',
            'submitted': '#4f6df5',
            'approved': '#10b981',
            'paid': '#059669',
            'cancelled': '#ef4444',
        }
        color = colors.get(obj.status, '#64748b')
        return format_html(
            '<span style="background:{};color:white;padding:2px 8px;'
            'border-radius:4px;font-size:11px;font-weight:bold;">{}</span>',
            color,
            obj.get_status_display()
        )
    status_badge.short_description = 'Status'


# ============================================
# BILL ENTRY ITEM — ADMIN
# ============================================

@admin.register(BillEntryItem)
class BillEntryItemAdmin(admin.ModelAdmin):
    list_display = [
        'id',
        'bill_entry',
        'date',
        'particulars_short',
        'amount_display',
    ]
    list_filter = ['date']
    search_fields = [
        'particulars',
        'remarks',
        'bill_entry__bill_no',
    ]
    ordering = ['-id']

    def particulars_short(self, obj):
        return obj.particulars[:60] + '...' if len(obj.particulars) > 60 else obj.particulars
    particulars_short.short_description = 'Particulars'

    def amount_display(self, obj):
        return f"₹ {obj.amount_rs:,.2f}.{obj.amount_paise:02d}"
    amount_display.short_description = 'Amount'