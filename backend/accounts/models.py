from django.contrib.auth.models import AbstractUser
from django.db import models

from core.models import BaseModel


class Role(BaseModel):
    """
    User roles — Admin, Manager, Operator, Viewer.
    """
    ROLE_CHOICES = [
        ('admin', 'Administrator'),
        ('manager', 'Manager'),
        ('operator', 'Data Entry Operator'),
        ('viewer', 'Viewer'),
    ]

    name = models.CharField(max_length=50, unique=True)
    code = models.CharField(max_length=30, unique=True, choices=ROLE_CHOICES)
    description = models.TextField(blank=True)

    class Meta:
        db_table = 'pims_roles'
        ordering = ['name']

    def __str__(self):
        return f"{self.name} ({self.code})"


class User(AbstractUser):
    """
    Custom User model — PIMS ke liye.
    """
    role = models.ForeignKey(
        Role,
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='users'
    )
    phone = models.CharField(max_length=20, blank=True)
    designation = models.CharField(max_length=100, blank=True)
    department = models.CharField(max_length=100, blank=True)
    is_active_user = models.BooleanField(default=True)

    class Meta:
        db_table = 'pims_users'

    def __str__(self):
        return f"{self.get_full_name() or self.username} ({self.role})"