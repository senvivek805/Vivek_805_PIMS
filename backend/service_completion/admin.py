from django.contrib import admin
from unfold.admin import ModelAdmin
from .models import ServiceCompletion

@admin.register(ServiceCompletion)
class ServiceCompletionAdmin(ModelAdmin):
    list_display = ('certificate_no', 'purchase_order', 'completion_date', 'status')
    list_filter = ('status', 'completion_date')
    search_fields = ('certificate_no', 'purchase_order__po_number')
    date_hierarchy = 'completion_date'
    readonly_fields = ('created_at', 'updated_at')