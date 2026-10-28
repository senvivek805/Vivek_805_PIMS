from django.db.models.signals import post_save, pre_delete, pre_save
from django.dispatch import receiver
from django.forms.models import model_to_dict
from audit_logs.models import AuditLog
from audit_logs.middleware import get_current_user

# Models ko import karo
from projects.models import Project
from vendors.models import Vendor
from bills.models import BillEntry
from purchase.models import PurchaseOrder

# Temporary store to save old state before update
_old_states = {}

@receiver(pre_save, sender=Project)
@receiver(pre_save, sender=Vendor)
@receiver(pre_save, sender=BillEntry)
@receiver(pre_save, sender=PurchaseOrder)
def track_old_state(sender, instance, **kwargs):
    """Update hone se pehle purana data save karo."""
    if instance.pk:
        try:
            _old_states[f"{sender.__name__}_{instance.pk}"] = model_to_dict(
                sender.objects.get(pk=instance.pk)
            )
        except sender.DoesNotExist:
            pass

@receiver(post_save, sender=Project)
@receiver(post_save, sender=Vendor)
@receiver(post_save, sender=BillEntry)
@receiver(post_save, sender=PurchaseOrder)
def log_create_update(sender, instance, created, **kwargs):
    """Naya data banne ya update hone par log karo."""
    user = get_current_user()
    if not user:
        return # Agar background task hai to skip karo

    action = 'CREATE' if created else 'UPDATE'
    changes = None

    if not created:
        old_state = _old_states.get(f"{sender.__name__}_{instance.pk}")
        if old_state:
            new_state = model_to_dict(instance)
            changes = {}
            for key, new_val in new_state.items():
                old_val = old_state.get(key)
                if str(old_val) != str(new_val):
                    changes[key] = {"old": str(old_val), "new": str(new_val)}
            
            if not changes:
                return # Agar kuch change nahi hua to log mat karo

    AuditLog.objects.create(
        user=user,
        action=action,
        model_name=sender.__name__,
        object_id=str(instance.pk),
        object_repr=str(instance),
        changes=changes
    )

@receiver(pre_delete, sender=Project)
@receiver(pre_delete, sender=Vendor)
@receiver(pre_delete, sender=BillEntry)
@receiver(pre_delete, sender=PurchaseOrder)
def log_delete(sender, instance, **kwargs):
    """Delete hone par log karo."""
    user = get_current_user()
    if not user:
        return

    AuditLog.objects.create(
        user=user,
        action='DELETE',
        model_name=sender.__name__,
        object_id=str(instance.pk),
        object_repr=str(instance),
        changes=None
    )