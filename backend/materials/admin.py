from django.contrib import admin
from django.utils.html import format_html

from .models import MaterialCategory, Material, MaterialReceipt, MaterialReceiptItem


# ============================================
# MATERIAL CATEGORY ADMIN
# ============================================

@admin.register(MaterialCategory)
class MaterialCategoryAdmin(admin.ModelAdmin):
    list_display = (
        'code',
        'order',
        'name',
        'material_count',
        'is_deleted',
    )
    search_fields = ('name', 'code', 'description')
    list_filter = ('is_deleted',)
    readonly_fields = ('created_at', 'updated_at')
    ordering = ('order', 'name')

    fieldsets = (
        ('📋 Category Info', {
            'fields': ('name', 'code', 'description', 'order')
        }),
        ('🔒 Audit Info', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    def material_count(self, obj):
        count = obj.materials.filter(is_deleted=False).count()
        return format_html(
            '<span style="color: #4f6df5; font-weight: 600;">📦 {}</span>',
            count
        )
    material_count.short_description = 'Materials'

    class Media:
        css = {'all': ('admin/css/pims_admin.css',)}


# ============================================
# MATERIAL ADMIN
# ============================================

@admin.register(Material)
class MaterialAdmin(admin.ModelAdmin):
    list_display = (
        'material_code',
        'material_name',
        'category_badge',
        'unit_display',
        'gst_badge',
        'is_active',
        'is_deleted',
    )
    search_fields = (
        'material_code',
        'material_name',
        'hsn_code',
        'description',
        'category__name',
        'category__code',
    )
    list_filter = (
        'category',
        'unit',
        'gst_rate',
        'is_active',
        'is_deleted',
    )
    readonly_fields = ('material_code', 'created_at', 'updated_at')
    ordering = ('material_name',)
    list_per_page = 25
    list_select_related = ('category',)

    fieldsets = (
        ('📋 Material Info', {
            'fields': (
                'material_code',
                'material_name',
                'category',
                'description',
            ),
            'description': '💡 Material Code auto-generate hoga save karne par'
        }),
        ('📏 Unit & GST', {
            'fields': (
                'unit',
                'hsn_code',
                'gst_rate',
            )
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
        return format_html(
            '<span style="background: #4f6df520; color: #4f6df5; '
            'padding: 4px 10px; border-radius: 12px; font-weight: 600; '
            'font-size: 11px;">📁 {}</span>',
            obj.category.name
        )
    category_badge.short_description = 'Category'

    def unit_display(self, obj):
        return obj.get_unit_display()
    unit_display.short_description = 'Unit'

    def gst_badge(self, obj):
        rates = {
            0: ('#64748b', '0%'),
            5: ('#10b981', '5%'),
            12: ('#f59e0b', '12%'),
            18: ('#4f6df5', '18%'),
            28: ('#ef4444', '28%'),
        }
        rate = int(obj.gst_rate)
        color, label = rates.get(rate, ('#64748b', f'{rate}%'))
        return format_html(
            '<span style="background: {}20; color: {}; padding: 4px 10px; '
            'border-radius: 12px; font-weight: 600; font-size: 11px;">'
            '💰 {}</span>',
            color, color, label
        )
    gst_badge.short_description = 'GST'

    class Media:
        css = {'all': ('admin/css/pims_admin.css',)}
        

# ============================================
# MATERIAL RECEIPT INLINE
# ============================================

class MaterialReceiptItemInline(admin.TabularInline):
    model = MaterialReceiptItem
    extra = 1
    fields = (
        'item_name',
        'ordered_quantity',
        'received_quantity',
        'unit',
        'remarks',
    )
    verbose_name = 'Received Item'
    verbose_name_plural = '📦 Received Items'


# ============================================
# MATERIAL RECEIPT ADMIN
# ============================================

@admin.register(MaterialReceipt)
class MaterialReceiptAdmin(admin.ModelAdmin):
    list_display = (
        'receipt_no',
        'receipt_date',
        'purchase_order',
        'vendor',
        'status_badge',
        'item_count_display',
        'is_deleted',
    )
    search_fields = (
        'receipt_no',
        'purchase_order__po_number',
        'vendor__vendor_name',
    )
    list_filter = ('status', 'is_deleted', 'receipt_date')
    readonly_fields = ('receipt_no', 'created_at', 'updated_at')
    date_hierarchy = 'receipt_date'
    list_select_related = ('purchase_order', 'vendor', 'project')
    inlines = [MaterialReceiptItemInline]

    fieldsets = (
        ('📋 Receipt Info', {
            'fields': ('receipt_no', 'receipt_date', 'status'),
            'description': '💡 Receipt No. auto-generate hoga save par'
        }),
        ('🔗 Relations', {
            'fields': ('purchase_order', 'vendor', 'project')
        }),
        ('📝 Remarks', {
            'fields': ('remarks',)
        }),
        ('🔒 Audit Info', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    def status_badge(self, obj):
        colors = {
            'draft': ('#64748b', '📝'),
            'partial': ('#f59e0b', '🔄'),
            'completed': ('#10b981', '✅'),
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

    def item_count_display(self, obj):
        return format_html(
            '<span style="color: #4f6df5; font-weight: 600;">📦 {}</span>',
            obj.item_count
        )
    item_count_display.short_description = 'Items'

    class Media:
        css = {'all': ('admin/css/pims_admin.css',)}


# ============================================
# MATERIAL RECEIPT ITEM ADMIN
# ============================================

@admin.register(MaterialReceiptItem)
class MaterialReceiptItemAdmin(admin.ModelAdmin):
    list_display = (
        'item_name_short',
        'material_receipt',
        'ordered_quantity',
        'received_quantity',
        'unit',
        'is_deleted',
    )
    search_fields = (
        'item_name',
        'material_receipt__receipt_no',
    )
    list_filter = ('is_deleted',)
    readonly_fields = ('created_at', 'updated_at')
    list_select_related = ('material_receipt', 'po_item', 'material')

    def item_name_short(self, obj):
        return obj.item_name[:60] + ('...' if len(obj.item_name) > 60 else '')
    item_name_short.short_description = 'Item'

    class Media:
        css = {'all': ('admin/css/pims_admin.css',)}