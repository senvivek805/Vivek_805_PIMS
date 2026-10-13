from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from .models import User, Role


# ============================================
# PIMS Admin Branding + Custom CSS
# ============================================
admin.site.site_header = "PIMS Administration"
admin.site.site_title = "PIMS Admin Portal"
admin.site.index_title = "Welcome to PIMS — Project Information Management System"


@admin.register(Role)
class RoleAdmin(admin.ModelAdmin):
    list_display = ('name', 'code', 'description', 'is_deleted', 'created_at')
    list_filter = ('code', 'is_deleted')
    search_fields = ('name', 'code')
    readonly_fields = ('created_at', 'updated_at')

    class Media:
        css = {
            'all': ('admin/css/pims_admin.css',)
        }


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ('username', 'email', 'first_name', 'last_name', 'role', 'is_active', 'is_staff')
    list_filter = ('role', 'is_active', 'is_staff', 'is_superuser')
    search_fields = ('username', 'email', 'first_name', 'last_name', 'phone')
    ordering = ('username',)

    fieldsets = BaseUserAdmin.fieldsets + (
        ('PIMS Info', {
            'fields': ('role', 'phone', 'designation', 'department', 'is_active_user')
        }),
    )

    add_fieldsets = BaseUserAdmin.add_fieldsets + (
        ('PIMS Info', {
            'fields': ('role', 'phone', 'designation', 'department')
        }),
    )

    class Media:
        css = {
            'all': ('admin/css/pims_admin.css',)
        }