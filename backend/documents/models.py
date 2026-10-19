from django.db import models
from django.conf import settings
from core.models import BaseModel
from projects.models import Project
from bills.models import BillEntry
from purchase.models import PurchaseOrder

class Document(BaseModel):
    DOCUMENT_TYPES = [
        ('uc', 'Utilization Certificate'),
        ('invoice', 'Invoice / Bill'),
        ('po', 'Purchase Order'),
        ('agreement', 'Agreement'),
        ('other', 'Other'),
    ]

    title = models.CharField(max_length=255, verbose_name="Document Title")
    doc_type = models.CharField(max_length=50, choices=DOCUMENT_TYPES, default='other', verbose_name="Document Type")
    file = models.FileField(upload_to='documents/%Y/%m/', verbose_name="File")
    
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='documents', verbose_name="Project")
    bill = models.ForeignKey(BillEntry, on_delete=models.SET_NULL, null=True, blank=True, related_name='documents', verbose_name="Related Bill (Optional)")
    purchase_order = models.ForeignKey(PurchaseOrder, on_delete=models.SET_NULL, null=True, blank=True, related_name='documents', verbose_name="Related PO (Optional)")
    
    remarks = models.TextField(blank=True, null=True, verbose_name="Remarks")
    
    uploaded_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'pims_documents'
        ordering = ['-uploaded_at']
        verbose_name = 'Document'
        verbose_name_plural = 'Documents'

    def __str__(self):
        return f"{self.title} - {self.get_doc_type_display()}"