from django.db import models
from django.conf import settings
from core.models import BaseModel

class AuditLog(BaseModel):
    """
    Records all Create, Update, and Delete actions in the system.
    """
    ACTION_CHOICES = [
        ('CREATE', 'Created'),
        ('UPDATE', 'Updated'),
        ('DELETE', 'Deleted'),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='audit_logs',
        verbose_name='User'
    )
    action = models.CharField(
        max_length=10,
        choices=ACTION_CHOICES,
        verbose_name='Action'
    )
    model_name = models.CharField(
        max_length=100,
        verbose_name='Model Name',
        help_text='e.g., BillEntry, Project'
    )
    object_id = models.CharField(
        max_length=50,
        verbose_name='Object ID'
    )
    object_repr = models.CharField(
        max_length=200,
        verbose_name='Object Name',
        help_text='e.g., BILL-001'
    )
    changes = models.JSONField(
        null=True,
        blank=True,
        verbose_name='Changes',
        help_text='JSON of changed fields'
    )
    ip_address = models.GenericIPAddressField(
        null=True,
        blank=True,
        verbose_name='IP Address'
    )
    timestamp = models.DateTimeField(
        auto_now_add=True,
        verbose_name='Timestamp'
    )

    class Meta:
        db_table = 'pims_audit_logs'
        ordering = ['-timestamp']
        verbose_name = 'Audit Log'
        verbose_name_plural = 'Audit Logs'

    def __str__(self):
        return f"{self.user} - {self.action} {self.model_name} - {self.timestamp}"