from django.contrib import admin
from unfold.admin import ModelAdmin
from .models import AuditLog

@admin.register(AuditLog)
class AuditLogAdmin(ModelAdmin):
    list_display = ('timestamp', 'user', 'action', 'model_name', 'object_repr')
    list_filter = ('action', 'model_name', 'timestamp')
    search_fields = ('object_repr', 'user__username')
    readonly_fields = ('user', 'action', 'model_name', 'object_id', 'object_repr', 'changes', 'ip_address', 'timestamp')

    def has_add_permission(self, request):
        return False # Manual add disable karo

    def has_change_permission(self, request, obj=None):
        return False # Edit disable karo