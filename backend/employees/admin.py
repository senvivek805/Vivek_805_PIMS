from django.contrib import admin
from django.utils.html import format_html

from .models import Employee


@admin.register(Employee)
class EmployeeAdmin(admin.ModelAdmin):
    list_display = (
        'employee_code',
        'full_name',
        'designation',
        'employee_type_badge',
        'department',
        'assigned_project',
        'phone',
        'is_active',
        'is_deleted',
    )
    search_fields = (
        'employee_code',
        'reference_no',
        'full_name',
        'designation',
        'department',
        'email',
        'phone',
        'project_role',
    )
    list_filter = (
        'employee_type',
        'manpower_type',
        'is_active',
        'is_deleted',
        'assigned_project',
    )
    readonly_fields = ('employee_code', 'created_at', 'updated_at')
    ordering = ('full_name',)
    list_per_page = 25
    list_select_related = ('assigned_project',)

    fieldsets = (
        ('📋 Basic Information', {
            'fields': (
                'employee_code',
                'reference_no',
                'full_name',
                'designation',
                'department',
                'employee_type',
            ),
            'description': '💡 Employee Code auto-generate hoga save karne par'
        }),
        ('📞 Contact', {
            'fields': (
                'email',
                'phone',
                'address',
            )
        }),
        ('📅 Dates', {
            'fields': (
                'joining_date',
                'leaving_date',
            )
        }),
        ('🔗 Project Assignment', {
            'fields': (
                'assigned_project',
                'project_role',
                'manpower_type',
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

    def employee_type_badge(self, obj):
        """Employee type ko color badge me dikhao."""
        colors = {
            'faculty': ('#4f6df5', '🎓'),
            'staff': ('#10b981', '👤'),
            'jrf': ('#f59e0b', '🔬'),
            'srf': ('#8b5cf6', '🔬'),
            'ra': ('#06b6d4', '🎯'),
            'project_staff': ('#ec4899', '👥'),
            'consultant': ('#ef4444', '💼'),
            'other': ('#64748b', '📌'),
        }
        color, emoji = colors.get(obj.employee_type, ('#64748b', '📌'))
        return format_html(
            '<span style="background: {}20; color: {}; padding: 4px 10px; '
            'border-radius: 12px; font-weight: 600; font-size: 11px;">'
            '{} {}</span>',
            color, color, emoji, obj.get_employee_type_display()
        )
    employee_type_badge.short_description = 'Type'

    class Media:
        css = {'all': ('admin/css/pims_admin.css',)}