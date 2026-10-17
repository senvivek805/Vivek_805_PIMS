from django.db import models
from django.conf import settings
from purchase.models import PurchaseOrder

class ServiceCompletion(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]

    certificate_no = models.CharField(max_length=100, unique=True, help_text="Unique Certificate Number")
    purchase_order = models.OneToOneField(PurchaseOrder, on_delete=models.CASCADE, related_name='service_completion')
    completion_date = models.DateField()
    remarks = models.TextField(blank=True, null=True, help_text="Any specific remarks or observations")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='completed')
    
    # Audit fields
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'pims_service_completions'
        ordering = ['-completion_date', '-created_at']

    def __str__(self):
        return f"{self.certificate_no} - {self.purchase_order.po_number}"