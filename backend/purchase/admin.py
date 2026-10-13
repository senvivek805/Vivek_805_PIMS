from django.contrib import admin
from django.utils.html import format_html

from .models import PurchaseOrder, PurchaseOrderItem


# ============================================
# PO ITEM INLINE
# ============================================

class PurchaseOrderItemInline(admin.TabularInline):
    model = PurchaseOrderItem
    extra = 1
    fields = (
        'order',
        'item_name',
        'quantity',
        'unit',
        'rate',
        'gst_rate',
        'cgst_amount',
        'sgst_amount',
        'igst_amount',
        'amount',
    )
    readonly_fields = (
        'cgst_amount',
        'sgst_amount',
        'igst_amount',
        'amount',
    )
    ordering = ('order', 'id')
    verbose_name = 'Item'
    verbose_name_plural = '📦 Purchase Items'


# ============================================
# PURCHASE ORDER ADMIN
# ============================================

@admin.register(PurchaseOrder)
class PurchaseOrderAdmin(admin.ModelAdmin):
    list_display = (
        'po_number',
        'po_date',
        'vendor',
        'project',
        'grand_total_display',
        'gst_type_badge',
        'status_badge',
        'item_count_display',
        'is_deleted',
    )
    search_fields = (
        'po_number',
        'subject',
        'vendor__vendor_name',
        'vendor__vendor_code',
        'project__project_code',
        'project__project_name',
        'major_budget_head',
        'minor_budget_head',
    )
    list_filter = (
        'status',
        'gst_type',
        'tc_template',
        'is_deleted',
        'po_date',
        'department_school',
    )
    readonly_fields = (
        'subtotal',
        'cgst_amount',
        'sgst_amount',
        'igst_amount',
        'gst_amount',
        'grand_total',
        'in_words',
        'gst_type',
        'created_at',
        'updated_at',
    )
    date_hierarchy = 'po_date'
    list_select_related = ('vendor', 'project')
    list_per_page = 25
    inlines = [PurchaseOrderItemInline]

    fieldsets = (
        ('📋 Order Information', {
            'fields': (
                'po_number',
                'po_date',
                'status',
                'department_school',
            ),
            'description': '💡 PO Number manual — aapka custom format'
        }),
        ('🔗 Relations', {
            'fields': (
                'vendor',
                'project',
                'budget_head',
            )
        }),
        ('💰 Budget Heads (Header)', {
            'fields': (
                'major_budget_head',
                'minor_budget_head',
                'approximate_cost',
                'budget_grant',
                'amount_spent',
                'balance_available',
            ),
            'classes': ('collapse',)
        }),
        ('📝 Subject & Body', {
            'fields': (
                'subject',
                'body_description',
            )
        }),
        ('📋 Terms & Conditions', {
            'fields': (
                'tc_template',
                'terms_conditions',
            ),
            'description': '💡 Har PO me editable'
        }),
        ('💵 Financial Summary (Auto-calculated)', {
            'fields': (
                'gst_type',
                'subtotal',
                'cgst_amount',
                'sgst_amount',
                'igst_amount',
                'gst_amount',
                'grand_total',
                'in_words',
            ),
            'description': '💡 Save karne par items se auto-calculate hoga'
        }),
        ('📎 Extra', {
            'fields': (
                'reference_no',
                'remarks',
            ),
            'classes': ('collapse',)
        }),
        ('🔒 Audit Info', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    def grand_total_display(self, obj):
        if obj.grand_total is None:
            return "—"
        formatted = f"₹{float(obj.grand_total):,.2f}"
        return format_html(
            '<span style="color: #10b981; font-weight: 700;">{}</span>',
            formatted
        )
    grand_total_display.short_description = '💰 Grand Total'

    def status_badge(self, obj):
        colors = {
            'draft': ('#64748b', '📝'),
            'approved': ('#10b981', '✅'),
            'completed': ('#4f6df5', '🎯'),
            'cancelled': ('#ef4444', '❌'),
        }
        color, emoji = colors.get(obj.status, ('#64748b', '📌'))
        return format_html(
            '<span style="background: {}20; color: {}; padding: 4px 10px; '
            'border-radius: 12px; font-weight: 600; font-size: 11px;">'
            '{} {}</span>',
            color, color, emoji, obj.get_status_display()
        )
    status_badge.short_description = 'Status'

    def gst_type_badge(self, obj):
        if obj.gst_type == 'igst':
            return format_html(
                '<span style="background: #8b5cf620; color: #8b5cf6; '
                'padding: 4px 10px; border-radius: 12px; font-weight: 600; '
                'font-size: 11px;">🌐 IGST</span>'
            )
        else:
            return format_html(
                '<span style="background: #10b98120; color: #10b981; '
                'padding: 4px 10px; border-radius: 12px; font-weight: 600; '
                'font-size: 11px;">🏠 CGST+SGST</span>'
            )
    gst_type_badge.short_description = 'GST Type'

    def item_count_display(self, obj):
        count = obj.item_count
        return format_html(
            '<span style="color: #4f6df5; font-weight: 600;">📦 {}</span>',
            count
        )
    item_count_display.short_description = 'Items'

    def save_related(self, request, form, formsets, change):
        """Items save hone ke baad totals calculate karo."""
        super().save_related(request, form, formsets, change)
        form.instance.calculate_totals()

    class Media:
        css = {'all': ('admin/css/pims_admin.css',)}


# ============================================
# PO ITEM ADMIN (standalone)
# ============================================

@admin.register(PurchaseOrderItem)
class PurchaseOrderItemAdmin(admin.ModelAdmin):
    list_display = (
        'item_name_short',
        'purchase_order',
        'quantity',
        'unit',
        'rate',
        'gst_rate',
        'gst_amount',
        'amount_display',
        'is_deleted',
    )
    search_fields = (
        'item_name',
        'purchase_order__po_number',
    )
    list_filter = ('gst_rate', 'is_deleted')
    readonly_fields = (
        'cgst_amount',
        'sgst_amount',
        'igst_amount',
        'gst_amount',
        'amount',
        'created_at',
        'updated_at',
    )
    list_select_related = ('purchase_order',)

    def item_name_short(self, obj):
        return obj.item_name[:60] + ('...' if len(obj.item_name) > 60 else '')
    item_name_short.short_description = 'Item'

    def amount_display(self, obj):
        if obj.amount is None:
            return "—"
        formatted = f"₹{float(obj.amount):,.2f}"
        return format_html(
            '<span style="color: #4f6df5; font-weight: 700;">{}</span>',
            formatted
        )
    amount_display.short_description = '💰 Amount'

    class Media:
        css = {'all': ('admin/css/pims_admin.css',)}