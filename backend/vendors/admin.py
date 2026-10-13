from django.contrib import admin
from django.utils.html import format_html

from .models import Vendor


@admin.register(Vendor)
class VendorAdmin(admin.ModelAdmin):
    list_display = (
        'vendor_code',
        'reference_no',
        'vendor_name',
        'vendor_type_badge',
        'contact_person',
        'phone',
        'city',
        'is_active',
        'is_deleted',
    )
    search_fields = (
        'vendor_code',
        'reference_no',
        'vendor_name',
        'gst_number',
        'pan_number',
        'contact_person',
        'email',
        'phone',
    )
    list_filter = ('vendor_type', 'is_active', 'is_deleted', 'state', 'city')
    readonly_fields = ('vendor_code', 'created_at', 'updated_at')
    ordering = ('vendor_name',)
    list_per_page = 25

    fieldsets = (
        ('📋 Basic Information', {
            'fields': (
                'vendor_code',
                'reference_no',
                'vendor_name',
                'vendor_type',
                'description',
            ),
            'description': '💡 Vendor Code auto-generate hoga save karne par'
        }),
        ('💰 Tax Information', {
            'fields': (
                'gst_number',
                'pan_number',
                'tan_number',
            ),
            'classes': ('collapse',)
        }),
        ('📍 Address', {
            'fields': (
                'address_line1',
                'address_line2',
                'city',
                'state',
                'pincode',
                'country',
            )
        }),
        ('📞 Contact', {
            'fields': (
                'contact_person',
                'email',
                'phone',
                'alternate_phone',
            )
        }),
        ('🏦 Bank Details', {
            'fields': (
                'bank_name',
                'account_number',
                'ifsc_code',
                'bank_branch',
                'account_type',
            ),
            'classes': ('collapse',)
        }),
        ('⚙️ Status', {
            'fields': ('is_active',)
        }),
        ('🔒 Audit Info', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    def vendor_type_badge(self, obj):
        """Vendor type ko color badge me dikhao."""
        colors = {
            'supplier': ('#10b981', '🏭'),
            'contractor': ('#f59e0b', '🔨'),
            'consultant': ('#8b5cf6', '💼'),
            'service': ('#06b6d4', '🛠️'),
            'manufacturer': ('#ef4444', '⚙️'),
            'other': ('#64748b', '📌'),
        }
        color, emoji = colors.get(obj.vendor_type, ('#64748b', '📌'))
        return format_html(
            '<span style="background: {}20; color: {}; padding: 4px 10px; '
            'border-radius: 12px; font-weight: 600; font-size: 11px;">'
            '{} {}</span>',
            color, color, emoji, obj.get_vendor_type_display()
        )
    vendor_type_badge.short_description = 'Type'

    class Media:
        css = {'all': ('admin/css/pims_admin.css',)}