from django.contrib import admin
from django.utils.html import format_html
from django.utils.safestring import mark_safe

from .models import Agency, Department, Project, ProjectPI


@admin.register(Agency)
class AgencyAdmin(admin.ModelAdmin):
    list_display = ('code', 'name', 'contact_person', 'contact_email', 'is_deleted')
    search_fields = ('code', 'name', 'contact_person')
    list_filter = ('is_deleted',)
    readonly_fields = ('created_at', 'updated_at')

    class Media:
        css = {'all': ('admin/css/pims_admin.css',)}


@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = ('code', 'name', 'hod_name', 'is_deleted')
    search_fields = ('code', 'name', 'hod_name')
    list_filter = ('is_deleted',)
    readonly_fields = ('created_at', 'updated_at')

    class Media:
        css = {'all': ('admin/css/pims_admin.css',)}


class ProjectPIInline(admin.TabularInline):
    """Project ke saath PI/Co-PI add karne ka inline."""
    model = ProjectPI
    extra = 1
    fields = ('order', 'name', 'role', 'designation', 'email', 'phone', 'department')
    ordering = ('order', 'id')
    verbose_name = 'PI / Co-PI'
    verbose_name_plural = 'PIs / Co-PIs / Coordinators'


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = (
        'project_code',
        'project_name',
        'agency',
        'department',
        'display_pi',
        'display_co_pis',
        'status',
        'sanctioned_amount',
        'start_date',
    )
    search_fields = ('project_code', 'project_name', 'pi_name', 'co_pi_name')
    list_filter = ('status', 'agency', 'department', 'is_deleted')
    readonly_fields = ('created_at', 'updated_at')
    date_hierarchy = 'start_date'
    inlines = [ProjectPIInline]
    list_per_page = 20

    fieldsets = (
        ('📋 Project Information', {
            'fields': ('project_code', 'project_name', 'description')
        }),
        ('💰 Funding & Organization', {
            'fields': ('agency', 'department', 'sanctioned_amount')
        }),
        ('📅 Duration', {
            'fields': ('start_date', 'end_date')
        }),
        ('👥 Primary People (Legacy Fields)', {
            'fields': ('pi_name', 'co_pi_name', 'coordinator_name'),
            'description': '⚠️ Ye purane fields hain. Neeche "PIs / Co-PIs" section me detailed PI list add karo.'
        }),
        ('📌 Status & Remarks', {
            'fields': ('status', 'remarks')
        }),
        ('🔒 Audit Info', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    # ============================================
    # PI Display — Separate Column
    # ============================================

    def display_pi(self, obj):
        """Sirf PI role wale log."""
        pis = obj.pis.filter(is_deleted=False, role='pi').order_by('order')

        if not pis.exists():
            if obj.pi_name:
                return format_html(
                    '<span style="color: #4f6df5; font-weight: 600;">{}</span>',
                    obj.pi_name
                )
            return "—"

        items = [
            '<div style="color: #4f6df5; font-weight: 600; padding: 3px 0;">👤 {}</div>'.format(p.name)
            for p in pis
        ]
        return mark_safe(''.join(items))

    display_pi.short_description = '🎯 PI'

    # ============================================
    # Co-PI Display — Separate Column
    # ============================================

    def display_co_pis(self, obj):
        """Sirf Co-PI role wale log."""
        co_pis = obj.pis.filter(is_deleted=False, role='co_pi').order_by('order')

        if not co_pis.exists():
            if obj.co_pi_name:
                return format_html(
                    '<span style="color: #10b981; font-weight: 500;">{}</span>',
                    obj.co_pi_name
                )
            return "—"

        items = [
            '<div style="color: #10b981; font-weight: 500; padding: 3px 0;">👥 {}</div>'.format(p.name)
            for p in co_pis
        ]
        return mark_safe(''.join(items))

    display_co_pis.short_description = '👥 Co-PI(s)'

    class Media:
        css = {'all': ('admin/css/pims_admin.css',)}


@admin.register(ProjectPI)
class ProjectPIAdmin(admin.ModelAdmin):
    list_display = ('name', 'role_badge', 'project', 'designation', 'email', 'order', 'is_deleted')
    list_filter = ('role', 'is_deleted')
    search_fields = ('name', 'email', 'project__project_code', 'project__project_name')
    readonly_fields = ('created_at', 'updated_at')
    list_select_related = ('project',)

    def role_badge(self, obj):
        """Role ko badge me dikhao."""
        colors = {
            'pi': ('#4f6df5', '🎯 PI'),
            'co_pi': ('#10b981', '👥 Co-PI'),
            'coordinator': ('#f59e0b', '🎯 Coordinator'),
            'mentor': ('#8b5cf6', '⭐ Mentor'),
            'investigator': ('#06b6d4', '🔬 Investigator'),
        }
        color, label = colors.get(obj.role, ('#64748b', obj.role))
        return format_html(
            '<span style="background: {}20; color: {}; padding: 4px 10px; '
            'border-radius: 12px; font-weight: 600; font-size: 11px;">{}</span>',
            color, color, label
        )

    role_badge.short_description = 'Role'

    class Media:
        css = {'all': ('admin/css/pims_admin.css',)}