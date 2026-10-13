from django.db import models
from django.conf import settings


class BaseModel(models.Model):
    """
    Base model — har PIMS table isse inherit karegi.
    Automatically milta hai: created_at, updated_at, soft delete.
    """
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='%(class)s_created'
    )
    updated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='%(class)s_updated'
    )

    # Soft delete
    is_deleted = models.BooleanField(default=False, db_index=True)
    deleted_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        abstract = True
        ordering = ['-created_at']

    def soft_delete(self, user=None):
        """Soft delete — actual row delete nahi hogi."""
        from django.utils import timezone
        self.is_deleted = True
        self.deleted_at = timezone.now()
        if user:
            self.updated_by = user
        self.save()

    def restore(self):
        """Deleted record wapas laao."""
        self.is_deleted = False
        self.deleted_at = None
        self.save()