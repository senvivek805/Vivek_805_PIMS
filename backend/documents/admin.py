from django.contrib import admin
from unfold.admin import ModelAdmin
from .models import Document

@admin.register(Document)
class DocumentAdmin(ModelAdmin):
    list_display = ('title', 'doc_type', 'project', 'bill', 'purchase_order', 'uploaded_at')
    list_filter = ('doc_type', 'project')
    search_fields = ('title', 'project__project_code', 'bill__bill_no')
    date_hierarchy = 'uploaded_at'
    readonly_fields = ('uploaded_by', 'uploaded_at')

    def save_model(self, request, obj, form, change):
        if not obj.pk:
            obj.uploaded_by = request.user
        super().save_model(request, obj, form, change)