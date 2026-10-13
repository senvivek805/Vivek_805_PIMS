from django.contrib import admin
from django.utils.html import format_html

from .models import (
    FundReceipt,
    BudgetCategory,
    BudgetHead,
    FundBreakup,
)


# ============================================
# BUDGET CATEGORY ADMIN
# ============================================

@admin.register(BudgetCategory)
class BudgetCategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'code', 'order', 'description', 'is_deleted')
    search_fields = ('name', 'code')
    list_filter = ('is_deleted',)
    readonly_fields = ('created_at', 'updated_at')
    ordering = ('order',)

    fieldsets = (
        ('📋 Budget Category Info', {
            'fields': ('name', 'code', 'description', 'order')
        }),
        ('🔒 Audit Info', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    class Media:
        css = {'all': ('admin/css/pims_admin.css',)}


# ============================================
# BUDGET HEAD ADMIN
# ============================================

@admin.register(BudgetHead)
class BudgetHeadAdmin(admin.ModelAdmin):
    list_display = (
        'code',
        'order',
        'name',
        'category_badge',
        'is_active',
        'is_deleted',
    )
    search_fields = ('name', 'code', 'description')
    list_filter = ('category', 'is_active', 'is_deleted')
    readonly_fields = ('created_at', 'updated_at')
    ordering = ('category__order', 'order', 'name')
    list_select_related = ('category',)

    fieldsets = (
        ('📋 Budget Head Info', {
            'fields': ('category', 'name', 'code', 'description', 'order')
        }),
        ('⚙️ Status', {
            'fields': ('is_active',)
        }),
        ('🔒 Audit Info', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    def category_badge(self, obj):
        if not obj.category:
            return "—"
        colors = {
            'REC': ('#10b981', '🔄'),
            'NON_REC': ('#8b5cf6', '📦'),
        }
        color, emoji = colors.get(obj.category.code, ('#64748b', '📌'))
        return format_html(
            '<span style="background: {}20; color: {}; padding: 4px 10px; '
            'border-radius: 12px; font-weight: 600; font-size: 11px;">'
            '{} {}</span>',
            color, color, emoji, obj.category.name
        )
    category_badge.short_description = '🎯 Category'

    class Media:
        css = {'all': ('admin/css/pims_admin.css',)}


# ============================================
# FUND BREAKUP INLINE
# ============================================

class FundBreakupInline(admin.TabularInline):
    model = FundBreakup
    extra = 1
    fields = ('category', 'budget_head', 'amount', 'remarks')
    ordering = ('category__order', 'budget_head__order', 'id')
    verbose_name = 'Breakup Entry'
    verbose_name_plural = '💰 Budget Breakups'


# ============================================
# FUND RECEIPT ADMIN
# ============================================

@admin.register(FundReceipt)
class FundReceiptAdmin(admin.ModelAdmin):
    list_display = (
        'receipt_reference_no',
        'project',
        'financial_year',
        'fund_type',
        'amount_display',
        'breakup_status',
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
    inlines = [FundBreakupInline]

    fieldsets = (
        ('📋 Receipt Information', {
            'fields': ('project', 'financial_year', 'fund_type')
        }),
        ('💰 Amount & Date', {
            'fields': ('receipt_date', 'receipt_reference_no', 'amount_received')
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
        if obj.amount_received is None:
            return "—"
        formatted = f"₹{float(obj.amount_received):,.2f}"
        return format_html(
            '<span style="color: #10b981; font-weight: 700;">{}</span>',
            formatted
        )
    amount_display.short_description = '💰 Amount'

    def breakup_status(self, obj):
        total = float(obj.amount_received or 0)
        allocated = float(obj.total_breakup_amount)
        remaining = total - allocated

        if total == 0:
            return "—"

        percentage = (allocated / total * 100) if total > 0 else 0

        if remaining == 0:
            color = '#10b981'
            emoji = '✅'
        elif allocated == 0:
            color = '#ef4444'
            emoji = '⚠️'
        else:
            color = '#f59e0b'
            emoji = '🔄'

        return format_html(
            '<span style="color: {}; font-weight: 600;">'
            '{} {:.0f}%</span>',
            color, emoji, percentage
        )
    breakup_status.short_description = '📊 Breakup'

    class Media:
        css = {'all': ('admin/css/pims_admin.css',)}


# ============================================
# FUND BREAKUP ADMIN
# ============================================

@admin.register(FundBreakup)
class FundBreakupAdmin(admin.ModelAdmin):
    list_display = (
        'fund_receipt',
        'category_badge',
        'budget_head',
        'amount_display',
        'is_deleted',
    )
    search_fields = (
        'fund_receipt__receipt_reference_no',
        'budget_head__name',
    )
    list_filter = ('category', 'budget_head', 'is_deleted')
    readonly_fields = ('created_at', 'updated_at')
    list_select_related = ('fund_receipt', 'category', 'budget_head')
    ordering = ('category__order', 'budget_head__order', 'id')

    fieldsets = (
        ('📋 Breakup Info', {
            'fields': ('fund_receipt', 'category', 'budget_head')
        }),
        ('💰 Amount', {
            'fields': ('amount', 'remarks')
        }),
        ('🔒 Audit Info', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    def amount_display(self, obj):
        if obj.amount is None:
            return "—"
        formatted = f"₹{float(obj.amount):,.2f}"
        return format_html(
            '<span style="color: #4f6df5; font-weight: 700;">{}</span>',
            formatted
        )
    amount_display.short_description = '💰 Amount'

    def category_badge(self, obj):
        if not obj.category:
            return "—"
        colors = {
            'REC': ('#10b981', '🔄'),
            'NON_REC': ('#8b5cf6', '📦'),
        }
        color, emoji = colors.get(obj.category.code, ('#64748b', '📌'))
        return format_html(
            '<span style="background: {}20; color: {}; padding: 4px 10px; '
            'border-radius: 12px; font-weight: 600; font-size: 11px;">'
            '{} {}</span>',
            color, color, emoji, obj.category.name
        )
    category_badge.short_description = '🎯 Category'

    class Media:
        css = {'all': ('admin/css/pims_admin.css',)}